import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Footer complet — section 11 du playbook (`_shared/landing-playbook.md`).
 *
 * Rôle : signal « produit fini » + légal FR. 4 colonnes :
 * logo + mission + ville / liens produit / légal / contact.
 *
 * Légal France (OBLIGATOIRE, playbook §Footer) :
 * - `/legal/mentions-legales` — LCEN art. 6, pour TOUT site ;
 * - `/legal/confidentialite` — RGPD, dès qu'un email est collecté ;
 * - `/legal/cgv` — si vente aux particuliers.
 * Les pages légales sont GÉNÉRÉES en Phase 4 — jamais de liens morts.
 */

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterProps {
  /** Wordmark — toujours `brand.name` (cf. `lib/brand.ts`). */
  brandName: string;
  /** Mission en 1 ligne, voix du client. */
  mission: string;
  /** Ville d'ancrage (« Lyon, France ») — preuve de localité, optionnel. */
  city?: string;
  /** Colonne « Produit » : fonctionnalités, tarifs, FAQ, connexion. */
  productLinks: ReadonlyArray<FooterLink>;
  /** Colonne « Légal » : mentions légales, confidentialité, CGV — pages générées. */
  legalLinks: ReadonlyArray<FooterLink>;
  /** Contact réel : email obligatoire, téléphone cliquable optionnel. */
  contact: { email: string; phone?: string };
  className?: string;
}

export function Footer({
  brandName,
  mission,
  city,
  productLinks,
  legalLinks,
  contact,
  className,
}: FooterProps) {
  return (
    <footer className={cn("border-t border-border bg-background py-12", className)}>
      <div className="container flex flex-col gap-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <p className="text-base font-semibold tracking-tight [font-family:var(--font-display,inherit)]">
              {brandName}
            </p>
            <p className="text-sm text-muted-foreground">{mission}</p>
            {city ? (
              <p className="text-sm text-muted-foreground">{city}</p>
            ) : null}
          </div>

          <nav aria-label="Liens produit" className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold">Produit</h2>
            <ul className="flex flex-col gap-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Informations légales" className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold">Légal</h2>
            <ul className="flex flex-col gap-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold">Contact</h2>
            <ul className="flex flex-col gap-2">
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {contact.email}
                </a>
              </li>
              {contact.phone ? (
                <li>
                  <a
                    href={`tel:${contact.phone.replace(/\s/g, "")}`}
                    className="rounded-md text-sm tabular-nums text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {contact.phone}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <p className="border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {brandName}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
