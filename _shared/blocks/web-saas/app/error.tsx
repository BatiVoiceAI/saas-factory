"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";

/**
 * Error boundary de segment — capte les exceptions non gérées rendues SOUS le
 * `RootLayout` (les pages et layouts imbriqués). Le layout racine survit : la
 * nav/le thème restent en place, seul le sous-arbre en erreur est remplacé par
 * cet écran. Pour une erreur DANS le layout racine lui-même, c'est
 * `app/global-error.tsx` qui prend le relais.
 *
 * OBLIGATOIREMENT un Client Component (`"use client"`) : Next exige `reset()`,
 * un handler client qui re-monte le segment pour retenter le rendu.
 *
 * Observabilité : on remonte l'erreur à Sentry (bloc `observability`).
 * `captureException` est un NO-OP propre si le DSN est absent — aucun couplage
 * dur (cf. `sentry.client.config.ts`).
 */
export default function Error({
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
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/30 px-4 py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
        Une erreur est survenue
      </p>
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Quelque chose s&apos;est mal passé
        </h1>
        <p className="mx-auto max-w-md text-balance text-muted-foreground">
          Un incident inattendu a interrompu cette page. Vous pouvez réessayer ;
          si le problème persiste, revenez un peu plus tard.
        </p>
        {error.digest ? (
          <p className="text-xs text-muted-foreground">
            Référence : <code className="font-mono">{error.digest}</code>
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" onClick={() => reset()}>
          Réessayer
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{brand.name}</p>
    </main>
  );
}
