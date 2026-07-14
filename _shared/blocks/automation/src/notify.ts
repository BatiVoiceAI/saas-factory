// ─────────────────────────────────────────────────────────────────────────────
// AU4 — Boucle fermée : notifier le propriétaire, sur succès COMME sur échec
// ─────────────────────────────────────────────────────────────────────────────
// Doctrine _shared/boucles-fermees.md (canon « travail asynchrone ») appliquée en
// autonome : aucun run de valeur sans accusé de réception. Le destinataire est le
// PROPRIÉTAIRE du job (OWNER_EMAIL), pas un client final. La règle est universelle,
// seul le canal s'adapte : email (Resend REST) ET/OU webhook (Slack, etc.).
//
// BEST-EFFORT ABSOLU : notifyOwner ne lève JAMAIS. Un échec d'envoi est loggué,
// jamais propagé — sinon la notification d'un run en échec ferait elle-même
// échouer le process, masquant la cause d'origine. C'est le pendant du garde-fou
// « best-effort honnête » de la doctrine.
// ─────────────────────────────────────────────────────────────────────────────

import type { Config } from "./config.js";
import { resolveFetch, type FetchImpl } from "./supabase.js";

/** Contenu d'une notification de boucle fermée. `ok` = le run a réussi ou non. */
export type NotifyInput = {
  subject: string;
  body: string;
  ok: boolean;
};

/** Surcharges optionnelles de notify (P1-D) : `fetch` injectable en test loopback. */
export type NotifyOptions = { fetchImpl?: FetchImpl };

/** Envoie l'email via Resend REST. Lève si non-2xx (capté par Promise.allSettled). */
async function sendEmail(
  resend: { apiKey: string; from: string },
  ownerEmail: string,
  subject: string,
  text: string,
  fetchImpl: FetchImpl = fetch,
): Promise<void> {
  const res = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resend.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resend.from,
      to: [ownerEmail],
      subject,
      text,
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend → ${res.status} ${await res.text()}`);
  }
}

/** POST le rapport sur le webhook (Slack incoming webhook ou générique). */
async function postWebhook(
  webhookUrl: string,
  payload: { ok: boolean; subject: string; body: string; at: string },
  fetchImpl: FetchImpl = fetch,
): Promise<void> {
  const res = await fetchImpl(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // `text` : compat Slack incoming webhook (affiche directement le message).
    body: JSON.stringify({
      text: `${payload.subject}\n\n${payload.body}`,
      ...payload,
    }),
  });
  if (!res.ok) {
    throw new Error(`Webhook → ${res.status} ${await res.text()}`);
  }
}

/**
 * Notifie le propriétaire du job (AU4). Appelée sur succès ET sur échec — c'est
 * l'appelant (index.ts) qui garantit les deux chemins. Diffuse sur TOUS les
 * canaux configurés (email + webhook) en parallèle ; chaque échec d'envoi est
 * loggué mais n'interrompt ni les autres canaux ni le process.
 *
 * Ne lève jamais : la fonction avale toute erreur (best-effort).
 */
export async function notifyOwner(
  config: Config,
  input: NotifyInput,
  opts: NotifyOptions = {},
): Promise<void> {
  try {
    const fetchImpl = resolveFetch(opts.fetchImpl);
    const tag = input.ok ? "[OK]" : "[ÉCHEC]";
    const subject = `${tag} ${input.subject}`;
    const at = new Date().toISOString();

    const sends: Array<{ channel: string; run: Promise<void> }> = [];
    if (config.resend) {
      sends.push({
        channel: "email",
        run: sendEmail(config.resend, config.owner.email, subject, input.body, fetchImpl),
      });
    }
    if (config.webhookUrl) {
      sends.push({
        channel: "webhook",
        run: postWebhook(
          config.webhookUrl,
          { ok: input.ok, subject, body: input.body, at },
          fetchImpl,
        ),
      });
    }

    if (sends.length === 0) {
      // Ne devrait pas arriver : loadConfig() exige au moins un canal (AU4).
      console.warn(`[notify] aucun canal configuré — boucle fermée impossible : ${subject}`);
      return;
    }

    const results = await Promise.allSettled(sends.map((s) => s.run));
    results.forEach((result, i) => {
      const channel = sends[i]?.channel ?? "?";
      if (result.status === "rejected") {
        const reason =
          result.reason instanceof Error ? result.reason.message : String(result.reason);
        console.error(`[notify] envoi ${channel} échoué (best-effort) : ${reason}`);
      } else {
        console.log(`[notify] ${channel} envoyé → ${config.owner.email}`);
      }
    });
  } catch (err) {
    // Filet ultime : notifyOwner ne propage jamais une erreur.
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[notify] échec inattendu (avalé) : ${msg}`);
  }
}
