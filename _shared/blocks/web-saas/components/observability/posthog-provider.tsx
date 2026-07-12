"use client";

/**
 * PostHogProvider — monte PostHog dans l'arbre client et capture les pageviews
 * du App Router manuellement (Next ne déclenche pas de rechargement complet
 * entre routes, donc on écoute pathname + searchParams).
 *
 * NO-OP propre si `NEXT_PUBLIC_POSTHOG_KEY` est absent : `initPostHog()` ne fait
 * rien, `PHProvider` fournit un contexte inerte, et le composant se contente de
 * rendre `children`.
 *
 * Ce fichier est DISJOINT (bloc observability). Il est wrappé autour de
 * `children` par `app/providers.tsx` (cf. CONVENTIONS.md §7).
 */
import { usePathname, useSearchParams } from "next/navigation";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { Suspense, useEffect, type ReactNode } from "react";

import {
  capturePageview,
  getPostHog,
  initPostHog,
} from "@/lib/analytics/posthog";

/**
 * `useSearchParams` force le rendu dynamique de tout ce qui l'appelle : on
 * l'isole dans un enfant sous <Suspense> pour ne pas désactiver le
 * pré-rendu statique des pages parentes.
 */
function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const query = searchParams.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    capturePageview(window.location.origin + url);
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  const client = getPostHog();

  // Sans clé configurée : pas de contexte PostHog, on rend `children` tel quel.
  if (!client) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={client}>
      <Suspense fallback={null}>
        <PostHogPageview />
      </Suspense>
      {children}
    </PHProvider>
  );
}
