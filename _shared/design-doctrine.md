# Doctrine design — anti-AI-slop

> Synthèse de recherche web 2026-07 — sources en bas de fichier.
> Référence normative. Chargée par l'étape 08 (design system), les agents dev UI + la porte d'intégration (étape 12), le Designer-agent (étape 13) et la QA (étape 14). Chaque règle est binaire : elle passe ou elle échoue. Pas d'interprétation.

**Deux formes de slop, une seule parade.**
- **(1) Régression vers le corpus** : les LLM régressent vers la médiane de leur corpus (Tailwind UI et `bg-indigo-500`, tutoriels 2019-2024). Résultat reconnaissable en 3 secondes : gradient bleu→violet + Inter partout + hero centré + 3 cartes identiques.
- **(2) Convergence par template** : quand l'usine sort le **même look d'un projet à l'autre** (même paire de polices, même hue de marque, même layout, même motion) parce qu'elle a « choisi une recette » au lieu de **rechercher une direction**. AgencyDesk (agence B2B US) finit par ressembler au site coiffeur (booking FR) : deux secteurs, un seul design. **La convergence par template EST du slop** — au même titre que l'indigo-violet.

La parade est la même pour les deux : imposer des contraintes explicites AVANT génération (interdits vérifiables + thème décidé en amont + structures non-médianes + zéro contenu inventé + checklist binaire avant merge) **ET** dériver une **direction recherchée par projet** (§Processus de recherche de direction) qui occupe le *white space* de CE secteur — pas la médiane des 5 recettes. « Demander plus de créativité » à un LLM produit de la médiane ; lui donner un **processus de recherche + un arsenal + des contraintes** produit du distinctif.

---

## Sommaire

- Marqueurs d'AI slop (INTERDITS)
- Processus de recherche de direction (par projet) — LE cœur anti-convergence
- Leviers du design distinctif
- Points de départ (5 graines de registre — JAMAIS la sortie)
- Sources de blocs vendorables
- Arsenal créatif — création + duplication
- Checklist de review anti-slop
- Sources

## Marqueurs d'AI slop (INTERDITS)

Liste binaire. Un agent qui produit un de ces marqueurs a échoué, quelle que soit la qualité du reste.

### Couleur
1. **INTERDIT** : couleur primaire indigo / violet / purple, et tout gradient bleu→violet (`text-indigo-*`, `bg-violet-*`, `from-purple-*`, hex voisins de `#a78bfa`, `#d8b4fe`). C'est le marqueur n°1 du slop.
2. **INTERDIT** : gris purs comme neutres (`#666`, `#f5f5f5`, `neutral-*`, `gray-*` non teintés).
3. **INTERDIT** : blobs / glows de gradient décoratifs en fond de section.
4. **INTERDIT** : plus d'1 couleur de marque ; la couleur de marque en fond de section entière.
5. **INTERDIT** : hex en dur dans les composants ; toute couleur passe par les variables sémantiques shadcn (`--primary`, `--muted`, `--accent`…).

### Typographie
6. **INTERDIT** : Inter / Roboto / Arial / system-ui comme police unique du produit (sans display à caractère).
7. **INTERDIT** : police non issue des variables de thème (`--font-display`, `--font-sans`, `--font-mono`).

### Layout
8. **INTERDIT** : hero centré générique = headline vague + 2 boutons + gradient, badge au-dessus du H1.
9. **INTERDIT** : 3+ cartes features identiques (même radius, même padding, même hauteur, icône + h3 + p).
10. **INTERDIT** : toutes les sections avec le même fond ET le même padding vertical (ruban blanc uniforme du header au footer, `py-24` partout).
11. **INTERDIT** : radius 16px uniforme partout, comme le mix aléatoire de radius.
12. **INTERDIT** : glassmorphism, cartes à bordure latérale colorée 3-4px, labels ALL-CAPS généralisés.

### Ombres et effets
13. **INTERDIT** : `shadow-lg`/`shadow-xl` floues (opacité ~0.1) saupoudrées sur toutes les cartes ; box-shadows colorées blur > 20px.
14. **INTERDIT** : fade-in uniforme sur toutes les sections ; hover states qui ne font rien ; animation qui ne communique pas un changement d'état.

### Icônes et images
15. **INTERDIT** : emojis ou checkmarks unicode en guise d'icônes.
16. **INTERDIT** : deux styles d'icônes qui coexistent (mélange outline/filled, tailles ou strokes hétérogènes).
17. **INTERDIT** : illustrations stock (Undraw), image IA ou faux dashboard **se faisant passer pour un vrai screenshot produit** (fausse preuve produit). ⚠️ **Distinction** : l'**imagerie de marque générée on-brand** — hero éditorial/atmosphérique, OG image, illustration d'empty-state, spot art, favicon/wordmark — via le **pipeline Nano Banana Pro** (§Arsenal → Génération de visuels) est **permise et recommandée** (levier anti-convergence). Ce qui reste interdit, c'est le **stock générique/placeholder** et une image IA **maquillée en capture d'écran produit** ou en preuve. La preuve « voici l'app » demeure un **vrai screenshot**.

### Contenu
18. **INTERDIT** : testimonials fictifs, avatars stock/IA, logos « as seen in » faux, métriques inventées (« 10 000+ users » au lancement), stats non sourcées. Règle : pas de preuve réelle = pas de section.
19. **INTERDIT** : lexique buzz/hedge — seamless, empower, unlock, revolutionize, supercharge, best-in-class, effortless, next-gen, all-in-one, leverage, « may help you » — et tout lorem ipsum / placeholder / TODO.
20. **INTERDIT** : thème shadcn par défaut (zinc) non personnalisé (`bg-slate-100` / `rounded-lg` bruts).

### Convergence (par template) — le slop de l'usine
21. **INTERDIT** : réutiliser une **direction** telle quelle — même **couple typo + hue de marque + layout signature + parti-pris motion** qu'un **autre projet de l'usine** ou qu'une **recette non modifiée**. Un rendu qui pourrait servir un autre métier sans changement = convergence = échec de la porte distinctiveness.
    - **⚠️ La convergence est aussi STRUCTURELLE, pas seulement cutanée.** Deux projets ne doivent partager ni la même **SILHOUETTE de page** (même ordre/structure de sections landing — cf. `_shared/landing-playbook.md` §Menu d'archétypes : chacun choisit un archétype adapté au métier) ni les **mêmes composants shadcn de base non re-thémés**. Re-skinner la même structure (mêmes sections dans le même ordre, mêmes blocs) avec des couleurs différentes = **convergence par template**, même verdict. La parade : **choisir un archétype structurel** (Part A) **+ sourcer des blocs de forme différente** depuis l'écosystème de registres (`skills/08-design-system/references/structural-sourcing.md`, Part B), puis re-thémer.
22. **INTERDIT** : livrer un `DESIGN.md` **sans artefact « direction »** (territoire nommé + white space visé vs 5-8 concurrents + 2-3 références réelles) ni **rationale par page**. Sans cette trace, « pourquoi ce design » n'existe pas → template par défaut.
23. **INTERDIT** : animation **sans fallback `prefers-reduced-motion`** (parallax / transforms sur gros éléments actifs en mode réduit).

**Garde-fou automatisable (lint CI)** : grep qui échoue sur classes `text-indigo-*` / `bg-violet-*` / `from-purple-*`, hex en dur dans `components/`, font-family hors variables, emoji unicode dans les TSX de pages marketing, chaînes du lexique buzz dans le copy. Peu coûteux, attrape ~80 % des régressions. La **convergence** (marqueurs 21-23) n'est pas grep-able : elle se contrôle à la **porte distinctiveness** (§ ci-dessous, check comparatif + rationale + reduced-motion).

---

## Processus de recherche de direction (par projet) — LE cœur anti-convergence

> **On ne « choisit pas une des 5 recettes ».** On **recherche une direction taillée pour CE métier / CETTE marque**, par une recherche courte mais réelle. Les 5 recettes (§Points de départ) sont des **graines/exemples de registre**, jamais la sortie. Deux secteurs n'ont pas le même *white space* → AgencyDesk et un coiffeur **doivent** diverger. Ce processus produit l'artefact qui **justifie « pourquoi ce design »** (exigence Felix) et **empêche la convergence** entre projets.

Chaîne obligatoire, **aucune étape sautée, AVANT tout token** :

1. **Brand audit** — attributs de marque depuis `research/positioning.md` + `research/idea-brief.md` : valeurs, ton, promesse, passé/présent/futur voulu, cible. Règle : **chaque décision visuelle (couleur, typo, layout, motion) devra tracer à un attribut de marque**, pas à un goût.

2. **Audit concurrentiel VISUEL (5-8 réfs)** — le geste central de l'art direction. Cartographier « à quoi ressemble le secteur **aujourd'hui** » sur 5-8 concurrents/voisins : **palette dominante, type de typo, densité, motion**. But : trouver le **white space** — la **position visuelle libre**. On occupe le **contraste**, on ne se fond pas. C'est CE qui force deux secteurs à diverger (le coiffeur et l'agence B2B n'ont pas le même white space).

3. **Moodboard / références réelles** — sourcer **par intention**, jamais une seule galerie (croiser = anti-recette) :
   - **flux d'apps du métier** (onboarding/checkout **réels**) → Mobbin, Refero, Pageflows — plus forte valeur pour un SaaS ;
   - **landing sectorielles / un bloc précis** (pricing, feature grid…) → Land-book (filtrable style/couleur/section), Lapa Ninja, SaaS Landing Page, Landingfolio ;
   - **niveau award / animé** (scroll, storytelling) → Awwwards, Godly, SiteInspire, Minimal Gallery.
   Retenir **2-3 références précises (URL)** qui incarnent le white space visé. On duplique la **structure** observée, **jamais** le code, les assets ni le copy (règle §Arsenal — DUPLIQUER).

4. **Direction distinctive DÉRIVÉE** (du moodboard, pas d'un template) — produire les 4 partis-pris :
   - **Typo expressive = voix de marque** : display à caractère / letterforms qui portent l'identité (sortir du trio serif+sans+mono par défaut si la marque le demande), type fluide pour le **rythme et la hiérarchie**. Levier n°1 de personnalité.
   - **Système couleur dérivé de la marque** : palette tirée du **territoire du métier** (OKLCH), 1 hue de marque + neutres teintés — **pas** « terracotta partout ». Test : si la palette pouvait servir un autre métier, elle n'est pas dérivée.
   - **Layout signature** : le parti-pris spatial (asymétrie, calques/superpositions maîtrisées, crops inattendus — *controlled chaos*), issu des relations spatiales du board — l'inverse du centré-minimal générique.
   - **Parti-pris motion** (voir §Direction motion) : **où** (hero / micro-interactions / empty states / loading / success), **pourquoi**, quelle couche (Lottie/Rive), **`prefers-reduced-motion`** respecté.
   - + **grain / texture** si la marque le porte (*visible craft* contre le poli lisse stérile de l'IA).

5. **Artefact « direction » (mini brand-book), AVANT le code** — écrit dans `DESIGN.md` : **1 territoire visuel nommé** + le **white space visé** (vs les concurrents cartographiés) + **2-3 références précises (URL)** + **palette dérivée** + **couple typo** + **1 motion signature**. C'est le livrable qui **justifie** et qui **empêche la convergence**. Chaque token doit tracer à un attribut de marque (étape 1).

6. **Rationale par page** — attacher à **CHAQUE type de page** (landing, auth, dashboard, detail, portal, settings, empty states…) une **ligne « intention »** : *pourquoi ce layout / cette hiérarchie / cette anim servent le job de CETTE page*, reliée à la direction. Ex. « hero asymétrique = white space vs concurrents centrés » ; « empty state animé = réduire la friction d'activation » ; « dashboard dense en `tabular-nums` = le job est de scanner des chiffres ». Sans cette trace → retour au template. (Section dédiée du `DESIGN.md`.)

### Porte « distinctiveness » (binaire — un échec = pas de présentation à la porte)
- **(a) Test anti-convergence** : si la **même palette + typo + motion** pouvait servir un **autre métier** sans changement → **FAIL** (direction pas assez taillée).
- **(b) Check comparatif** : le rendu **ne doit ressembler NI au défaut / à une recette non modifiée, NI à un autre projet de l'usine**. Même **couple typo + hue de marque + layout signature + parti-pris motion** qu'un projet précédent = convergence = **FAIL**.
- **(c) Rationale par page présent ET tenu** : chaque type de page a sa ligne « intention » dans `DESIGN.md`, **et le rendu la tient** (le layout/anim décrit est bien celui livré).
- **(d) `prefers-reduced-motion` respecté** partout (marqueur 23).
Un design qui rate (a), (b), (c) ou (d) repart au **mouvement concerné** (recherche de direction / dérivation / écran), pas de rustine.

---

## Leviers du design distinctif

### 1. Typographie — une paire déclarée, jamais improvisée
Une display à caractère réservée aux H1-H3 + un sans neutre pour le corps, chargées via `next/font`, exposées en `--font-display` / `--font-sans` / `--font-mono`. Chiffres (prix, stats, dates) en `tabular-nums` ou en mono. Tracking resserré (-0.01 à -0.03em) sur les grands titres.

Paires Google Fonts approuvées (display + corps → registre) :

| # | Paire | Registre |
|---|-------|----------|
| 1 | Bricolage Grotesque 600-800 + Inter/Geist | moderne à caractère, SaaS généraliste (display tendance 2025-26) |
| 2 | Space Grotesk + Inter | technique / dev-tool, chiffres qui claquent |
| 3 | IBM Plex Sans + IBM Plex Mono (accents chiffres/labels) | technique sérieux, data / infra |
| 4 | Fraunces (soft-serif, axes optiques) + Work Sans | premium chaleureux, fintech friendly / lifestyle |
| 5 | Instrument Serif + Instrument Sans | élégant contemporain, « studio 2025 » |
| 6 | DM Serif Display + DM Sans | éditorial moderne (même fonderie, cohérent) |
| 7 | Playfair Display + Source Sans 3 | éditorial classique / luxe |
| 8 | Newsreader (italiques en display) + Manrope | éditorial premium calme |
| 9 | Syne 700-800 + DM Sans | brutal / créatif, anti-enterprise |
| 10 | Sora + Inter | géométrique doux, produit B2C |
| 11 | Lora + Karla | chaleureux humain, services |
| 12 | Manrope variable seule (graisses 400→800) | mono-famille à la Linear — option la plus sûre en registre neutre |

### 2. Couleur — 1 hue de marque OKLCH + neutres teintés
- **1 seule couleur de marque**, définie en OKLCH, usage restreint : CTA primaire, liens, états actifs. Jamais en fond de section entière, jamais en glow.
- **Neutres teintés** : famille chaude (stone/sand, hue ~40-70) ou froide (slate, hue ~230-260) selon le registre, appliquée à TOUTES les surfaces (fonds, bordures, textes secondaires). Les neutres partagent la hue de la marque avec un chroma 0.005-0.02.
- Contraste AA (≥ 4.5:1) vérifié sur `--primary` / `--primary-foreground` après tout preset.

### 3. Bordures > ombres (style Linear)
Par défaut : bordures 1px (`var(--border)`) pour délimiter les surfaces. UNE seule ombre discrète tokenisée (`--shadow-elevated`) réservée aux éléments flottants (popover, dialog).

### 4. Radius et spacing — une personnalité, une échelle
- Choisir une personnalité de radius : 0-2px = sharp/technique ; 6-10px = moderne ; 14px+ = friendly. La décliner depuis `--radius` (`calc(var(--radius) - 4px)` etc.).
- Spacing sur échelle base-4 stricte.
- Padding vertical des sections VARIÉ (ex. py-16 / py-32 / py-20 / py-40) : une courte, une longue, une full-bleed.

### 5. Rythme de sections
Alterner les fonds : clair / neutre teinté / sombre. Au moins UNE rupture forte par landing (section sombre, bandeau full-bleed, ou stat géante en display).

### 6. Grilles non-médianes
À la place des 3 cartes identiques : grille asymétrique 2+1, bento à cellules de tailles variées, liste numérotée avec prose, ou étapes séquentielles.

### 7. Icônes
Un seul set : **Lucide** (licence ISC). Un seul style : taille et stroke uniformes (ex. 20px / stroke 1.75).

### 8. Micro-détails obligatoires (signal « produit fini »)
- `focus-visible` ring visible sur tout élément interactif.
- hover / active / disabled définis partout.
- empty states dessinés, skeletons de chargement, erreurs de formulaire inline.
- Motion : une animation seulement si elle communique (changement d'état, direction d'attention) ; durées 150-250ms, easing standard ; **parti-pris motion décidé par projet** (§Direction motion) et **`prefers-reduced-motion` respecté**.

### 9. Pipeline thème (APRÈS la recherche de direction, AVANT la première page)
1. **La direction est déjà recherchée** (§Processus de recherche de direction : brand audit → audit concurrentiel visuel / white space → moodboard 2-3 réfs réelles → 4 partis-pris dérivés). Le pipeline thème ne fait que **matérialiser** cette direction dans `DESIGN.md` : territoire nommé, paire de polices (voix de marque), couleur **dérivée du métier**, neutres teintés, radius, style d'ombres, motion signature, **white space visé + 2-3 références réelles (URL)** — jamais « 3 références décoratives » posées après coup.
2. Partir d'un preset tweakcn (Apache-2.0, vendorable — jamais Amethyst/violet) ou en générer un.
3. Exporter les CSS vars ; remplacer les polices du preset par la paire choisie.
4. Fixer radius / shadows selon la personnalité.
5. Vérifier contraste AA sur `--primary` / `--primary-foreground`.

L'agent qui code n'improvise JAMAIS le thème en cours de route. Dans le prompt de l'agent UI : rôle assigné (« senior designer »), bloc `<theme>` (registre, polices, hues) et les interdits négatifs explicites listés plus haut — les contraintes négatives fonctionnent mieux que « sois créatif ».

---

## Points de départ (5 graines de registre — JAMAIS la sortie)

⚠️ Ces 5 recettes sont des **graines de recherche**, pas un menu à choisir. Elles donnent un **registre de départ** (couples typo, familles de neutres, motifs de layout éprouvés) que le **§Processus de recherche de direction fait DIVERGER** vers une direction taillée pour CE métier / CETTE marque. **Règle dure : la sortie doit diverger de sa graine** — couleur **dérivée du territoire du métier** (jamais la teinte d'exemple telle quelle), typo/motion taillées, layout signature propre. Une sortie identique à sa recette de départ = convergence par template = **échec de la porte distinctiveness** (marqueur 21). L'étape 08 **seede** ses 3 variantes shotgun sur **3 registres différents** puis **recherche** chacune — jamais 3 graines du même registre, jamais une graine servie brute.

### R1 — « Éditorial chaleureux »
- **Registre** : humain, artisanal, proche — le produit parle comme un commerçant, pas comme une plateforme.
- **Polices** : Fraunces (H1-H3, graisses 500-700) + Work Sans. Variante : Lora + Karla.
- **Palette** : neutres chauds stone/sand (hue 40-70), marque terracotta / vert olive / bordeaux en OKLCH ; fond crème, section de rupture brun sombre.
- **Layout** : hero 2 colonnes aligné gauche avec photo/screenshot dans un cadre à bordure 1px, radius 8-12px, bordures plutôt qu'ombres, une section sombre chaleureuse (citation fondateur), footer dense.
- **Niches** : salons de coiffure/beauté, restaurants, artisans, services locaux B2B, bien-être, food.

### R2 — « Technique précis »
- **Registre** : outil sérieux pour gens sérieux ; densité d'information, zéro décoration.
- **Polices** : Space Grotesk + Inter, ou IBM Plex Sans + IBM Plex Mono (chiffres et labels en mono).
- **Palette** : neutres froids slate (hue 230-260), marque unique verte/cyan/orange vif à usage chirurgical ; mode sombre naturel.
- **Layout** : radius 0-4px, bordures 1px partout, tables et chiffres en tabular-nums, hero aligné gauche avec screenshot terminal/dashboard réel, stat géante en display, grille bento asymétrique.
- **Niches** : outils dev, data / analytics, infra, API-first, back-office métier.

### R3 — « Studio contemporain »
- **Registre** : élégant, calme, très 2025 ; l'esthétique porte la crédibilité.
- **Polices** : Instrument Serif (display, éventuellement en italique) + Instrument Sans. Variante : Newsreader + Manrope.
- **Palette** : neutres sable/ivoire à peine teintés, marque encre profonde ou vert sauge ; peu de couleur, beaucoup de blanc typographié.
- **Layout** : grandes marges, hero asymétrique typographique (headline en display géant), radius 6-8px, une seule ombre tokenisée, rythme par la taille des titres plutôt que par les fonds.
- **Niches** : produits créatifs, portfolio-SaaS, coaching / conseil premium, fintech calme.

### R4 — « Moderne à caractère »
- **Registre** : SaaS contemporain confiant, sans tomber dans le générique.
- **Polices** : Bricolage Grotesque 600-800 + Inter ou Geist. Variante B2C : Sora + Inter.
- **Palette** : neutres légèrement froids, marque unique franche (jamais indigo/violet) ; alternance clair / teinté / sombre.
- **Layout** : hero 2 colonnes gauche + screenshot produit encadré, bento 1 grande cellule + 2 petites, radius 8-10px, section sombre de rupture, pricing sobre 2 colonnes max.
- **Niches** : SaaS généraliste B2B/B2C, booking, gestion, productivité.

### R5 — « Brutal créatif »
- **Registre** : anti-enterprise assumé, contrastes forts, personnalité avant consensus.
- **Polices** : Syne 700-800 + DM Sans.
- **Palette** : noir/blanc dominant + 1 accent saturé (jaune, rouge, vert acide) ; neutres quasi purs mais teintés d'un chroma minimal.
- **Layout** : radius 0-2px, bordures épaisses 1-2px, typographie surdimensionnée, grilles cassées volontairement (mais spacing base-4 strict), pas d'ombres.
- **Niches** : design tools, produits pour créatifs, audiences jeunes, marques qui veulent trancher.

**Structure de landing non-médiane (ordre éprouvé, quelle que soit la direction)** : hero 2 colonnes aligné gauche (headline spécifique + screenshot produit dans un cadre à bordure 1px) → bandeau preuve concrète (démo 30s ou stat réelle en display géant) → features en bento asymétrique → section SOMBRE de rupture (use-case ou citation fondateur) → pricing sobre 2 colonnes max → CTA final court sur fond teinté → footer dense. Détail des sections : voir `landing-playbook.md`.

---

## Sources de blocs vendorables

Règle plugin (rappel) : **vendoring MIT / Apache-2.0 / ISC uniquement**, avec fichier LICENSE conservé + PROVENANCE (source, URL, date, licence) pour chaque bloc vendorisé.

| Écosystème | Licence | Usage | Restrictions |
|---|---|---|---|
| shadcn/ui + blocks officiels | MIT | base structurelle : dashboards, sidebars, login, calendars | — |
| Origin UI | MIT | ~400 composants copy-paste (inputs, selects, notifications) | passé en mode legacy (successeur : coss ui) — vendorable, mais pas de dépendance long terme |
| Magic UI | MIT | 50+ effets animés (bento grid, marquee, number ticker) | à doser : 1-2 par page MAX |
| HyperUI | MIT | sections marketing/ecommerce HTML Tailwind v4 | à convertir en JSX |
| Flowbite core | MIT | composants utilitaires | **PAS le Pro** (EULA propriétaire) |
| Tremor | Apache-2.0 | 35+ composants dashboard/charts — app authentifiée | conserver la notice ; **PAS les Tremor Blocks** (payants) |
| tweakcn | Apache-2.0 | presets + éditeur de thème shadcn | re-vérifier le contraste AA après tout preset |
| Lucide | ISC | set d'icônes unique du châssis | un seul style (taille/stroke uniformes) |

**INTERDITS de vendoring** (licences propriétaires interdisant la redistribution) : Flowbite Pro, Tremor Blocks, shadcnblocks.com, Aceternity Pro. **Aceternity gratuit** : licence ambiguë (annoncé MIT, EULA propriétaire côté Pro) → vérifier composant par composant, ne jamais vendorer en masse.

---

## Arsenal créatif — création + duplication

**Principe (fondateur) :** on ne cherche pas à être « plus créatif » — on s'équipe d'**outils qui rendent plus puissant en créativité**, par deux voies seulement : la **CRÉATION** (ce qui porte l'identité : thème, copy, visuels) et la **DUPLICATION** (ce qui est déjà résolu ailleurs : structures, blocs, patterns d'animation). Demander « plus de créativité » à un LLM produit de la médiane ; lui donner un arsenal + des contraintes produit du distinctif.

### Outils (licences vérifiées)

| Outil | Licence | Verdict | Usage |
|---|---|---|---|
| **Motion** (ex-Framer Motion, motion.dev) | MIT | **dépendance par défaut** côté React | micro-interactions, transitions d'état, presence enter/exit, layout animations |
| **GSAP** + tous plugins (ScrollTrigger, SplitText…) | GSAP Standard — gratuite depuis 3.13 (rachat Webflow), usage commercial inclus, mais **pas MIT** | dépendance npm OK ; **JAMAIS vendoré** (règle vendoring MIT/Apache/ISC) | scènes scroll orchestrées, timelines, typo animée — **seulement si la recette le justifie** |
| **@lottiefiles/dotlottie-react** (runtime WASM) | MIT | dépendance npm, **lazy-load** via `<MotionAsset>` | motion **décoratif / one-shot** : hero illustré, loading, empty state, célébration — asset re-thémé aux tokens |
| **@rive-app/react-canvas** (runtime WASM) | MIT | dépendance npm, **lazy-load** via `<MotionAsset>` | motion **interactif piloté par l'état** : icônes réactives, toggles, mascotte — **seulement si beaucoup d'interactif** (amortir les 200 KB) |
| **next/og / @vercel/og** (moteur Satori) | Next.js MIT ; Satori MPL-2.0 | dépendance (`next/og` est inclus dans Next.js) ; ne pas vendorer Satori | **og-images générées en code** avec les tokens du thème (display + couleur de marque du `DESIGN.md`) — jamais d'og-image statique bricolée ni d'image IA |
| **Galeries de blocs code** (shadcn blocks, HyperUI, Magic UI, templates Vercel MIT…) | MIT / Apache-2.0 / ISC — **à vérifier par bloc** | **duplication** selon la règle vendoring (LICENSE + PROVENANCE) | squelettes de sections, dashboards, pricing — toujours **re-thémés** (règles ci-dessous) |
| **Galeries d'inspiration** (Mobbin, Godly, Land-book, Landingfolio…) | contenu propriétaire | **référence de patterns uniquement** : on duplique la **structure** observée, jamais le code, les assets ni le copy | choisir un squelette de section éprouvé avant de coder |
| **Nano Banana Pro** (`gemini-3-pro-image`, Google/Gemini) — helper `_shared/blocks/web-saas/scripts/generate-visual.mjs`, clé `GEMINI_API_KEY` en env (jamais en dur) | API Google | **moteur de visuels du plugin** (`providers.visuals="nano-banana"`) : **création** de visuels **on-brand dérivés de `DESIGN.md`** — hero éditorial/atmosphérique, **OG image**, illustrations d'empty-states, spot art, favicon/wordmark. Sortie `public/generated/`, référencée via `next/image` | prompts **dérivés de la direction** (palette/typo/métier), jamais du stock/placeholder ; **jamais maquillé en screenshot produit** (n°17) ni en fausse preuve (n°18) |

### Génération de visuels (Nano Banana Pro) — création on-brand, levier anti-convergence

Quand le design a besoin d'**imagerie** — hero éditorial/atmosphérique, **OG image**, illustrations d'**empty-states**, **spot art**, favicon/wordmark — on **GÉNÈRE** un visuel dérivé de la **direction du projet** (`DESIGN.md` : palette de marque, typo, métier, parti-pris). **Jamais** du stock générique ni un placeholder. C'est un **levier d'anti-convergence côté image** : deux projets de métiers différents → prompts différents → visuels différents (le coiffeur et l'agence B2B ne partagent pas leur hero).

- **Moteur** : Nano Banana Pro (`gemini-3-pro-image`, image Google/Gemini) — modèle prouvé pour un rendu premium, texte lisible, on-brand. Réglé par `providers.visuals="nano-banana"` (`config-schema.md`).
- **Helper réutilisable** : `_shared/blocks/web-saas/scripts/generate-visual.mjs` (présent dans le châssis en `scripts/generate-visual.mjs`). Signature : `node scripts/generate-visual.mjs "<prompt>" public/generated/<nom>.png [model] [aspect]`. La clé `GEMINI_API_KEY` est lue depuis `~/.saas-factory/.env` — **jamais en dur, jamais commitée**.
- **Prompt = dérivé de `DESIGN.md`**, pas générique : sujet + style (éditorial/premium…) + **palette de la marque** + cadrage/aspect + « NO lorem text / NO fake UI » au besoin. C'est la règle CRÉER (l'identité) de l'arsenal.
- **Sortie et câblage** : `public/generated/` (ex. `hero.png`, `og.png`, `empty-<liste>.png`), **référencée via `next/image`** dans les composants — pas des placeholders. L'**OG image** générée est branchée dans les `metadata` (`openGraph.images`) — soit ce raster Nano Banana Pro, soit un `next/og` codé (les deux comptent comme « généré on-brand » ; jamais une OG statique bricolée ni du stock).
- **Garde-fous** : jamais à la place d'un **vrai screenshot produit** (interdit n°17 — la preuve « voici l'app » reste un screenshot) ni d'une **fausse preuve sociale** (n°18 : avatars/logos/personnes réalistes inventés). Chaque visuel généré est **référencé par un écran réel** (pas de décoration « pour faire joli »).
- **Repli honnête (`safety-rails.md` §6)** : `GEMINI_API_KEY` absente ou `visuals="none"` → **ne pas simuler** d'images ; s'arrêter proprement sur la génération, livrer le reste, consigner « ajoute ta clé pour générer les visuels ».
- **Décider quoi générer** : matrice `skills/08-design-system/references/matrices-decision.md` (M5). **Câblage build** : le walking skeleton appelle le helper depuis `DESIGN.md` (`skills/12-build/references/walking-skeleton.md`).

### Direction motion (couche d'animation par projet)

Chaque projet choisit **une couche d'animation** avec un **parti-pris** (décidé au §Processus de recherche de direction, matérialisé dans `DESIGN.md` §Direction motion), pas des micro-anims génériques saupoudrées. Trois runtimes, trois niveaux de coût/pouvoir :

| Runtime | Poids (gzip) | Format | Pouvoir | Cas d'usage |
|---|---|---|---|---|
| `lottie-react` | ~60 KB | JSON | zéro interactivité, one-shot | le plus simple, décoratif |
| `@lottiefiles/dotlottie-react` | ~100 KB (WASM) | `.lottie` (ZIP, 40-70 % + léger que le JSON) | one-shot + **state machines** (fin 2025) | **décoratif / one-shot** : hero illustré, loading, empty state, célébration/confetti |
| `@rive-app/react-canvas` | ~200 KB (WASM) | `.riv` (50-80 % + petit, parfois 10-15×) | **state machines interactives natives** | **interactif piloté par l'état de l'app** : micro-interactions, icônes réactives (hover/scroll), toggles, mascotte réactive |

**Règle de choix (par cas d'usage) :**
- Décoratif / one-shot → **dotLottie-react** (léger, assets abondants).
- Interactif piloté par l'état → **Rive react-canvas** (les state machines évitent d'empiler des variantes). ⚠️ un seul petit icône animé **ne justifie PAS** les 200 KB de Rive ; beaucoup d'icônes interactives, **oui** (le runtime s'amortit).
- Transitions d'état React / presence / layout → **Motion** (déjà la dépendance par défaut) ; scène scroll orchestrée → **GSAP** (seulement si la direction l'exige).

**Sources d'assets :** LottieFiles (lottiefiles.com — free + premium, export dotLottie/JSON), Rive Community (rive.app/community/files — tout pensé interactif), LottieFolder. **Un asset générique non retouché = slop** : le prendre comme **base**, puis **recolorer / retimer aux tokens de la marque** (règle DUPLIQUER re-thémé).

**`prefers-reduced-motion` — non négociable (marqueur 23).** Hook `useReducedMotion` (matchMedia `'(prefers-reduced-motion: reduce)'`, avec listener pour les changements live). Trois niveaux de fallback :
- **(a) gate simple** — couper l'autoplay / rendre une frame statique ;
- **(b) Lottie/dotLottie** — jouer un marqueur nommé `reduced motion` s'il existe ;
- **(c) Rive** — passer un booléen `prefersReducedMotion` dans la state machine pour router vers un chemin « réduit ».
Principe : garder l'**opacité**, supprimer les **transforms** sur gros éléments et le **parallax**.

**Un composant `<MotionAsset>` unique et theming-aware** (patron châssis) qui : choisit le runtime, respecte reduced-motion **par défaut**, **lazy-load** le WASM/asset (jamais dans le bundle critique), et lit les couleurs des **design tokens**. Compile-safe (tsc + next build), réutilisable par tous les projets, animation **décidée par la config de la direction** — jamais hardcodée.

### Règles CRÉER vs DUPLIQUER

| On DUPLIQUE (déjà résolu ailleurs) | On CRÉE (l'identité — jamais dupliquée) |
|---|---|
| structures éprouvées : blocs, squelettes de sections, layouts pricing/FAQ/footer | le **thème** : tokens, paire de polices, couleur de marque, radius |
| patterns d'animation (stagger d'entrée, number ticker, reveal ciblé) | le **copy** : headline, features orientées jobs, FAQ |
| plomberie UI : auth, tables, formulaires (blocs du châssis) | les **visuels de marque** et les screenshots produit |

1. **Tout template ou bloc dupliqué est RE-THÉMÉ** : tokens + polices + radius + contenu remplacés, au point de **ne plus ressembler à son origine**. Un bloc qui sort avec ses couleurs/polices d'origine = échec (équivalent du marqueur n°20).
2. La duplication porte sur la **structure** (grille, hiérarchie, ordre des éléments), jamais sur l'identité (thème, copy, images). C'est la combinaison structure éprouvée × identité créée qui rend distinctif.
3. Licences : le code dupliqué suit la règle vendoring (MIT/Apache-2.0/ISC + LICENSE + PROVENANCE). Les galeries d'inspiration ne fournissent **aucun** code ni asset à copier.

### Règles d'animation anti-slop

1. **Une animation = un changement d'état communiqué** (feedback d'action, direction d'attention, apparition motivée). Une animation qui ne communique rien est **supprimée**.
2. **INTERDIT** : fade-in décoratif généralisé (toutes les sections qui « apparaissent » au scroll), parallax gratuit, hover inerte, boucles infinies hors loading, animation d'entrée sur chaque carte d'une grille.
3. **Durées** : micro-interactions 150-250 ms ; entrées/transitions 300-400 ms ; jamais > 500 ms hors scène scroll volontaire (registre brutal/créatif).
4. **Easing** : ease-out pour les entrées, ease-in-out pour les déplacements ; jamais linear (hors marquee), jamais bounce/elastic hors R5.
5. **Routage lib** (voir §Direction motion) : **Motion** par défaut (état, presence, micro-interactions) ; **dotLottie** pour le décoratif/one-shot (hero illustré, loading, empty state, success) ; **Rive** pour l'interactif piloté par l'état (icônes réactives, mascotte, toggles) ; **GSAP** seulement pour une scène scroll orchestrée. Jamais deux libs pour le même type d'effet sur la même page.
6. **Budget** : 1-2 effets « signature » max par page (même règle que Magic UI) ; le reste = micro-interactions fonctionnelles. Le motion signature du projet est **déclaré dans `DESIGN.md` §Direction motion**.
7. **`prefers-reduced-motion` respecté** (marqueur 23) : via `useReducedMotion` + `<MotionAsset>`, les **3 niveaux de fallback** de §Direction motion (gate simple / marqueur Lottie `reduced motion` / booléen Rive). On garde l'opacité, on supprime transforms sur gros éléments et parallax.

---

## Checklist de review anti-slop

Utilisée par le Designer-agent (étape 13) et la QA (étape 14), sur screenshot **desktop + mobile**, avant tout merge de page. Chaque point : OUI = fail.

1. Un gradient bleu/violet ou une primary indigo est visible ?
2. Inter/system est la seule police (pas de display à caractère sur les H1-H3) ?
3. Le hero est centré avec headline vague et 2 boutons génériques ?
4. Il y a 3+ cartes features identiques (même radius / padding / hauteur) ?
5. Des emojis ou checkmarks servent d'icônes, ou 2 styles d'icônes coexistent ?
6. Des ombres floues (blur fort, opacité ~0.1) sont sur toutes les cartes ?
7. Des blobs/glows de gradient décoratifs traînent en fond ?
8. Testimonials, avatars, logos ou stats sont inventés ?
9. Le copy contient seamless / empower / unlock / revolutionize / all-in-one (ou équivalents FR creux : « révolutionnaire », « tout-en-un » non justifié) ?
10. Des illustrations stock (Undraw) ou images IA remplacent les vrais screenshots ?
11. Toutes les sections ont le même fond ET le même padding vertical ?
12. Les neutres sont des gris purs (pas teintés) ?
13. Focus rings absents ou hover states inertes ?
14. Un hex en dur ou une classe couleur Tailwind brute existe dans les composants ?
15. Le thème est resté sur les defaults shadcn (zinc) sans personnalisation ?

**Convergence & justification (porte distinctiveness — voir §Processus de recherche de direction) :**
16. La **direction** (palette + typo + motion) pourrait servir un **autre métier** sans changement ? *(test anti-convergence)*
17. Le rendu **ressemble à une recette non modifiée** OU à **un autre projet de l'usine** (même couple typo + hue de marque + layout signature + parti-pris motion) ? *(check comparatif)*
18. Un **type de page** n'a **pas de ligne « intention » (rationale)** dans `DESIGN.md`, OU le **rendu ne tient pas** le rationale déclaré ?
19. Une animation **ignore `prefers-reduced-motion`** (transforms / parallax actifs en mode réduit) ?

**Score : 0 OUI = ship. 1+ OUI = retour en design (pas de rustine ponctuelle).** Même règle partout : porte de l'étape 08, passe d'intégration (étape 12), cran Designer (étape 13), QA (étape 14) — un marqueur coché = FAIL.

> **Altitude des points 16-19.** (16) et (18-rendu) et (19) se vérifient **par écran** (crans 12/13/14). (17 — comparaison à un autre projet) et (18-artefact — présence du rationale + de l'artefact « direction ») se vérifient au **niveau produit** : porte 08 (à la création de la direction) et étape 14 (faux-client, sur le produit réel). Le cran Designer (13) vérifie que **le rendu de la surface tient son rationale** et respecte reduced-motion.

---

## Sources

- https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website
- https://www.925studios.co/blog/ai-slop-web-design-guide
- https://publishd.app/blog/make-ai-built-site-not-look-ai
- https://dev.to/alanwest/why-every-ai-built-website-looks-the-same-blame-tailwinds-indigo-500-3h2p
- https://www.monet.design/blog/posts/escape-ai-slop-landing-page-design
- https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it
- https://tweakcn.com/ et https://github.com/jnsahaj/tweakcn
- https://ui.shadcn.com/docs/theming
- https://github.com/origin-space/originui
- https://github.com/magicuidesign/magicui
- https://github.com/markmead/hyperui
- https://github.com/themesberg/flowbite et https://flowbite.com/docs/getting-started/license/
- https://github.com/tremorlabs/tremor
- https://ui.aceternity.com/licence
- https://medley.ltd/blog/best-google-font-pairings-for-ui-design-in-2025/
- https://www.landingpageflow.com/post/google-font-pairings-for-websites
- https://www.alexchristou.co.uk/posts/comparing-ai-design-tools-bolt-v0-lovable
- https://www.designsystemscollective.com/design-systems-lovable-bolt-v0-and-replit-50a0a197bc35
- https://adminlte.io/blog/shadcn-ui-block-libraries/
- https://gsap.com/blog/3-13/ (GSAP + tous les plugins gratuits, usage commercial inclus) et https://gsap.com/licensing/ (GSAP Standard — pas MIT)
- https://github.com/motiondivision/motion (Motion, MIT)
- https://github.com/vercel/satori (MPL-2.0) et https://vercel.com/docs/og-image-generation (`next/og` / @vercel/og)
- https://vercel.com/templates et https://mobbin.com / https://godly.website / https://land-book.com (galeries — inspiration de structure uniquement)
- Recherche direction / white space : https://land-book.com/ · https://www.saasui.design/best-saas-ui-design-inspiration · https://avedesign.studio/guide/moodboards-the-strategic-tool-hiding-in-plain-sight/ · https://www.nngroup.com/articles/mood-boards/ · https://www.fontfabric.com/blog/10-design-trends-shaping-the-visual-typographic-landscape-in-2026/ · https://www.designmonks.co/blog/brand-design-trends-2026
- Galeries de sourcing : https://mobbin.com · https://refero.design · https://pageflows.com · https://www.lapa.ninja · https://www.awwwards.com · https://godly.website · https://www.siteinspire.com
- Motion (Lottie/Rive) : https://unicornicons.com/learn/rive-vs-lottie · https://www.pkgpulse.com/guides/lottie-vs-rive-vs-css-animations-web-animation-formats-2026 · https://rive.app/blog/rive-as-a-lottie-alternative · https://lottiefiles.com · https://rive.app/community/files/ · https://lottiefolder.com/
- Reduced motion : https://rive.app/docs/editor/accessibility/reduced-motion · https://motion.dev/docs/react-use-reduced-motion · https://joshcomeau.org/react/prefers-reduced-motion/
