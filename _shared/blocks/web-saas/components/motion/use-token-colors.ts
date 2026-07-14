"use client";

import { useEffect, useState } from "react";

/**
 * Lecture des couleurs de la marque depuis les **design tokens** (les variables
 * CSS de `app/globals.css` : `--primary`, `--background`, `--accent`…). C'est ce
 * qui rend `<MotionAsset>` *theming-aware* : au lieu de coder une couleur en dur
 * dans un asset (slop — cf. doctrine motion « asset re-thémé aux tokens »), on
 * résout la couleur RÉELLE de la direction au runtime et on l'injecte dans
 * l'animation (currentColor du wrapper, variables `--motion-*`, data-binding Rive).
 *
 * Les tokens du châssis sont stockés en **triplet HSL brut** (`H S% L%`, sans
 * `hsl()`) pour composer avec l'opacité Tailwind. On les enveloppe donc en
 * `hsl(...)` pour obtenir une couleur CSS directement consommable.
 */

/** Enveloppe un triplet HSL brut (`240 5.9% 10%`) en couleur CSS (`hsl(...)`). */
function toColor(raw: string): string {
  // Déjà une couleur-fonction (hsl()/rgb()/oklch()/var()…) ou un mot-clé/hex :
  // on ne touche pas. Sinon, présence d'un `%` ⇒ triplet HSL du châssis à envelopper.
  if (/^[a-z-]+\(/i.test(raw) || raw.startsWith("#")) return raw;
  return raw.includes("%") ? `hsl(${raw})` : raw;
}

/**
 * Résout une liste de noms de tokens (sans le préfixe `--`) en couleurs CSS,
 * lues sur `<html>`. SSR-safe : renvoie `{}` hors navigateur (le serveur ne peut
 * pas calculer les styles ; la résolution a lieu au montage client).
 */
function resolveTokenColors(names: string[]): Record<string, string> {
  if (typeof window === "undefined" || typeof getComputedStyle !== "function") {
    return {};
  }
  const styles = getComputedStyle(document.documentElement);
  const out: Record<string, string> = {};
  for (const name of names) {
    const raw = styles.getPropertyValue(`--${name}`).trim();
    if (raw) out[name] = toColor(raw);
  }
  return out;
}

/**
 * Hook client : résout des design tokens en couleurs et **reste synchronisé avec
 * le thème**. `next-themes` bascule la classe `.dark` sur `<html>` (cf.
 * `app/providers.tsx`) ; on ré-observe cette mutation pour re-résoudre les
 * couleurs quand l'utilisateur change de thème — sans quoi un asset gardé en
 * mémoire afficherait la palette du thème précédent.
 *
 * @param names - tokens à lire, ex. `["primary", "accent"]` (sans `--`).
 * @returns map `{ token: couleur CSS }` — `{}` tant que non monté / hors browser.
 */
export function useTokenColors(names: string[] = []): Record<string, string> {
  // Clé stable : `names` a une identité neuve à chaque rendu ; on dépend de sa
  // valeur jointe et on reconstruit la liste dans l'effet (deps exhaustives OK).
  const key = names.join(",");
  const [colors, setColors] = useState<Record<string, string>>({});

  useEffect(() => {
    const list = key ? key.split(",") : [];
    if (list.length === 0) {
      setColors({});
      return;
    }

    const read = () => setColors(resolveTokenColors(list));
    read();

    // Re-résoudre quand le thème change : classe/inline-style de <html> (next-themes)
    // et préférence système (thème « system »).
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    const mql =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;
    mql?.addEventListener?.("change", read);

    return () => {
      observer.disconnect();
      mql?.removeEventListener?.("change", read);
    };
  }, [key]);

  return colors;
}
