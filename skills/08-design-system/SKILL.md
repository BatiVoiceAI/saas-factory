---
name: 08-design-system
description: >-
  Étape 8 (Phase 2 · cadrage produit) de SaaS Factory — Design system & maquettes (rôle Designer). Produit DESIGN.md (source de vérité visuelle : tokens, typo, couleurs, motion, composants) + les maquettes des écrans clés, avec un minimum d'interaction (une seule décision utilisateur : la direction visuelle, choisie parmi 3 recettes complètes de la doctrine design), tout le reste dérivé automatiquement via frontend-design sous contrainte anti-slop. Se déclenche pour « design system », « maquettes », « la charte / le look », après le PRD validé.
allowed-tools: Read, Write, Edit, AskUserQuestion, Bash
---

# SaaS Factory — Étape 8 : Design system & maquettes (rôle Designer)

Objectif : produire le **`DESIGN.md` (source de vérité visuelle)** + les **maquettes des écrans clés**, avec un **minimum d'interaction** : une seule décision est demandée à l'utilisateur (la **direction visuelle**), tout le reste est dérivé automatiquement.

## À lire d'abord (une fois)
`_shared/lessons.md`, `_shared/safety-rails.md`, **`_shared/design-doctrine.md` (OBLIGATOIRE avant toute proposition — recettes, leviers, marqueurs de slop interdits)** ; si présent, `skills/phase-2-product/references/conventions.md`. Au mouvement 3 : `_shared/landing-playbook.md` (structure + copy de la landing).

## Principe
**Pas de design bespoke, pas d'AI slop.** Une base **opinionated et buildable** (shadcn/ui + Tailwind), une esthétique tirée des **recettes de `_shared/design-doctrine.md`** (direction choisie en une décision), des tokens qui **mappent directement la stack de la Phase 3** — sinon design et code divergent. Les **marqueurs de slop** listés dans la doctrine sont des interdits binaires, pas des recommandations.

**HARD GATE.** Ici : le système visuel + les maquettes. Pas de code produit (Phase 4), pas de choix d'architecture (Phase 3). Livrables : `DESIGN.md` + `design/mockups/`.

## Entrées / sortie (contrat)
- **Lit :** `product/product-spec.md` (écrans/features Must, workflow cœur), `research/positioning.md` (feel de marque, catégorie), `research/idea-brief.md` (type, cible), `product/pricing.md` (tiers/prix pour le copy de la landing), `_shared/design-doctrine.md` (recettes + leviers + interdits), `_shared/landing-playbook.md` (structure canonique + règles de copy).
- **Écrit :** `DESIGN.md` (racine, source de vérité, template `assets/templates/design-system.md` — inclut la recette retenue et **1-2 éléments signature**) + `design/mockups/` (écrans clés générés) + `design/brand-assets/` (visuels générés si besoin) + `.saas-factory/state.md` (état : étape 8 faite, direction retenue = recette + couleur de marque, source charte = import/générée).

## Références (profondeur, chargées au besoin)
Le SKILL.md est le chef d'orchestre ; la procédure exhaustive vit dans `references/` (progressive disclosure) :
- `references/procedure-detaillee.md` — sous-procédure des 4 mouvements (machine à états import/génération, data-flow, ordre de dérivation, critères de passage, modes dégradés). Ouvre-le pour exécuter chaque mouvement.
- `references/forcing-questions.md` — recettes (Ask exact / Push-until / Red-flags / MOU-vs-FORT / routage) pour l'unique question utilisateur (la direction) + les auto-interrogations qualité (dont anti-slop et landing) + les seuls cas de routage R1.
- `references/matrices-decision.md` — matrices condition→action : format d'import, recettes candidates par type de produit, composition des 3 recettes proposées, liste d'écrans, visuels Nano Banana, dark mode.
- `references/tokens-a11y.md` — contrat « buildable, pas décoratif » : mapping token→Tailwind/shadcn + procédure de contraste WCAG AA (light **et** dark).
- `references/checklists-modes-echec.md` — DoD par artefact, catalogue de cas limites, modes d'échec + corrections, porte de sortie.

## Procédure normée (interaction minimale)
### 1. Une seule question : la DIRECTION (`AskUserQuestion`)
« As-tu déjà une charte graphique / un design system ? »
- **Oui → il dépose un dossier ou un fichier.** Lis-le et **extrais les tokens** dans `DESIGN.md` : couleurs, police(s), logo, spacing/radius s'ils y sont. Gère les formats courants (tokens JSON/CSS, config Tailwind, feuille de style, PDF de charte, ou simplement logo + liste de couleurs). Ne demande rien de plus.
- **Non → propose 3 DIRECTIONS complètes.** Pas 3 palettes nues : **3 recettes complètes** tirées de `_shared/design-doctrine.md` §Recettes (registre + **paire de polices** + **palette** + **motifs de layout**), choisies pour coller au **type/cible/positionnement** (M2), **jamais deux du même registre**, couleur de marque adaptée à la niche. Chacune est **rendue visuellement** (titre en display réelle + bouton + carte + mini-aperçu de hero) — **pas des hex bruts**, pour qu'il choisisse **en regardant**. Il en retient **une**. C'est la **seule** décision design de toute l'étape, comme avant.

Pourquoi limiter à ça : la direction est le seul choix vraiment subjectif, et une recette embarque déjà polices + palette + layout **cohérents entre eux** ; tout le reste se dérive proprement. Détail des deux couloirs (import vs génération) : `references/procedure-detaillee.md` (mouvement 1) ; routage de format d'import : `references/matrices-decision.md` (M1) ; composition des 3 recettes : `matrices-decision.md` (M2 + M3) ; recette de la question : `references/forcing-questions.md` (Q1).

### 2. Dériver tout le reste — automatiquement, via `frontend-design` (zéro question)
Une fois la recette fixée, lance **`frontend-design` une seule fois** pour dériver le système complet en **imposant les leviers de `design-doctrine.md`** : **neutres teintés** (jamais gris purs — hue partagée avec la marque), **paire typographique** = display à caractère (H1-H3) + sans neutre pour le corps, exposée en `--font-display`/`--font-sans`/`--font-mono`, **bordures 1px > ombres** (une seule ombre tokenisée pour les éléments flottants), **échelles explicites** de radius (personnalité déclarée, déclinée depuis `--radius`) et de spacing (base-4 stricte), **dark mode cohérent** (les neutres gardent leur teinte), **motion** sobre, et le **système de composants** (**shadcn/ui + Tailwind + icônes Lucide**). Les **marqueurs d'AI slop** (`design-doctrine.md` §Marqueurs — indigo/violet, gradient bleu→violet, Inter seule, gris purs, glassmorphism, ombres floues partout…) sont **INTERDITS** : un livrable qui en coche un est refusé. Intègre le **contraste a11y** dès les tokens (ratios texte/fond conformes). Écris le tout dans `DESIGN.md`. Pourquoi une seule passe après le choix de direction : la recette contraint le reste (contraste, hiérarchie) ; la fixer d'abord évite les allers-retours. Ordre de dérivation + mode dégradé : `references/procedure-detaillee.md` (mouvement 2) ; le contrat « buildable » (mapping token→Tailwind/shadcn) et la procédure de contraste AA (light **et** dark) : `references/tokens-a11y.md` ; dark mode oui/non : `matrices-decision.md` (M6).

### 3. Générer les écrans clés du PRD
On part du principe que l'utilisateur **n'a pas de maquette** → on les **génère**. Dérive la liste des écrans depuis le PRD (features **Must** + **landing** + auth + dashboard, **workflow cœur d'abord**) et génère-les avec **`frontend-design` en code (React/HTML production)** — fiable, **autonome**, sans dépendre d'un outil navigateur. ⚠️ **La landing suit `_shared/landing-playbook.md`** : structure canonique (11 sections, ordre imposé, testimonials **conditionnels** — rendus uniquement si l'intake fournit des témoignages réels) + **copy spécifique** dérivé de `research/positioning.md` + `product/pricing.md` + PRD (formules de headline, features orientées jobs, prix réels affichés) — **jamais un hero nu, zéro lorem/placeholder, zéro testimonial inventé**. Le visuel hero = **screenshot/mockup réel** de l'app (l'écran le plus parlant du mouvement 3), pas une illustration abstraite. Écris dans `design/mockups/`. Pourquoi du code plutôt qu'un outil de maquette : autonome, respecte exactement le `DESIGN.md`, **réutilisable directement** en Phase 3. Dérivation ordonnée de la liste d'écrans : `references/matrices-decision.md` (M4) ; sous-procédure + fidélité stricte au système : `references/procedure-detaillee.md` (mouvement 3).

### 4. Visuels si nécessaire — Nano Banana
Si des visuels sont utiles (favicon, logo, illustration d'état vide), génère-les avec **Nano Banana (Gemini 2.5 Flash Image)** via l'API Gemini. ⚠️ **Jamais d'image IA à la place d'un screenshot produit** (hero de landing, « comment ça marche ») : la doctrine l'interdit (marqueur n°17) — le visuel produit vient du mouvement 3. La **clé Gemini** est demandée à l'utilisateur au setup (guide de clés) — **jamais en dur**. Écris dans `design/brand-assets/`. Décider s'il faut un visuel (par défaut : non) : `references/matrices-decision.md` (M5) ; discipline de génération + repli honnête si la clé manque : `references/procedure-detaillee.md` (mouvement 4).

## Garde-fous
- **Buildable ET appliqué, pas décoratif.** Le `DESIGN.md` déclare le **mapping exact** vers `app/globals.css` (bloc `:root` + `.dark`, valeurs HSL/OKLCH prêtes). ⚠️ **La Phase 4 DOIT l'appliquer** — écrire ces tokens dans `app/globals.css` en **écrasant** les défauts du châssis. Un `DESIGN.md` qui reste un document mort (le produit sort au look **générique noir/blanc du châssis**) = **échec**, pas un design. La charte n'est « faite » qu'une fois **dans le code**.
- **Zéro marqueur d'AI slop.** La checklist de `_shared/design-doctrine.md` fait loi : un design (tokens, mockup ou landing) qui coche **un** marqueur (primary indigo/violet, gradient bleu→violet, Inter seule, gris purs, hero centré générique, 3 cartes identiques, testimonials inventés…) est **REFUSÉ avant la porte** — retour au mouvement concerné, pas de rustine ponctuelle.
- **1-2 éléments signature.** `DESIGN.md` déclare 1-2 éléments distinctifs assumés (ex. serif éditoriale en display, neutres chauds, radius signature, section sombre de rupture) — ce qui rend le produit reconnaissable, pas médian.
- **Une seule décision utilisateur** (la direction). Tout le reste est dérivé.
- **A11y dès les tokens** (contraste, tailles de cible).
- **Cohérence > originalité.** Les écrans générés respectent le `DESIGN.md` (mêmes tokens, mêmes composants).
- **Ni Stitch ni Figma.** Import = simple dépôt de fichier/dossier ; génération = `frontend-design` (code) + Nano Banana (images). Plus autonome, plus simple.

Catalogue des modes d'échec (AI slop, design non buildable, divergence tokens↔mockups, contraste raté, trop de questions, secret committé…) et leur correction : `references/checklists-modes-echec.md`.

## Porte de sortie (validation charte)
Avant de clore, présente à l'utilisateur la **direction visuelle** retenue — la **recette** choisie (registre, paire de polices, palette), les **éléments signature**, 1-2 maquettes clés, **et la checklist anti-slop passée** (les 15 points de `design-doctrine.md`, résultat : 0 marqueur coché) — puis demande **validation** (`AskUserQuestion`). Un design qui coche un marqueur **ne se présente pas à la porte** : il repart au mouvement concerné d'abord. S'il veut **ajuster la direction ou la dérivation**, reboucle sur le mouvement concerné (1 pour la recette, 2 pour la dérivation) puis **re-dérive** le reste — ne bricole pas un token isolé. C'est le seul point où la charte se valide côté utilisateur : une fois passée, elle est figée pour la Phase 3. DoD par artefact + checklist complète de la porte : `references/checklists-modes-echec.md`.

## Clôture d'étape
Une fois la porte franchie, passe les DoD par artefact (`DESIGN.md`, mockups, brand-assets) : `references/checklists-modes-echec.md`. Puis mets à jour `.saas-factory/state.md` (étape 8 faite, direction retenue = recette + couleur de marque, source charte = import/générée). Résume en 2 lignes. **Fin de Phase 2 : PRD + design system prêts** → Phase 3 (cadrage technique, `09-architecture`).
