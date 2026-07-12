import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Navbar de landing — section 1 du playbook (`_shared/landing-playbook.md`).
 *
 * Rôle : orientation. Logo + 2-4 liens d'ancre (fonctionnalités, tarifs, FAQ)
 * + CTA primaire. Le CTA porte le MÊME label que le hero et le CTA final
 * (répétition voulue par le playbook).
 *
 * Mobile-first : les liens passent en `hidden md:flex`, le CTA reste visible
 * sans scroll (règle bloquante du playbook).
 */

export interface NavbarLink {
  label: string;
  /** Ancre de section (`#fonctionnalites`) ou route (`/login`). */
  href: string;
}

export interface NavbarProps {
  /** Wordmark — toujours `brand.name` (cf. `lib/brand.ts`), jamais re-codé en dur. */
  brandName: string;
  /** 2 à 4 liens MAX (playbook §Navbar). */
  links: ReadonlyArray<NavbarLink>;
  /** CTA primaire — même label que le hero et le CTA final. */
  cta: { label: string; href: string };
  className?: string;
}

export function Navbar({ brandName, links, cta, className }: NavbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className,
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="rounded-md text-base font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [font-family:var(--font-display,inherit)]"
        >
          {brandName}
        </Link>

        <nav aria-label="Navigation principale" className="hidden md:block">
          <ul className="flex items-center gap-6">
            {links.map((link) => (
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

        <Button asChild>
          <Link href={cta.href}>{cta.label}</Link>
        </Button>
      </div>
    </header>
  );
}
