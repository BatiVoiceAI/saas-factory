"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

/**
 * Fournit le contexte de thème clair/sombre (via `next-themes`).
 *
 * À monter dans `<Providers>` (cf. CONVENTIONS.md §7) en wrappant `children`.
 * `attribute="class"` pilote la classe `.dark` sur `<html>`, ce qui correspond
 * au `darkMode: ["class"]` de `tailwind.config.ts` et aux tokens de
 * `globals.css`. `<html suppressHydrationWarning>` est déjà en place.
 *
 * Exemple de câblage (Phase Cohérence) :
 *   <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
 *     {children}
 *   </ThemeProvider>
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
