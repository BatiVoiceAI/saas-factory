import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Pricing transparent — section 8 du playbook (`_shared/landing-playbook.md`).
 *
 * Règles (playbook §Pricing) :
 * - prix TOUJOURS affichés, TTC, devise locale — jamais « contactez-nous » ;
 * - 1 à 3 tiers MAX, nommés par résultat (« Solo », « Salon », « Multi-salons ») ;
 * - 5-7 items CONCRETS par tier (« 200 rappels SMS par mois », pas « SMS ») ;
 * - un seul tier `recommended` (badge « Recommandé ») ;
 * - politique d'annulation EXPLICITE sous les cartes (une clause floue =
 *   cause majeure d'abandon).
 *
 * Chiffres en `tabular-nums` (doctrine §Typographie). Bordures fines, pas
 * d'ombres ; le tier recommandé se distingue par `border-primary`.
 */

export interface PricingPlan {
  /** Nommé par résultat client (« Solo », « Salon »), pas par taille abstraite. */
  name: string;
  /** Prix affiché, TTC, devise locale (« 39 € »). Jamais « sur devis ». */
  price: string;
  /** Période et régime (« /mois TTC »). */
  period: string;
  /** Pour qui est ce tier, en 1 ligne. */
  description?: string;
  /** 5 à 7 items concrets et chiffrés. */
  features: ReadonlyArray<string>;
  cta: { label: string; href: string };
  /** Tier recommandé — UN SEUL par grille. */
  recommended?: boolean;
}

export interface PricingProps {
  title: string;
  subtitle?: string;
  /** 1 à 3 plans MAX. */
  plans: ReadonlyArray<PricingPlan>;
  /** Politique d'annulation explicite (« Sans engagement. Annulez en 1 clic. »). */
  cancellationNote: string;
  /** Remise annuelle visible (« 2 mois offerts en paiement annuel. ») — optionnel. */
  annualNote?: string;
  id?: string;
  className?: string;
}

export function Pricing({
  title,
  subtitle,
  plans,
  cancellationNote,
  annualNote,
  id = "tarifs",
  className,
}: PricingProps) {
  const headingId = `${id}-titre`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("scroll-mt-16 bg-background py-24", className)}
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
          {annualNote ? (
            <p className="text-sm font-medium">{annualNote}</p>
          ) : null}
        </div>

        <div
          className={cn(
            "grid gap-6",
            plans.length === 1 && "mx-auto w-full max-w-md",
            plans.length === 2 && "md:grid-cols-2",
            plans.length >= 3 && "md:grid-cols-3",
          )}
        >
          {plans.map((plan) => (
            <article
              key={plan.name}
              aria-label={`Formule ${plan.name}`}
              className={cn(
                "flex flex-col gap-6 rounded-lg border bg-card p-8",
                plan.recommended ? "border-primary" : "border-border",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold tracking-tight">
                  {plan.name}
                </h3>
                {plan.recommended ? (
                  <span className="rounded-full border border-primary px-3 py-1 text-xs font-medium text-primary">
                    Recommandé
                  </span>
                ) : null}
              </div>

              <p className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold tabular-nums tracking-tight [font-family:var(--font-display,inherit)]">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  {plan.period}
                </span>
              </p>

              {plan.description ? (
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              ) : null}

              <ul className="flex flex-col gap-3 border-t border-border pt-6 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      className="mt-0.5 size-4 shrink-0"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={plan.recommended ? "default" : "outline"}
                className="mt-auto"
              >
                <Link href={plan.cta.href}>{plan.cta.label}</Link>
              </Button>
            </article>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {cancellationNote}
        </p>
      </div>
    </section>
  );
}
