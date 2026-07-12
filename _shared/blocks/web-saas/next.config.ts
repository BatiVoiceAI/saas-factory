import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Le bloc `observability` peut activer le source-map upload Sentry en
  // décommentant le wrapper ci-dessous (aucune valeur en dur : tout vient de l'env).
};

export default nextConfig;

// --- Sentry (optionnel, activé par le bloc `observability`) -----------------
// Décommenter pour envelopper la config avec Sentry. Nécessite
// NEXT_PUBLIC_SENTRY_DSN + SENTRY_AUTH_TOKEN dans l'environnement.
//
// import { withSentryConfig } from "@sentry/nextjs";
//
// export default withSentryConfig(nextConfig, {
//   silent: true,
//   org: process.env.SENTRY_ORG,
//   project: process.env.SENTRY_PROJECT,
//   authToken: process.env.SENTRY_AUTH_TOKEN,
//   widenClientFileUpload: true,
//   disableLogger: true,
// });
