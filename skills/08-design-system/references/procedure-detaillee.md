# Référence — Procédure détaillée (mouvements 1-4)

Sous-procédure exhaustive de l'étape 8. Le SKILL.md est le chef d'orchestre ; ici vit le **quoi faire / dans quel ordre / avec quel critère de passage** pour chacun des 4 mouvements. Principe directeur non négociable : **une seule décision utilisateur (la direction visuelle)**, tout le reste **dérivé** automatiquement (lessons.md : interaction minimale). Référence normative transverse : **`_shared/design-doctrine.md`** (§Processus de recherche de direction, §Points de départ = graines, leviers, §Direction motion, marqueurs slop+convergence interdits, porte distinctiveness) — lue AVANT toute proposition ; pour la landing : **`_shared/landing-playbook.md`**.

## Sommaire

- Machine à états — les deux couloirs
- Data-flow — qui alimente quoi
- Mouvement 1 — La question DIRECTION (la SEULE interaction)
- Mouvement 2 — Dériver tout le reste (frontend-design, 1 passe, 0 question)
- Mouvement 3 — Générer les écrans clés du PRD (frontend-design en CODE)
- Mouvement 4 — Génération de visuels (Nano Banana Pro)
- Definition-of-Done du mouvement (vue d'ensemble)

## Machine à états — les deux couloirs

Toute l'étape se joue sur **une bifurcation unique** au mouvement 1, puis converge :

```
                        ┌─────────────────────────────┐
                        │  1. Question charte (unique) │
                        └───────────────┬──────────────┘
              a une charte ?            │
            ┌──────────────── OUI ──────┴────── NON ──────────────┐
            ▼                                                     ▼
   ┌──────────────────┐                              ┌──────────────────────┐
   │ COULOIR IMPORT   │                              │ COULOIR GÉNÉRATION    │
   │ dépôt fichier/   │                              │ RECHERCHE → SHOTGUN 3 │
   │ dossier          │                              │ DIRECTIONS TAILLÉES ≠ │
   │ extraire tokens  │                              │ screenshots → 1 choix │
   │                  │                              │ (SEULE décision UI)   │
   └────────┬─────────┘                              └───────────┬──────────┘
            │            direction + éventuels tokens fixés       │
            └───────────────────────┬────────────────────────────┘
                                     ▼
                        ┌────────────────────────────┐
                        │ 2. Dériver le reste         │  ← frontend-design, 1 passe, 0 question
                        │ typo·spacing·géo·motion·    │     leviers doctrine imposés,
                        │ composants shadcn → DESIGN.md│     marqueurs de slop INTERDITS
                        └───────────────┬─────────────┘
                                        ▼
                        ┌────────────────────────────┐
                        │ 3. Générer les écrans clés  │  ← frontend-design en CODE
                        │ workflow cœur d'abord        │     → design/mockups/
                        │ landing = landing-playbook   │
                        └───────────────┬─────────────┘
                                        ▼
                        ┌────────────────────────────┐
                        │ 4. Générer les visuels      │  ← Nano Banana Pro (helper)
                        │ hero·OG·empty·spot·favicon   │     → public/generated/ (next/image)
                        └────────────────────────────┘
```

**Règle de convergence :** quel que soit le couloir, à la sortie du mouvement 1 tu as **au minimum une direction fixée** (recette ou tokens importés). Le reste du pipeline est identique. Un import qui apporte déjà typo/spacing/radius **écrase** la dérivation correspondante au mouvement 2 (l'import prime, on ne re-dérive pas ce qui est fourni).

## Data-flow — qui alimente quoi

```
_shared/design-doctrine.md ─(recherche, leviers, interdits)─────┐
research/idea-brief.md ─(type, cible)──────────┐                │
research/positioning.md ─(feel marque, catégorie)┼──▶ audit visuel→white space→moodboard→3 directions recherchées (shotgun)→1 ─▶ DESIGN.md
product/product-spec.md ─(feel, non-goals)──────┘                              │
                                                                               ▼
product/product-spec.md ─(features Must, workflow cœur, auth, dashboard)─▶ liste écrans ─▶ design/mockups/
_shared/landing-playbook.md + positioning + product/pricing.md ─▶ structure + copy landing ──┘
DESIGN.md ─(tokens, composants)──────────────────────────────────────────────┘ (respect strict)
DESIGN.md ─(palette, typo, métier)─▶ prompts Nano Banana Pro ─▶ public/generated/ (next/image · OG · favicon)
```

Rien ne remonte : l'étape 8 **consomme** la Phase 1/2, ne les réécrit pas. Si un input manque → mode dégradé honnête (voir chaque mouvement), jamais d'invention.

---

## Mouvement 1 — La question DIRECTION (la SEULE interaction)

But : décider en **une** question si on **importe** une identité existante ou si on en **génère** une, et dans le second cas obtenir l'**unique décision design** de l'étape (la direction : une recette complète).

### 1.a — Poser la question (`AskUserQuestion`)
« As-tu déjà une charte graphique / un design system ? » Deux issues seulement. Recette exacte, critère de passage et red-flags : `forcing-questions.md` Q1.

### 1.b — Couloir IMPORT (réponse « oui »)
1. L'utilisateur **dépose un fichier ou un dossier**. Ne demande **pas** de format précis : accepte ce qui vient.
2. **Détecter le format** et router l'extraction via la **matrice M1** (`matrices-decision.md`) : tokens JSON/CSS, `tailwind.config`, feuille de style, PDF de charte, ou simplement logo + liste de couleurs.
3. **Extraire les tokens** disponibles dans `DESIGN.md` : couleurs (obligatoire), police(s), logo, spacing/radius **s'ils y sont**. Ce qui est fourni est **verrouillé** (source `import`) ; ce qui manque sera **dérivé** au mouvement 2.
4. **Ne rien demander de plus.** Un import partiel (logo + 2 couleurs) est normal : on complète par dérivation, on ne ré-interroge pas.
- **Critère de passage :** couleurs primaires extraites + chaque token importé tracé dans le Decisions log (`source: import`).
- **Mode dégradé :** fichier illisible / format inconnu → le dire, extraire ce qui est lisible (au minimum les couleurs si visibles), **basculer le reste en génération**. Jamais bloquer sur un parsing.

### 1.c — Couloir GÉNÉRATION (réponse « non ») — RECHERCHE DE DIRECTION puis PATTERN SHOTGUN
**D'abord la recherche (§Processus de recherche de direction de `design-doctrine.md`), AVANT de coder** — c'est ce qui tue la convergence :
0.a **Brand audit** — attributs de marque depuis `positioning.md` + `idea-brief.md` (valeurs, ton, promesse, cible). Chaque parti-pris visuel devra tracer à un attribut.
0.b **Audit concurrentiel visuel (5-8 réfs)** — cartographier palette/typo/densité/motion du secteur → identifier le **white space** (position visuelle libre). C'est CE qui force la divergence entre métiers.
0.c **Moodboard de références réelles** — croiser 3 sources (flux d'apps du métier : Mobbin/Refero/Pageflows · landing sectorielles : Land-book/Lapa Ninja · award/animé : Awwwards/Godly) → retenir **2-3 URL** qui incarnent le white space. On duplique la **structure**, jamais le code/assets/copy.

Puis le shotgun, chaque variante **seedée sur un registre différent mais taillée** :
1. **Seeder 3 registres différents** (graines §Points de départ) via M2 puis M3 de `matrices-decision.md`. **Jamais deux du même registre.**
2. **Tailler chaque graine au white space** : couleur **dérivée du territoire du métier** (pas la teinte d'exemple de la recette ; jamais indigo/violet), typo = **voix de marque**, **layout signature** (issu du moodboard), **parti-pris motion**. Une graine servie brute = convergence (échec porte distinctiveness).
3. **Coder RÉELLEMENT les 3 variantes (shotgun)** : pour chacune, générer **en code** (React/HTML, mêmes exigences de fidélité que le mouvement 3) un **hero + 1 section clé** (la plus parlante : workflow cœur ou features), avec la display, la palette dérivée, le layout signature, et — si la direction en appelle un — son pattern d'animation (doctrine §Direction motion / §Arsenal, blocs dupliqués **re-thémés**). **Diversité forcée** : 3 registres ET 3 squelettes de hero différents ; **chaque variante passe la porte distinctiveness** (test anti-convergence : ne pourrait pas servir un autre métier ; ne ressemble ni à une recette brute ni à un autre projet de l'usine) + zéro marqueur de slop (une variante qui en coche un est re-générée avant présentation).
4. **Rendre et screenshoter** chaque variante (desktop) et présenter les 3 screenshots **côte à côte**. Jamais des palettes nues, des hex bruts ni des vignettes abstraites : le fondateur compare du **RÉEL** et choisit **en regardant**.
5. L'utilisateur en retient **une**. C'est la **seule** décision design de toute l'étape. La variante retenue est **conservée** (`design/mockups/variants/`) : son hero et sa section servent de **graine** au mouvement 3 ; les deux écartées sont archivées, jamais recyclées telles quelles.
- **Critère de passage :** recherche faite (white space nommé + 2-3 réfs URL) ; 3 variantes codées + rendues + screenshotées (3 registres différents, 0 marqueur de slop, **porte distinctiveness passée** chacune) ; une direction unique retenue (territoire nommé + paire de polices + couleur dérivée + motion signature), tracée dans le Decisions log (`source: générée`, + rationale « choisie sur rendu réel parmi 3 directions recherchées — shotgun »).
- **Mode dégradé :** rendu/screenshot impossible → coder quand même les 3 variantes en aperçu HTML statique ouvrable localement ; jamais de repli vers des hex bruts. L'utilisateur ne tranche pas / « fais au mieux » → choisir la direction **la plus alignée au positionnement / au white space** (recette prioritaire de M2 + white space identifié), l'annoncer, marquer `[Assumption]`, avancer. Ne pas relancer 3 fois. **Jamais** sauter la recherche (0.a-0.c) : sans white space, on retombe dans la convergence.

**Pourquoi rechercher avant de coder :** « choisir une des 5 recettes » produit la convergence (AgencyDesk ≈ coiffeur) ; occuper le white space de CE secteur force la divergence. **Pourquoi limiter à une décision :** une direction recherchée embarque déjà polices + palette + layout + motion **cohérents et taillés** ; spacing, géométrie, composants se dérivent proprement une fois la direction fixée. **Pourquoi coder les 3 variantes :** un aperçu abstrait fait choisir un fantasme, un rendu réel fait choisir un produit ; la variante retenue est du code réutilisable au mouvement 3, pas un artefact jeté.

---

## Mouvement 2 — Dériver tout le reste (frontend-design, 1 passe, 0 question)

But : à partir de la recette fixée, produire un **système complet et buildable** sans « AI slop », en **une seule passe** de `frontend-design`, en **imposant les leviers de `design-doctrine.md`**.

### Ordre de dérivation (déterministe)
```
recette fixée (registre + polices + couleur de marque)
   │
   ├─▶ (2.1) rôles couleur   : primary·accent·neutrals TEINTÉS·sémantique·dark ─┐
   ├─▶ (2.2) typographie     : paire display+corps de la recette, échelle, poids │
   ├─▶ (2.3) spacing         : base-4 stricte + échelle xs…xl                 ├─▶ DESIGN.md
   ├─▶ (2.4) géométrie       : grille, personnalité de radius, bordures>ombres │
   ├─▶ (2.5) motion          : durées, easing, transitions clés              │
   └─▶ (2.6) composants      : shadcn/ui + Tailwind + icônes Lucide + états  ─┘
```
Cet ordre n'est pas cosmétique : **les couleurs contraignent les rôles → le contraste** ; le contraste conditionne l'**a11y des tokens** (voir `tokens-a11y.md`) ; l'a11y valide typo et composants. Dériver dans le désordre force des allers-retours.

### Leviers doctrine imposés (design-doctrine.md §Leviers — non négociables)
- **Neutres TEINTÉS, jamais gris purs** : famille chaude (stone/sand) ou froide (slate) selon le registre de la recette, hue partagée avec la marque (chroma 0.005-0.02), appliquée à toutes les surfaces.
- **Typo = paire déclarée** : display à caractère (H1-H3) + sans neutre (corps), exposées en `--font-display` / `--font-sans` / `--font-mono` ; chiffres en `tabular-nums`/mono ; jamais Inter/system seule.
- **Bordures > ombres** : bordures 1px par défaut, UNE seule ombre tokenisée (`--shadow-elevated`) pour les éléments flottants.
- **Échelles explicites** : personnalité de radius déclarée (sharp 0-2px / moderne 6-10px / friendly 14px+), déclinée depuis `--radius` ; spacing base-4 stricte ; padding vertical de sections VARIÉ.
- **Couleur de marque DÉRIVÉE du territoire du métier** (jamais la teinte d'exemple d'une recette recopiée) ; **layout signature** déclaré (parti-pris spatial du moodboard, pas centré-minimal générique).
- **Dark mode cohérent** : les neutres gardent leur teinte en `.dark`, AA re-vérifié.
- **Direction motion** (design-doctrine.md §Direction motion) : parti-pris déclaré (motion signature + où/pourquoi + runtime Motion/dotLottie/Rive/GSAP), câblé via `<MotionAsset>` (lazy, theming-aware), **`prefers-reduced-motion` respecté** (3 niveaux de fallback).
- **Marqueurs de slop INTERDITS** (design-doctrine.md §Marqueurs, liste binaire **1-23**, dont **convergence 21-23**) : primary indigo/violet, gradient bleu→violet, gris purs, blobs/glows, Inter seule, hero centré générique, 3 cartes identiques, glassmorphism, ombres floues partout, emojis en icônes, thème shadcn zinc par défaut, **direction réutilisée d'un autre projet / recette non modifiée, DESIGN.md sans artefact « direction » ni rationale par page, animation sans reduced-motion**… Un livrable qui en coche un a **échoué**, quelle que soit la qualité du reste.

### Sous-procédure
1. **Lancer `frontend-design` UNE fois**, en lui passant : la recette retenue (registre, paire de polices, couleur de marque, motifs de layout), le type/cible (idea-brief), le feel de marque (positioning), la contrainte de stack (**shadcn/ui + Tailwind + Lucide**), **et les interdits négatifs explicites** (marqueurs de slop) — les contraintes négatives fonctionnent mieux que « sois créatif ».
2. **Intégrer le contraste a11y dès les tokens** : chaque paire texte/fond doit viser WCAG AA. Procédure de vérification et ratios : `tokens-a11y.md`.
3. **Respecter l'import** : tout token fourni au mouvement 1.b **écrase** la dérivation correspondante (on ne re-dérive pas une police déjà imposée par la charte).
4. **Écrire dans `DESIGN.md`** (template `assets/templates/design-system.md`), section par section : **Direction visuelle (recherchée)** = artefact « direction » (territoire nommé + audit concurrentiel visuel + white space visé + 2-3 références réelles URL + **test anti-convergence** binaire), Typography (voix de marque), Color (dérivée du métier), Spacing, Layout/Geometry (+ layout signature), **Direction motion** (parti-pris + runtime + reduced-motion), **Rationale par page** (une ligne « intention » par type de page — remplie au mouvement 3 une fois les écrans connus), Components. Remplir **toutes** les sections `<...>` et déclarer **1-2 éléments signature** distinctifs.
- **Critère de passage :** `DESIGN.md` n'a plus aucun `<...>` (hors Rationale par page, complété au mouvement 3) ; chaque token est **buildable** (mappe Tailwind/shadcn, cf. `tokens-a11y.md`) ; contraste AA vérifié ; **zéro marqueur de slop coché (1-23)** ; **porte distinctiveness passée** (test anti-convergence + check comparatif vs autres projets de l'usine) ; artefact « direction » + Direction motion présents ; 1-2 éléments signature déclarés ; zéro question rouverte.
- **Mode dégradé :** `frontend-design` indisponible → appliquer manuellement les leviers doctrine ci-dessus (la doctrine suffit : recette + leviers + interdits), ne **pas** inventer un système bespoke incohérent.

**Pourquoi une seule passe :** fixer la recette d'abord évite les allers-retours ; une passe unique après ce choix garde l'étape déterministe et sans friction.

---

## Mouvement 3 — Générer les écrans clés du PRD (frontend-design en CODE)

But : produire les **maquettes des écrans clés** en **code de production** (React/HTML), fidèles au `DESIGN.md`, directement réutilisables en Phase 3.

### Sous-procédure
1. **Dériver la liste des écrans** depuis `product/product-spec.md` via la **matrice M4** (`matrices-decision.md`) : features **Must** + landing + auth + dashboard. **Workflow cœur d'abord.**
2. **Ordonner** (ordre de la matrice M4) : écran(s) du workflow cœur → dashboard/coquille → autres écrans Must → landing → auth. On maquette d'abord ce qui **porte la valeur**, pas la page marketing.
3. **Générer en code** via `frontend-design` (React/HTML production) — **pas** un outil de maquette navigateur : autonome, fiable, respecte exactement le `DESIGN.md`. **Partir de la variante shotgun retenue** (mouvement 1.c) : son hero et sa section clé sont la graine, on les étend, on ne repart pas de zéro.
4. **Fidélité stricte** : chaque écran importe les **mêmes tokens** et les **mêmes composants** que `DESIGN.md`. Un écran qui invente une couleur ou un radius hors système est un **défaut** (voir `checklists-modes-echec.md`).
5. **Mobiliser l'arsenal créatif** (`_shared/design-doctrine.md` §Arsenal) — création + duplication :
   - **DUPLIQUER** les structures éprouvées : blocs vendorables (MIT/Apache/ISC + PROVENANCE) et squelettes de sections — puis **RE-THÉMER systématiquement** (tokens + polices + radius + contenu remplacés) au point que le bloc ne ressemble plus à son origine. Un bloc aux couleurs/polices d'origine = défaut.
   - **Animations selon la Direction motion de `DESIGN.md`** : Motion (état/presence, micro-interactions) ; **dotLottie** pour le décoratif one-shot (hero illustré, loading, empty state, success) ; **Rive** pour l'interactif piloté par l'état (icônes réactives, toggles, mascotte) ; **GSAP** seulement pour une scène scroll orchestrée. Toujours via **`<MotionAsset>`** (lazy, theming-aware), sous les **règles d'animation anti-slop** de l'arsenal (une animation = un changement d'état communiqué, durées 150-400 ms, pas de fade-in généralisé, 1-2 effets signature max/page, **`prefers-reduced-motion` respecté** — 3 niveaux de fallback), assets **re-thémés aux tokens** (un Lottie/Rive générique non retouché = slop).
   - **OG image générée** pour la landing (`openGraph.images`) : soit **en code** (`next/og`, tokens du thème : display + couleur de marque), soit un **raster on-brand Nano Banana Pro** (mouvement 4) — les deux comptent comme « généré on-brand » ; jamais une OG statique bricolée ni du stock.
6. **La landing suit `_shared/landing-playbook.md`** — c'est le contrat, pas une inspiration :
   - **Structure canonique** : les 11 sections dans l'ordre imposé (navbar → hero → micro-preuve → problème → comment ça marche → features jobs → preuve [conditionnelle] → pricing → FAQ → CTA final → footer complet), avec les motifs de layout de la recette (hero 2 colonnes aligné gauche, bento asymétrique, section sombre de rupture…).
   - **Copy spécifique**, jamais générique : headline via les formules du playbook, instanciée avec le job du client (`positioning.md`) ; prix réels de `product/pricing.md` (jamais de tiers inventés) ; features orientées jobs. **Zéro lorem / placeholder / TODO**, zéro buzzword interdit.
   - **Testimonials = section conditionnelle** : rendue uniquement si l'intake fournit des témoignages réels ; sinon bloc « preuve honnête » du playbook (stat sourcée, garantie, badge de lancement, ligne fondateur). **Jamais de testimonials, logos ou stats inventés.**
   - **Preuve produit du hero = screenshot/mockup réel** de l'app (l'écran le plus parlant généré en 1-4) dans un cadre à bordure 1px — la démonstration « voici l'app » n'est **jamais** une image IA (interdit n°17). *(Le hero peut par ailleurs porter un **visuel éditorial/atmosphérique on-brand généré** (Nano Banana Pro, mouvement 4) comme art/fond — tant qu'il ne se fait pas passer pour la capture UI.)*
7. **Écrire dans `design/mockups/`** (un fichier par écran, nommé par l'écran).
8. **Renseigner le Rationale par page** dans `DESIGN.md` (section dédiée) : une ligne « intention » par type de page maquetté (landing, auth, dashboard, detail, empty states, portal…) — *pourquoi ce layout / cette hiérarchie / cette anim servent le job de CETTE page*, relié à la direction et au white space. Le **rendu de chaque écran doit tenir son rationale** (la QA design 13/14 le vérifie).
- **Critère de passage :** tous les écrans **Must** + landing + auth + dashboard présents ; chacun rend sans dépendance externe non déclarée ; zéro token hors `DESIGN.md` ; landing conforme au playbook (structure + copy) ; **zéro marqueur de slop (1-23)** sur les écrans ; **zéro bloc dupliqué non re-thémé** ; animations conformes aux règles de l'arsenal (aucun fade-in généralisé, reduced-motion) ; **Rationale par page rempli et tenu par le rendu**.
- **Mode dégradé :** PRD sans liste d'écrans exploitable → dériver le **minimum** (workflow cœur + dashboard + auth + landing), le dire, marquer `[Assumption]`, ne pas inventer de features non specifiées.

**Pourquoi du code plutôt qu'un outil de maquette :** autonome (pas de dépendance navigateur), respecte le `DESIGN.md` au pixel près, **réutilisable directement** en Phase 3 — le mockup EST le point de départ du build.

---

## Mouvement 4 — Génération de visuels (Nano Banana Pro)

But : **GÉNÉRER** les visuels **on-brand** dont le design a besoin — hero éditorial/atmosphérique, **OG image**, illustration d'**empty-state**, spot art, favicon/wordmark — **dérivés de `DESIGN.md`** (palette/typo/métier), **jamais du stock générique ni un placeholder**. C'est le **levier d'anti-convergence côté image** : deux métiers → deux prompts → deux visuels. On génère quand un **écran réel** le porte, pas « pour faire joli ». ⚠️ **Jamais d'image IA maquillée en screenshot produit** (hero « voici l'app », « comment ça marche ») : interdit doctrine n°17 — la **preuve produit reste un vrai screenshot** du mouvement 3 ; jamais de fausse preuve sociale (n°18).

### Sous-procédure
1. **Décider quoi générer** via la **matrice M5** (`matrices-decision.md`) : hero éditorial, OG, empty-states, spot art, favicon/wordmark — chaque visuel adossé à un **écran réel**.
2. **Générer avec Nano Banana Pro** (`gemini-3-pro-image`, image Google/Gemini) via le helper **`_shared/blocks/web-saas/scripts/generate-visual.mjs`** (dans le châssis : `scripts/generate-visual.mjs`). Commande : `node scripts/generate-visual.mjs "<prompt>" public/generated/<nom>.png [model] [aspect]`. **Prompt dérivé de `DESIGN.md`** : sujet + style (éditorial/premium…) + **palette de la marque** + cadrage/aspect + « NO lorem text / NO fake UI » au besoin (cohérence > flash).
3. **Clé `GEMINI_API_KEY`** : déposée au **setup** (infra-setup, guide de clés) — lue en **variable d'environnement** depuis `~/.saas-factory/.env`, **jamais en dur**, jamais commitée, jamais écrite dans le fichier d'état (safety-rails §4).
4. **Écrire dans `public/generated/`** (produit livré, référencé via `next/image`) ; l'**OG image** est branchée dans les `metadata` (`openGraph.images`). *(En Phase 2 pure, les explorations peuvent aller dans `design/brand-assets/` ; le câblage produit se fait au build — étape 12, `skills/12-build/references/walking-skeleton.md`.)*
- **Critère de passage :** chaque visuel généré est **référencé par un écran**, **dérivé de `DESIGN.md`** (pas de stock/placeholder) ; cohérent avec la palette ; aucun secret dans le repo.
- **Mode dégradé :** clé `GEMINI_API_KEY` absente ou `visuals="none"` → **s'arrêter proprement** sur ce mouvement, produire un guide « ajoute ta clé pour générer les visuels », livrer le reste (safety-rails §6, repli honnête). Ne **jamais** simuler des images.

---

## Definition-of-Done du mouvement (vue d'ensemble)
Le détail par artefact est dans `checklists-modes-echec.md`. En une ligne : **`DESIGN.md` complet + buildable + AA + artefact « direction » recherché (white space + réfs) + Direction motion + Rationale par page + éléments signature**, **zéro marqueur de slop/convergence (checklist doctrine 1-23) + porte distinctiveness passée**, **mockups fidèles au système + landing conforme au playbook + rendu qui tient son rationale**, **une seule décision utilisateur consommée**, **aucun secret**, état mis à jour.
