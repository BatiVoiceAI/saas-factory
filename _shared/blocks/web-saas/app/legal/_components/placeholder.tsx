import { cn } from "@/lib/utils";

/**
 * Marqueur de champ « à renseigner » d'un gabarit légal.
 *
 * Rend le token `{{ NOM }}` de façon **visible** (police mono, fond teinté)
 * pour qu'aucun placeholder non substitué ne passe inaperçu dans une page
 * légale publiée. Le `data-placeholder` rend chaque champ **greppable** à la
 * substitution.
 *
 * Contrat de build : le walking skeleton (étape 12) remplace chaque
 * `<Placeholder>NOM</Placeholder>` par la valeur réelle de l'éditeur
 * (raison sociale, adresse, e-mail de contact, hébergeur, dates…), tirée du
 * dossier projet. Une page légale ne doit **jamais** être livrée avec un
 * `{{ … }}` résiduel visible.
 *
 * Dossier privé `_components` (préfixe `_`) : exclu du routing App Router.
 */
export function Placeholder({
  children,
  className,
}: {
  /** Nom du champ, en MAJUSCULE_SNAKE (ex. `RAISON_SOCIALE`). */
  children: string;
  className?: string;
}) {
  return (
    <span
      data-placeholder={children}
      className={cn(
        "rounded bg-primary/10 px-1 font-mono text-[0.85em] font-medium text-foreground",
        className,
      )}
    >
      {`{{ ${children} }}`}
    </span>
  );
}
