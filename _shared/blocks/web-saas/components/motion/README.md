# Couche `motion` — animation réutilisable, build-safe

Couche d'animation du châssis. Réutilisable par tout projet, **compile-safe**
(`tsc` + `next build`) et **a11y-first** : chaque brique respecte
`prefers-reduced-motion`. Contrat châssis : `CONVENTIONS.md §14`.

## Contenu

| Fichier | Rôle | `"use client"` |
|---|---|---|
| `lib/motion.ts` | Helpers reduced-motion (`prefersReducedMotion`, `watchReducedMotion`, `REDUCED_MOTION_QUERY`) + tokens `motionDuration`. Framework-agnostic, SSR-safe. | non |
| `use-reduced-motion.ts` | Hook `useReducedMotion()` (via `useSyncExternalStore`, réactif aux bascules). | oui |
| `use-token-colors.ts` | Hook `useTokenColors()` — résout des design tokens (`--primary`…) en couleurs CSS, réactif au thème clair/sombre. Rend `<MotionAsset>` theming-aware. | oui |
| `motion-asset.tsx` | **`<MotionAsset>`** — point d'entrée UNIQUE de la direction motion : route le runtime (`motion`/`lottie`/`rive`, M7), reduced-motion par défaut (3 niveaux), lazy WASM, lit les tokens. | oui |
| `lottie-animation.tsx` | `<LottieAnimation>` — wrapper lazy du runtime dotLottie, repli statique en mouvement réduit (niveaux a/b). | oui |
| `rive-animation.tsx` | `<RiveAnimation>` — wrapper lazy du runtime Rive (`<canvas>` + WASM), booléen `reduced` poussé dans la state machine (niveau c). | oui |
| `reveal.tsx` | `<Reveal>` — fondu + glissement à l'entrée au scroll (`IntersectionObserver`, zéro dépendance). | oui |
| `skeleton-shimmer.tsx` | `<SkeletonShimmer>` — skeleton animé « shimmer » (pur CSS). | non |
| `empty-state.tsx` | `<EmptyState>` — exemple neutre : état vide animé + repli. | non |
| `index.ts` | Barrel : `import { … } from "@/components/motion"`. | — |

## Règle NON négociable — `prefers-reduced-motion`

Deux niveaux, complémentaires :

1. **Backstop CSS global** (`app/globals.css`) : `@media (prefers-reduced-motion:
   reduce)` quasi-annule animations/transitions/scroll fluide sur tout l'arbre
   (couvre même `animate-pulse` et le shimmer). Défense en profondeur.
2. **JS piloté par l'état** : `useReducedMotion()` coupe l'autoplay et rend un
   repli statique (`<LottieAnimation>`), ou révèle le contenu immédiatement sans
   glissement (`<Reveal>`). `<LottieAnimation reducedMotionMarker="…">` joue un
   marqueur nommé de l'asset comme frame figée si l'animation en fournit un.

Principe : on **garde l'opacité finale**, on **supprime le mouvement** (pas de
parallax ni de transform sur de gros éléments).

## Brancher un asset `.lottie` (aucun binaire lourd committé)

Le châssis ne committe **aucun** `.lottie`/`.riv` lourd. On passe l'animation
par **URL** (prop `src`) — branchée au build par la direction de marque :

```tsx
import { EmptyState } from "@/components/motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Inbox } from "lucide-react";

<EmptyState
  title="Rien ici pour le moment"
  description="Ce que vous créez apparaîtra dans cette liste."
  animationSrc="https://cdn.exemple.com/brand/empty.lottie" // asset de la marque
  icon={<Inbox className="h-10 w-10" aria-hidden />}         // repli statique
  action={
    <Button asChild>
      <Link href="/nouveau">Créer</Link>
    </Button>
  }
/>
```

Sources d'assets : **LottieFiles** (`lottiefiles.com`, export `.lottie`/JSON),
**Rive Community** (`rive.app/community`). Prendre l'asset comme **base** puis le
**recolorer/retimer** aux tokens de la marque (`--primary`, `motionDuration`) —
un Lottie générique non retouché = slop.

Alternatives pour héberger l'asset au lieu d'une URL distante :
- Poser le fichier dans `public/` du projet généré et passer
  `src="/anim/empty.lottie"` (servi en statique, pas dans le bundle JS).
- L'importer comme URL d'asset (`import url from "./empty.lottie?url"`) si un
  loader est configuré.

> **WASM** : le runtime dotLottie récupère son binaire WASM au runtime (CDN par
> défaut). Pour l'auto-héberger (CSP stricte), appeler `setWasmUrl(url)` de
> `@lottiefiles/dotlottie-react` une fois côté client.

## Reveal au scroll

```tsx
import { Reveal } from "@/components/motion";

<Reveal direction="up" delay={80}>
  <FeatureCard … />
</Reveal>
```

Cascader plusieurs `Reveal` avec des `delay` croissants. En mouvement réduit, le
contenu est visible immédiatement (jamais masqué).

## Skeleton animé

```tsx
import { SkeletonShimmer } from "@/components/motion";

<div className="space-y-2">
  <SkeletonShimmer className="h-4 w-40" />
  <SkeletonShimmer className="h-4 w-full" />
  <SkeletonShimmer className="h-24 w-full" />
</div>
```

Utilisable dans un `loading.tsx` (Server Component, pur CSS).

## `<MotionAsset>` — le point d'entrée unique (router theming-aware)

Le châssis livre les **deux** runtimes d'asset (dotLottie **et** Rive, tous deux
MIT, lazy) derrière un composant unique, `<MotionAsset>` : on déclare le
`runtime` de la direction, il route, respecte `prefers-reduced-motion` par défaut
(3 niveaux), lazy-load le WASM et lit les design tokens. **L'asset n'est jamais
hardcodé** : `src`, `runtime` et couleurs viennent de la config de la direction.

| Cas d'usage (M7) | `runtime` | Runtime réel |
|---|---|---|
| Transitions d'état / presence / micro-interactions code-driven | `"motion"` | rend les `children` (Motion / `<Reveal>` / GSAP) |
| Décoratif / one-shot (hero illustré, empty-state, loading, célébration) | `"lottie"` | **dotLottie** (`@lottiefiles/dotlottie-react`) — léger, assets abondants |
| Interactif piloté par l'état (icônes réactives, toggles, mascotte) | `"rive"` | **Rive** (`@rive-app/react-canvas`) — state machines natives |

```tsx
"use client";
import { MotionAsset } from "@/components/motion";

// Décoratif : dotLottie, recoloré aux tokens, repli statique en reduced-motion.
<MotionAsset
  runtime="lottie"
  src="https://cdn.exemple.com/brand/success.lottie"
  reducedMotionMarker="reduced motion"   // niveau (b)
  themeTokens={["primary", "accent"]}     // exposés en --motion-primary / --motion-accent
  currentColorToken="primary"
  ariaLabel="Paiement confirmé"
  className="h-40 w-40"
/>

// Interactif : Rive, booléen reduced dans la state machine (niveau c).
<MotionAsset
  runtime="rive"
  src="/anim/toggle.riv"
  stateMachine="State Machine 1"
  riveReducedInput="reduced"              // input booléen de la state machine
  onRiveLoad={(rive, colors) => {/* data-binding des couleurs de tokens */}}
  className="h-10 w-10"
/>
```

Trois niveaux de fallback `prefers-reduced-motion` (non négociable, marqueur 23) :
**(a)** gate simple → repli statique (et pour Rive, le WASM n'est même pas chargé) ;
**(b)** marqueur nommé `reduced motion` de l'asset Lottie ; **(c)** booléen poussé
dans la state machine Rive. Le hook `useReducedMotion` capte les bascules en direct.

> **Poids.** dotLottie ≈ 100 KB, Rive ≈ 200 KB (WASM) — les deux en chunk **lazy**,
> jamais dans le bundle critique (`dynamic(ssr:false)`). Un seul petit icône animé
> ne justifie PAS Rive ; beaucoup d'icônes interactives, oui (le runtime s'amortit).
