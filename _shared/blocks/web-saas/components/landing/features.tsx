import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Features orientées jobs — section 6 du playbook (`_shared/landing-playbook.md`).
 *
 * Rôle : prouver la promesse du hero. 3 à 6 features MAX ; pour chacune :
 * - `title` = le RÉSULTAT client (« Ne perdez plus une cliente… »), jamais le
 *   nom de la techno ;
 * - `description` = 2-3 phrases : le mécanisme + 1 objection adressée.
 *
 * Anti-slop (`design-doctrine.md` §Grilles non-médianes) : bento asymétrique
 * — cellules larges et étroites alternées — jamais 3+ cartes identiques
 * (même radius / padding / hauteur). Bordures fines, pas d'ombres.
 *
 * Icônes : Lucide uniquement, UN style (size-5, stroke 1.75) — jamais
 * d'emojis ni de checkmarks unicode en guise d'icônes.
 */

export interface Feature {
  /** Icône Lucide, passée en composant (`import { BellRing } from "lucide-react"`). */
  icon: LucideIcon;
  /** Header = résultat en langage client, relié à la promesse du hero. */
  title: string;
  /** 2-3 phrases : mécanisme + 1 objection adressée. */
  description: string;
}

export interface FeaturesProps {
  title: string;
  subtitle?: string;
  /** 3 à 6 features, JAMAIS plus (playbook §Structure canonique). */
  features: ReadonlyArray<Feature>;
  id?: string;
  className?: string;
}

/**
 * Bento asymétrique sur grille 3 colonnes : les cellules alternent
 * large (2 col) / étroite (1 col) en quinconce — rangée « 2+1 » puis « 1+2 ».
 */
function cellSpan(index: number): string {
  const isWide = index % 4 === 0 || index % 4 === 3;
  return isWide ? "md:col-span-2" : "";
}

export function Features({
  title,
  subtitle,
  features,
  id = "fonctionnalites",
  className,
}: FeaturesProps) {
  const headingId = `${id}-titre`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("scroll-mt-16 bg-muted/40 py-28", className)}
    >
      <div className="container flex flex-col gap-12">
        <div className="flex max-w-2xl flex-col gap-3">
          <h2
            id={headingId}
            className="text-3xl font-semibold tracking-tight sm:text-4xl [font-family:var(--font-display,inherit)]"
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="text-lg text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>

        <ul className="grid gap-4 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const wide = cellSpan(index) !== "";

            return (
              <li
                key={feature.title}
                className={cn(
                  "flex flex-col gap-4 rounded-lg border border-border bg-card",
                  wide ? "p-8" : "p-6",
                  cellSpan(index),
                )}
              >
                <span className="flex size-10 items-center justify-center rounded-md border border-border">
                  <Icon
                    className="size-5"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </span>
                <h3
                  className={cn(
                    "font-semibold tracking-tight",
                    wide ? "text-xl" : "text-lg",
                  )}
                >
                  {feature.title}
                </h3>
                <p
                  className={cn(
                    "text-muted-foreground",
                    wide ? "max-w-xl" : "text-sm",
                  )}
                >
                  {feature.description}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
