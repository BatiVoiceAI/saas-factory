# Référence — Matrices de décision (étape 8)

Condition → action, pour chaque point où l'étape **tranche sans interroger l'utilisateur**. On applique la matrice, on n'improvise pas. Ces matrices rendent l'étape **déterministe** malgré son unique décision utilisateur.

---

## M1 — Format d'import → action d'extraction (mouvement 1.b)

Router selon ce qui est déposé. On extrait ce qui existe, on **dérive** le reste au mouvement 2.

| Ce qui est déposé | Reconnaissance | Action d'extraction | Ce qui reste à dériver |
|---|---|---|---|
| **Tokens JSON / CSS custom-props** (`tokens.json`, `:root{--…}`) | clés `color/space/radius/font` | Extraire tel quel → mapper Tailwind/shadcn (`tokens-a11y.md`) | rien, ou ce qui manque |
| **`tailwind.config.(js/ts)`** | `theme.extend.colors/spacing/borderRadius` | Reprendre la config **directement** — déjà buildable | motion, composants |
| **Feuille de style / CSS global** | sélecteurs + variables | Extraire couleurs, police(s), radius présents | spacing/motion si absents |
| **PDF de charte** | doc de marque | Lire couleurs (hex/CMJN→hex), police(s), logo, règles d'usage | spacing, radius, motion, composants |
| **Logo + liste de couleurs** (le cas fréquent) | image(s) + quelques hex | Extraire palette + logo ; dériver le contraste des couleurs du logo | typo, spacing, géométrie, motion, composants |
| **Capture d'écran d'un produit existant** | image d'UI | Extraire palette dominante + estimer radius/spacing visibles ; marquer `[Assumption]` | tout le reste, à confirmer |
| **Format inconnu / illisible** | parsing échoue | Extraire couleurs si visibles, sinon **R1 import illisible** → génération | tout |

**Règle :** l'import **prime** sur la dérivation. Tout token fourni est verrouillé (`source: import`) et **écrase** la dérivation correspondante. On ne re-dérive jamais ce qui est imposé par la charte.

---

## M2 — Type/positionnement produit → graines de registre candidates (mouvement 1.c)

Route le **type / cible / feel** vers les **graines de `_shared/design-doctrine.md` §Points de départ** (R1 « Éditorial chaleureux », R2 « Technique précis », R3 « Studio contemporain », R4 « Moderne à caractère », R5 « Brutal créatif »). ⚠️ Ce sont des **graines de registre** (point de départ du shotgun), **pas la sortie** : chaque graine est ensuite **taillée au white space** du secteur (couleur dérivée du métier, typo voix de marque, layout signature, motion) — une graine servie brute = convergence. La 1re graine listée est la **prioritaire** (mode dégradé « fais au mieux »). Le **feel de marque** de `positioning.md` prime en cas d'hésitation.

| Type / cible / feel (idea-brief + positioning) | Recettes candidates (ordre) | Pourquoi |
|---|---|---|
| **B2B niche locale / services** (salon, resto, artisan, cabinet, bien-être) | **R1** · R4 · R3 | voix de commerçant, chaleur ; jamais de registre dev-tool |
| **Outil pro / B2B / productivité / booking / gestion** | **R4** · R2 · R3 | SaaS contemporain confiant sans générique |
| **Dev tool / technique / data / infra** | **R2** · R4 · R5 | densité, précision, dark mode naturel |
| **Créatif / expressif / audience jeune** | **R5** · R3 · R4 | personnalité avant consensus |
| **Premium / confiance / coaching / fintech calme** | **R3** · R1 · R4 | élégance calme, crédibilité par l'esthétique |
| **Consumer / mobile-first / léger** | **R4 (variante Sora)** · R3 · R1 | ton direct, géométrique doux |
| **Interne / perso / low-stakes** | **R4 en version minimale** (mono-famille Manrope, paire 12 de la doctrine) | vitesse de build, mais **jamais** le zinc shadcn brut (interdit doctrine n°20) |

**Règles :** en cas de conflit type ↔ positionnement, **positionnement gagne** (c'est lui qui porte le feel de marque validé en Phase 1). En cas de doute total → **R4** comme graine, couleur **dérivée du métier** (la plus sûre, sans risque de slop). **Jamais deux graines du même registre** dans les 3 proposées.

---

## M3 — Composer les 3 directions recherchées proposées (mouvement 1.c)

Objectif : **3 directions vraiment différentes**, chacune **seedée sur un registre différent** (graine M2) puis **taillée au white space** (audit concurrentiel visuel + moodboard) — direction = registre de départ + typo voix de marque + palette **dérivée du métier** + layout signature + parti-pris motion. Pas 3 palettes nues, pas 3 nuances d'une même teinte, **pas 3 graines servies brutes**.

| Piste | Rôle | Comment la composer |
|---|---|---|
| **Prioritaire** | valeur sûre, alignée au métier | graine 1 de M2, couleur **dérivée du territoire** (`positioning.md` + audit concurrentiel) |
| **Affirmée** | plus de personnalité, mémorable | graine 2 de M2 (registre différent), parti-pris plus franc — jamais indigo/violet |
| **Alternative** | contre-proposition de registre | graine 3 de M2, pour vérifier que le choix du registre est bien réel |

Contraintes communes aux 3 :
- Chaque direction **part d'une graine** `design-doctrine.md` §Points de départ puis est **taillée au white space** — on n'invente pas une 6e graine, mais on ne sert jamais la graine brute.
- **Jamais deux graines du même registre** (doctrine) ; les palettes sont **distinctes en teinte ET en tonalité** et **dérivées du métier**.
- Chaque direction doit **passer AA** (sinon non proposable — `tokens-a11y.md`), **zéro marqueur de slop**, et **passer la porte distinctiveness** (test anti-convergence : ne pourrait pas servir un autre métier ; ne ressemble ni à une graine brute ni à un autre projet de l'usine).
- Chaque direction est **rendue visuellement** : titre dans la **display de la direction** + échantillons + bouton + carte + extrait de hero (avec le layout signature) — jamais des hex bruts ni une palette sans polices.
- **Ancrage :** la teinte de marque découle du **territoire du métier** (audit concurrentiel + feel `positioning.md`), pas d'un goût arbitraire ; typo, layout et motion tracent aux attributs de marque.

---

## M4 — Dériver la liste des écrans depuis le PRD (mouvement 3)

Source : `product/product-spec.md` (features **Must**, workflow cœur). Ordre = **valeur d'abord**.

| Priorité | Écran | Origine | Toujours ? |
|---|---|---|---|
| 1 | **Écran(s) du workflow cœur** | feature Must portant la valeur centrale | Oui — d'abord |
| 2 | **Dashboard / coquille app** | vue post-login, navigation | Oui |
| 3 | **Écrans des autres features Must** | chaque Must restante | Oui (1 par Must) |
| 4 | **Landing** | positioning + value themes | Oui |
| 5 | **Auth** (login / signup) | standard | Oui |
| 6 | États : vide / chargement / erreur | robustesse UX | Si le workflow cœur en dépend |
| — | Features Should/Could | PRD | **Non** — hors périmètre maquettes MVP |

**Règles :**
- On maquette le **workflow cœur AVANT** la landing (la page marketing ne porte pas la valeur).
- **1 écran = 1 feature Must** (pas de sur-génération d'écrans Should/Could).
- Écran non specifié dans le PRD → ne pas l'inventer ; si le cœur l'exige, le dériver au minimum et `[Assumption]`.

---

## M5 — Génération de visuels Nano Banana Pro (mouvement 4)

Moteur : **Nano Banana Pro** (`gemini-3-pro-image`, image Google/Gemini) via le helper `_shared/blocks/web-saas/scripts/generate-visual.mjs` → sortie `public/generated/`, référencée via `next/image`. Règle : quand le design a **besoin d'imagerie**, on **GÉNÈRE** un visuel **dérivé de `DESIGN.md`** (palette/typo/métier) — **jamais du stock/placeholder** (levier anti-convergence). On génère quand un écran réel le demande, pas « pour faire joli ».

| Besoin | Générer ? | Contrainte |
|---|---|---|
| **Hero éditorial / atmosphérique** (art de fond, illustration de marque) | **Oui** | visuel **on-brand dérivé de `DESIGN.md`** — ⚠️ **ne doit pas se faire passer pour une capture UI** ; la **preuve « voici l'app »** reste un **screenshot réel** (mouvement 3, interdit n°17) |
| **OG image** (carte sociale, `openGraph.images`) | **Oui** | **générée** on-brand (raster Nano Banana Pro **ou** `next/og` codé aux tokens) — jamais une OG statique bricolée ni du stock |
| **Illustration d'empty-state** (écran cœur en a un) | Oui, 1 par état réel | cohérente esthétique, dérivée de la palette, jamais générique |
| **Spot art** (accent de section, illustration de feature) | Oui, si un emplacement réel le porte | on-brand, référencé par un écran ; pas de décoration flottante |
| **Favicon / wordmark** | Oui, 1 | dérivé de l'accent/du territoire, formats standard |
| **Faux dashboard / capture UI simulée** | **Non** | interdit doctrine n°17 (fausse preuve produit) — la preuve reste un vrai screenshot |
| **Photos de personnes / avatars réalistes** | **Non** | interdit doctrine n°18 (avatars stock/IA = fausse preuve sociale) |
| **Décoration « pour faire joli »** (aucun emplacement) | **Non** | pas d'écran = pas d'image |
| **Clé `GEMINI_API_KEY` absente / `visuals="none"`** | **Non** (repli) | s'arrêter proprement, guide, livrer le reste (safety-rails §6) — **jamais** simuler d'images |

**Règle :** chaque image générée est **référencée par un écran réel**, **dérivée de `DESIGN.md`** (prompt : sujet + palette de marque + cadrage/aspect), **jamais du stock/placeholder**. Cohérence avec `DESIGN.md` > flash. Clé `GEMINI_API_KEY` en env, jamais en dur (safety-rails §4). Câblage build : `skills/12-build/references/walking-skeleton.md`.

---

## M6 — Dark mode : le fournir ? (mouvement 2.1)

| Condition | Dark mode | Traitement |
|---|---|---|
| Dev tool / audience technique / usage nocturne | **Oui, natif** | tokens sémantiques dual (light + dark) dès `DESIGN.md` |
| B2B / consumer standard | **Oui, dérivé** | mapper les neutres via variables shadcn (`.dark{--…}`), coût faible |
| Contrainte explicite « dark-only » (R1) | **Dark seul** | ne pas produire de light superflu |
| Interne / perso / time-box serré | **Light d'abord** | dark en `[Could]`, ne pas bloquer le build |

**Règle :** shadcn/ui gère le dual light/dark par variables CSS → le fournir coûte peu **si** les couleurs sont définies en **rôles sémantiques** (`background`, `foreground`, `primary`…) et non en teintes brutes. Le dark mode reste **cohérent avec la direction** : les neutres **gardent leur teinte** en `.dark` (jamais un dark gris pur plaqué sur des neutres chauds). Vérifier le contraste AA **dans les deux thèmes** (`tokens-a11y.md`).

---

## M7 — Runtime motion selon le cas d'usage (mouvement 2 / 3 — §Direction motion)

Chaque projet déclare un **parti-pris motion** (pas des micro-anims partout). Router le runtime par cas d'usage — via `<MotionAsset>` (lazy, theming-aware), `prefers-reduced-motion` respecté.

| Cas d'usage | Runtime | Pourquoi |
|---|---|---|
| Transitions d'état React, presence enter/exit, layout, micro-interactions | **Motion** (déjà dépendance) | le plus léger pour l'état de l'app |
| Décoratif / one-shot : hero illustré, loading, empty state, célébration/confetti | **@lottiefiles/dotlottie-react** | léger (~100 KB), assets abondants, `.lottie` compressé |
| Interactif piloté par l'état : icônes réactives (hover/scroll), toggles, mascotte | **@rive-app/react-canvas** | state machines natives ; **amortir les 200 KB** = beaucoup d'interactif, jamais 1 seul icône |
| Scène scroll orchestrée (storytelling, typo animée) | **GSAP** (npm, jamais vendoré) | timelines/ScrollTrigger — **seulement si la direction l'exige** (typiquement R5, éventuellement landing R3) |
| **Aucun besoin motion réel** | **rien** | pas d'animation gratuite ; 1-2 effets signature max/page |

**Règle :** l'asset Lottie/Rive est **re-thémé aux tokens** (recolor/retime) — un asset générique non retouché = slop. `prefers-reduced-motion` : 3 niveaux de fallback (gate simple / marqueur Lottie `reduced motion` / booléen Rive) — jamais optionnel (marqueur 23).
