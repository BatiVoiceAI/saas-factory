# Référence — Tokens buildables & accessibilité (garde-fou « buildable, pas décoratif »)

Le garde-fou central de l'étape : **un design qui ne se traduit pas en code est inutile.** Les tokens de `DESIGN.md` doivent **mapper directement la stack de la Phase 3** (Tailwind + shadcn/ui + Lucide), sinon design et code divergent. Ce fichier donne le **contrat de mapping** et la **procédure de contraste a11y**.

## Axiome : le token EST une variable de la stack, pas une intention
Un token décoratif (« ombres douces », « vibe premium », « coins arrondis ») n'est **pas** un token : c'est une intention non buildable. Un vrai token a une **valeur** et un **point d'ancrage dans la stack**.

```
   INTENTION (non buildable)            TOKEN (buildable)
   ─────────────────────────            ─────────────────────────────────
   « coins arrondis »          ──▶      --radius: 0.5rem        (shadcn var)
   « bleu de marque »          ──▶      --primary: 221 83% 53%  (HSL ou OKLCH, .dark aussi)
   « espacé, aéré »            ──▶      base 4px, échelle 4/8/12/16/24/32 (Tailwind)
   « titres qui claquent »     ──▶      --font-display: Fraunces + --font-sans: Work Sans
                                        (paire de la recette, next/font) + échelle 12→48
   « animations fluides »      ──▶      duration-200, ease-out (Tailwind)
```

## Table de mapping token → stack Phase 3

| Catégorie DESIGN.md | Forme buildable | Ancrage stack |
|---|---|---|
| **Couleur (rôle)** | HSL ou OKLCH en variable CSS sémantique | `:root{--primary --secondary --accent --muted --destructive --background --foreground --border --ring}` + `.dark{…}` (convention shadcn) |
| **Couleur (Tailwind)** | référence la variable | `colors.primary: 'hsl(var(--primary))'` dans `tailwind.config` |
| **Neutres** | famille **teintée** (jamais gris purs — doctrine) | les rôles `background/muted/border` partagent la hue de la marque (chroma 0.005-0.02), en light ET en `.dark` |
| **Typographie** | **paire** display+corps via Google Fonts + `fontFamily` | `--font-display`/`--font-sans`/`--font-mono` ; `@import`/`next/font` ; échelle = classes `text-xs…text-5xl` ; chiffres en `tabular-nums`/mono |
| **Spacing** | base 4px, échelle | échelle Tailwind par défaut (`p-1`=4px…) — **ne pas** inventer une échelle parallèle |
| **Radius** | `--radius` unique (personnalité de la recette) | `borderRadius.lg/md/sm` dérivés de `--radius` (convention shadcn) |
| **Élévation / ombres** | **bordures 1px par défaut** + UNE ombre tokenisée | `border` (`var(--border)`) pour délimiter ; `--shadow-elevated` réservée aux éléments flottants (popover, dialog) — pas de `shadow-lg` saupoudré (doctrine) |
| **Motion (état)** | durée + easing | `duration-150/200/300` + `ease-in-out/out` ; transitions déclarées ; **Motion** (MIT) par défaut |
| **Direction motion (assets)** | runtime + fallback reduced-motion | `<MotionAsset>` (patron châssis, lazy, theming-aware) route Motion/**dotLottie**/**Rive**/GSAP (M7) ; `useReducedMotion` (matchMedia `prefers-reduced-motion: reduce`) → 3 niveaux de fallback ; asset re-thémé aux tokens |
| **Composants** | shadcn/ui + Lucide | nommés par leur composant shadcn (`Button`, `Card`, `Dialog`…) + variantes/états |

**Règle de rôle sémantique :** définir les couleurs en **rôles** (`primary`, `background`, `foreground`, `muted`, `destructive`, `border`, `ring`), **pas** en teintes brutes (`blue-500`). C'est ce qui rend le **dark mode** quasi gratuit (M6) et les mockups cohérents. Rappel doctrine : **1 seule couleur de marque** (jamais indigo/violet), **jamais d'hex en dur** dans les composants.

## Procédure de contraste a11y (WCAG AA — dès les tokens, mouvement 2)

Intégrer le contraste **dans la définition des tokens**, pas en correctif après coup.

### Seuils à tenir
| Élément | Ratio minimal | Note |
|---|---|---|
| Texte corps (< 18px / < 14px gras) | **4.5:1** | le cas le plus fréquent |
| Grand texte (≥ 18px / ≥ 14px gras) | **3:1** | titres |
| Composants UI & bordures signifiantes (icône, champ, focus ring) | **3:1** | non-décoratif |
| Cible tactile | **≥ 44×44px** | boutons, liens tapables |

### Paires à vérifier systématiquement
```
foreground        sur  background        (corps)            ≥ 4.5:1
muted-foreground  sur  background        (texte secondaire) ≥ 4.5:1
primary-foreground sur primary           (label bouton)     ≥ 4.5:1
foreground        sur  card / muted      (texte sur surface)≥ 4.5:1
ring / border     sur  background        (focus, champ)     ≥ 3:1
destructive-fg    sur  destructive       (alerte)           ≥ 4.5:1
```
→ **Répéter l'intégralité de ces paires dans le thème `.dark`** (M6). Un token AA en light peut échouer en dark.

### Comment vérifier
1. Calculer le ratio de chaque paire (formule de luminance relative WCAG).
2. Toute paire **< seuil** → ajuster la **teinte de texte** (assombrir/éclaircir) ou la surface, re-calculer.
3. Ne **jamais** livrer un token qui échoue « parce que ça a l'air lisible ».
4. Consigner dans `DESIGN.md` (section Color) que les ratios AA sont tenus.

### Micro-exemples (niche-agnostiques)
- **Échoue (✗) :** `muted-foreground: #9CA3AF` sur `background: #FFFFFF` ≈ 2.8:1 → texte secondaire illisible. **Corriger** vers `#6B7280` (≈ 4.6:1).
- **Passe (✓) :** `foreground: #111827` sur `#FFFFFF` ≈ 16:1 ; bouton `primary #2563EB` avec `primary-foreground #FFFFFF` ≈ 4.5:1.
- **Piège dark :** un accent qui passe sur fond blanc peut **saturer** et échouer sur fond sombre → prévoir une variante d'accent en `.dark`.

## Definition-of-Done (tokens buildables & a11y)
- [ ] Chaque token a une **valeur** + un **ancrage stack** (aucune intention nue).
- [ ] Couleurs définies en **rôles sémantiques**, pas en teintes brutes ; **1 seule couleur de marque**.
- [ ] **Neutres teintés** (hue partagée avec la marque), jamais gris purs.
- [ ] Mapping Tailwind/shadcn **explicite** (ou reprenable tel quel).
- [ ] Spacing sur l'**échelle Tailwind** (pas d'échelle parallèle inventée).
- [ ] `--radius` unique (personnalité de la recette) ; **bordures > ombres** (une `--shadow-elevated` max) ; motion sur les échelles Tailwind.
- [ ] **Paire** de polices (display + corps) via **Google Fonts** avec plan de chargement, exposée en `--font-display`/`--font-sans`/`--font-mono`.
- [ ] **Toutes** les paires texte/fond vérifiées AA, **en light ET dark**.
- [ ] Cibles tactiles ≥ 44px.
- [ ] **Direction motion buildable** : runtime déclaré (M7), `<MotionAsset>` lazy/theming-aware, **`prefers-reduced-motion`** géré via `useReducedMotion` (3 niveaux de fallback) — aucune animation sans fallback.
- [ ] Ratios AA consignés dans `DESIGN.md`.

## Modes d'échec (et correction)
| Mode d'échec | Symptôme | Correction |
|---|---|---|
| **Token décoratif** | « vibe premium », « ombres douces » sans valeur | reformuler en valeur + ancrage stack, ou retirer |
| **Teinte brute au lieu de rôle** | `blue-500` en dur partout | passer en rôle sémantique (`--primary`) → dark mode + cohérence |
| **Gris purs en neutres** | `#666`, `gray-*`/`neutral-*` non teintés (marqueur de slop n°2) | re-teinter la famille de neutres avec la hue de la marque (chroma 0.005-0.02) |
| **Police unique sans display** | Inter/Roboto/system seule (marqueur de slop n°6) | adopter la paire de la recette : display à caractère (H1-H3) + sans neutre (corps) |
| **Échelle spacing parallèle** | valeurs 5/7/13px arbitraires | revenir à la base 4px / échelle Tailwind |
| **Contraste « à l'œil »** | aucun ratio calculé | calculer chaque paire, corriger < seuil |
| **Dark oublié** | AA en light seulement | dupliquer et vérifier toutes les paires en `.dark` (les neutres gardent leur teinte) |
| **Radius/ombres multiples** | 4 radius différents au feeling ; `shadow-lg` sur toutes les cartes | un `--radius`, dérivés lg/md/sm ; bordures 1px + une seule ombre tokenisée |
| **Police non chargeable** | font hors Google Fonts sans fallback | Google Fonts + fallback système déclaré |
