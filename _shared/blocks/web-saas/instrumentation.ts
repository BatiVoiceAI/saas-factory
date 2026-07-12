/**
 * Instrumentation Next 15 (App Router).
 *
 * `register()` est appelé une fois au démarrage de chaque runtime serveur.
 * On y charge la config Sentry adaptée au runtime courant (Node.js vs Edge).
 * `onRequestError` propage à Sentry les erreurs non capturées des Server
 * Components / route handlers (API Next 15 `instrumentation.onRequestError`).
 *
 * Aucune valeur en dur : chaque config lue ne s'initialise que si le DSN est
 * présent (cf. sentry.*.config.ts). Sans DSN, tout ceci est un no-op.
 */
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
