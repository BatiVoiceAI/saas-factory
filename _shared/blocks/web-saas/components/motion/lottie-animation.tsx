"use client";

import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/components/motion/use-reduced-motion";

/**
 * Runtime dotLottie chargé UNIQUEMENT côté client (`ssr: false`) : il s'appuie
 * sur `<canvas>` + WASM, indisponibles au rendu serveur. L'import dynamique
 * garde ce poids HORS du bundle critique (lazy) — il n'arrive qu'au montage du
 * premier composant animé de la page. Cette indirection est la raison pour
 * laquelle le châssis COMPILE malgré une dépendance runtime navigateur.
 */
const DotLottieReact = dynamic(
  () => import("@lottiefiles/dotlottie-react").then((m) => m.DotLottieReact),
  { ssr: false },
);

export interface LottieAnimationProps {
  /**
   * URL du fichier `.lottie` (recommandé — compressé) ou `.json` à jouer.
   * Branché au BUILD (URL distante ou asset importé), JAMAIS un binaire lourd
   * committé dans le châssis. Voir `components/motion/README.md`.
   */
  src: string;
  /**
   * Repli statique rendu quand le mouvement est réduit (sans marqueur dédié) ou
   * avant le montage client (icône, illustration, première frame). Décoratif si
   * `ariaLabel` est absent.
   */
  fallback?: ReactNode;
  /** Boucle la lecture. Défaut `true` (ignoré en mouvement réduit). */
  loop?: boolean;
  /** Démarre à l'affichage. Défaut `true` (ignoré en mouvement réduit). */
  autoplay?: boolean;
  /** Multiplicateur de vitesse. Défaut `1`. */
  speed?: number;
  /**
   * Marqueur nommé de l'asset à jouer comme repli « mouvement réduit »
   * (frame quasi figée). S'il existe dans le `.lottie`, on l'affiche sans
   * autoplay au lieu du `fallback` statique — cf. doctrine motion (a11y niv. b).
   */
  reducedMotionMarker?: string;
  /**
   * Thème dotLottie natif (JSON de theming embarqué dans le `.lottie`), pour
   * **recolorer l'asset aux tokens de la marque** au lieu d'une palette figée
   * (doctrine motion : « asset re-thémé aux tokens »). Généralement câblé par
   * `<MotionAsset>` à partir des design tokens résolus. Optionnel.
   */
  themeData?: string;
  className?: string;
  style?: CSSProperties;
  /**
   * Description accessible : si fournie, l'animation est exposée en `role="img"`
   * avec ce label ; sinon elle est marquée décorative (`aria-hidden`).
   */
  ariaLabel?: string;
}

/** Cadre de repli statique (mouvement réduit / pré-montage), centré. */
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
 * `<LottieAnimation>` — wrapper client, lazy et a11y-first autour du runtime
 * dotLottie. Respecte `prefers-reduced-motion` par défaut : en mouvement
 * réduit, rend le `fallback` statique (ou le marqueur « reduced motion » de
 * l'asset s'il est fourni) au lieu d'animer. Décoratif par défaut ; passer
 * `ariaLabel` pour l'exposer aux technologies d'assistance.
 */
export function LottieAnimation({
  src,
  fallback = null,
  loop = true,
  autoplay = true,
  speed = 1,
  reducedMotionMarker,
  themeData,
  className,
  style,
  ariaLabel,
}: LottieAnimationProps) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Avant montage : repli statique (SSR + 1er rendu client identiques).
  if (!mounted) {
    return (
      <StaticFrame className={className} style={style} ariaLabel={ariaLabel}>
        {fallback}
      </StaticFrame>
    );
  }

  // Mouvement réduit SANS marqueur dédié : aucune lecture, repli statique.
  if (reduced && !reducedMotionMarker) {
    return (
      <StaticFrame className={className} style={style} ariaLabel={ariaLabel}>
        {fallback}
      </StaticFrame>
    );
  }

  return (
    <DotLottieReact
      src={src}
      loop={reduced ? false : loop}
      autoplay={reduced ? false : autoplay}
      speed={speed}
      marker={reduced ? reducedMotionMarker : undefined}
      themeData={themeData}
      className={className}
      style={style}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    />
  );
}
