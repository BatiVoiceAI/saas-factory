/**
 * Sentry — configuration côté SERVEUR (runtime Node.js).
 *
 * Chargée par `instrumentation.ts` quand `NEXT_RUNTIME === "nodejs"`.
 * NO-OP propre si `NEXT_PUBLIC_SENTRY_DSN` est absent.
 */
import * as Sentry from "@sentry/nextjs";

import { env } from "@/lib/env";

if (env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Pas de PII par défaut : on n'attache pas les headers/cookies/IP
    // (respect safety-rails §4 — aucune donnée sensible non maîtrisée).
    sendDefaultPii: false,
  });
}
