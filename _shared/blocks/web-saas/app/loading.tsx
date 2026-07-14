import { Skeleton } from "@/components/ui/skeleton";

/**
 * État de chargement racine — affiché par le `<Suspense>` implicite de Next
 * pendant que le segment se résout (navigation, data-fetching serveur). Rendu
 * INSTANTANÉ, il évite l'écran blanc et pose la structure visuelle attendue.
 *
 * Server Component (pas d'interactivité). Squelette **générique** volontaire :
 * un en-tête + une grille de cartes, neutre vis-à-vis de toute verticale. Une
 * surface au layout spécifique peut poser son propre `loading.tsx` plus proche
 * dans l'arbre (il aura la priorité pour ce segment).
 *
 * Réutilise la primitive `Skeleton` (bloc `ui-shell`) — `aria-hidden` + label
 * SR pour annoncer le chargement sans lire chaque barre.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10"
    >
      <span className="sr-only">Chargement…</span>

      {/* En-tête : titre + sous-titre */}
      <div aria-hidden="true" className="flex flex-col gap-3">
        <Skeleton className="h-8 w-1/2 max-w-xs" />
        <Skeleton className="h-4 w-2/3 max-w-md" />
      </div>

      {/* Grille de cartes générique */}
      <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-lg border border-border p-6"
          >
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
