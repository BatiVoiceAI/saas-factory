import { env } from "@/lib/env";

/**
 * Politique d'enrollment par TYPE de déploiement (bloc `auth`).
 *
 * Usage SERVEUR uniquement (Server Actions, Server Components, middleware). PAS
 * de tripwire `import "server-only"` ici À DESSEIN : ce module est dans le graphe
 * du middleware (via le bloc `access-gate`), et `server-only` lève une exception
 * dans l'Edge Runtime. C'est sans risque de fuite : on ne lit que des variables
 * NON secrètes (`APP_ACCESS_MODE`, `AUTH_ALLOWED_EMAIL_DOMAINS`), jamais une clé.
 *
 * Le châssis a UN mécanisme d'auth : OTP → mot de passe (`lib/auth/actions.ts`,
 * l'e-mail est vérifié par un code à 6 chiffres, puis un mot de passe est posé).
 * L'enrollment ne change PAS ce mécanisme — il restreint seulement QUI a le droit
 * d'obtenir un code d'inscription, selon `APP_ACCESS_MODE` :
 *
 *  - `public` : signup ouvert. N'importe quelle adresse reçoit un code et le
 *    compte est créé à la volée (`shouldCreateUser: true`).
 *  - `interne` : outil d'équipe fermé. Deux stratégies (exclusives) :
 *      • INVITATIONS (défaut, `AUTH_ALLOWED_EMAIL_DOMAINS` vide) — seuls les
 *        comptes pré-créés par `auth.admin.inviteUserByEmail` (posés au
 *        provisioning) peuvent entrer ; l'app ne tente jamais de créer un compte
 *        (`shouldCreateUser: false`).
 *      • ALLOWLIST DE DOMAINE (`AUTH_ALLOWED_EMAIL_DOMAINS` renseigné) — une
 *        adresse d'un domaine listé peut s'enrôler seule ; les autres sont
 *        refusées AVANT tout appel Supabase (gate applicatif).
 *  - `perso` : outil perso. Un seul compte (le fondateur) est seedé au
 *    provisioning ; aucune création à la volée (`shouldCreateUser: false`).
 *
 * DÉFENSE EN PROFONDEUR — l'autorité NE réside PAS dans ce fichier. Le gate
 * FAISANT FOI est côté Supabase : `disable_signup=true` (posé par 11-project-setup
 * pour interne/perso) refuse toute création de compte inconnue, même si un appel
 * contourne l'app en tapant l'API GoTrue directement avec la clé anon. Cette
 * couche applicative garantit la COHÉRENCE (pas de tentative vouée à l'échec, un
 * message honnête, l'allowlist de domaine tranchée tôt) — elle ne remplace pas la
 * porte serveur.
 */

export type AccessMode = "public" | "interne" | "perso";

/** Mode de déploiement courant (défaut prudent : `public`). */
export function accessMode(): AccessMode {
  // `.default("public")` côté schéma garantit une valeur côté serveur ; le `??`
  // couvre le cas d'un bundle où le schéma serveur n'est pas parsé.
  return env.APP_ACCESS_MODE ?? "public";
}

/** Vrai si le déploiement est privé (outil interne ou perso). */
export function isPrivateMode(): boolean {
  return accessMode() !== "public";
}

/** Domaines e-mail autorisés à s'auto-enrôler (mode `interne` par domaine). */
function allowedEmailDomains(): string[] {
  const raw = env.AUTH_ALLOWED_EMAIL_DOMAINS;
  if (!raw) return [];
  return raw
    .split(",")
    .map((d) => d.trim().replace(/^@/, "").toLowerCase())
    .filter((d) => d.length > 0);
}

export type Enrollment = {
  /**
   * L'app doit-elle appeler `signInWithOtp` pour cette adresse ? `false` = refus
   * applicatif immédiat (domaine hors allowlist) — aucun code n'est envoyé.
   */
  allowed: boolean;
  /**
   * Valeur à passer à `signInWithOtp` : crée le compte à la volée si l'adresse
   * est inconnue. Toujours `false` hors `public`/allowlist (l'entrée passe par
   * une invitation ou un compte seedé, jamais par une création anonyme).
   */
  shouldCreateUser: boolean;
};

/**
 * Résout la politique d'enrollment pour une adresse donnée, selon le mode.
 * `email` est déjà validé (zod) en amont ; on ne lit ici que son domaine.
 */
export function resolveEnrollment(email: string): Enrollment {
  const mode = accessMode();

  if (mode === "public") {
    return { allowed: true, shouldCreateUser: true };
  }

  if (mode === "perso") {
    // Seul le compte seedé existe ; Supabase (`disable_signup`) refuse le reste.
    return { allowed: true, shouldCreateUser: false };
  }

  // mode === "interne"
  const domains = allowedEmailDomains();
  if (domains.length === 0) {
    // Invitations : l'app ne crée jamais ; seuls les comptes invités entrent.
    return { allowed: true, shouldCreateUser: false };
  }

  // Allowlist de domaine : un domaine listé peut s'enrôler seul.
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  const ok = domain.length > 0 && domains.includes(domain);
  return { allowed: ok, shouldCreateUser: ok };
}
