/**
 * PostHog — initialisation + capture TYPÉE (côté navigateur).
 *
 * Tout est piloté par `lib/env` : si `NEXT_PUBLIC_POSTHOG_KEY` est absent, ce
 * module est un NO-OP complet — aucune requête réseau, aucune erreur. Le
 * template compile et tourne sans PostHog configuré.
 *
 * `capture()` n'accepte qu'un nom d'event du catalogue (lib/analytics/events.ts)
 * avec le shape de propriétés correspondant : un event inconnu ou un payload
 * mal formé est refusé à la compilation.
 */
import posthog, { type PostHog } from "posthog-js";

import {
  type AnalyticsEventName,
  type AnalyticsEventProps,
} from "@/lib/analytics/events";
import { env } from "@/lib/env";

/** PostHog est-il configuré ET sommes-nous dans le navigateur ? */
function isEnabled(): boolean {
  return typeof window !== "undefined" && Boolean(env.NEXT_PUBLIC_POSTHOG_KEY);
}

let initialized = false;

/**
 * Initialise le client PostHog (idempotent). Appelé une fois au montage du
 * `PostHogProvider`. No-op si la clé est absente ou hors navigateur.
 */
export function initPostHog(): PostHog | null {
  if (!isEnabled() || initialized) {
    return initialized ? posthog : null;
  }

  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY as string, {
    // Hôte auto-hébergé ou cloud EU/US selon l'env ; défaut cloud US.
    api_host: env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",

    // On maîtrise le pageview via le provider (App Router) : pas de capture
    // automatique sur `history.pushState`, sinon doublons.
    capture_pageview: false,
    capture_pageleave: true,

    // Respect vie privée : pas d'autocapture de saisies, masquage par défaut.
    autocapture: false,
    persistence: "localStorage+cookie",

    // En dev, ne pas polluer le projet PostHog.
    loaded: (ph) => {
      if (process.env.NODE_ENV === "development") {
        ph.debug();
      }
    },
  });

  initialized = true;
  return posthog;
}

/** Instance PostHog courante, ou `null` si non configurée. */
export function getPostHog(): PostHog | null {
  return isEnabled() && initialized ? posthog : null;
}

/**
 * Capture un event produit typé.
 *
 * @example
 * capture("activation_completed", { milestone: "first_item_created" });
 */
export function capture<E extends AnalyticsEventName>(
  event: E,
  ...args: AnalyticsEventProps<E> extends Record<string, never>
    ? []
    : [properties: AnalyticsEventProps<E>]
): void {
  const ph = getPostHog();
  if (!ph) return;
  ph.capture(event, args[0]);
}

/**
 * Associe les events à un utilisateur identifié (après login).
 * `traits` reste volontairement libre : ce sont des propriétés de personne,
 * pas des events (donc pas soumises au catalogue typé).
 */
export function identify(
  distinctId: string,
  traits?: Record<string, string | number | boolean | null>,
): void {
  getPostHog()?.identify(distinctId, traits);
}

/** Réinitialise l'identité (après logout) pour ne pas mélanger les sessions. */
export function resetIdentity(): void {
  getPostHog()?.reset();
}

/** Enregistre manuellement un pageview (App Router : sur changement de route). */
export function capturePageview(url: string): void {
  getPostHog()?.capture("$pageview", { $current_url: url });
}
