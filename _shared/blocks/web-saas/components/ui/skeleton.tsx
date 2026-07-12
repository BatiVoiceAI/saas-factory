import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Placeholder animé pour les états de chargement (style shadcn/ui).
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
