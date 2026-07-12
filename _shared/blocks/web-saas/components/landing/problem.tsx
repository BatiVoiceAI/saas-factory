import { cn } from "@/lib/utils";

/**
 * Problème — section 4 du playbook (`_shared/landing-playbook.md`).
 *
 * Rôle : rappeler la douleur. 2-4 phrases dans la voix du client + une stat
 * contextuelle SOURCÉE sur le problème (jamais une stat d'usage inventée).
 *
 * C'est aussi la section SOMBRE de rupture exigée par `design-doctrine.md`
 * (§Rythme de sections : « au moins UNE rupture forte par landing ») : fond
 * `foreground`, stat géante en display. Tokens sémantiques uniquement —
 * aucun hex en dur.
 */

export interface ProblemStat {
  /** Le chiffre seul, en display géant (« 35 % »). */
  value: string;
  /** Ce que le chiffre mesure (« des RDV se prennent hors horaires d'ouverture »). */
  description: string;
  /** Source OBLIGATOIRE — une stat sans source est supprimée (playbook §Copy). */
  source: string;
  sourceHref?: string;
}

export interface ProblemProps {
  title: string;
  /** 2 à 4 phrases MAX, réparties en 1-2 paragraphes, voix du client final. */
  paragraphs: ReadonlyArray<string>;
  /** Stat sourcée du problème — optionnelle, mais fortement recommandée. */
  stat?: ProblemStat;
  id?: string;
  className?: string;
}

export function Problem({
  title,
  paragraphs,
  stat,
  id = "probleme",
  className,
}: ProblemProps) {
  const headingId = `${id}-titre`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("bg-foreground py-24 text-background", className)}
    >
      <div
        className={cn(
          "container grid gap-12",
          stat ? "lg:grid-cols-[3fr_2fr] lg:items-center" : "max-w-3xl",
        )}
      >
        <div className="flex flex-col gap-5">
          <h2
            id={headingId}
            className="text-3xl font-semibold tracking-tight sm:text-4xl [font-family:var(--font-display,inherit)]"
          >
            {title}
          </h2>
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="max-w-2xl text-lg text-background/70">
              {paragraph}
            </p>
          ))}
        </div>

        {stat ? (
          <div className="flex flex-col gap-3 border-t border-background/20 pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <p className="text-6xl font-semibold tabular-nums tracking-tight sm:text-7xl [font-family:var(--font-display,inherit)]">
              {stat.value}
            </p>
            <p className="max-w-xs text-base text-background/70">
              {stat.description}
            </p>
            <p className="text-sm text-background/50">
              {stat.sourceHref ? (
                <a
                  href={stat.sourceHref}
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 transition-colors hover:text-background"
                >
                  Source : {stat.source}
                </a>
              ) : (
                <>Source : {stat.source}</>
              )}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
