# Référence — Checklists Definition-of-Done, cas limites & modes d'échec (étape 8)

Les critères d'acceptation par artefact, le catalogue de cas limites, et les modes d'échec de l'étape avec leur correction. À passer **avant** la clôture d'étape.

---

## Definition-of-Done — `DESIGN.md` (source de vérité)
- [ ] Toutes les sections du template remplies (aucun `<...>` restant).
- [ ] **Product context** hérité de `idea-brief` (ce que c'est, pour qui, type).
- [ ] **Direction visuelle (recherchée)** : **territoire nommé** + **audit concurrentiel visuel** (5-8 réfs) + **white space visé** + **2-3 références réelles (URL)** + **test anti-convergence** binaire répondu (`design-doctrine.md` §Processus de recherche de direction) — ou identité importée. **Jamais une graine (recette) recopiée brute.**
- [ ] **1-2 éléments signature** distinctifs déclarés (ex. serif éditoriale en display dérivée de la marque, neutres chauds, layout asymétrique signature, section sombre de rupture).
- [ ] **Typography** : **paire** display à caractère (voix de marque) + corps neutre (Google Fonts, dérivée de la marque ou de l'import), exposée en `--font-display`/`--font-sans`/`--font-mono`, + échelle + poids + usage.
- [ ] **Color** : rôles sémantiques (primary/accent/neutrals/sémantique) + **1 seule couleur de marque DÉRIVÉE du territoire** + **neutres teintés** (jamais gris purs) + **dark mode** + ratios **AA consignés** (`tokens-a11y.md`).
- [ ] **Spacing** : base (4px) + échelle Tailwind.
- [ ] **Layout/Geometry** : grille + personnalité de radius déclinée depuis `--radius` + **bordures > ombres** (une ombre tokenisée max) + **layout signature** (parti-pris spatial).
- [ ] **Direction motion** : motion signature + où/pourquoi + runtime (Motion/dotLottie/Rive/GSAP, M7) + **`prefers-reduced-motion`** (3 niveaux de fallback) — câblé via `<MotionAsset>`.
- [ ] **Rationale par page** : une ligne « intention » par type de page maquetté (pourquoi ce layout / cette hiérarchie / cette anim) — la QA design 13/14 vérifie qu'il existe et que le rendu le tient.
- [ ] **Components** : composants shadcn/ui + variantes/états, mappant la Phase 3.
- [ ] Chaque token **buildable** (table de mapping `tokens-a11y.md`).
- [ ] **Checklist anti-slop de `design-doctrine.md` passée : 0 marqueur coché (1-23)** + **porte distinctiveness passée** (test anti-convergence + check comparatif vs autres projets de l'usine).
- [ ] **Decisions log** : direction tracée (`source: import` **ou** `générée`, territoire + couleur de marque + motion signature) + rationale (attribut de marque / white space).
- [ ] **Aucun secret / clé** dans le fichier.

## Definition-of-Done — `design/mockups/`
- [ ] Tous les écrans **Must** + landing + auth + dashboard présents (M4).
- [ ] **Workflow cœur généré en premier.**
- [ ] Généré **en code** (React/HTML production) via `frontend-design`, pas un outil navigateur.
- [ ] **Zéro token hors `DESIGN.md`** (mêmes couleurs, spacing, radius, composants).
- [ ] Mêmes composants **shadcn/ui**, pas de composant réinventé.
- [ ] **Landing conforme à `_shared/landing-playbook.md`** : 11 sections canoniques dans l'ordre (testimonials conditionnels), copy spécifique tiré de `positioning.md` + `product/pricing.md`, hero = screenshot réel, **zéro lorem / placeholder / testimonial inventé / buzzword interdit**.
- [ ] **Checklist anti-slop passée sur chaque écran (desktop + mobile pour la landing) : 0 marqueur (1-23).**
- [ ] **Rationale par page tenu** : le layout / la hiérarchie / l'anim de chaque écran correspondent à la ligne « intention » de `DESIGN.md`.
- [ ] **Motion conforme à la Direction motion** : via `<MotionAsset>`, 1-2 effets signature max/page, assets Lottie/Rive re-thémés, **`prefers-reduced-motion` respecté** (aucun transform/parallax actif en mode réduit).
- [ ] Chaque écran rend sans dépendance externe non déclarée.
- [ ] 1 fichier par écran, nommé par l'écran.
- [ ] Directement **réutilisable en Phase 3** (le mockup est le point de départ du build).

## Definition-of-Done — `design/brand-assets/` (si généré)
- [ ] Chaque visuel **référencé par un écran** (M5) — aucune déco orpheline.
- [ ] Cohérent avec la palette / l'esthétique du `DESIGN.md`.
- [ ] Clé Gemini en **variable d'environnement**, jamais en dur / commitée / dans l'état.
- [ ] Si clé absente : **rien de simulé** ; guide de repli produit.

## Definition-of-Done — Clôture d'étape
- [ ] La **porte a présenté** : **territoire nommé + white space visé** + éléments signature + Direction motion + 1-2 maquettes + **checklist anti-slop passée (0/19 marqueur) + porte distinctiveness passée**.
- [ ] `.saas-factory/state.md` mis à jour (étape 8 faite, **direction retenue** = territoire nommé + couleur de marque + motion signature, **source charte** = import/générée).
- [ ] Résumé en 2 lignes.
- [ ] **Une seule** décision utilisateur consommée (la direction) — vérifier qu'aucune 2e question design n'a fuité.
- [ ] Annonce **Phase 3 (`09-architecture`)**.

---

## Catalogue de cas limites (condition → traitement)

| Cas limite | Traitement |
|---|---|
| **Charte partielle** (logo + 2 couleurs) | Extraire ce qui existe, **dériver** le reste (mouvement 2), ne pas ré-interroger |
| **Charte contradictoire** (2 palettes/2 logos) | R1 : montrer, demander de trancher (binaire), documenter |
| **Charte illisible** | Extraire couleurs si visibles, sinon basculer en génération (couloir 1.c) |
| **`tailwind.config` fourni** | Le reprendre **tel quel** (déjà buildable), dériver seulement motion/composants |
| **Utilisateur ne choisit pas la direction** | Choisir la **graine prioritaire de M2** alignée au positionnement/white space (taillée, jamais servie brute), annoncer, `[Assumption]`, ne pas relancer |
| **PRD sans écrans exploitables** | Dériver le minimum (cœur+dashboard+auth+landing), `[Assumption]` |
| **Produit sans landing** (interne/perso) | Sauter la landing ; garder cœur+dashboard+auth |
| **Dark-only imposé** | Ne produire que le thème dark (M6), pas de light superflu |
| **Contrainte AAA / a11y renforcée** | Confirmer (R1), viser les seuils AAA au lieu d'AA |
| **Clé Gemini absente** | Repli honnête : livrer DESIGN.md + mockups, guide pour les visuels |
| **`frontend-design` indisponible** | Appliquer manuellement les leviers + interdits de `design-doctrine.md` (recette, neutres teintés, paire typo, bordures>ombres) ; ne pas inventer un bespoke |
| **Feel type ↔ positionnement en conflit** | Positionnement gagne (M2) |

---

## Modes d'échec (et comment les gérer)

| Mode d'échec | Symptôme | Correction |
|---|---|---|
| **Marqueur d'AI slop coché** | un des 23 interdits de `design-doctrine.md` : primary indigo/violet, gradient bleu→violet, Inter seule, gris purs, hero centré générique, 3 cartes identiques, glassmorphism, ombres floues partout, emojis en icônes, zinc shadcn brut… | **REFUSÉ avant la porte** : retour au mouvement concerné (1 direction / 2 tokens / 3 écran) + re-dérivation — jamais de rustine ponctuelle |
| **Convergence par template** (marqueur 21) | direction réutilisable pour un autre métier ; même couple typo + hue + layout + motion qu'un autre projet de l'usine ou qu'une graine non modifiée | **retour recherche** (§Processus de recherche de direction) : audit concurrentiel visuel → white space → tailler la direction ; ne jamais servir une graine brute |
| **Pas d'artefact « direction »** (marqueur 22) | `DESIGN.md` sans territoire nommé / white space / réfs réelles, ou sans rationale par page | rédiger l'artefact « direction » et le rationale par page AVANT la porte |
| **Rationale par page absent ou non tenu** | section vide/générique, ou rendu qui contredit l'intention déclarée | rédiger la ligne « intention » par type de page ; réaligner l'écran si le rendu ne la tient pas |
| **Motion générique / reduced-motion absent** (marqueur 23) | fade-in généralisé, parallax gratuit, asset Lottie non re-thémé, aucune gestion `prefers-reduced-motion` | déclarer le parti-pris motion (M7), câbler `<MotionAsset>` + `useReducedMotion` (3 niveaux), re-thémer les assets |
| **Design non buildable** | tokens = intentions (« vibe premium ») intraduisibles | reformuler en valeurs mappant Tailwind/shadcn (`tokens-a11y.md`) |
| **Divergence tokens ↔ mockups** | un écran invente une couleur/un radius hors système | réaligner l'écran sur `DESIGN.md` (cohérence > originalité) |
| **Contraste raté** | gris clair sur blanc, accent en texte fin | calculer chaque paire, corriger < AA, re-vérifier en dark |
| **Trop de questions** | 2e/3e question design (« et la police ? ») | STOP : une seule décision (la direction), la recette embarque la police, tout le reste se dérive |
| **Palettes nues / graines brutes au lieu de directions recherchées** | 3 codes `#…` ou 3 palettes sans polices/layout, ou 3 recettes servies brutes non taillées au white space | rechercher le white space, **tailler** puis re-rendre en **directions complètes** (display + bouton + carte + hero au layout signature) avant le choix |
| **3 directions du même registre** | 3 variantes du même thème proposées | repasser par M2 : 3 registres distincts (doctrine) |
| **Recherche sautée** | aucun audit concurrentiel visuel, pas de white space nommé, pas de réfs réelles | exécuter §Processus de recherche de direction (brand audit → audit visuel → moodboard) AVANT de proposer |
| **Landing hors playbook** | hero nu, sections manquantes, copy générique, lorem/placeholder | régénérer depuis `_shared/landing-playbook.md` (structure canonique + formules de copy), pas de patch cosmétique |
| **Contenu inventé** | testimonials/logos/stats/avis fabriqués, pricing hors `pricing.md` | supprimer ; bloc « preuve honnête » du playbook ; prix réels uniquement |
| **Pas d'élément signature** | design correct mais interchangeable, rien de distinctif déclaré | déclarer 1-2 éléments signature dans `DESIGN.md` et les incarner dans les mockups |
| **Design bespoke** | système inventé de zéro hors shadcn/Tailwind | revenir à la base opinionated buildable (shadcn/ui) |
| **Secret Gemini committé** | clé en dur dans un fichier/mockup | retirer, passer en env (safety-rails §4), purger l'historique si commité |
| **Images simulées** | « visuels » fabriqués alors que la clé manque | supprimer, repli honnête + guide (safety-rails §6) |
| **Sur-génération d'écrans** | maquettes de features Should/Could | limiter aux Must + landing + auth + dashboard (M4) |
| **Landing avant le cœur** | page marketing maquettée d'abord | ordre : workflow cœur d'abord (M4) |
| **Débordement de phase** | choix d'archi (Phase 3) ou code produit (Phase 4) | HARD GATE : ici uniquement système visuel + maquettes |
| **Dark mode oublié** | AA vérifié en light seulement | dupliquer/vérifier toutes les paires en `.dark` (M6) |

---

## Diagramme — la porte de sortie de l'étape 8

```
DESIGN.md complet ──────┐
 (buildable+AA+signature)│
checklist anti-slop ────┤
 (0 marqueur, doctrine) ├──▶  [ Porte P2 : PRD + design system prêts ? ]
mockups fidèles ────────┤            │
 (0 token hors,          │        OUI │ NON ─▶ compléter le DoD manquant, ne pas ouvrir la Phase 3
  landing = playbook)    │            ▼
brand-assets ───────────┘   Phase 3 · 09-architecture (cadrage technique)
(si utile, 0 secret)
```
La validation utilisateur à la porte **présente la checklist anti-slop passée** (0/19 marqueur) **+ la porte distinctiveness** (territoire nommé, white space visé, test anti-convergence, rationale par page, reduced-motion) avec la direction recherchée et les maquettes — un design qui coche un marqueur (slop **ou convergence**) ne se présente pas à la porte.
**Fin de Phase 2 :** PRD (étape 7) + design system (étape 8) prêts → la Phase 3 part d'un `DESIGN.md` dont les tokens **mappent déjà** la stack qu'elle va choisir.
