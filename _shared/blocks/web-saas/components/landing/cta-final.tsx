import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * CTA final — section 10 du playbook (`_shared/landing-playbook.md`).
 *
 * Rôle : conversion. Court, sur fond teinté (`muted`, doctrine §Rythme de
 * sections) : rappel de la promesse du hero + CTA primaire (MÊME label que
 * navbar et hero) + CTA alternatif moins engageant (« Voir la démo »).
 */

export interface CtaFinalProps {
  /** Rappel court de la promesse du hero — pas une nouvelle promesse. */
  title: string;
  subtitle?: string;
  /** CTA primaire — même label que la navbar et le hero (répétition voulue). */
  cta: { label: string; href: string };
  /** CTA alternatif moins engageant — optionnel. */
  secondaryCta?: { label: string; href: string };
  /** Réassurance sous les boutons (« Essai 30 jours. Sans carte bancaire. »). */
  reassurance?: string;
  className?: string;
}

export function CtaFinal({
  title,
  subtitle,
  cta,
  secondaryCta,
  reassurance,
  className,
}: CtaFinalProps) {
  return (
    <section
      aria-labelledby="cta-final-titre"
      className={cn("border-t border-border bg-muted/50 py-20", className)}
    >
      <div className="container flex max-w-2xl flex-col items-center gap-6 text-center">
        <h2
          id="cta-final-titre"
          className="text-3xl font-semibold tracking-tight sm:text-4xl [font-family:var(--font-display,inherit)]"
        >
          {title}
        </h2>

        {subtitle ? (
          <p className="text-lg text-muted-foreground">{subtitle}</p>
        ) : null}

        <div className="flex flex-wrap items-center justify-center gap-3">
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
    </section>
  );
}
