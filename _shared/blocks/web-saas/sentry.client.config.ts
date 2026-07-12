/**
 * Sentry — configuration côté NAVIGATEUR.
 *
 * Chargée automatiquement par `@sentry/nextjs` dans le bundle client.
 * Si `NEXT_PUBLIC_SENTRY_DSN` est absent, `Sentry.init` est un NO-OP propre :
 * le SDK ne s'initialise pas et n'envoie rien (template compile sans Sentry).
 */
import * as Sentry from "@sentry/nextjs";

import { env } from "@/lib/env";

if (env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,

    // Environnement dérivé du build (dev/preview/production).
    environment: process.env.NODE_ENV,

    // Échantillonnage des traces de performance. 0.1 = 10 % en prod ;
    // 1.0 en dev pour tout voir localement.
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Session Replay : 0 % en nominal, 100 % sur les sessions avec erreur.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      Sentry.replayIntegration({
        // Ne jamais fuiter le contenu utilisateur dans les replays.
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Bruit navigateur inutile à filtrer.
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",
    ],
  });
}
