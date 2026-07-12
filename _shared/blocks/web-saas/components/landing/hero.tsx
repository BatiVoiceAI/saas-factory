import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Hero — section 2 du playbook (`_shared/landing-playbook.md`).
 *
 * Règles bloquantes portées par les props :
 * - `headline` ≤ 10 mots, objet concret + bénéfice (test des 5 secondes) ;
 * - `subtitle` = ce que c'est + comment c'est possible (1-2 phrases) ;
 * - `cta` = verbe d'action spécifique au job, UN seul CTA primaire ;
 * - `visual` = screenshot/mockup RÉEL de l'app, jamais d'illustration stock.
 *
 * Anti-slop (`design-doctrine.md` §Layout) : hero 2 colonnes ALIGNÉ GAUCHE,
 * visuel dans un cadre à bordure 1px — jamais le hero centré générique
 * (headline vague + 2 boutons + badge au-dessus du H1).
 */

export interface HeroProps {
  /** Headline ≤ 10 mots : un visiteur qui ne lit QUE cette ligne comprend le produit. */
  headline: string;
  /** Sous-titre 1-2 phrases : rend le headline crédible en expliquant le mécanisme. */
  subtitle: string;
  /** CTA primaire — verbe d'action spécifique (« Ouvrir mon agenda en ligne »). */
  cta: { label: string; href: string };
  /** CTA alternatif moins engageant (« Voir comment ça marche ») — optionnel. */
  secondaryCta?: { label: string; href: string };
  /** Ligne de réassurance sous les CTA (« Essai 30 jours. Sans carte bancaire. »). */
  reassurance?: string;
  /**
   * Slot visuel produit : screenshot RÉEL de l'app générée (`next/image`),
   * l'écran le plus parlant (l'agenda rempli, la page de réservation).
   * Rendu dans un cadre à bordure 1px. Le visuel réduit l'incertitude,
   * il ne décore pas.
   */
  visual?: ReactNode;
  className?: string;
}

export function Hero({
  headline,
  subtitle,
  cta,
  secondaryCta,
  reassurance,
  visual,
  className,
}: HeroProps) {
  return (
    <section
      aria-labelledby="hero-headline"
      className={cn("bg-background pb-20 pt-16 md:pb-28 md:pt-24", className)}
    >
      <div
        className={cn(
          "container grid items-center gap-12",
          visual ? "lg:grid-cols-2" : "max-w-3xl",
        )}
      >
        <div className="flex flex-col items-start gap-6">
          <h1
            id="hero-headline"
            className="text-4xl font-semibold tracking-tight sm:text-5xl [font-family:var(--font-display,inherit)]"
          >
            {headline}
          </h1>

          <p className="max-w-xl text-lg text-muted-foreground">{subtitle}</p>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href={cta.href}>{cta.label}</Link>
            </Button>
            {secondaryCta ? (
              <Button asChild size="lg" variant="outline">
                <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
              </Button>
            ) : null}
          </div>

          {reassurance ? (
            <p className="text-sm text-muted-foreground">{reassurance}</p>
          ) : null}
        </div>

        {visual ? (
          <div className="overflow-hidden rounded-lg border border-border bg-card p-2">
            {visual}
          </div>
        ) : null}
      </div>
    </section>
  );
}
