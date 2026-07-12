# Référence — Procédure détaillée (mouvements 1-4)

Sous-procédure exhaustive de l'étape 8. Le SKILL.md est le chef d'orchestre ; ici vit le **quoi faire / dans quel ordre / avec quel critère de passage** pour chacun des 4 mouvements. Principe directeur non négociable : **une seule décision utilisateur (la direction visuelle)**, tout le reste **dérivé** automatiquement (lessons.md : interaction minimale). Référence normative transverse : **`_shared/design-doctrine.md`** (recettes, leviers, marqueurs de slop interdits) — lue AVANT toute proposition ; pour la landing : **`_shared/landing-playbook.md`**.

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
   │ dépôt fichier/   │                              │ 3 RECETTES complètes  │
   │ dossier          │                              │ (doctrine §Recettes)  │
   │ extraire tokens  │                              │ rendues → 1 choix     │
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
                        │ 4. Visuels si nécessaire    │  ← Nano Banana (optionnel)
                        │ hero·illustr·favicon         │     → design/brand-assets/
                        └────────────────────────────┘
```

**Règle de convergence :** quel que soit le couloir, à la sortie du mouvement 1 tu as **au minimum une direction fixée** (recette ou tokens importés). Le reste du pipeline est identique. Un import qui apporte déjà typo/spacing/radius **écrase** la dérivation correspondante au mouvement 2 (l'import prime, on ne re-dérive pas ce qui est fourni).

## Data-flow — qui alimente quoi

```
_shared/design-doctrine.md ─(recettes, leviers, interdits)──────┐
research/idea-brief.md ─(type, cible)──────────┐                │
research/positioning.md ─(feel marque, catégorie)┼──▶ 3 recettes → direction ─▶ DESIGN.md
product/product-spec.md ─(feel, non-goals)──────┘                              │
                                                                               ▼
product/product-spec.md ─(features Must, workflow cœur, auth, dashboard)─▶ liste écrans ─▶ design/mockups/
_shared/landing-playbook.md + positioning + product/pricing.md ─▶ structure + copy landing ──┘
DESIGN.md ─(tokens, composants)──────────────────────────────────────────────┘ (respect strict)
DESIGN.md ─(couleurs, esthétique)─▶ prompts image ─▶ design/brand-assets/ (si utile)
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

### 1.c — Couloir GÉNÉRATION (réponse « non »)
1. **Sélectionner 3 recettes candidates** dans `_shared/design-doctrine.md` §Recettes selon le **type / cible / positionnement** (M2 puis M3 de `matrices-decision.md`). **Jamais deux recettes du même registre** — trois directions vraiment différentes, pas trois nuances du même thème.
2. **Adapter chaque recette à la niche** : couleur de marque tirée du feel de `positioning.md` (en respectant les interdits doctrine — jamais indigo/violet), neutres teintés assortis. La paire de polices et les motifs de layout viennent de la recette, on ne les improvise pas.
3. **Rendre visuellement** chaque recette : titre en **display réelle de la recette** + échantillons de couleurs + **mini-aperçu rendu** (bouton, carte, extrait de hero dans le registre). **Jamais des palettes nues ni des hex bruts** : l'utilisateur compare des **directions complètes** (polices + palette + layout), il choisit **en regardant**.
4. L'utilisateur en retient **une**. C'est la **seule** décision design de toute l'étape.
- **Critère de passage :** une recette unique retenue (registre + paire de polices + couleur de marque), tracée dans le Decisions log (`source: générée`, + rationale « choisie visuellement parmi 3 recettes doctrine »).
- **Mode dégradé :** l'utilisateur ne tranche pas / « fais au mieux » → choisir la recette **la plus alignée au positionnement** (feel de marque de `positioning.md`, recette prioritaire de M2), l'annoncer, marquer `[Assumption]`, avancer. Ne pas relancer 3 fois.

**Pourquoi limiter à ça :** la direction est le **seul** choix vraiment subjectif ; une recette embarque déjà polices + palette + motifs de layout **cohérents entre eux** (design-doctrine.md), et spacing, géométrie, motion et composants se dérivent proprement une fois la recette fixée (elle contraint contraste et hiérarchie).

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
- **Dark mode cohérent** : les neutres gardent leur teinte en `.dark`, AA re-vérifié.
- **Marqueurs de slop INTERDITS** (design-doctrine.md §Marqueurs, liste binaire 1-20) : primary indigo/violet, gradient bleu→violet, gris purs, blobs/glows, Inter seule, hero centré générique, 3 cartes identiques, glassmorphism, ombres floues partout, emojis en icônes, thème shadcn zinc par défaut… Un livrable qui en coche un a **échoué**, quelle que soit la qualité du reste.

### Sous-procédure
1. **Lancer `frontend-design` UNE fois**, en lui passant : la recette retenue (registre, paire de polices, couleur de marque, motifs de layout), le type/cible (idea-brief), le feel de marque (positioning), la contrainte de stack (**shadcn/ui + Tailwind + Lucide**), **et les interdits négatifs explicites** (marqueurs de slop) — les contraintes négatives fonctionnent mieux que « sois créatif ».
2. **Intégrer le contraste a11y dès les tokens** : chaque paire texte/fond doit viser WCAG AA. Procédure de vérification et ratios : `tokens-a11y.md`.
3. **Respecter l'import** : tout token fourni au mouvement 1.b **écrase** la dérivation correspondante (on ne re-dérive pas une police déjà imposée par la charte).
4. **Écrire dans `DESIGN.md`** (template `assets/templates/design-system.md`), section par section : Aesthetic direction (registre nommé + recette + 3 références réelles), Typography, Color, Spacing, Layout/Geometry, Motion, Components. Remplir **toutes** les sections `<...>` et déclarer **1-2 éléments signature** distinctifs (ex. serif éditoriale en display, neutres chauds, radius signature, section sombre de rupture).
- **Critère de passage :** `DESIGN.md` n'a plus aucun `<...>` ; chaque token est **buildable** (mappe Tailwind/shadcn, cf. `tokens-a11y.md`) ; contraste AA vérifié ; **zéro marqueur de slop coché** ; 1-2 éléments signature déclarés ; zéro question rouverte.
- **Mode dégradé :** `frontend-design` indisponible → appliquer manuellement les leviers doctrine ci-dessus (la doctrine suffit : recette + leviers + interdits), ne **pas** inventer un système bespoke incohérent.

**Pourquoi une seule passe :** fixer la recette d'abord évite les allers-retours ; une passe unique après ce choix garde l'étape déterministe et sans friction.

---

## Mouvement 3 — Générer les écrans clés du PRD (frontend-design en CODE)

But : produire les **maquettes des écrans clés** en **code de production** (React/HTML), fidèles au `DESIGN.md`, directement réutilisables en Phase 3.

### Sous-procédure
1. **Dériver la liste des écrans** depuis `product/product-spec.md` via la **matrice M4** (`matrices-decision.md`) : features **Must** + landing + auth + dashboard. **Workflow cœur d'abord.**
2. **Ordonner** (ordre de la matrice M4) : écran(s) du workflow cœur → dashboard/coquille → autres écrans Must → landing → auth. On maquette d'abord ce qui **porte la valeur**, pas la page marketing.
3. **Générer en code** via `frontend-design` (React/HTML production) — **pas** un outil de maquette navigateur : autonome, fiable, respecte exactement le `DESIGN.md`.
4. **Fidélité stricte** : chaque écran importe les **mêmes tokens** et les **mêmes composants** que `DESIGN.md`. Un écran qui invente une couleur ou un radius hors système est un **défaut** (voir `checklists-modes-echec.md`).
5. **La landing suit `_shared/landing-playbook.md`** — c'est le contrat, pas une inspiration :
   - **Structure canonique** : les 11 sections dans l'ordre imposé (navbar → hero → micro-preuve → problème → comment ça marche → features jobs → preuve [conditionnelle] → pricing → FAQ → CTA final → footer complet), avec les motifs de layout de la recette (hero 2 colonnes aligné gauche, bento asymétrique, section sombre de rupture…).
   - **Copy spécifique**, jamais générique : headline via les formules du playbook, instanciée avec le job du client (`positioning.md`) ; prix réels de `product/pricing.md` (jamais de tiers inventés) ; features orientées jobs. **Zéro lorem / placeholder / TODO**, zéro buzzword interdit.
   - **Testimonials = section conditionnelle** : rendue uniquement si l'intake fournit des témoignages réels ; sinon bloc « preuve honnête » du playbook (stat sourcée, garantie, badge de lancement, ligne fondateur). **Jamais de testimonials, logos ou stats inventés.**
   - **Visuel hero = screenshot/mockup réel** de l'app (l'écran le plus parlant généré en 1-4) dans un cadre à bordure 1px — jamais d'illustration abstraite ou d'image IA.
6. **Écrire dans `design/mockups/`** (un fichier par écran, nommé par l'écran).
- **Critère de passage :** tous les écrans **Must** + landing + auth + dashboard présents ; chacun rend sans dépendance externe non déclarée ; zéro token hors `DESIGN.md` ; landing conforme au playbook (structure + copy) ; **zéro marqueur de slop** sur les écrans.
- **Mode dégradé :** PRD sans liste d'écrans exploitable → dériver le **minimum** (workflow cœur + dashboard + auth + landing), le dire, marquer `[Assumption]`, ne pas inventer de features non specifiées.

**Pourquoi du code plutôt qu'un outil de maquette :** autonome (pas de dépendance navigateur), respecte le `DESIGN.md` au pixel près, **réutilisable directement** en Phase 3 — le mockup EST le point de départ du build.

---

## Mouvement 4 — Visuels si nécessaire (Nano Banana, optionnel)

But : générer les visuels **utiles** (favicon, logo, illustration d'état vide) — **seulement** s'ils apportent quelque chose, jamais par défaut. ⚠️ **Jamais d'image IA à la place d'un screenshot produit** (hero, « comment ça marche ») : interdit doctrine n°17 — le visuel produit vient du mouvement 3.

### Sous-procédure
1. **Décider s'il en faut** via la **matrice M5** (`matrices-decision.md`). Par défaut : **rien**. On ne génère un visuel que s'il sert un écran réel (favicon, illustration d'état vide).
2. **Générer avec Nano Banana** (Gemini 2.5 Flash Image) via l'API Gemini. Prompts alignés sur l'esthétique et les couleurs du `DESIGN.md` (cohérence > flash).
3. **Clé Gemini** : demandée à l'utilisateur au **setup** (guide de clés) — lue en **variable d'environnement**, **jamais en dur**, jamais commitée, jamais écrite dans le fichier d'état (safety-rails §4).
4. **Écrire dans `design/brand-assets/`**.
- **Critère de passage :** chaque visuel généré est référencé par un écran ; cohérent avec la palette ; aucun secret dans le repo.
- **Mode dégradé :** clé Gemini absente → **s'arrêter proprement** sur ce mouvement, produire un guide « ajoute ta clé pour générer les visuels », livrer le reste (safety-rails §6, repli honnête). Ne **jamais** simuler des images.

---

## Definition-of-Done du mouvement (vue d'ensemble)
Le détail par artefact est dans `checklists-modes-echec.md`. En une ligne : **`DESIGN.md` complet + buildable + AA + éléments signature**, **zéro marqueur de slop (checklist doctrine)**, **mockups fidèles au système + landing conforme au playbook**, **une seule décision utilisateur consommée**, **aucun secret**, état mis à jour.
