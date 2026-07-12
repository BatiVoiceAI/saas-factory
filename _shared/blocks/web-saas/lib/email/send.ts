import "server-only";

import type { ReactElement } from "react";
import type { CreateEmailResponseSuccess } from "resend";
import { env } from "@/lib/env";
import { getResend, isEmailConfigured } from "@/lib/email/client";

/**
 * Envoi d'email transactionnel typé (bloc `notifications`).
 *
 * L'expéditeur vient TOUJOURS de `env.EMAIL_FROM` (jamais en dur). Le contenu
 * est fourni soit sous forme de composant React (`react`), soit en HTML/texte
 * brut — au moins l'un des trois est requis.
 */

type EmailContent =
  | { react: ReactElement; html?: never; text?: string }
  | { html: string; react?: never; text?: string }
  | { text: string; react?: never; html?: never };

export type SendEmailParams = {
  /** Destinataire(s). */
  to: string | string[];
  /** Objet du message. */
  subject: string;
  /** Adresse de réponse optionnelle. */
  replyTo?: string | string[];
} & EmailContent;

export type SendEmailResult =
  | { ok: true; skipped?: false; data: CreateEmailResponseSuccess }
  | { ok: true; skipped: true }
  | { ok: false; error: string };

/**
 * Envoie un email via Resend. Best-effort : si le bloc n'est pas configuré
 * (pas de `RESEND_API_KEY`/`EMAIL_FROM`), on ne throw pas — on retourne
 * `{ ok: true, skipped: true }` pour ne pas casser un flux appelant (ex.
 * signup) dont l'email n'est pas critique.
 */
export async function sendEmail(
  params: SendEmailParams,
): Promise<SendEmailResult> {
  if (!isEmailConfigured()) {
    return { ok: true, skipped: true };
  }

  const { to, subject, replyTo, ...content } = params;

  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM!,
      to,
      subject,
      replyTo,
      ...content,
    });

    if (error) {
      return { ok: false, error: error.message };
    }
    // `data` non-null quand `error` est null (contrat Resend).
    return { ok: true, data: data! };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Échec d'envoi email inconnu.",
    };
  }
}
