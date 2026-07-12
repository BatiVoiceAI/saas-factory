---
name: 16-seo
description: >-
  Étape 16 (Phase 5 · lancement) de SaaS Factory — SEO de base (rôle Marketing). Pour un SaaS public : recherche de mots-clés structurée en clusters (selon la niche/positionnement), génération d'un nombre MESURÉ de pages de qualité (landing + quelques pages, plafond dur pour éviter la pénalité Google « scaled content abuse »), SEO on-page + technique (schema, sitemap, Core Web Vitals), et itération. Garde-fous qualité anti-pénalité (Helpful Content / E-E-A-T) + gate humain avant publication. Se déclenche pour « SEO », « référencement », si le SaaS est public.
allowed-tools: Read, Write, Edit, Bash, WebSearch, WebFetch, AskUserQuestion
---

# SaaS Factory — Étape 16 : SEO de base (rôle Marketing)

Donner au SaaS **public** une base SEO **saine et durable** — pas une campagne, pas une ferme de contenu. Si `type != public` → **saute cette étape**.

**Principe directeur : qualité mesurée, JAMAIS du volume.** Un **nombre de pages plafonné** + une vraie recherche de mots-clés + des **garde-fous anti-pénalité Google**. La génération de masse (programmatic SEO) = le `scaled content abuse` que Google pénalise → **interdit ici**.

## À lire d'abord
`_shared/lessons.md`, `_shared/safety-rails.md` ; `references/quality-guardrails.md` (le garde-fou anti-pénalité — **prime sur tout**), `references/keyword-research.md`, `references/technical-seo.md` ; si présent, `skills/phase-5-launch/references/conventions.md`.

**HARD GATE.** Ici : la **base SEO** (mots-clés → clusters, pages de qualité mesurée, on-page + technique), **validée humainement**. Pas de campagne marketing, pas de génération de masse, pas d'indexation réelle (celle-ci se fait au déploiement, **étape 17**). `type != public` ⇒ on ne fait **rien** et on annonce l'étape 17. Livrables : `seo/topic-cluster-map.md` + `seo/plan.md` + optimisations dans le code.

## Entrées / sortie (contrat)
- **Lit :** `research/positioning.md` (catégorie, angle, niche, feel), `research/idea-brief.md` (cible, écosystème, type), le PRD `product/product-spec.md` (features = intentions), `DESIGN.md` (landing/tokens existants), `research/market.md` (concurrents = SERP à observer).
- **Écrit :** `seo/topic-cluster-map.md` (template) + `seo/plan.md` (template) + les **pages optimisées dans le code** (chemin explicite : sous `app/` — ex. `app/(marketing)/**` : landing + une page par cluster) + `.saas-factory/state.md` (étape 16 faite).

## Références (profondeur, chargées au besoin)
Le SKILL.md est le chef d'orchestre ; la procédure exhaustive vit dans `references/` (progressive disclosure) :
- `references/procedure-detaillee.md` — sous-procédure des 5 mécanismes (garde d'entrée par type, machine à états du pipeline, data-flow, critères de passage, modes dégradés). Ouvre-le pour exécuter.
- `references/keyword-research.md` — mécanisme 1 en détail : seed → étendre → qualifier → clusteriser (SERP-overlap) → mapper, avec micro-exemple.
- `references/quality-guardrails.md` — **le moat.** Plafond dur, self-assessment Helpful Content, E-E-A-T, anti-cannibalisation, gate humain — et **comment** les vérifier concrètement.
- `references/technical-seo.md` — mécanisme 3 en détail : on-page, `schema-dts` (JSON-LD), sitemap/robots/canonical, Core Web Vitals (`unlighthouse`), avec micro-exemple.
- `references/decision-matrices.md` — matrices condition→action : source data (M1), intention (M2), scoring opportunité (M3), plafond de pages (M4), cannibalisation (M5), type de schema (M6), sitemap par stack (M7), seuils CWV (M8), action d'itération GSC (M9).
- `references/forcing-questions.md` — recettes (Ask exact / Push-until / Red-flags / MOU-vs-FORT / routage) : self-assessment Helpful Content, garde du plafond, anti-cannibalisation, **gate humain de publication**, garde anti-bruit de l'itération.
- `references/checklists-modes-echec.md` — DoD par artefact, catalogue de cas limites, modes d'échec + corrections, porte de sortie.

## Les mécanismes (dans l'ordre)
1. **Recherche de mots-clés → clusters** (`references/keyword-research.md`) — depuis la niche + `research/positioning.md` + le PRD : sur quels mots-clés se placer, structurés en **clusters** (intention · difficulté · volume · opportunité). Data : **MCP DataForSEO** (défaut) / Ahrefs (option) / GSC (itération) — routage `decision-matrices.md` (M1). Clusterisation par **SERP-overlap**, priorité à la **longue traîne accessible** (M2, M3). Sortie : `seo/topic-cluster-map.md`.
2. **Stratégie + génération MESURÉE de pages** — la **landing** + **3-8 pages** max (une par cluster clé, M4), **haute qualité**, **plafond dur** (`quality-guardrails.md`). Anti-cannibalisation (M5). Rédaction soignée (réutilise `content-creation` vendoré). Chaque page passe le **self-assessment Helpful Content** (`forcing-questions.md` §1) avant d'être retenue.
3. **On-page + technique** (`references/technical-seo.md`) — meta / Hn / URLs / OG · **schema-dts** (JSON-LD, type via M6) · sitemap/robots/canonical (natifs du framework, M7) · **Core Web Vitals** (`unlighthouse` en CI, seuils M8) · mobile. **Titre** : le nom du produit vient de `lib/brand.ts` (étape 12) via le `title.template` du layout — chaque page ne pose que sa partie propre, on ne re-code **jamais** le nom en dur (pas de double source de vérité).
4. **Gate qualité + publication** — applique la **checklist bloquante** (`checklists-modes-echec.md` + `quality-guardrails.md`) ; **gate humain** avant de publier les pages (`AskUserQuestion`, recette `forcing-questions.md` §4). Rien ne se publie sans passer le garde-fou et sans **OK explicite tracé**.
5. **Itération** — post-lancement, via **GSC** (impressions/clics/position réels), affine **dans la limite mesurée** (routage M9). Ne s'ouvre qu'après le déploiement.

## Garde-fous (le moat — `quality-guardrails.md`)
- **Plafond dur** de pages (landing + N petit, N ≤ 8). Dépasser = refusé.
- **Helpful Content / E-E-A-T** : chaque page répond aux questions de self-assessment Google (valeur réelle, expertise, pas de contenu creux).
- **Anti scaled-content-abuse** : pas de génération de masse depuis une DB / un template.
- **Anti-cannibalisation** : deux pages ne ciblent jamais la même intention (M5).
- **Gate humain** avant publication (safety-rails §1 : on ne publie pas de contenu public sans OK).
- **Secrets en env** (clés DataForSEO/Ahrefs) — jamais en dur, jamais committés (safety-rails §4).

Catalogue des modes d'échec (scaled content abuse, contenu creux, faux structured data, cannibalisation, itération sur bruit, publication sans OK, secret committé…) et leur correction : `references/checklists-modes-echec.md`.

## Clôture d'étape
Avant de clore, passe les DoD par artefact et la porte de sortie (`references/checklists-modes-echec.md`) : carte ancrée niche, pages ≤ plafond toutes PASS Helpful Content, technique verte (`unlighthouse`), **gate humain OK et tracé**, zéro secret. Puis met à jour `.saas-factory/state.md` (étape 16 faite, nb de clusters, nb de pages, gate OK). Résume en 2 lignes (clusters + nb de pages). Annonce l'**étape 17** (déploiement).
