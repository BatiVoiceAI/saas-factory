/**
 * Socle MOUVEMENT du châssis — helpers framework-agnostic de la couche motion
 * (`components/motion/*`). Aucune dépendance React : ce module est importable
 * partout (client comme serveur) et n'accède à `window` que sous garde SSR.
 *
 * Règle NON négociable (doctrine design §motion + a11y) : TOUTE animation
 * respecte `prefers-reduced-motion`. La détection est centralisée ici pour que
 * chaque composant animé partage la même source de vérité, et se double d'un
 * backstop CSS global dans `app/globals.css` (défense en profondeur — cf.
 * CONVENTIONS §14). Les composants pilotés par l'état (Lottie, Reveal) lisent
 * la préférence via le hook `useReducedMotion` bâti sur ces fonctions.
 */

/** Media query canonique de la préférence système « mouvement réduit ». */
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Tokens de durée d'animation (ms) — échelle partagée par la couche motion.
 * Reliés à la direction de marque au build : on retime, on ne réinvente pas.
 */
export const motionDuration = {
  fast: 150,
  base: 250,
  slow: 400,
} as const;

/**
 * `true` si l'utilisateur a demandé un mouvement réduit. SSR-safe : renvoie
 * `false` côté serveur ou sur un navigateur sans `matchMedia` (on assume alors
 * l'animation, cohérent avec le rendu serveur initial). À réévaluer via
 * `watchReducedMotion` pour capter les changements en direct.
 */
export function prefersReducedMotion(): boolean {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return false;
  }
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * S'abonne aux changements en direct de la préférence (l'utilisateur peut la
 * basculer sans recharger). Retourne une fonction de désabonnement (no-op côté
 * serveur). Gère l'API moderne (`addEventListener`) avec repli legacy
 * (`addListener`, Safari < 14).
 *
 * @param onChange - rappelé avec la nouvelle valeur à chaque bascule.
 * @returns fonction de nettoyage à appeler au démontage.
 */
export function watchReducedMotion(
  onChange: (reduced: boolean) => void,
): () => void {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return () => {};
  }

  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  const handler = (event: MediaQueryListEvent) => onChange(event.matches);

  if (typeof mql.addEventListener === "function") {
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }

  // Repli legacy : addListener / removeListener (dépréciés mais nécessaires).
  mql.addListener(handler);
  return () => mql.removeListener(handler);
}
