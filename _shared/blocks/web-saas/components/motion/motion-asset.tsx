"use client";

import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useRef,
} from "react";
import dynamic from "next/dynamic";

import { cn } from "@/lib/utils";
import { LottieAnimation } from "@/components/motion/lottie-animation";
import { useReducedMotion } from "@/components/motion/use-reduced-motion";
import { useTokenColors } from "@/components/motion/use-token-colors";
import type { RiveInstance } from "@/components/motion/rive-animation";

/**
 * Wrapper Rive chargé PARESSEUSEMENT (`ssr: false`) : le module `rive-animation`
 * — et donc `@rive-app/react-canvas` + son WASM (~200 KB) — n'est importé QUE si
 * `<MotionAsset runtime="rive">` est réellement rendu (et non gaté par le
 * mouvement réduit). C'est ce qui garde ce poids HORS du bundle critique.
 */
const RiveAnimation = dynamic(
  () => import("@/components/motion/rive-animation").then((m) => m.RiveAnimation),
  { ssr: false },
);

/**
 * Runtimes routables (table M7 de la doctrine motion) :
 * - `motion` — transitions d'état / presence / micro-interactions code-driven
 *   (Motion / `<Reveal>` / GSAP) : `<MotionAsset>` rend les `children` tels quels.
 * - `lottie` — décoratif / one-shot (hero, loading, empty state, célébration).
 * - `rive`   — interactif piloté par l'état (icônes réactives, toggles, mascotte).
 */
export type MotionRuntime = "motion" | "lottie" | "rive";

export interface MotionAssetProps {
  /** Runtime choisi selon le cas d'usage (M7). */
  runtime: MotionRuntime;
  /** URL de l'asset : `.lottie` (runtime `lottie`) ou `.riv` (runtime `rive`). */
  src?: string;
  /**
   * Repli statique : rendu en mouvement réduit (niveau a), avant montage / avant
   * chargement du WASM, ou si `src` manque. Décoratif si `ariaLabel` est absent.
   */
  fallback?: ReactNode;
  /** Contenu code-driven pour `runtime="motion"` (`<Reveal>`, Motion, GSAP…). */
  children?: ReactNode;
  /** Description accessible ; sinon l'asset est décoratif (`aria-hidden`). */
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;

  // ── Theming (lit les design tokens — cf. useTokenColors) ──────────────────
  /**
   * Tokens de design à résoudre et exposer à l'asset, sans le préfixe `--`
   * (ex. `["primary", "accent"]`). Chacun est publié en variable CSS
   * `--motion-<token>` sur le wrapper — un asset SVG/Lottie authoré avec ces
   * variables (ou `currentColor`) se recolore alors aux couleurs de la marque.
   */
  themeTokens?: string[];
  /**
   * Token dont la couleur pilote `currentColor` du wrapper (ex. `"primary"`).
   * Pratique pour les assets monochromes basés sur `currentColor`.
   */
  currentColorToken?: string;

  // ── Options Lottie ────────────────────────────────────────────────────────
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  /** Niveau (b) : marqueur nommé `reduced motion` de l'asset Lottie. */
  reducedMotionMarker?: string;
  /** Thème dotLottie natif (recolor aux tokens) — voir `<LottieAnimation>`. */
  themeData?: string;

  // ── Options Rive ──────────────────────────────────────────────────────────
  artboard?: string;
  stateMachine?: string;
  /** Niveau (c) : input booléen de la state machine recevant `reduced`. */
  riveReducedInput?: string;
  /**
   * Rappelé quand l'instance Rive est prête, avec les couleurs de tokens
   * résolues — point d'accroche du recolor Rive (data-binding, asset-spécifique).
   */
  onRiveLoad?: (rive: RiveInstance, colors: Record<string, string>) => void;
}

/** Cadre de repli statique centré (mouvement réduit / pré-chargement / sans src). */
function StaticFrame({
  children,
  className,
  style,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
}) {
  const a11y = ariaLabel
    ? { role: "img" as const, "aria-label": ariaLabel }
    : { "aria-hidden": true };
  return (
    <div
      className={cn("flex items-center justify-center", className)}
      style={style}
      {...a11y}
    >
      {children}
    </div>
  );
}

/**
 * `<MotionAsset>` — **point d'entrée unique et theming-aware** de la couche
 * motion (patron châssis, doctrine design §Direction motion). Il :
 *
 * 1. **choisit le runtime** (`motion` / `lottie` / `rive`) selon le cas d'usage (M7) ;
 * 2. **respecte `prefers-reduced-motion` par défaut**, avec les 3 niveaux de
 *    fallback : (a) gate simple → repli statique, sans même charger le WASM Rive ;
 *    (b) marqueur `reduced motion` de l'asset Lottie ; (c) booléen poussé dans la
 *    state machine Rive ;
 * 3. **lazy-load** le WASM/asset (Lottie et Rive via `dynamic(ssr:false)`) — jamais
 *    dans le bundle critique ;
 * 4. **lit les design tokens** (`themeTokens` → variables `--motion-*` + `currentColor`)
 *    pour recolorer l'asset aux couleurs de la marque — jamais de couleur hardcodée.
 *
 * L'animation est **décidée par la config de la direction** (src, runtime, tokens),
 * pas codée en dur ici. Compile-safe (`tsc` + `next build`), réutilisable partout.
 */
export function MotionAsset({
  runtime,
  src,
  fallback = null,
  children,
  ariaLabel,
  className,
  style,
  themeTokens,
  currentColorToken,
  loop = true,
  autoplay = true,
  speed = 1,
  reducedMotionMarker,
  themeData,
  artboard,
  stateMachine,
  riveReducedInput,
  onRiveLoad,
}: MotionAssetProps) {
  const reduced = useReducedMotion();
  const tokenColors = useTokenColors(themeTokens);

  // Couleurs de tokens → variables CSS `--motion-*` (+ `currentColor` optionnel),
  // fusionnées dans le style porté par l'élément rendu (theming-aware).
  const themeVars: Record<string, string> = {};
  for (const [name, value] of Object.entries(tokenColors)) {
    themeVars[`--motion-${name}`] = value;
  }
  const currentColor = currentColorToken
    ? tokenColors[currentColorToken]
    : undefined;
  const mergedStyle = {
    ...style,
    ...themeVars,
    ...(currentColor ? { color: currentColor } : {}),
  } as CSSProperties;

  // `onRiveLoad` stable : on lit les dernières couleurs via une ref pour ne pas
  // relancer l'effet `onReady` de Rive à chaque re-rendu.
  const colorsRef = useRef(tokenColors);
  colorsRef.current = tokenColors;
  const handleRiveReady = useCallback(
    (rive: RiveInstance) => onRiveLoad?.(rive, colorsRef.current),
    [onRiveLoad],
  );

  // Runtime code-driven : on rend les children (ils portent leur propre
  // reduced-motion via `useReducedMotion` + backstop CSS global). Wrapper = theming.
  if (runtime === "motion") {
    return (
      <div className={cn(className)} style={mergedStyle}>
        {children ?? fallback}
      </div>
    );
  }

  // Asset requis mais absent → repli statique (jamais de runtime sans source).
  if (!src) {
    return (
      <StaticFrame className={className} style={mergedStyle} ariaLabel={ariaLabel}>
        {fallback}
      </StaticFrame>
    );
  }

  if (runtime === "rive") {
    // Niveau (a) : mouvement réduit SANS input dédié → repli statique, et le
    // module Rive (WASM) n'est même pas importé.
    if (reduced && !riveReducedInput) {
      return (
        <StaticFrame
          className={className}
          style={mergedStyle}
          ariaLabel={ariaLabel}
        >
          {fallback}
        </StaticFrame>
      );
    }
    return (
      <RiveAnimation
        src={src}
        artboard={artboard}
        stateMachine={stateMachine}
        reducedInput={riveReducedInput}
        fallback={fallback}
        className={className}
        style={mergedStyle}
        ariaLabel={ariaLabel}
        onReady={handleRiveReady}
      />
    );
  }

  // runtime === "lottie" : niveaux (a) et (b) gérés par <LottieAnimation>.
  return (
    <LottieAnimation
      src={src}
      fallback={fallback}
      loop={loop}
      autoplay={autoplay}
      speed={speed}
      reducedMotionMarker={reducedMotionMarker}
      themeData={themeData}
      className={className}
      style={mergedStyle}
      ariaLabel={ariaLabel}
    />
  );
}
