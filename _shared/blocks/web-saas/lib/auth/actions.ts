"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { AuthError } from "@supabase/supabase-js";
import { ui } from "@/lib/i18n";
import { resolveEnrollment } from "@/lib/auth/enrollment";
import { createClient } from "@/lib/supabase/server";
import type {
  LoginFormState,
  OtpRequestState,
  OtpVerifyState,
  PasswordFormState,
  ResetFormState,
} from "@/lib/auth/form-state";

/**
 * Server Actions d'authentification (bloc `auth`) — flux OTP → MOT DE PASSE.
 *
 * Décision produit (Felix) : plus de magic link. Deux parcours distincts.
 *
 *  INSCRIPTION (3 étapes) : e-mail → `requestSignupOtp` envoie un code à 6
 *  chiffres → `verifyOtp` vérifie le code et OUVRE la session (l'e-mail est
 *  vérifié par cet acte) → `setPassword` pose le mot de passe (`updateUser`) et
 *  redirige. Mécanique Supabase : `signInWithOtp` (crée le compte à la volée
 *  selon l'enrollment) → `verifyOtp({type:'email'})` → `updateUser({password})`.
 *
 *  CONNEXION (1 étape) : `signInWithPassword` (e-mail + mot de passe) → redirect.
 *
 *  MOT DE PASSE OUBLIÉ (2 étapes) : e-mail → `requestPasswordReset` envoie un
 *  code (au compte EXISTANT ; jamais de création) → `resetPassword` vérifie le
 *  code (ouvre la session) puis pose le nouveau mot de passe et redirige.
 *
 * L'e-mail d'OTP ne contient QUE le code (pas de lien de connexion) — le
 * template prod est posé code-seul par `provisioner-db` (cf. supabase/config.toml).
 *
 * Contrat client : chaque action est consommée via `useActionState`. Sécurité :
 * le mot de passe n'est JAMAIS journalisé ni renvoyé au client — il ne transite
 * que du `FormData` vers Supabase.
 */

/** Cible post-login : la surface authentifiée (route group `(app)`). */
const AFTER_LOGIN = "/dashboard";

// ─── Schémas de validation ───────────────────────────────────────────────────

const emailSchema = z.string().trim().email(ui.auth.errors.emailInvalid);

/** Code OTP : paste-friendly (on retire tout non-chiffre), exactement 6 chiffres. */
const codeSchema = z
  .string()
  .transform((value) => value.replace(/\D/g, ""))
  .pipe(z.string().length(6, ui.auth.errors.code));

/**
 * Force du mot de passe (règles raisonnables, alignées sur
 * `supabase/config.toml` [auth]) : 8–72 caractères, au moins une lettre et un
 * chiffre. La borne 72 = limite bcrypt de GoTrue (au-delà, tronqué côté serveur).
 */
const passwordSchema = z
  .string()
  .min(8, ui.auth.errors.passwordShort)
  .max(72, ui.auth.errors.passwordLong)
  .regex(/[A-Za-z]/, ui.auth.errors.passwordLetter)
  .regex(/\d/, ui.auth.errors.passwordNumber);

// ─── Mapping d'erreurs Supabase → messages humains (sans fuite d'info) ────────

/** Erreur d'envoi de code (`signInWithOtp`). */
function sendErrorMessage(error: AuthError): string {
  if (error.code === "signup_disabled" || error.code === "otp_disabled") {
    return ui.auth.errors.accessDenied;
  }
  if (error.code === "over_email_send_rate_limit" || error.status === 429) {
    return ui.auth.errors.rateLimit;
  }
  return ui.auth.errors.sendFailed;
}

/** Erreur de vérification de code (`verifyOtp`) — code faux ET expiré = même message. */
function verifyErrorMessage(error: AuthError): string {
  if (error.status === 429) return ui.auth.errors.rateLimit;
  return ui.auth.errors.codeIncorrect;
}

/** Erreur de pose de mot de passe (`updateUser`). */
function passwordErrorMessage(error: AuthError): string {
  if (error.status === 429) return ui.auth.errors.rateLimit;
  if (error.code === "weak_password") return ui.auth.errors.passwordWeak;
  return ui.auth.errors.generic;
}

// ─── INSCRIPTION ──────────────────────────────────────────────────────────────

/**
 * Étape 1 — Envoie le code d'inscription. Sert aussi au « Renvoyer le code ».
 * L'enrollment (type de déploiement) décide si le compte peut être créé à la
 * volée (`public`/allowlist) ou doit préexister (invitations/`perso`).
 */
export async function requestSignupOtp(
  _prevState: OtpRequestState,
  formData: FormData,
): Promise<OtpRequestState> {
  const rawEmail = String(formData.get("email") ?? "");
  const parsed = emailSchema.safeParse(rawEmail);
  if (!parsed.success) {
    return {
      sent: false,
      email: rawEmail,
      fieldErrors: { email: parsed.error.issues.map((i) => i.message) },
    };
  }

  const enrollment = resolveEnrollment(parsed.data);
  if (!enrollment.allowed) {
    // Refus applicatif immédiat (domaine hors allowlist) — aucun code envoyé.
    return { sent: false, email: parsed.data, error: ui.auth.errors.accessDenied };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: {
      // `public`/allowlist : compte créé à la volée ; sinon (invitations/perso) :
      // seul un compte préexistant reçoit un code — l'écran sert alors à
      // l'ACTIVATION (poser le mot de passe d'un compte invité/seedé).
      shouldCreateUser: enrollment.shouldCreateUser,
      // Pas d'`emailRedirectTo` : le flux n'a plus de lien de connexion, l'e-mail
      // ne porte QUE le code à 6 chiffres.
    },
  });

  if (error) {
    return { sent: false, email: parsed.data, error: sendErrorMessage(error) };
  }
  return { sent: true, email: parsed.data };
}

/**
 * Étape 2 — Vérifie le code à 6 chiffres et OUVRE la session (l'e-mail est
 * vérifié). Ne redirige pas : l'UI enchaîne sur l'écran « créer un mot de passe ».
 */
export async function verifyOtp(
  _prevState: OtpVerifyState,
  formData: FormData,
): Promise<OtpVerifyState> {
  const parsedEmail = emailSchema.safeParse(String(formData.get("email") ?? ""));
  const parsedCode = codeSchema.safeParse(String(formData.get("code") ?? ""));

  if (!parsedEmail.success || !parsedCode.success) {
    return {
      verified: false,
      fieldErrors: parsedCode.success
        ? undefined
        : { code: parsedCode.error.issues.map((i) => i.message) },
      error: parsedEmail.success ? undefined : ui.auth.errors.sessionExpired,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: parsedEmail.data,
    token: parsedCode.data,
    type: "email",
  });

  if (error) {
    return { verified: false, error: verifyErrorMessage(error) };
  }
  // Session posée (cookies écrits par le client serveur) ; le mot de passe reste
  // à poser à l'étape suivante.
  return { verified: true };
}

/**
 * Étape 3 — Pose le mot de passe sur la session ouverte à l'étape 2, puis
 * redirige vers la surface authentifiée. Action TERMINALE.
 */
export async function setPassword(
  _prevState: PasswordFormState,
  formData: FormData,
): Promise<PasswordFormState> {
  const parsed = passwordSchema.safeParse(String(formData.get("password") ?? ""));
  const confirm = String(formData.get("confirm") ?? "");

  if (!parsed.success) {
    return { fieldErrors: { password: parsed.error.issues.map((i) => i.message) } };
  }
  if (parsed.data !== confirm) {
    return { fieldErrors: { confirm: [ui.auth.errors.passwordMismatch] } };
  }

  const supabase = await createClient();
  // Garde : `updateUser` exige une session (posée par `verifyOtp`). Si elle a
  // expiré entre-temps, on renvoie l'utilisateur reprendre la vérification.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: ui.auth.errors.sessionExpired };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) {
    return { error: passwordErrorMessage(error) };
  }

  revalidatePath("/", "layout");
  redirect(AFTER_LOGIN);
}

// ─── CONNEXION ────────────────────────────────────────────────────────────────

/** Connexion e-mail + mot de passe. Action TERMINALE (redirect au succès). */
export async function signInWithPassword(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const parsedEmail = emailSchema.safeParse(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  const fieldErrors: LoginFormState["fieldErrors"] = {};
  if (!parsedEmail.success) {
    fieldErrors.email = parsedEmail.error.issues.map((i) => i.message);
  }
  if (password.length === 0) {
    fieldErrors.password = [ui.auth.errors.passwordRequired];
  }
  if (fieldErrors.email || fieldErrors.password) {
    return { fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsedEmail.success ? parsedEmail.data : "",
    password,
  });

  if (error) {
    if (error.status === 429) return { error: ui.auth.errors.rateLimit };
    // Identifiants faux OU e-mail non confirmé → même message, zéro énumération.
    return { error: ui.auth.errors.invalidCredentials };
  }

  revalidatePath("/", "layout");
  redirect(AFTER_LOGIN);
}

// ─── MOT DE PASSE OUBLIÉ ──────────────────────────────────────────────────────

/**
 * Étape 1 — Envoie un code au compte EXISTANT (jamais de création). Réponse
 * anti-énumération : on renvoie « envoyé » même si l'adresse est inconnue ou le
 * signup désactivé — seul un rate limit est signalé.
 */
export async function requestPasswordReset(
  _prevState: OtpRequestState,
  formData: FormData,
): Promise<OtpRequestState> {
  const parsed = emailSchema.safeParse(String(formData.get("email") ?? ""));
  if (!parsed.success) {
    return {
      sent: false,
      email: String(formData.get("email") ?? ""),
      fieldErrors: { email: parsed.error.issues.map((i) => i.message) },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: { shouldCreateUser: false },
  });

  if (error && error.status === 429) {
    return { sent: false, email: parsed.data, error: ui.auth.errors.rateLimit };
  }
  // Toute autre erreur (adresse inconnue, signup désactivé) est avalée : on ne
  // révèle pas si un compte existe pour cette adresse.
  return { sent: true, email: parsed.data };
}

/**
 * Étape 2 — Vérifie le code (ouvre la session) puis pose le nouveau mot de passe
 * en un seul envoi. Action TERMINALE (redirect au succès).
 */
export async function resetPassword(
  _prevState: ResetFormState,
  formData: FormData,
): Promise<ResetFormState> {
  const parsedEmail = emailSchema.safeParse(String(formData.get("email") ?? ""));
  const parsedCode = codeSchema.safeParse(String(formData.get("code") ?? ""));
  const parsedPassword = passwordSchema.safeParse(
    String(formData.get("password") ?? ""),
  );
  const confirm = String(formData.get("confirm") ?? "");

  const fieldErrors: ResetFormState["fieldErrors"] = {};
  if (!parsedCode.success) {
    fieldErrors.code = parsedCode.error.issues.map((i) => i.message);
  }
  if (!parsedPassword.success) {
    fieldErrors.password = parsedPassword.error.issues.map((i) => i.message);
  } else if (parsedPassword.data !== confirm) {
    fieldErrors.confirm = [ui.auth.errors.passwordMismatch];
  }
  if (fieldErrors.code || fieldErrors.password || fieldErrors.confirm) {
    return { fieldErrors };
  }
  if (!parsedEmail.success) {
    return { error: ui.auth.errors.sessionExpired };
  }

  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    email: parsedEmail.data,
    token: parsedCode.success ? parsedCode.data : "",
    type: "email",
  });
  if (verifyError) {
    return { fieldErrors: { code: [ui.auth.errors.codeIncorrect] } };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: parsedPassword.success ? parsedPassword.data : "",
  });
  if (updateError) {
    return { error: passwordErrorMessage(updateError) };
  }

  revalidatePath("/", "layout");
  redirect(AFTER_LOGIN);
}

// ─── DÉCONNEXION ──────────────────────────────────────────────────────────────

export async function signout(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
