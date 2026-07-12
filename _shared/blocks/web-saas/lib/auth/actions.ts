"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { env } from "@/lib/env";
import { resolveEnrollment } from "@/lib/auth/enrollment";
import { createClient } from "@/lib/supabase/server";

/**
 * Server Actions d'authentification (bloc `auth`) — flux PASSWORDLESS.
 *
 * Un seul parcours pour la connexion ET la création de compte : l'utilisateur
 * saisit son e-mail, reçoit un code à 6 chiffres + un magic link dans le même
 * e-mail, et valide l'un ou l'autre. Pas de mot de passe : pas de flux
 * « mot de passe oublié », et l'e-mail est vérifié par construction (saisir le
 * code ou cliquer le lien prouve la possession de la boîte mail).
 *
 * Contrat côté client : chaque action est consommée via `useActionState`
 * (React 19 / Next 15). Elle reçoit l'état précédent + le `FormData` du
 * formulaire et retourne un `AuthState`. En cas de succès, `verifyOtp`
 * `redirect()` — le composant n'a donc pas de branche « succès » à gérer ;
 * le magic link, lui, aboutit via `app/auth/callback/route.ts` (PKCE).
 */

const emailSchema = z.object({
  email: z.string().email("Adresse e-mail invalide."),
});

const otpSchema = z.object({
  email: z.string().email("Adresse e-mail invalide."),
  token: z
    .string()
    // Paste-friendly : on ignore espaces et séparateurs collés avec le code.
    .transform((value) => value.replace(/\D/g, ""))
    .pipe(z.string().length(6, "Le code contient 6 chiffres.")),
});

export type AuthState = {
  /** Étape du parcours : saisie de l'e-mail, ou vérification du code envoyé. */
  step: "email" | "verify";
  /** E-mail auquel le code a été envoyé (étape « verify »). */
  email?: string;
  /** Erreur transverse en langage humain (rate limit, code expiré…). */
  error?: string;
  /** Erreurs de validation par champ (zod). */
  fieldErrors?: Partial<Record<"email" | "token", string[]>>;
};

/** Cible post-login : la surface authentifiée (route group `(app)`). */
const AFTER_LOGIN = "/dashboard";

/**
 * Refus d'enrollment (déploiement `interne`/`perso`) : adresse non invitée ou
 * hors allowlist de domaine. Message unique pour le refus applicatif ET le refus
 * Supabase (`disable_signup`) — l'utilisateur ne peut pas distinguer les deux.
 */
const ACCESS_DENIED_MESSAGE =
  "Cette adresse n'est pas autorisée à accéder à cet outil. Demandez une invitation à l'administrateur.";

/**
 * Étape 1 — Envoie le code + magic link. Sert aussi au « Renvoyer le code »
 * (l'état précédent est alors conservé pour rester sur l'écran de vérification).
 */
export async function requestOtp(
  prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return {
      step: prevState.step,
      email: prevState.email,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Politique d'enrollment selon le type de déploiement (bloc `auth`). En mode
  // `public` : signup ouvert (compte créé à la volée). En `interne`/`perso` :
  // création anonyme interdite — l'entrée passe par une invitation ou un compte
  // seedé (autorité = `disable_signup` Supabase, cf. lib/auth/enrollment.ts).
  const enrollment = resolveEnrollment(parsed.data.email);
  if (!enrollment.allowed) {
    // Refus applicatif immédiat (domaine hors allowlist `interne`) — aucun code
    // n'est envoyé. Message honnête sans révéler qui est enrôlé.
    return {
      step: prevState.step,
      email: prevState.email,
      error: ACCESS_DENIED_MESSAGE,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      // `public` : login = signup, un seul écran, compte créé à la volée (le
      // trigger 0001_auth crée le profil). `interne`/`perso` : jamais de
      // création anonyme — seuls les comptes invités/seedés obtiennent un code.
      shouldCreateUser: enrollment.shouldCreateUser,
      // Le magic link contenu dans l'e-mail passe par le callback qui échange
      // le code PKCE contre une session. `NEXT_PUBLIC_SITE_URL` = origine publique.
      emailRedirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(
        AFTER_LOGIN,
      )}`,
    },
  });

  if (error) {
    // Signup désactivé (interne/perso) + adresse non enrôlée : GoTrue refuse la
    // création (`shouldCreateUser: false` sur e-mail inconnu, ou
    // `disable_signup=true`). On renvoie le même message de refus que le gate
    // applicatif — pas de code parti, pas de compte créé.
    if (error.code === "signup_disabled" || error.code === "otp_disabled") {
      return {
        step: prevState.step,
        email: prevState.email,
        error: ACCESS_DENIED_MESSAGE,
      };
    }
    // Messages humains, sans fuite d'info. (Pas d'énumération possible de
    // toute façon : compte existant ou pas, le même e-mail part.)
    if (error.code === "over_email_send_rate_limit" || error.status === 429) {
      return {
        step: prevState.step,
        email: prevState.email,
        error:
          "Trop de demandes rapprochées. Patientez une minute avant de redemander un code.",
      };
    }
    return {
      step: prevState.step,
      email: prevState.email,
      error: "L'envoi du code a échoué. Vérifiez l'adresse et réessayez.",
    };
  }

  return { step: "verify", email: parsed.data.email };
}

/** Étape 2 — Vérifie le code à 6 chiffres et ouvre la session. */
export async function verifyOtp(
  prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = otpSchema.safeParse({
    email: formData.get("email"),
    token: formData.get("token"),
  });

  if (!parsed.success) {
    return {
      step: "verify",
      email: prevState.email ?? String(formData.get("email") ?? ""),
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.token,
    // `email` couvre les codes de connexion ET de création de compte.
    type: "email",
  });

  if (error) {
    if (error.status === 429) {
      return {
        step: "verify",
        email: parsed.data.email,
        error: "Trop de tentatives. Patientez une minute puis réessayez.",
      };
    }
    // GoTrue renvoie la même erreur pour un code faux et un code expiré :
    // un seul message honnête, zéro fuite d'info.
    return {
      step: "verify",
      email: parsed.data.email,
      error:
        "Code incorrect ou expiré. Vérifiez la saisie ou demandez un nouveau code.",
    };
  }

  // Session posée (cookies écrits par le client serveur). Invalide le cache
  // serveur : le layout dépend désormais d'une session.
  revalidatePath("/", "layout");
  redirect(AFTER_LOGIN);
}

export async function signout(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
