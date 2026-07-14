---
name: 16-seo
description: >-
  Étape 16 (Phase 5 · lancement) de SaaS Factory — SEO de base (rôle Marketing), en DEUX livrables pour un SaaS public. (a) SEO technique = CODE COMMITTÉ immédiatement, sans gate humain : app/sitemap.ts, app/robots.ts (bloquant les zones auth), metadata + canonical par route, JSON-LD selon le type de site, conscience de la langue (`<html lang>`/`og:locale`/`hreflang` + métadonnées dans la langue `locale` du produit) — vérifié par le livret QA comme une feature. (b) Contenu éditorial = plan + gate humain : recherche de mots-clés en clusters (selon la niche/positionnement), nombre MESURÉ de pages de qualité (plafond dur anti « scaled content abuse »), itération. Data mots-clés : fallback gratuit par défaut, upgrade optionnel si provisionné via infra-setup. Garde-fous qualité anti-pénalité (Helpful Content / E-E-A-T). Se déclenche pour « SEO », « référencement », si le SaaS est public.
allowed-tools: Read, Write, Edit, Bash, WebSearch, WebFetch, AskUserQuestion
---

# SaaS Factory — Étape 16 : SEO de base (rôle Marketing)

Donner au SaaS **public** une base SEO **saine et durable** — pas une campagne, pas une ferme de contenu. Si `type != public` → **saute cette étape**.

**Principe directeur : qualité mesurée, JAMAIS du volume.** Un **nombre de pages plafonné** + une vraie recherche de mots-clés + des **garde-fous anti-pénalité Google**. La génération de masse (programmatic SEO) = le `scaled content abuse` que Google pénalise → **interdit ici**.

## À lire d'abord
`_shared/lessons.md`, `_shared/safety-rails.md` ; `references/quality-guardrails.md` (le garde-fou anti-pénalité — **prime sur tout**), `references/keyword-research.md`, `references/technical-seo.md` ; si présent, `skills/phase-5-launch/references/conventions.md`.

**HARD GATE — sur le contenu éditorial uniquement.** L'étape produit **deux livrables** de nature différente :
- **(a) SEO technique = du CODE, committé immédiatement, SANS gate humain** — `app/sitemap.ts`, `app/robots.ts` (bloquant les zones authentifiées), metadata + **canonical par route**, JSON-LD selon le type de site. C'est de la plomberie d'indexation, pas du contenu public : la retenir « en attente de validation » est un **mode d'échec**. Vérifiée par le **livret QA** (`qa/test-booklet.md`) **comme une feature**.
- **(b) Contenu éditorial = plan + gate humain** — mots-clés → clusters, pages de qualité mesurée, **validées humainement** avant publication. Pas de campagne marketing, pas de génération de masse, pas d'indexation réelle (celle-ci se fait au déploiement, **étape 17**).

`type != public` ⇒ on ne fait **rien** (ni a, ni b) et on annonce l'étape 17. Livrables : le **socle technique committé** + `seo/topic-cluster-map.md` + `seo/plan.md` + les pages éditoriales validées.

## Entrées / sortie (contrat)
- **Lit :** `.saas-factory/state.md` (🚨 `locale`/`dir`/`jurisdiction` — langue+sens+juridiction du **LIVRABLE** ; source du champ : `_shared/state-schema.md` §locale), `research/positioning.md` (catégorie, angle, niche, feel), `research/idea-brief.md` (cible, écosystème, type), le PRD `product/product-spec.md` (features = intentions), `DESIGN.md` (landing/tokens existants), `research/market.md` (concurrents = SERP à observer).
- **Écrit :** **(a) le socle technique dans le code, committé sans gate** — `app/sitemap.ts`, `app/robots.ts`, metadata (dans la langue `locale`) + canonical + `og:locale` + `hreflang` (si multilingue) par route (sous `app/**`) + la section « SEO technique » du **livret QA** (`qa/test-booklet.md`, un check par élément du socle) ; **(b)** `seo/topic-cluster-map.md` (template) + `seo/plan.md` (template) + les **pages éditoriales dans le code** (chemin explicite : sous `app/` — ex. `app/(marketing)/**` : landing + une page par cluster, après gate humain) + `.saas-factory/state.md` (étape 16 faite).

## Références (profondeur, chargées au besoin)
Le SKILL.md est le chef d'orchestre ; la procédure exhaustive vit dans `references/` (progressive disclosure) :
- `references/procedure-detaillee.md` — sous-procédure des mécanismes (dont le socle 3-A committé sans gate) : garde d'entrée par type, machine à états du pipeline, data-flow, critères de passage, modes dégradés. Ouvre-le pour exécuter.
- `references/keyword-research.md` — mécanisme 1 en détail : seed → étendre → qualifier → clusteriser (SERP-overlap) → mapper, avec micro-exemple.
- `references/quality-guardrails.md` — **le moat.** Plafond dur, self-assessment Helpful Content, E-E-A-T, anti-cannibalisation, gate humain — et **comment** les vérifier concrètement.
- `references/technical-seo.md` — mécanismes 3-A (socle technique, livrable a — code committé sans gate) et 3-B (on-page éditorial) en détail : sitemap/robots/canonical, metadata par route, `schema-dts` (JSON-LD), Core Web Vitals (`unlighthouse`), vérification livret QA, avec micro-exemple.
- `references/decision-matrices.md` — matrices condition→action : source data (M1), intention (M2), scoring opportunité (M3), plafond de pages (M4), cannibalisation (M5), type de schema (M6), sitemap par stack (M7), seuils CWV (M8), action d'itération GSC (M9).
- `references/forcing-questions.md` — recettes (Ask exact / Push-until / Red-flags / MOU-vs-FORT / routage) : self-assessment Helpful Content, garde du plafond, anti-cannibalisation, **gate humain de publication**, garde anti-bruit de l'itération.
- `references/checklists-modes-echec.md` — DoD par artefact, catalogue de cas limites, modes d'échec + corrections, porte de sortie.

## Les deux livrables, les mécanismes (dans l'ordre d'exécution)

**Livrable (a) — SEO technique, EN PREMIER (code committé, sans gate humain) :**
1. **Socle technique** (mécanisme **3-A**, `references/technical-seo.md`) — dès l'entrée d'étape, sur les routes existantes (landing de l'étape 12, pages légales) : `app/sitemap.ts` + `app/robots.ts` (**bloque les zones authentifiées**, M7) · metadata + **canonical par route** · **schema-dts** (JSON-LD, type via M6 selon le type de site) · **Core Web Vitals** (`unlighthouse` en CI, seuils M8) · mobile. **Committé immédiatement** — aucun gate humain — et consigné au **livret QA** (`qa/test-booklet.md`), vérifié **comme une feature**. **Titre** : le nom du produit vient de `lib/brand.ts` (étape 12) via le `title.template` du layout — chaque page ne pose que sa partie propre, on ne re-code **jamais** le nom en dur (pas de double source de vérité). **Langue** 🚨 : la couche SEO **suit `locale`** (langue+juridiction du LIVRABLE, source `_shared/state-schema.md` §locale) — `<html lang={locale}>` + `dir` (`ltr`/`rtl`, posés au build 12, **vérifiés ici**), `og:locale` = `locale`, et **toutes les métadonnées** (title/description/OG, JSON-LD) **rédigées dans la langue `locale`**, jamais en FR par défaut. Produit **multilingue** → `hreflang` par variante (+ `x-default`) et une entrée sitemap par locale (M7). Un socle SEO **aveugle à la langue** (ni `lang`, ni `og:locale`, ni `hreflang`) = **mode d'échec**.

**Livrable (b) — contenu éditorial (plan + gate humain) :**
2. **Recherche de mots-clés → clusters** (mécanisme **1**, `references/keyword-research.md`) — depuis la niche + `research/positioning.md` + le PRD : sur quels mots-clés se placer, structurés en **clusters** (intention · difficulté · volume · opportunité). Data : **fallback gratuit = défaut assumé** (recherche web manuelle + heuristiques) ; DataForSEO / Ahrefs = **upgrade optionnel si provisionné via `infra-setup`** ; GSC (itération) — routage `decision-matrices.md` (M1). Clusterisation par **SERP-overlap**, priorité à la **longue traîne accessible** (M2, M3). Sortie : `seo/topic-cluster-map.md`.
3. **Stratégie + génération MESURÉE de pages** (mécanisme **2**) — la **landing** + **3-8 pages** max (une par cluster clé, M4), **haute qualité**, **plafond dur** (`quality-guardrails.md`). Anti-cannibalisation (M5). Rédaction soignée (réutilise `content-creation` vendoré). Chaque page passe le **self-assessment Helpful Content** (`forcing-questions.md` §1) avant d'être retenue.
4. **On-page des pages éditoriales** (mécanisme **3-B**, `references/technical-seo.md`) — meta / Hn / URLs / OG · maillage interne · **extension du socle** (entrée sitemap, canonical, JSON-LD via M6) aux pages retenues.
5. **Gate qualité + publication** (mécanisme **4**) — applique la **checklist bloquante** (`checklists-modes-echec.md` + `quality-guardrails.md`) ; **gate humain** avant de publier les **pages éditoriales** (`AskUserQuestion`, recette `forcing-questions.md` §4). Aucun contenu ne se publie sans passer le garde-fou et sans **OK explicite tracé** — le socle technique, lui, est **déjà committé** et n'attend pas ce gate.
6. **Itération** (mécanisme **5**) — post-lancement, via **GSC si provisionné** (impressions/clics/position réels), affine **dans la limite mesurée** (routage M9). Ne s'ouvre qu'après le déploiement.

## Garde-fous (le moat — `quality-guardrails.md`)
- **Plafond dur** de pages (landing + N petit, N ≤ 8). Dépasser = refusé.
- **Helpful Content / E-E-A-T** : chaque page répond aux questions de self-assessment Google (valeur réelle, expertise, pas de contenu creux).
- **Anti scaled-content-abuse** : pas de génération de masse depuis une DB / un template.
- **Anti-cannibalisation** : deux pages ne ciblent jamais la même intention (M5).
- **Gate humain** avant publication **des pages éditoriales** (safety-rails §1 : on ne publie pas de contenu public sans OK). Le **socle technique n'attend pas ce gate** : sitemap/robots/metadata/JSON-LD = du code, committé d'emblée — le retarder est un mode d'échec.
- **Secrets en env** (clés DataForSEO/Ahrefs, si upgrade provisionné) — jamais en dur, jamais committés (safety-rails §4).

Catalogue des modes d'échec (scaled content abuse, contenu creux, faux structured data, cannibalisation, itération sur bruit, publication sans OK, secret committé…) et leur correction : `references/checklists-modes-echec.md`.

## Clôture d'étape
Avant de clore, passe les DoD par artefact et la porte de sortie (`references/checklists-modes-echec.md`) : **socle technique committé et consigné au livret QA** (sitemap servi, robots bloque les zones auth, canonical par route, JSON-LD valide, `<html lang={locale}>`+`dir`, `og:locale`, `hreflang`+`x-default` si multilingue, **métadonnées dans la langue `locale`**), carte ancrée niche, pages ≤ plafond toutes PASS Helpful Content, technique verte (`unlighthouse`), **gate humain OK et tracé pour les pages éditoriales publiées** (sinon : « prêt, en attente » consigné — le socle technique, lui, reste committé dans tous les cas), zéro secret. Puis met à jour `.saas-factory/state.md` (étape 16 faite, socle committé, nb de clusters, nb de pages, gate). Résume en 2 lignes (socle + clusters + nb de pages). Annonce l'**étape 17** (déploiement).
