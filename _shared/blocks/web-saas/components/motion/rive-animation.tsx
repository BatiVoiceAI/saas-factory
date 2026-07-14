"use client";

import { type CSSProperties, type ReactNode, useEffect } from "react";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";

import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/components/motion/use-reduced-motion";

/**
 * Instance Rive chargée (type dérivé du hook pour ne pas coupler à un symbole
 * ambigu du package : `Rive` y désigne à la fois le composant et la classe).
 */
export type RiveInstance = NonNullable<ReturnType<typeof useRive>["rive"]>;

export interface RiveAnimationProps {
  /** URL du fichier `.riv` (branché au build, jamais committé lourd dans le châssis). */
  src: string;
  /** Artboard à rendre (défaut : le premier de l'asset). */
  artboard?: string;
  /** State machine à jouer — nécessaire pour l'interactivité ET le fallback (c). */
  stateMachine?: string;
  /**
   * Niveau (c) du fallback reduced-motion : nom d'un input BOOLÉEN de la state
   * machine qui reçoit `prefers-reduced-motion`. L'asset route alors lui-même
   * vers un chemin « réduit » (frame calme, pas de mouvement). Sans cet input,
   * `<MotionAsset>` ne monte PAS Rive en mouvement réduit (repli statique amont).
   */
  reducedInput?: string;
  /** Repli statique tant que le runtime WASM n'a pas fini de charger. */
  fallback?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /**
   * Description accessible : expose l'animation en `role="img"` ; sinon décorative
   * (`aria-hidden`).
   */
  ariaLabel?: string;
  /**
   * Rappelé une fois l'instance Rive prête. Point d'accroche du *theming* : le
   * projet y lie ses couleurs de tokens aux propriétés de l'asset (data-binding
   * View Model, `setColor`…) — recolor asset-spécifique, décidé par la direction.
   */
  onReady?: (rive: RiveInstance) => void;
}

/**
 * `<RiveAnimation>` — wrapper client du runtime **Rive** (`@rive-app/react-canvas`,
 * `<canvas>` + WASM). Chargé UNIQUEMENT via `dynamic(ssr:false)` par
 * `<MotionAsset>` : le poids Rive (~200 KB) reste dans un chunk lazy, HORS du
 * bundle critique. C'est cette indirection qui garde le châssis compile-safe.
 *
 * Reduced-motion (niveau c) : le booléen `prefers-reduced-motion` est poussé dans
 * l'input `reducedInput` de la state machine à chaque bascule, laissant l'asset
 * router vers son chemin « réduit ».
 */
export function RiveAnimation({
  src,
  artboard,
  stateMachine,
  reducedInput,
  fallback = null,
  className,
  style,
  ariaLabel,
  onReady,
}: RiveAnimationProps) {
  const reduced = useReducedMotion();

  const { rive, RiveComponent } = useRive({
    src,
    artboard,
    stateMachines: stateMachine,
    autoplay: true,
  });

  // Niveau (c) : brancher la préférence sur l'input booléen de la state machine.
  const reducedMotionInput = useStateMachineInput(
    rive,
    stateMachine,
    reducedInput,
  );

  useEffect(() => {
    if (reducedMotionInput) reducedMotionInput.value = reduced;
  }, [reducedMotionInput, reduced]);

  // Theming / data-binding : laisser le projet lier ses tokens quand l'instance
  // est prête (le recolor Rive est propre à chaque asset).
  useEffect(() => {
    if (rive && onReady) onReady(rive);
  }, [rive, onReady]);

  const a11y = ariaLabel
    ? { role: "img" as const, "aria-label": ariaLabel }
    : { "aria-hidden": true };

  return (
    <div className={cn("relative", className)} style={style} {...a11y}>
      <RiveComponent className="h-full w-full" />
      {!rive && fallback ? (
        <div className="absolute inset-0 flex items-center justify-center">
          {fallback}
        </div>
      ) : null}
    </div>
  );
}
