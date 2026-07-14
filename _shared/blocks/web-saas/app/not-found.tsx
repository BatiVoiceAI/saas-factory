import Link from "next/link";

import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";

/**
 * 404 brandée — remplace la page « This page could not be found » par défaut
 * de Next. Rendue (statut 404) quand aucune route ne matche OU qu'un segment
 * appelle `notFound()`.
 *
 * Server Component : aucune interactivité, rien à hydrater. Reste dans le
 * `RootLayout` (`app/layout.tsx`) — donc `<html>`/`<body>`, la police et les
 * providers (thème) sont déjà posés ; on ne rend QUE le contenu.
 *
 * i18n : les littéraux FR sont des **placeholders de langue de travail**
 * (cf. `CONVENTIONS.md` §12), régénérés dans `locale` au walking skeleton.
 * `brand.name` vient de la source de vérité unique (`lib/brand.ts`).
 */
export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/30 px-4 py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
        Erreur 404
      </p>
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Page introuvable
        </h1>
        <p className="mx-auto max-w-md text-balance text-muted-foreground">
          La page que vous cherchez n&apos;existe pas, a été déplacée ou son
          adresse a changé.
        </p>
      </div>
      <Button asChild size="lg">
        <Link href="/">Retour à l&apos;accueil</Link>
      </Button>
      <p className="text-xs text-muted-foreground">{brand.name}</p>
    </main>
  );
}
