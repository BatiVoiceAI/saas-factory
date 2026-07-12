import { ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Micro-preuve sociale — section 3 du playbook (`_shared/landing-playbook.md`).
 *
 * Variante HONNÊTE pour un SaaS neuf, zéro client. INTERDICTION ABSOLUE
 * (playbook §Preuve sociale honnête) : faux témoignages, faux logos, fausses
 * stats d'usage, avatars stock/IA. Pas de preuve réelle = pas de section.
 *
 * Alternatives crédibles jour 1, chacune un `kind` :
 * - `stat`      : stat sourcée du PROBLÈME (pas de l'usage du produit) ;
 * - `founder`   : ligne fondateur (« Développé avec des coiffeuses de Lyon ») ;
 * - `launch`    : badge de lancement honnête (« Offre fondateur : -50 %… ») ;
 * - `guarantee` : garantie empilée (« Essai 30 jours, sans carte bancaire »).
 *
 * Dès que l'intake fournit de VRAIS témoignages (nom + métier + ville), la
 * Phase 4 ajoute la section preuve détaillée — ce composant reste la ligne
 * courte sous le hero.
 */

export type SocialProofItem =
  | {
      kind: "stat";
      /** La stat elle-même (« 35 % des RDV se prennent hors horaires d'ouverture »). */
      text: string;
      /** Source OBLIGATOIRE — une stat sans source est supprimée (playbook §Copy). */
      source: string;
      sourceHref?: string;
    }
  | { kind: "founder"; text: string }
  | { kind: "launch"; text: string }
  | { kind: "guarantee"; text: string };

export interface SocialProofProps {
  /** 1 à 3 items — c'est une LIGNE de crédibilité, pas une section entière. */
  items: ReadonlyArray<SocialProofItem>;
  className?: string;
}

function SocialProofEntry({ item }: { item: SocialProofItem }) {
  switch (item.kind) {
    case "stat":
      return (
        <span>
          {item.text}{" "}
          {item.sourceHref ? (
            <a
              href={item.sourceHref}
              rel="noopener noreferrer"
              className="underline underline-offset-4 transition-colors hover:text-foreground"
            >
              ({item.source})
            </a>
          ) : (
            <span>({item.source})</span>
          )}
        </span>
      );
    case "founder":
      return <span>{item.text}</span>;
    case "launch":
      return (
        <span className="rounded-full border border-border bg-background px-3 py-1">
          {item.text}
        </span>
      );
    case "guarantee":
      return (
        <span className="inline-flex items-center gap-2">
          <ShieldCheck
            className="size-4 shrink-0"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          {item.text}
        </span>
      );
  }
}

export function SocialProof({ items, className }: SocialProofProps) {
  if (items.length === 0) return null;

  return (
    <section
      aria-label="Éléments de confiance"
      className={cn("border-y border-border bg-muted/50 py-5", className)}
    >
      <ul className="container flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <SocialProofEntry item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
