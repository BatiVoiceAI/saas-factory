import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type SkeletonShimmerProps = HTMLAttributes<HTMLDivElement>;

/**
 * Skeleton animé à surbrillance qui balaie (« shimmer »), pendant plus riche de
 * `components/ui/skeleton.tsx` (pulse) pour les chargements soignés (listes,
 * cartes). L'animation vit dans `app/globals.css` (classe `.skeleton-shimmer`,
 * surbrillance dérivée du token `--foreground`) et **se fige automatiquement en
 * mouvement réduit** via le backstop CSS global (CONVENTIONS §14) — aucun JS.
 *
 * Server Component (pur CSS) : composable côté serveur, dans un `loading.tsx`
 * comme dans une liste. Exemple d'une ligne :
 *   `<SkeletonShimmer className="h-4 w-40" />`
 */
export function SkeletonShimmer({ className, ...props }: SkeletonShimmerProps) {
  return (
    <div
      className={cn("skeleton-shimmer rounded-md bg-muted", className)}
      {...props}
    />
  );
}
