import { cn } from "@/lib/utils";

/**
 * Comment ça marche — section 5 du playbook (`_shared/landing-playbook.md`).
 *
 * Rôle : réduire la confusion. 3 étapes MAX ; chaque étape =
 * [action utilisateur en 1 ligne] + [ce que fait le produit] + [bénéfice].
 *
 * Le playbook déconseille la numérotation nue « 1. 2. 3. » : ici chaque étape
 * porte un label descriptif (« Étape 1 — Créez votre page ») dans une
 * timeline horizontale reliée par une bordure fine.
 *
 * Phase 4 : ajouter un screenshot réel par étape via `visual` quand l'app
 * existe (jamais d'icône générique à la place, cf. playbook §Recette).
 */

export interface HowItWorksStep {
  /** Action utilisateur en 1 ligne (« Créez votre page en 10 minutes »). */
  title: string;
  /** Ce que fait le produit (1-2 phrases). */
  description: string;
  /** Le bénéfice, en 1 ligne (« Moins de no-shows, zéro relance à faire. »). */
  benefit?: string;
}

export interface HowItWorksProps {
  title: string;
  subtitle?: string;
  /** 3 étapes MAX (playbook §Structure canonique). */
  steps: ReadonlyArray<HowItWorksStep>;
  id?: string;
  className?: string;
}

export function HowItWorks({
  title,
  subtitle,
  steps,
  id = "comment-ca-marche",
  className,
}: HowItWorksProps) {
  const headingId = `${id}-titre`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("scroll-mt-16 bg-background py-20", className)}
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

        <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="flex flex-col gap-3 border-t border-border pt-6"
            >
              <p className="text-sm font-medium tabular-nums text-muted-foreground">
                Étape {index + 1}
              </p>
              <h3 className="text-xl font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="text-muted-foreground">{step.description}</p>
              {step.benefit ? (
                <p className="text-sm font-medium">{step.benefit}</p>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
