// ─────────────────────────────────────────────────────────────────────────────
// AU1 — Config / secrets (déclarés, jamais en dur, validés au démarrage)
// ─────────────────────────────────────────────────────────────────────────────
// Un worker headless ne doit JAMAIS porter un secret en dur (safety-rails §4) :
// toute la config vient de `process.env`, validée par un schéma zod dès l'entrée
// du process. Config invalide ⇒ on échoue TÔT, avec un message clair listant les
// variables fautives — jamais un run à moitié configuré qui plante en plein vol.
//
// Doctrine des optionnels (design dependency-light) :
//   • OWNER_EMAIL est OBLIGATOIRE : c'est la cible de la boucle fermée (AU4). Sans
//     propriétaire, un job de valeur n'a personne à qui rendre compte.
//   • AU MOINS UN canal de notification est requis : (RESEND_API_KEY + EMAIL_FROM)
//     et/ou WEBHOOK_URL. Sans canal, AU4 est impossible → config refusée.
//   • Supabase est OPTIONNEL : absent, `runs` (AU2) et `idempotency` (AU5) basculent
//     sur un fallback console/fichier. Le worker tourne quand même.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";

// Fenêtre d'idempotence par défaut : 24 h. Un re-run dans cette fenêtre est
// considéré comme un doublon (AU5) — sauf si le run précédent a échoué (la clé
// est alors relâchée, cf. idempotency.ts).
//
// ⚠️⚠️ DÉFAUT CALIBRÉ POUR UN JOB QUOTIDIEN (bucket jour, cf. index.ts
// `idempotencyKeyFor`). Un worker SUB-QUOTIDIEN (cadence < 24 h : sync toutes les
// N h, la MAJORITÉ des automations) ne DOIT PAS s'appuyer sur ce défaut : sinon
// tous les runs après le 1er du jour sont SKIPPÉS EN SILENCE (0 erreur, le worker
// croit tourner toutes les N h et ne tourne qu'1×/jour — l'inverse de l'intention).
// → Un worker sub-quotidien DOIT passer sa fenêtre de cadence au site d'appel :
//   `withIdempotency(config, cle, fn, { windowSec: SYNC_INTERVAL_HOURS * 3600 })`
//   + une `rawKey` bucketisée sur la même période. Voir `IdempotencyOptions`
//   (idempotency.ts), le README (§ « Fenêtre d'idempotence ») et P0-A de la rétro.
const DEFAULT_IDEMPOTENCY_WINDOW_SEC = 24 * 60 * 60;

// Schéma brut des variables d'environnement. Tout est string à l'entrée : les
// nombres sont coercés, les paires cohérentes vérifiées par superRefine.
const EnvSchema = z
  .object({
    // ── État d'automatisation (Supabase REST) — OPTIONNEL (fallback console/fichier)
    SUPABASE_URL: z.string().url().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

    // ── Canal email de la boucle fermée (Resend REST) — OPTIONNEL en paire
    RESEND_API_KEY: z.string().min(1).optional(),
    EMAIL_FROM: z.string().min(1).optional(),

    // ── Propriétaire du job = destinataire de la boucle fermée (AU4) — REQUIS
    OWNER_EMAIL: z.string().email(),

    // ── Canal webhook de la boucle fermée (ex. Slack incoming webhook) — OPTIONNEL
    WEBHOOK_URL: z.string().url().optional(),

    // ── Secret de déclenchement (protège un endpoint /trigger ou le /health) — OPTIONNEL
    CRON_SECRET: z.string().min(1).optional(),

    // ── Réglages runtime — OPTIONNELS (défauts fournis)
    // Fenêtre d'idempotence PAR DÉFAUT (job quotidien). ⚠️ Sub-quotidien : NE PAS
    // se reposer dessus — surcharger par claim via `withIdempotency(..., { windowSec })`.
    IDEMPOTENCY_WINDOW_SEC: z.coerce
      .number()
      .int()
      .positive()
      .default(DEFAULT_IDEMPOTENCY_WINDOW_SEC),
    HEALTHCHECK_PORT: z.coerce.number().int().min(1).max(65535).optional(),
  })
  .superRefine((e, ctx) => {
    // Supabase va par PAIRE : url + clé service-role, ou rien.
    if ((e.SUPABASE_URL == null) !== (e.SUPABASE_SERVICE_ROLE_KEY == null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["SUPABASE_SERVICE_ROLE_KEY"],
        message:
          "SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY vont ensemble : fournis les deux, ou aucun.",
      });
    }
    // Resend va par PAIRE : clé API + expéditeur, ou rien.
    if ((e.RESEND_API_KEY == null) !== (e.EMAIL_FROM == null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["EMAIL_FROM"],
        message:
          "RESEND_API_KEY et EMAIL_FROM vont ensemble (canal email de la boucle fermée) : fournis les deux, ou aucun.",
      });
    }
    // AU4 : au moins un canal de notification, sinon la boucle fermée est impossible.
    const hasEmail = e.RESEND_API_KEY != null && e.EMAIL_FROM != null;
    const hasWebhook = e.WEBHOOK_URL != null;
    if (!hasEmail && !hasWebhook) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["OWNER_EMAIL"],
        message:
          "Aucun canal de boucle fermée (AU4). Fournis (RESEND_API_KEY + EMAIL_FROM) et/ou WEBHOOK_URL.",
      });
    }
  });

// ── Type de config résolu, exploité par le reste du châssis ─────────────────
// On expose des sous-objets non-nuls quand la capacité est disponible (`null`
// sinon) : le code appelant teste `config.supabase != null` plutôt que de
// jongler avec des champs épars — les invariants de paire sont déjà garantis.
export type Config = {
  /** État d'automatisation (runs + idempotence). `null` ⇒ fallback console/fichier. */
  supabase: { url: string; serviceRoleKey: string } | null;
  /** Canal email de la boucle fermée. `null` ⇒ pas d'email (webhook seul). */
  resend: { apiKey: string; from: string } | null;
  /** Propriétaire du job — destinataire de la boucle fermée (AU4). Toujours présent. */
  owner: { email: string };
  /** Canal webhook de la boucle fermée. `null` ⇒ pas de webhook (email seul). */
  webhookUrl: string | null;
  /** Secret de déclenchement optionnel (à comparer côté endpoint /trigger, /health). */
  cronSecret: string | null;
  /** Fenêtre d'idempotence en secondes (AU5). */
  idempotencyWindowSec: number;
  /** Port du serveur de healthcheck (AU3). `null` ⇒ mode one-shot sans /health. */
  healthcheckPort: number | null;
};

/**
 * Charge + valide la config depuis l'environnement. Lève une erreur claire et
 * actionnable si une variable requise manque ou si une paire est incohérente.
 * @param env source d'environnement (défaut `process.env`) — injectable en test.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = EnvSchema.safeParse(env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => {
        const where = issue.path.length > 0 ? issue.path.join(".") : "(env)";
        return `  - ${where} : ${issue.message}`;
      })
      .join("\n");
    throw new Error(
      `Configuration d'automatisation invalide (AU1). Corrige ces variables d'environnement :\n${details}`,
    );
  }

  const e = parsed.data;
  return {
    owner: { email: e.OWNER_EMAIL },
    supabase:
      e.SUPABASE_URL != null && e.SUPABASE_SERVICE_ROLE_KEY != null
        ? { url: e.SUPABASE_URL, serviceRoleKey: e.SUPABASE_SERVICE_ROLE_KEY }
        : null,
    resend:
      e.RESEND_API_KEY != null && e.EMAIL_FROM != null
        ? { apiKey: e.RESEND_API_KEY, from: e.EMAIL_FROM }
        : null,
    webhookUrl: e.WEBHOOK_URL ?? null,
    cronSecret: e.CRON_SECRET ?? null,
    idempotencyWindowSec: e.IDEMPOTENCY_WINDOW_SEC,
    healthcheckPort: e.HEALTHCHECK_PORT ?? null,
  };
}
