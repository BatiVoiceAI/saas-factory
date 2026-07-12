# Doctrine design — anti-AI-slop

> Synthèse de recherche web 2026-07 — sources en bas de fichier.
> Référence normative. Chargée par l'étape 08 (design system), les agents dev UI + la porte d'intégration (étape 12), le Designer-agent (étape 13) et la QA (étape 14). Chaque règle est binaire : elle passe ou elle échoue. Pas d'interprétation.

**Cause racine du slop** : les LLM régressent vers la médiane de leur corpus (Tailwind UI et `bg-indigo-500`, tutoriels 2019-2024). Résultat reconnaissable en 3 secondes : gradient bleu→violet + Inter partout + hero centré + 3 cartes identiques. La parade n'est PAS « demander plus de créativité » : c'est imposer des contraintes explicites AVANT génération (interdits vérifiables + thème décidé en amont + structures non-médianes + zéro contenu inventé + checklist binaire avant merge).

---

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
17. **INTERDIT** : illustrations stock (Undraw), images IA ou faux dashboards à la place de vrais screenshots produit.

### Contenu
18. **INTERDIT** : testimonials fictifs, avatars stock/IA, logos « as seen in » faux, métriques inventées (« 10 000+ users » au lancement), stats non sourcées. Règle : pas de preuve réelle = pas de section.
19. **INTERDIT** : lexique buzz/hedge — seamless, empower, unlock, revolutionize, supercharge, best-in-class, effortless, next-gen, all-in-one, leverage, « may help you » — et tout lorem ipsum / placeholder / TODO.
20. **INTERDIT** : thème shadcn par défaut (zinc) non personnalisé (`bg-slate-100` / `rounded-lg` bruts).

**Garde-fou automatisable (lint CI)** : grep qui échoue sur classes `text-indigo-*` / `bg-violet-*` / `from-purple-*`, hex en dur dans `components/`, font-family hors variables, emoji unicode dans les TSX de pages marketing, chaînes du lexique buzz dans le copy. Peu coûteux, attrape ~80 % des régressions.

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
- Motion : une animation seulement si elle communique (changement d'état, direction d'attention) ; durées 150-250ms, easing standard.

### 9. Pipeline thème (AVANT la première page)
1. Fixer le registre dans DESIGN.md : registre esthétique nommé (éditorial / technique / chaleureux / premium / brutal), paire de polices, couleur de marque, neutres, radius, style d'ombres, 3 références réelles (ex. « hero split comme Stripe, bordures comme Linear »).
2. Partir d'un preset tweakcn (Apache-2.0, vendorable — jamais Amethyst/violet) ou en générer un.
3. Exporter les CSS vars ; remplacer les polices du preset par la paire choisie.
4. Fixer radius / shadows selon la personnalité.
5. Vérifier contraste AA sur `--primary` / `--primary-foreground`.

L'agent qui code n'improvise JAMAIS le thème en cours de route. Dans le prompt de l'agent UI : rôle assigné (« senior designer »), bloc `<theme>` (registre, polices, hues) et les interdits négatifs explicites listés plus haut — les contraintes négatives fonctionnent mieux que « sois créatif ».

---

## Recettes (directions complètes)

L'étape 08 puise ses 3 propositions dans CES recettes (en adaptant la couleur de marque à la niche). Ne jamais proposer 3 recettes du même registre.

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

**Structure de landing non-médiane (ordre éprouvé, toutes recettes)** : hero 2 colonnes aligné gauche (headline spécifique + screenshot produit dans un cadre à bordure 1px) → bandeau preuve concrète (démo 30s ou stat réelle en display géant) → features en bento asymétrique → section SOMBRE de rupture (use-case ou citation fondateur) → pricing sobre 2 colonnes max → CTA final court sur fond teinté → footer dense. Détail des sections : voir `landing-playbook.md`.

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
| **next/og / @vercel/og** (moteur Satori) | Next.js MIT ; Satori MPL-2.0 | dépendance (`next/og` est inclus dans Next.js) ; ne pas vendorer Satori | **og-images générées en code** avec les tokens du thème (display + couleur de marque du `DESIGN.md`) — jamais d'og-image statique bricolée ni d'image IA |
| **Galeries de blocs code** (shadcn blocks, HyperUI, Magic UI, templates Vercel MIT…) | MIT / Apache-2.0 / ISC — **à vérifier par bloc** | **duplication** selon la règle vendoring (LICENSE + PROVENANCE) | squelettes de sections, dashboards, pricing — toujours **re-thémés** (règles ci-dessous) |
| **Galeries d'inspiration** (Mobbin, Godly, Land-book, Landingfolio…) | contenu propriétaire | **référence de patterns uniquement** : on duplique la **structure** observée, jamais le code, les assets ni le copy | choisir un squelette de section éprouvé avant de coder |
| **Nano Banana** (Gemini 2.5 Flash Image) | API Google (clé en env, jamais en dur) | création de **visuels de marque** : logo, favicon, illustrations d'états vides | **jamais à la place d'un screenshot produit** (interdit n°17), jamais pour une fausse preuve (n°18) |

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
5. **Routage lib** : Motion par défaut (état, presence, micro-interactions) ; GSAP **seulement** quand la recette exige une scène orchestrée (scroll storytelling, typo animée — typiquement R5, éventuellement une landing R3). Jamais les deux libs pour le même type d'effet sur la même page.
6. **Budget** : 1-2 effets « signature » max par page (même règle que Magic UI) ; le reste = micro-interactions fonctionnelles.
7. **`prefers-reduced-motion` respecté** : toute animation non essentielle désactivée.

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

**Score : 0 OUI = ship. 1+ OUI = retour en design (pas de rustine ponctuelle).** Même règle partout : porte de l'étape 08, passe d'intégration (étape 12), cran Designer (étape 13), QA (étape 14) — un marqueur coché = FAIL.

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
