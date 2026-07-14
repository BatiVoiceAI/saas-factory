import "server-only";

import { brand } from "@/lib/brand";
import { env } from "@/lib/env";
import { locale, ui } from "@/lib/i18n";

/**
 * E-mail de confirmation d'inscription à la liste d'attente (bloc `waitlist`).
 *
 * Construit le couple { subject, html } sérialisé dans le `payload` jsonb du job
 * `waitlist_confirmation` (bloc notifications) : `dispatch` lit `payload.subject`
 * + `payload.html` et livre via Resend (cf. lib/notifications/dispatch.ts). On
 * NE passe PAS de composant React (le payload doit être sérialisable en base) —
 * d'où un HTML « email-safe » (styles inline, table de layout, zéro dépendance).
 *
 * Vit dans `lib/` (et non `app/`) volontairement : comme
 * `lib/email/templates/welcome.tsx`, un template e-mail a besoin de couleurs HEX
 * inline (les tokens `globals.css`/Tailwind ne s'appliquent pas dans un client
 * mail) — le gate `lint:slop` (qui scanne `app/`+`components/`) ne juge donc pas
 * ces HEX légitimes.
 *
 * i18n : copy via `lib/i18n` (`ui.waitlist.*`), `<html lang>` = `locale` du
 * produit — cohérent avec l'app et l'e-mail de bienvenue (CONVENTIONS.md §12).
 * Aucune donnée utilisateur n'est injectée dans le corps (pas d'injection HTML).
 */
export function buildWaitlistConfirmationEmail(): {
  subject: string;
  html: string;
} {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const html = `<!doctype html>
<html lang="${locale}">
  <body style="margin:0;padding:24px 0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;max-width:480px;padding:32px;">
            <tr>
              <td>
                <h1 style="color:#18181b;font-size:20px;font-weight:600;margin:0 0 16px;">${ui.waitlist.confirmationHeading}</h1>
                <p style="color:#3f3f46;font-size:14px;line-height:22px;margin:0 0 16px;">${ui.waitlist.confirmationBody(brand.name)}</p>
                <p style="color:#a1a1aa;font-size:12px;line-height:18px;margin:24px 0 0;">${ui.waitlist.confirmationSignoff(brand.name)}<br /><a href="${siteUrl}" style="color:#a1a1aa;">${siteUrl}</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject: ui.waitlist.confirmationSubject, html };
}
