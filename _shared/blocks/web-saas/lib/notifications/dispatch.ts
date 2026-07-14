import "server-only";

import { isEmailConfigured } from "@/lib/email/client";
import { sendEmail, type SendEmailParams } from "@/lib/email/send";
import {
  getServiceClient,
  NOTIFICATION_JOBS_TABLE,
  type NotificationJobRow,
} from "@/lib/notifications/service";

/**
 * ┌───────────────────────────────────────────────────────────────────────────┐
 * │ RAPPEL CÂBLAGE — au site de CHAQUE action de valeur, appeler               │
 * │ `dispatchEntityJobs(id)` APRÈS `enqueueJob(...)`. ENFILER ≠ ENVOYER : un   │
 * │ job enfilé sans ce call-site dort jusqu'au prochain cron (jusqu'à ~24 h).  │
 * │ Le cron (`dispatchDueJobs`) n'est QUE le filet retry + les rappels J-1 —   │
 * │ JAMAIS la première livraison d'une confirmation.                           │
 * │ Doctrine : _shared/boucles-fermees.md. Constat fondateur {2026-07} : Poser │
 * │ avait la fonction d'envoi ciblé, mais elle n'était appelée nulle part.     │
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * Bloc `notifications` — dépilage best-effort de `notification_jobs`.
 *
 * Deux points d'entrée, un seul moteur :
 *   - `dispatchEntityJobs(entityId)` : envoi IMMÉDIAT des jobs `pending` DUS
 *     d'UNE entité — à appeler dans le handler de l'action, best-effort ;
 *   - `dispatchDueJobs(limit)`        : tous les jobs `pending` dus (le cron).
 *
 * Best-effort STRICT : ces fonctions n'échouent JAMAIS l'appelant (try/catch
 * global). L'action métier reste valide même si l'email tombe ; l'échec est
 * persisté (`status='failed'`, `last_error`, `attempts++`) et rejoué par le cron.
 */

export interface DispatchResult {
  /** Jobs examinés (dus). */
  attempted: number;
  /** Jobs passés à `sent`. */
  sent: number;
  /** Jobs passés à `failed`. */
  failed: number;
  /**
   * Email non configuré (`RESEND_API_KEY`/`EMAIL_FROM` absents) : rien n'a été
   * tenté, les jobs restent `pending` (le cron les rejouera une fois configuré).
   */
  skipped: boolean;
}

const SELECT_COLUMNS =
  "id, entity_type, entity_id, type, channel, recipient, payload, status, scheduled_for, attempts, last_error, created_at, updated_at";

/**
 * Envoi IMMÉDIAT des jobs en attente et dus d'UNE entité. À APPELER au site de
 * l'action (create/confirm/cancel/reschedule), après la mutation métier. Ne
 * remonte jamais d'erreur : c'est la livraison en quelques secondes de la
 * confirmation / notification, pas une dépendance du flux appelant.
 */
export async function dispatchEntityJobs(
  entityId: string,
): Promise<DispatchResult> {
  return runDispatch((supabase) =>
    supabase
      .from(NOTIFICATION_JOBS_TABLE)
      .select(SELECT_COLUMNS)
      .eq("entity_id", entityId)
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .order("scheduled_for", { ascending: true }),
  );
}

/**
 * Envoi de TOUS les jobs `pending` dus (échéance passée), plafonné par `limit`.
 * C'est le worker du cron quotidien : rappels planifiés arrivés à échéance +
 * retry des `pending` en échec. Jamais la 1ʳᵉ livraison d'une confirmation
 * (celle-ci part au call-site via `dispatchEntityJobs`).
 */
export async function dispatchDueJobs(limit = 50): Promise<DispatchResult> {
  return runDispatch((supabase) =>
    supabase
      .from(NOTIFICATION_JOBS_TABLE)
      .select(SELECT_COLUMNS)
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .order("scheduled_for", { ascending: true })
      .limit(limit),
  );
}

/** Type minimal d'une réponse Supabase `{ data, error }` (évite un `any`). */
type QueryResult = { data: NotificationJobRow[] | null; error: { message: string } | null };

/**
 * Cœur commun : charge un lot de jobs, tente chaque envoi, persiste l'issue.
 * `select` isole la seule différence entre les deux points d'entrée (le filtre).
 */
async function runDispatch(
  select: (
    supabase: ReturnType<typeof getServiceClient>,
  ) => PromiseLike<QueryResult>,
): Promise<DispatchResult> {
  const empty: DispatchResult = {
    attempted: 0,
    sent: 0,
    failed: 0,
    skipped: false,
  };

  // Email non configuré : on ne touche pas les jobs (ils restent `pending`).
  if (!isEmailConfigured()) {
    return { ...empty, skipped: true };
  }

  try {
    const supabase = getServiceClient();
    const { data, error } = await select(supabase);

    if (error || !data || data.length === 0) {
      return empty;
    }

    let sent = 0;
    let failed = 0;

    for (const job of data) {
      const outcome = await processJob(supabase, job);
      if (outcome === "sent") sent += 1;
      else failed += 1;
    }

    return { attempted: data.length, sent, failed, skipped: false };
  } catch {
    // Best-effort : toute erreur d'infra (DB injoignable, etc.) est avalée —
    // l'appelant ne doit jamais casser. Le cron réessaiera.
    return empty;
  }
}

/** Envoie un job unique et persiste son issue. Retourne 'sent' | 'failed'. */
async function processJob(
  supabase: ReturnType<typeof getServiceClient>,
  job: NotificationJobRow,
): Promise<"sent" | "failed"> {
  const params = toEmailParams(job);

  if (!params) {
    await markJob(supabase, job, "failed", "payload/recipient invalide");
    return "failed";
  }

  const result = await sendEmail(params);

  // `skipped` ne peut pas arriver ici (email configuré vérifié en amont), mais
  // on le traite comme un non-échec prudent.
  if (result.ok) {
    await markJob(supabase, job, "sent", null);
    return "sent";
  }

  await markJob(supabase, job, "failed", result.error);
  return "failed";
}

/**
 * Traduit un job en paramètres d'envoi email. Le châssis ne gère que le canal
 * 'email' ; un canal inconnu (futur bloc SMS/push) est rejeté proprement. Le
 * contenu vient du `payload` jsonb ({ subject, html?, text?, replyTo? }) — pas
 * de composant React en base.
 */
function toEmailParams(job: NotificationJobRow): SendEmailParams | null {
  if (job.channel !== "email") return null;

  const to = job.recipient;
  const payload = job.payload ?? {};
  const subject = payload.subject;

  if (typeof to !== "string" || to.length === 0) return null;
  if (typeof subject !== "string" || subject.length === 0) return null;

  const html = typeof payload.html === "string" ? payload.html : undefined;
  const text = typeof payload.text === "string" ? payload.text : undefined;
  const replyTo =
    typeof payload.replyTo === "string" ? payload.replyTo : undefined;

  // `sendEmail` exige html OU text (contrat EmailContent).
  if (html) {
    return { to, subject, replyTo, html, ...(text ? { text } : {}) };
  }
  if (text) {
    return { to, subject, replyTo, text };
  }
  return null;
}

/** Persiste l'issue d'un job (status + attempts++ + last_error). */
async function markJob(
  supabase: ReturnType<typeof getServiceClient>,
  job: NotificationJobRow,
  status: "sent" | "failed",
  lastError: string | null,
): Promise<void> {
  await supabase
    .from(NOTIFICATION_JOBS_TABLE)
    .update({
      status,
      attempts: job.attempts + 1,
      last_error: lastError,
    })
    .eq("id", job.id);
}
