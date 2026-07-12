import { z } from "zod";

/**
 * Validation typée des variables d'environnement.
 *
 * - Les clés du CHÂSSIS (shell/SEO + Supabase) sont REQUISES : le build/dev
 *   throw explicitement si l'une manque.
 * - Les clés de blocs OPTIONNELS (notifications, observability, billing) sont
 *   `.optional()` — leur bloc les consomme mais le template compile sans elles.
 *
 * Registre de propriété des clés : cf. CONVENTIONS.md § « Registre env ».
 * Un bloc qui a besoin d'une nouvelle clé l'ajoute au schéma correspondant.
 */

const serverSchema = z.object({
  // --- Supabase (auth/crud) — requis côté serveur -----------------------
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // --- Type de déploiement (blocs auth + access-gate) ------------------
  // Pilote DEUX choses, jamais l'une sans l'autre :
  //   1. l'enrollment (QUI peut entrer) — bloc `auth`, `lib/auth/enrollment.ts` ;
  //   2. le gate d'accès (noindex + redirection de bord) — bloc `access-gate`.
  // Le MÉCANISME d'auth reste l'OTP passwordless quel que soit le mode : ce
  // réglage ne fait que restreindre l'enrollment et la surface publique.
  // Défaut prudent = `public` (surface ouverte + indexable) ; posé par
  // 11-project-setup selon le `type` du projet (public / interne / perso).
  APP_ACCESS_MODE: z.enum(["public", "interne", "perso"]).default("public"),
  // Allowlist de domaines e-mail pour l'enrollment `interne` PAR DOMAINE
  // (ex. "acme.com,acme.io") : une adresse d'un domaine listé peut s'enrôler
  // seule. Vide (défaut) = mode INVITATIONS (seuls les comptes pré-invités
  // via `auth.admin.inviteUserByEmail` entrent). Sans objet en `public`/`perso`.
  AUTH_ALLOWED_EMAIL_DOMAINS: z.string().min(1).optional(),

  // --- Notifications (bloc notifications) — optionnel -------------------
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(1).optional(),

  // --- Observability (bloc observability) — optionnel ------------------
  SENTRY_AUTH_TOKEN: z.string().min(1).optional(),

  // --- Billing (bloc billing) — optionnel ------------------------------
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  STRIPE_PRICE_ID: z.string().min(1).optional(),
});

const clientSchema = z.object({
  // --- Shell / SEO — requis --------------------------------------------
  NEXT_PUBLIC_SITE_URL: z.string().url(),

  // --- Supabase (auth/crud) — requis -----------------------------------
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

  // --- Observability (bloc observability) — optionnel ------------------
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),

  // --- Billing (bloc billing) — optionnel ------------------------------
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
});

/**
 * Les `NEXT_PUBLIC_*` sont inlinées au build par Next : on doit les référencer
 * statiquement (pas d'accès dynamique à process.env) pour qu'elles soient
 * remplacées côté client.
 */
const clientEnvRaw = {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
};

function formatErrors(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

const parsedClient = clientSchema.safeParse(clientEnvRaw);
if (!parsedClient.success) {
  throw new Error(
    `❌ Variables d'environnement publiques invalides ou manquantes :\n${formatErrors(
      parsedClient.error,
    )}\nVoir .env.example.`,
  );
}

/**
 * Le schéma serveur n'est validé QUE côté serveur : au bundle client,
 * process.env n'expose pas les clés secrètes, et les valider planterait le
 * navigateur inutilement.
 */
const isServer = typeof window === "undefined";
const parsedServer = isServer
  ? serverSchema.safeParse(process.env)
  : ({ success: true, data: {} as z.infer<typeof serverSchema> } as const);

if (isServer && !parsedServer.success) {
  throw new Error(
    `❌ Variables d'environnement serveur invalides ou manquantes :\n${formatErrors(
      parsedServer.error,
    )}\nVoir .env.example.`,
  );
}

export const env = {
  ...parsedClient.data,
  ...(parsedServer.success ? parsedServer.data : {}),
} as z.infer<typeof clientSchema> & z.infer<typeof serverSchema>;
