import Link from "next/link";
import type { ReactNode } from "react";

import { brand } from "@/lib/brand";

/**
 * Shell partagé des pages légales (`/legal/*`). Fournit UNE fois le cadrage
 * (conteneur lisible, en-tête avec retour accueil, pied de page) + les styles
 * typographiques de base, appliqués aux balises sémantiques des pages via des
 * variants arbitraires Tailwind (`[&_h2]:…`). Chaque page ne rend donc que son
 * contenu sémantique (`<h1>`, `<h2>`, `<p>`, `<ul>`…) et hérite de la mise en
 * forme — aucune duplication de markup entre les 4 gabarits.
 *
 * Sélection par juridiction : les 4 gabarits (`mentions-legales`,
 * `confidentialite`, `terms`, `privacy`) sont livrés ; le build ne conserve que
 * ceux de la `jurisdiction` du projet (FR → mentions + confidentialité ;
 * US/EN → terms + privacy). Ce layout survit quelle que soit la sélection.
 *
 * i18n : le chrome FR (« Retour à l'accueil ») est une **sentinelle de langue
 * de travail**, régénérée dans `locale` au build (cf. `CONVENTIONS.md` §12).
 */
export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-muted/20">
      <div className="container max-w-3xl py-12 sm:py-16">
        <header className="mb-10 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="rounded-md text-lg font-semibold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {brand.name}
          </Link>
          <Link
            href="/"
            className="rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            ← Retour à l’accueil
          </Link>
        </header>

        <article
          className={
            // Système typographique local (pas de plugin `prose`) : cible les
            // balises rendues par les pages enfants.
            "[&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight " +
            "[&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight " +
            "[&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold " +
            "[&_p]:mt-4 [&_p]:leading-relaxed [&_p]:text-muted-foreground " +
            "[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 " +
            "[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 " +
            "[&_li]:leading-relaxed [&_li]:text-muted-foreground " +
            "[&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 " +
            "[&_address]:mt-4 [&_address]:not-italic [&_address]:leading-relaxed [&_address]:text-muted-foreground"
          }
        >
          {children}
        </article>

        <footer className="mt-16 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {brand.name}. Tous droits réservés.
        </footer>
      </div>
    </div>
  );
}
