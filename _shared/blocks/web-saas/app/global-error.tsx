"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

import { brand } from "@/lib/brand";

/**
 * Global error boundary — dernier filet de sécurité. Ne se déclenche QUE si
 * l'erreur survient dans le `RootLayout` (`app/layout.tsx`) lui-même ; il
 * REMPLACE alors le layout racine. Conséquences :
 * - il DOIT rendre ses propres `<html>` et `<body>` (rien au-dessus de lui) ;
 * - `globals.css` / les providers (thème, police) ne sont PAS garantis chargés
 *   → on style en **inline** pour rester présentable en toutes circonstances,
 *   sans dépendre de Tailwind ni des tokens de `globals.css`.
 *
 * `"use client"` obligatoire (comme `error.tsx`) : `reset()` est un handler
 * client. Erreur remontée à Sentry (NO-OP propre sans DSN).
 *
 * i18n : `lang="fr"` + littéraux FR = **sentinelles de langue de travail**,
 * paramétrés depuis `locale`/`dir` au build (cf. `CONVENTIONS.md` §12).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          padding: "4rem 1rem",
          textAlign: "center",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          background: "#fafafa",
          color: "#0a0a0a",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#71717a",
          }}
        >
          Une erreur est survenue
        </p>
        <h1
          style={{
            margin: 0,
            fontSize: "1.875rem",
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          Quelque chose s&apos;est mal passé
        </h1>
        <p
          style={{
            margin: 0,
            maxWidth: "28rem",
            color: "#52525b",
            lineHeight: 1.6,
          }}
        >
          Un incident inattendu a interrompu l&apos;application. Vous pouvez
          réessayer&nbsp;; si le problème persiste, revenez un peu plus tard.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            appearance: "none",
            border: "none",
            cursor: "pointer",
            borderRadius: "0.375rem",
            padding: "0.625rem 1.5rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            background: "#0a0a0a",
            color: "#fafafa",
          }}
        >
          Réessayer
        </button>
        <p style={{ margin: 0, fontSize: "0.75rem", color: "#71717a" }}>
          {brand.name}
        </p>
      </body>
    </html>
  );
}
