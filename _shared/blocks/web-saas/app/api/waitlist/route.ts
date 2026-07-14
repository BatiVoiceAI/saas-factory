// BLOC OPTIONNEL — inclus seulement pour l'archétype landing (bloc `waitlist`).
import { NextResponse } from "next/server";
import { ui } from "@/lib/i18n";
import { dispatchEntityJobs } from "@/lib/notifications/dispatch";
import { enqueueJob } from "@/lib/notifications/enqueue";
import { getServiceClient } from "@/lib/notifications/service";
import { waitlistInputSchema } from "@/lib/schemas/waitlist";
import { buildWaitlistConfirmationEmail } from "@/lib/waitlist/confirmation-email";

// Runtime Node requis : client service-role Supabase + envoi Resend (bloc notifications).
export const runtime = "nodejs";

/** Table métier de capture (0005_waitlist.sql). Une seule source de vérité. */
const LEADS_TABLE = "leads" as const;
/** Type d'entité porté par le job de boucle fermée (bloc notifications). */
const WAITLIST_ENTITY_TYPE = "lead" as const;
/** Nature de la boucle (unique par (entity_id, type) — idempotence enqueue). */
const WAITLIST_JOB_TYPE = "waitlist_confirmation" as const;

/**
 * Capture d'un lead de liste d'attente (bloc `waitlist`, archétype landing).
 *
 * POST { email, source? } :
 *   1. valide le payload (zod, e-mail normalisé trim + minuscule) ;
 *   2. insère le lead via le client SERVICE-ROLE (la table `leads` est RLS sans
 *      policy : aucun client anon n'y écrit — cf. 0005_waitlist.sql) ;
 *   3. ENFILE un job `waitlist_confirmation` (durabilité + idempotence + retry)
 *      PUIS APPELLE l'envoi immédiat `dispatchEntityJobs(lead.id)` — boucle
 *      fermée, best-effort, non bloquante (_shared/boucles-fermees.md).
 *
 * Idempotent sur l'e-mail : l'index UNIQUE `lower(email)` fait qu'un e-mail déjà
 * inscrit lève une violation d'unicité (SQLSTATE 23505) ; on la traite comme un
 * succès sans doublon (aucune ré-insertion, aucun second e-mail).
 *
 * NB : on n'utilise pas `upsert({ onConflict })` — la cible d'unicité est un
 * index d'EXPRESSION `lower(email)` que PostgREST ne sait pas viser via
 * `on_conflict` (qui n'accepte que des noms de colonnes). On attrape donc 23505.
 */
export async function POST(request: Request): Promise<NextResponse> {
  // ── 1. Validation du payload ───────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Corps de requête JSON invalide." },
      { status: 400 },
    );
  }

  const parsed = waitlistInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? ui.waitlist.error },
      { status: 422 },
    );
  }
  const { email, source } = parsed.data;

  // Referrer capté depuis l'en-tête HTTP (attribution) — jamais depuis le body.
  const referrer = request.headers.get("referer");

  // ── 2. Insertion du lead (service-role, bypass RLS) ────────────────────────
  let supabase: ReturnType<typeof getServiceClient>;
  try {
    supabase = getServiceClient();
  } catch {
    // Service-role non configuré : la capture est impossible côté serveur.
    return NextResponse.json(
      { ok: false, error: ui.waitlist.error },
      { status: 503 },
    );
  }

  const { data: lead, error: insertError } = await supabase
    .from(LEADS_TABLE)
    .insert({ email, source: source ?? null, referrer })
    .select("id")
    .single();

  if (insertError) {
    // 23505 = unique_violation → e-mail déjà sur la liste : idempotent, on
    // renvoie ok sans doublon et sans renvoyer un second e-mail de confirmation.
    if (insertError.code === "23505") {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json(
      { ok: false, error: ui.waitlist.error },
      { status: 500 },
    );
  }

  // ── 3. Boucle fermée : enfiler PUIS envoyer immédiatement (best-effort) ─────
  // Les deux temps sont indissociables : enfiler sans dispatcher = job muet
  // jusqu'au cron. Aucun des deux ne casse la réponse (best-effort par contrat).
  const { subject, html } = buildWaitlistConfirmationEmail();
  await enqueueJob({
    entityType: WAITLIST_ENTITY_TYPE,
    entityId: lead.id,
    type: WAITLIST_JOB_TYPE,
    recipient: email,
    payload: { subject, html },
  });
  await dispatchEntityJobs(lead.id);

  return NextResponse.json({ ok: true });
}
