import "server-only";

import { sendEmail, type SendEmailResult } from "@/lib/email/send";
import { WelcomeEmail } from "@/lib/email/templates/welcome";
import { ui } from "@/lib/i18n";

/**
 * Envoi de l'email de bienvenue (bloc `notifications`).
 *
 * Fonction de convenance, SANS dépendance dure vers le bloc `auth` : ce dernier
 * PEUT l'importer et l'appeler juste après un signup réussi, mais rien ne l'y
 * oblige. L'envoi est best-effort — `sendEmail` no-op proprement si le bloc
 * n'est pas configuré (voir lib/email/send.ts).
 *
 * Exemple d'usage côté auth (Server Action / Route Handler) :
 *   import { sendWelcomeEmail } from "@/lib/email/welcome";
 *   await sendWelcomeEmail({ to: user.email, name: user.user_metadata?.name });
 */

export type SendWelcomeEmailParams = {
  to: string;
  name?: string;
  actionUrl?: string;
  productName?: string;
};

export async function sendWelcomeEmail({
  to,
  name,
  actionUrl,
  productName,
}: SendWelcomeEmailParams): Promise<SendEmailResult> {
  return sendEmail({
    to,
    // Objet dans la langue du produit (lib/i18n) — cohérent avec le corps du mail.
    subject: ui.email.welcomeSubject,
    react: WelcomeEmail({ name, actionUrl, productName }),
  });
}
