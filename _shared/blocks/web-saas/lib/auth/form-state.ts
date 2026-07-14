/**
 * États des formulaires d'auth (bloc `auth`, flux OTP → mot de passe).
 *
 * Module PLAIN (pas de directive `"use server"`) À DESSEIN : un fichier
 * `"use server"` ne peut exporter QUE des fonctions async. Les TYPES d'état et
 * leurs valeurs INITIALES vivent donc ici, importés à la fois par les Server
 * Actions (`lib/auth/actions.ts`, en `import type`) et par les composants client
 * (`components/auth/*`, qui consomment aussi les constantes `*_INIT`).
 *
 * Chaque état est pensé pour `useActionState` (React 19 / Next 15) : l'action
 * reçoit l'état précédent + le `FormData` et retourne le nouvel état. Les
 * actions terminales (`setPassword`, `signInWithPassword`, `resetPassword`,
 * `verifyOtp` côté connexion) font un `redirect()` serveur — pas de branche
 * « succès » à gérer côté client pour celles-là.
 */

/** Erreurs de validation par champ (zod), partagées par les formulaires. */
export type AuthFieldErrors = Partial<
  Record<"email" | "code" | "password" | "confirm", string[]>
>;

/**
 * Étape 1 de l'inscription / réinitialisation : envoi du code OTP.
 * `sent` bascule à `true` une fois le code parti (l'UI passe alors à l'étape
 * suivante) ; `email` est renvoyé pour être injecté dans les étapes suivantes.
 */
export type OtpRequestState = {
  sent: boolean;
  email: string;
  error?: string;
  fieldErrors?: Pick<AuthFieldErrors, "email">;
};

export const OTP_REQUEST_INIT: OtpRequestState = { sent: false, email: "" };

/**
 * Étape 2 de l'inscription : vérification du code (ouvre la session).
 * `verified` bascule à `true` quand la session est ouverte — l'UI passe alors à
 * l'écran « créer un mot de passe ».
 */
export type OtpVerifyState = {
  verified: boolean;
  error?: string;
  fieldErrors?: Pick<AuthFieldErrors, "code">;
};

export const OTP_VERIFY_INIT: OtpVerifyState = { verified: false };

/** Étape 3 de l'inscription : pose du mot de passe (action terminale → redirect). */
export type PasswordFormState = {
  error?: string;
  fieldErrors?: Pick<AuthFieldErrors, "password" | "confirm">;
};

export const PASSWORD_INIT: PasswordFormState = {};

/** Connexion e-mail + mot de passe (action terminale → redirect). */
export type LoginFormState = {
  error?: string;
  fieldErrors?: Pick<AuthFieldErrors, "email" | "password">;
};

export const LOGIN_INIT: LoginFormState = {};

/**
 * Réinitialisation, étape finale : code + nouveau mot de passe en un envoi
 * (action terminale → redirect).
 */
export type ResetFormState = {
  error?: string;
  fieldErrors?: Pick<AuthFieldErrors, "code" | "password" | "confirm">;
};

export const RESET_INIT: ResetFormState = {};
