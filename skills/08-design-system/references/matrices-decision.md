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

## M2 — Type/positionnement produit → recettes candidates (mouvement 1.c)

Route le **type / cible / feel** vers les **recettes de `_shared/design-doctrine.md` §Recettes** (R1 « Éditorial chaleureux », R2 « Technique précis », R3 « Studio contemporain », R4 « Moderne à caractère », R5 « Brutal créatif »). La 1re recette listée est la **prioritaire** (celle du mode dégradé « fais au mieux »). Le **feel de marque** de `positioning.md` prime en cas d'hésitation.

| Type / cible / feel (idea-brief + positioning) | Recettes candidates (ordre) | Pourquoi |
|---|---|---|
| **B2B niche locale / services** (salon, resto, artisan, cabinet, bien-être) | **R1** · R4 · R3 | voix de commerçant, chaleur ; jamais de registre dev-tool |
| **Outil pro / B2B / productivité / booking / gestion** | **R4** · R2 · R3 | SaaS contemporain confiant sans générique |
| **Dev tool / technique / data / infra** | **R2** · R4 · R5 | densité, précision, dark mode naturel |
| **Créatif / expressif / audience jeune** | **R5** · R3 · R4 | personnalité avant consensus |
| **Premium / confiance / coaching / fintech calme** | **R3** · R1 · R4 | élégance calme, crédibilité par l'esthétique |
| **Consumer / mobile-first / léger** | **R4 (variante Sora)** · R3 · R1 | ton direct, géométrique doux |
| **Interne / perso / low-stakes** | **R4 en version minimale** (mono-famille Manrope, paire 12 de la doctrine) | vitesse de build, mais **jamais** le zinc shadcn brut (interdit doctrine n°20) |

**Règles :** en cas de conflit type ↔ positionnement, **positionnement gagne** (c'est lui qui porte le feel de marque validé en Phase 1). En cas de doute total → **R4** avec la couleur de marque du positionnement (la plus sûre, sans risque de slop). **Jamais deux recettes du même registre** dans les 3 proposées.

---

## M3 — Composer les 3 recettes proposées (mouvement 1.c)

Objectif : **3 directions complètes vraiment différentes** (recette = registre + paire de polices + palette + motifs de layout), chacune viable et a11y — pas 3 palettes nues, pas 3 nuances d'une même teinte.

| Piste | Rôle | Comment la composer |
|---|---|---|
| **Prioritaire** | valeur sûre, alignée au métier | 1re recette candidate de M2, couleur de marque tirée du feel (`positioning.md`) |
| **Affirmée** | plus de personnalité, mémorable | 2e candidate de M2 (registre différent), accent plus franc — jamais indigo/violet |
| **Alternative** | contre-proposition de registre | 3e candidate de M2, pour vérifier que le choix du registre est bien réel |

Contraintes communes aux 3 :
- Chaque recette vient de `design-doctrine.md` §Recettes, **adaptée à la niche** (couleur de marque, ton) — on n'invente pas une 6e recette.
- **Jamais deux recettes du même registre** (doctrine) ; les palettes sont **distinctes en teinte ET en tonalité**.
- Chaque recette doit **passer AA** en usage texte/fond (sinon elle n'est pas proposable — `tokens-a11y.md`) et **zéro marqueur de slop** (jamais de primary indigo/violet, neutres toujours teintés).
- Chaque recette est **rendue visuellement** : titre dans la **display de la recette** + échantillons + bouton + carte + extrait de hero — jamais des hex bruts ni une palette sans polices.
- **Ancrage :** la teinte de marque découle du feel (`positioning.md`), pas d'un goût arbitraire ; polices et motifs de layout viennent de la recette.

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

## M5 — Générer un visuel Nano Banana ? (mouvement 4)

Par défaut : **NON**. On ne génère que si la case « oui » est cochée par un besoin réel.

| Besoin | Générer ? | Contrainte |
|---|---|---|
| **Visuel hero de landing** | **Non — jamais en IA** | le hero = **screenshot/mockup réel** de l'app (mouvement 3, landing-playbook) ; une image IA à la place = interdit doctrine n°17 |
| **Favicon** | Oui, 1 | dérivé du logo/accent, formats standard |
| **Illustration d'état vide** (écran cœur en a un) | Oui, 1 par état réel | cohérent esthétique, jamais générique |
| **Décoration « pour faire joli »** | **Non** | pas d'emplacement = pas d'image |
| **Photos de personnes / avatars réalistes** | **Non** | interdit doctrine n°18 (avatars stock/IA = fausse preuve sociale) |
| **Clé Gemini absente** | **Non** (repli) | s'arrêter proprement, guide, livrer le reste (safety-rails §6) |

**Règle :** chaque image générée doit être **référencée par un écran**. Cohérence avec `DESIGN.md` > flash. Clé Gemini en env, jamais en dur (safety-rails §4).

---

## M6 — Dark mode : le fournir ? (mouvement 2.1)

| Condition | Dark mode | Traitement |
|---|---|---|
| Dev tool / audience technique / usage nocturne | **Oui, natif** | tokens sémantiques dual (light + dark) dès `DESIGN.md` |
| B2B / consumer standard | **Oui, dérivé** | mapper les neutres via variables shadcn (`.dark{--…}`), coût faible |
| Contrainte explicite « dark-only » (R1) | **Dark seul** | ne pas produire de light superflu |
| Interne / perso / time-box serré | **Light d'abord** | dark en `[Could]`, ne pas bloquer le build |

**Règle :** shadcn/ui gère le dual light/dark par variables CSS → le fournir coûte peu **si** les couleurs sont définies en **rôles sémantiques** (`background`, `foreground`, `primary`…) et non en teintes brutes. Le dark mode reste **cohérent avec la recette** : les neutres **gardent leur teinte** en `.dark` (jamais un dark gris pur plaqué sur des neutres chauds). Vérifier le contraste AA **dans les deux thèmes** (`tokens-a11y.md`).
