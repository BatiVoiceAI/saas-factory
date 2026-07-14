/**
 * Point d'entrée unique de la couche MOTION du châssis (`components/motion/*`).
 * Importer d'ici : `import { LottieAnimation, Reveal, EmptyState } from "@/components/motion"`.
 *
 * Contrat a11y : chaque brique respecte `prefers-reduced-motion` (hook JS +
 * backstop CSS global). Détails d'usage + branchement d'un `.lottie` : voir
 * `components/motion/README.md`. Contrat châssis : CONVENTIONS §14.
 */

export {
  MotionAsset,
  type MotionAssetProps,
  type MotionRuntime,
} from "@/components/motion/motion-asset";
export {
  LottieAnimation,
  type LottieAnimationProps,
} from "@/components/motion/lottie-animation";
export {
  RiveAnimation,
  type RiveAnimationProps,
  type RiveInstance,
} from "@/components/motion/rive-animation";
export { Reveal, type RevealProps } from "@/components/motion/reveal";
export {
  SkeletonShimmer,
  type SkeletonShimmerProps,
} from "@/components/motion/skeleton-shimmer";
export {
  EmptyState,
  type EmptyStateProps,
} from "@/components/motion/empty-state";
export { useReducedMotion } from "@/components/motion/use-reduced-motion";
export { useTokenColors } from "@/components/motion/use-token-colors";
