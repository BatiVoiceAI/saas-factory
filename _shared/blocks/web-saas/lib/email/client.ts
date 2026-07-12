import "server-only";

import { Resend } from "resend";
import { env } from "@/lib/env";

/**
 * Client Resend (bloc `notifications`).
 *
 * La clé `RESEND_API_KEY` est OPTIONNELLE dans le châssis (cf. lib/env.ts) :
 * un projet peut tourner sans email transactionnel. On ne construit donc le
 * client que si la clé est présente, et on l'expose via `getResend()` qui
 * throw explicitement quand on tente d'envoyer sans configuration.
 *
 * La clé n'est JAMAIS en dur : elle passe exclusivement par `env`
 * (safety-rails §4). `server-only` garantit qu'elle ne fuit pas au bundle
 * client.
 */

let resendSingleton: Resend | null = null;

/** L'email transactionnel est-il configuré pour ce projet ? */
export function isEmailConfigured(): boolean {
  return Boolean(env.RESEND_API_KEY && env.EMAIL_FROM);
}

/**
 * Retourne le client Resend, en le mémoïsant. Throw si `RESEND_API_KEY`
 * n'est pas configurée — appeler `isEmailConfigured()` en amont pour un envoi
 * best-effort silencieux.
 */
export function getResend(): Resend {
  if (!env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY manquante : le bloc notifications n'est pas configuré. " +
        "Renseigner RESEND_API_KEY et EMAIL_FROM (voir .env.example).",
    );
  }

  resendSingleton ??= new Resend(env.RESEND_API_KEY);
  return resendSingleton;
}
