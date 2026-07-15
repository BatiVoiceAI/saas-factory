// ─────────────────────────────────────────────────────────────────────────────
// Config / secrets (déclarés, jamais en dur, validés au démarrage)
// ─────────────────────────────────────────────────────────────────────────────
// Un châssis qui manipule des paiements ne doit JAMAIS porter un secret en dur
// (safety-rails §4) : toute la config vient de `process.env`, validée par un schéma
// zod dès l'entrée du process. Config invalide ⇒ on échoue TÔT, avec un message
// clair listant les variables fautives — jamais une boutique à moitié configurée
// qui plante en plein checkout.
//
// Divergence ASSUMÉE vs le châssis `automation` (où Supabase/Resend étaient
// OPTIONNELS avec fallback) : une boutique n'a AUCUN fallback crédible. Le
// catalogue/les commandes/le stock vivent dans Supabase ; l'encaissement est
// Stripe ; la boucle fermée EC4 (« aucune vente muette ») exige un canal e-mail.
// Les trois paires sont donc REQUISES — leur absence est une config cassée, pas
// un mode dégradé. La testabilité SANS réseau reste garantie : les tests
// construisent un objet `Config` directement (cf. patron `test/_smoke.test.ts` du
// châssis automation), ils ne passent pas par `loadConfig`.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";

// Schéma brut des variables d'environnement. Tout est string à l'entrée ; les
// paires cohérentes (url+clé) sont garanties par les contraintes de type.
const EnvSchema = z.object({
  // ── Catalogue / commandes / stock (Supabase REST) — REQUIS ─────────────────
  // La service-role bypasse la RLS : c'est l'appelant de la RPC fulfill_paid_order
  // (webhook). Secret serveur, jamais exposé au navigateur.
  SUPABASE_URL: z.string().url({
    message: "SUPABASE_URL doit être une URL Supabase valide.",
  }),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, {
    message: "SUPABASE_SERVICE_ROLE_KEY est requise (secret serveur, bypass RLS).",
  }),

  // ── Paiement one-shot + webhook (Stripe) — REQUIS ──────────────────────────
  // `mode:payment` (JAMAIS subscription). Le webhook secret vérifie la SIGNATURE
  // (P3) avant tout accès DB : un POST non signé est rejeté.
  STRIPE_SECRET_KEY: z.string().min(1, {
    message: "STRIPE_SECRET_KEY est requise (création des Checkout Sessions one-shot).",
  }),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, {
    message:
      "STRIPE_WEBHOOK_SECRET est requise (vérification de signature du webhook — P3).",
  }),

  // ── Boucle fermée EC4 (Resend REST) — REQUIS ───────────────────────────────
  // Confirmation client + notification marchand : « aucune vente muette ».
  RESEND_API_KEY: z.string().min(1, {
    message: "RESEND_API_KEY est requise (boucle fermée EC4 : e-mail de confirmation).",
  }),
  EMAIL_FROM: z.string().min(1, {
    message: "EMAIL_FROM est requis (expéditeur des confirmations + boîte marchand).",
  }),
});

// ── Type de config résolu, exploité par le reste du châssis ─────────────────
// On expose des sous-objets cohérents (url+clé ensemble) : le code appelant tient
// `config.stripe.webhookSecret` plutôt que de jongler avec des champs épars.
export type Config = {
  /** Catalogue / commandes / stock (service-role, appelant de la RPC de paiement). */
  supabase: { url: string; serviceRoleKey: string };
  /** Paiement one-shot Stripe + secret de vérification de signature du webhook (P3). */
  stripe: { secretKey: string; webhookSecret: string };
  /** Canal e-mail de la boucle fermée EC4 (confirmation client + notif marchand). */
  resend: { apiKey: string; from: string };
};

/**
 * Charge + valide la config depuis l'environnement. Lève une erreur claire et
 * actionnable si une variable requise manque ou est invalide.
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
      `Configuration ecommerce invalide. Corrige ces variables d'environnement :\n${details}`,
    );
  }

  const e = parsed.data;
  return {
    supabase: {
      url: e.SUPABASE_URL,
      serviceRoleKey: e.SUPABASE_SERVICE_ROLE_KEY,
    },
    stripe: {
      secretKey: e.STRIPE_SECRET_KEY,
      webhookSecret: e.STRIPE_WEBHOOK_SECRET,
    },
    resend: {
      apiKey: e.RESEND_API_KEY,
      from: e.EMAIL_FROM,
    },
  };
}
