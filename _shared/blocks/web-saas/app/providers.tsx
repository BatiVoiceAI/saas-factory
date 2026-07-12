"use client";

import { type ReactNode } from "react";

import { PostHogProvider } from "@/components/observability/posthog-provider";
import { ThemeProvider } from "@/components/theme-provider";

/**
 * Providers globaux de l'application (racine de l'arbre client).
 *
 * CONTRAT DE STABILITÉ : la signature `Providers({ children })` est FIGÉE.
 * Le bloc `observability` (et d'autres) l'enrichit en WRAPPANT `children` avec
 * ses propres providers (PostHog, thème, toaster…) — SANS changer ni les props
 * ni l'import `@/app/providers`. Voir CONVENTIONS.md § « Enrichir Providers ».
 *
 * Bloc `observability` : monte `PostHogProvider` (no-op si la clé PostHog est
 * absente — cf. lib/analytics/posthog.ts).
 *
 * `ThemeProvider` (next-themes) enveloppe l'ensemble : sans lui, `useTheme()` de
 * `ThemeToggle` serait un no-op et `attribute="class"` ne piloterait jamais la
 * classe `.dark` sur `<html>`. `<html suppressHydrationWarning>` est déjà posé.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <PostHogProvider>{children}</PostHogProvider>
    </ThemeProvider>
  );
}
