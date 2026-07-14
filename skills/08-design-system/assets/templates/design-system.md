# Design System — <Produit>

> Source de vérité visuelle. Toujours lire ce fichier avant toute décision UI, en Phase 2 comme en Phase 3. Ne pas dévier sans accord explicite.

## Product context
<!-- Ce que c'est, pour qui, type (public/interne/perso) — hérité de research/idea-brief.md -->
<...>

## Direction visuelle (recherchée) — artefact « direction »
<!-- Produit par le §Processus de recherche de direction de `_shared/design-doctrine.md`, AVANT tout token.
     C'est ce qui justifie « pourquoi ce design » et empêche la convergence entre projets.
     ⚠️ NE PAS remplir en piochant une recette : la direction est DÉRIVÉE du brand audit + du white space sectoriel. -->

- **Territoire visuel nommé** : <un nom qui capture la direction, ex. « éditorial artisanal chaud » / « terminal précis dark » — pas un des 5 registres génériques recopié tel quel>
- **Audit concurrentiel visuel (5-8 réfs)** : <ce à quoi ressemble le secteur AUJOURD'HUI — palette dominante, typo, densité, motion des concurrents/voisins>
- **White space visé** : <la position visuelle LIBRE qu'on occupe VS les concurrents cartographiés — le contraste choisi>
- **2-3 références réelles (URL)** : <URL Mobbin / Land-book / Awwwards… qui incarnent le white space — on duplique la STRUCTURE, jamais le code/assets/copy>
- **Ancrage marque** : <chaque parti-pris ci-dessous trace à quel attribut de marque (positioning.md)>

### Test anti-convergence (porte distinctiveness)
<!-- Réponse OBLIGATOIRE, binaire. Un « oui » = direction pas assez taillée → retour recherche. -->
- La même **palette + typo + motion** pourrait-elle servir un **autre métier** sans changement ? **NON** — parce que : <justif : couleur dérivée du territoire, typo = voix de marque, motion parti-pris propre>
- Le rendu ressemble-t-il à **une recette non modifiée** ou à **un autre projet de l'usine** (même couple typo + hue + layout signature + motion) ? **NON** — parce que : <ce qui diverge>

### Éléments signature (1-2)
<!-- Ce qui rend le produit reconnaissable, pas médian (ex. serif éditoriale en display, neutres chauds, layout asymétrique signature, section sombre de rupture) — exigé par l'étape 08 -->
<...>

## Typography
<!-- Paire DÉRIVÉE de la marque (voix), pas le trio par défaut : display à caractère H1-H3 + sans neutre corps, via next/font, exposée en --font-display / --font-sans / --font-mono · échelle · poids · chiffres en tabular-nums/mono. Noter POURQUOI cette typo porte la marque. -->
<...>

## Color
<!-- 1 seule couleur de marque (OKLCH) DÉRIVÉE du territoire du métier (jamais une teinte d'exemple recopiée) + neutres TEINTÉS (jamais gris purs) : primary · accent · neutrals · sémantique (succès/erreur/alerte) · dark mode. Noter le contraste a11y (ratios texte/fond conformes WCAG AA, light ET dark). Interdits binaires : `_shared/design-doctrine.md` §Marqueurs. -->
<...>

## Spacing
<!-- Base (ex. 4px) · échelle (xs/sm/md/lg/xl) -->
<...>

## Layout / Geometry
<!-- Grille · radius (coins) · élévation / ombres · LAYOUT SIGNATURE (le parti-pris spatial : asymétrie / calques / crops — issu du moodboard, pas centré-minimal générique) -->
<...>

## Direction motion
<!-- Le PARTI-PRIS motion du projet (§Direction motion de `_shared/design-doctrine.md`), pas des micro-anims génériques.
     Décrire : OÙ, POURQUOI, quel runtime, reduced-motion. -->

- **Motion signature** : <le geste de mouvement récurrent et propre à la marque — ex. reveal directionnel du hero, kinetic typography, réaction d'un élément>
- **Où** : <hero / micro-interactions / empty states / loading / success — les emplacements choisis, pas partout>
- **Pourquoi** : <ce que le motion communique à chaque emplacement (changement d'état, direction d'attention, réduction de friction)>
- **Couche / runtime** : <Motion (état/presence) · dotLottie (décoratif one-shot) · Rive (interactif piloté par l'état) · GSAP (scène scroll orchestrée) — 1-2 effets signature max/page>
- **Durées / easing** : <150-250ms micro · 300-400ms transitions · ease-out entrées>
- **`prefers-reduced-motion`** : <fallback déclaré — gate simple / marqueur Lottie `reduced motion` / booléen Rive ; via `useReducedMotion` + `<MotionAsset>`>

## Visuels générés (Nano Banana Pro)
<!-- Les visuels du produit sont GÉNÉRÉS on-brand via Nano Banana Pro (`gemini-3-pro-image`) —
     helper `scripts/generate-visual.mjs`, prompt DÉRIVÉ de cette charte (palette/typo/métier).
     Jamais du stock/placeholder. Sortie `public/generated/`, référencée via next/image.
     ⚠️ Jamais une image IA maquillée en screenshot produit (n°17) ni en fausse preuve (n°18) :
     la preuve « voici l'app » reste un vrai screenshot. Le BUILD (étape 12) génère ces fichiers. -->

| Visuel | Emplacement (écran) | Fichier `public/generated/` | Prompt (dérivé de la direction — sujet + palette + cadrage) | Aspect |
|---|---|---|---|---|
| Hero (art éditorial/atmosphérique) | Landing hero | `hero.png` | <ex. « editorial hero art, warm terracotta on sand, 1px grid, no UI, no text »> | 16:9 |
| OG image (carte sociale) | metadata `openGraph.images` | `og.png` | <ex. « social card, brand wordmark, terracotta accent, editorial »> | 1.91:1 |
| Empty-state | <liste cœur vide> | `empty-<liste>.png` | <ex. « minimal spot illustration, brand palette, inviting »> | 1:1 |
| Favicon / wordmark | tab / auth | `favicon.png` | <ex. « mark derived from accent, geometric »> | 1:1 |

<!-- Repli honnête : si `GEMINI_API_KEY` absente ou `visuals="none"`, ne PAS simuler d'images —
     le build consigne « ajoute ta clé pour générer les visuels » et livre le reste (safety-rails §6). -->

## Rationale par page
<!-- NOUVELLE EXIGENCE (étape 08). Une ligne « intention » PAR type de page : pourquoi ce layout / cette hiérarchie / cette anim servent le job de CETTE page, relié à la direction visuelle.
     Sans cette trace, on retombe dans le template. La QA design (crans 13/14) vérifie que le rationale EXISTE et que le RENDU le tient. -->

| Type de page | Job de la page | Layout / hiérarchie choisis | Motion | Pourquoi (relié à la direction / au white space) |
|---|---|---|---|---|
| Landing | <convertir la cible sur le job> | <ex. hero 2 colonnes asymétrique + screenshot> | <ex. reveal directionnel hero> | <ex. asymétrie = white space vs concurrents centrés> |
| Auth (login/signup) | <faire entrer sans friction> | <...> | <...> | <...> |
| Dashboard / coquille | <orienter + montrer l'état> | <...> | <...> | <...> |
| Detail / écran cœur | <exécuter le workflow cœur> | <...> | <...> | <...> |
| Empty states | <amorcer l'activation> | <...> | <ex. illustration dotLottie> | <ex. empty animé = réduire la friction d'activation> |
| Portal / settings (si applicable) | <...> | <...> | <...> | <...> |

## Components (shadcn/ui + Tailwind)
<!-- Composants clés utilisés + leurs variantes/états. Ils mappent la stack de la Phase 3. Icônes : Lucide, un seul style (taille/stroke uniformes). Motion assets via `<MotionAsset>` (lazy, theming-aware). -->
<...>

## Tokens → code (mapping exact `app/globals.css`)
<!-- Bloc `:root` + `.dark` PRÊT À COLLER (valeurs HSL/OKLCH) : la Phase 4 l'applique en ÉCRASANT les défauts du châssis (garde-fou « charte appliquée », étape 12). Un DESIGN.md sans ce bloc reste un document mort. -->
```css
:root { <...> }
.dark { <...> }
```

## Decisions log
| Date | Décision | Rationale |
|------|----------|-----------|
| <date> | <décision> | <pourquoi (attribut de marque / white space)> |
