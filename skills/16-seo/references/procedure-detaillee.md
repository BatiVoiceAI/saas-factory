# Référence — Procédure détaillée (mécanismes 1-5, dont 3-A/3-B)

Sous-procédure exhaustive de l'étape 16. Le SKILL.md est le chef d'orchestre ; ici vit le **quoi faire / dans quel ordre / avec quel critère de passage** pour chaque mécanisme. L'étape produit **deux livrables** : **(a) le socle technique (mécanisme 3-A) = du CODE, committé immédiatement, sans gate humain** ; **(b) le contenu éditorial (mécanismes 1, 2, 3-B, 4) = plan + gate humain**. Principe directeur non négociable, qui prime sur tout : **qualité mesurée, jamais du volume** (`quality-guardrails.md`). Aucun mécanisme ne produit une page qui n'a pas passé le self-assessment Helpful Content, et **aucun contenu éditorial ne se publie sans le gate humain** — le socle technique, lui, ne dépend d'aucun gate.

## Sommaire

- Garde d'entrée — le type décide tout
- Machine à états — deux livrables, un pipeline
- Data-flow — qui alimente quoi
- Mécanisme 1 — Mots-clés → clusters
- Mécanisme 2 — Stratégie + génération MESURÉE de pages
- Mécanisme 3 — Technique + on-page, en deux temps (3-A socle · 3-B éditorial)
- Mécanisme 4 — Gate qualité + publication (contenu éditorial SEULEMENT)
- Mécanisme 5 — Itération (post-lancement, GSC)
- Definition-of-Done du mécanisme (vue d'ensemble)

## Garde d'entrée — le type décide tout

```
                 ┌─────────────────────────────┐
                 │  lire .saas-factory/state.md │
                 │  → type du projet ?          │
                 └───────────────┬──────────────┘
        public                   │        perso / interne
     ┌──────────────── public ───┴──── non-public ────────────┐
     ▼                                                         ▼
 exécuter les 5 mécanismes                          SAUTER l'étape 16
 (SEO base, qualité mesurée)                        (aucune page SEO,
                                                     aucun crawl souhaité)
                                                     → annoncer étape 17
```

**Règle :** `type != public` ⇒ on ne fait **rien** ici et on le dit clairement (« SaaS non public → pas de SEO, on passe au déploiement »). On ne « fait un peu de SEO au cas où » : un produit interne indexé est un défaut, pas un bonus. Doute sur le type → lire `research/idea-brief.md`, sinon demander (une question binaire).

## Machine à états — deux livrables, un pipeline

```
 ┌────────────────────────────────────────────────────────────────────┐
 │ 3-A. SOCLE TECHNIQUE — livrable (a), SANS gate humain               │
 │    app/sitemap.ts + app/robots.ts (bloque les zones auth)           │
 │    · metadata + canonical PAR ROUTE · JSON-LD (schema-dts, M6)      │
 │    · Core Web Vitals (unlighthouse) — sur les routes EXISTANTES     │
 │    → CODE COMMITTÉ immédiatement + livret QA (qa/test-booklet.md)   │
 └───────────────────────────────┬────────────────────────────────────┘
                                 ▼  (livrable b — plan + gate humain)
 ┌────────────────────────────────────────────────────────────────────┐
 │ 1. Mots-clés → clusters      (keyword-research.md)                  │
 │    seed → étendre → qualifier → clusteriser → mapper                │
 │    sortie: seo/topic-cluster-map.md                                 │
 └───────────────────────────────┬────────────────────────────────────┘
                                 ▼
 ┌────────────────────────────────────────────────────────────────────┐
 │ 2. Stratégie + génération MESURÉE de pages                          │
 │    landing + 3-8 pages max (1 par cluster clé) — PLAFOND DUR        │
 │    chaque page: rédaction soignée → self-assessment Helpful Content │
 │    sortie: pages en code + seo/plan.md (tableau des pages)          │
 └───────────────────────────────┬────────────────────────────────────┘
                                 ▼
 ┌────────────────────────────────────────────────────────────────────┐
 │ 3-B. On-page des pages éditoriales (technical-seo.md)               │
 │    meta/Hn/URL/OG · maillage · extension du socle aux pages         │
 │    retenues (entrée sitemap, canonical, JSON-LD)                    │
 └───────────────────────────────┬────────────────────────────────────┘
                                 ▼
 ┌────────────────────────────────────────────────────────────────────┐
 │ 4. GATE qualité + publication — CONTENU ÉDITORIAL SEULEMENT         │
 │    checklist bloquante → GATE HUMAIN (AskUserQuestion) → publier    │
 │    ┌── refus/à revoir ──▶ retour au mécanisme concerné (2 ou 3-B)   │
 └────┴──────────────────────────┬────────────────────────────────────┘
                          publié │   (le socle 3-A est DÉJÀ committé)
                                 ▼
 ┌────────────────────────────────────────────────────────────────────┐
 │ 5. Itération (post-lancement, GSC si provisionné)                   │
 │    impressions/clics/position réels → affiner DANS la limite mesurée│
 └────────────────────────────────────────────────────────────────────┘
```

**Règle de convergence :** le **socle 3-A se committe dès l'entrée d'étape, sans gate** — le retenir « en attente de validation » est un mode d'échec (c'est exactement comme ça qu'un produit sort sans sitemap). Les mécanismes 1→3-B se font **avant** toute publication éditoriale. Le mécanisme 4 est la **seule** porte de sortie du **contenu** vers le public ; un « à revoir » y renvoie en 2 (contenu) ou 3-B (on-page), jamais en avant — et ne suspend **jamais** le socle. Le mécanisme 5 ne s'ouvre qu'**après** le déploiement (étape 17) — on ne peut pas itérer sur de la donnée GSC qui n'existe pas encore.

## Data-flow — qui alimente quoi

```
routes existantes (étape 12 : landing, légales) ─▶ SOCLE 3-A (sitemap/robots/
                                          metadata+canonical/JSON-LD) ─▶ COMMITTÉ + livret QA
research/positioning.md ─(catégorie, angle, niche, feel)─┐
research/idea-brief.md ──(cible, écosystème, type)────────┼─▶ seeds mots-clés ─▶ topic-cluster-map.md
product/product-spec.md ─(features = intentions)──────────┘                          │
research/market.md ──────(concurrents = SERP à observer)──────────────────────────────┤
                                                                                       ▼
topic-cluster-map.md ─(1 cluster clé = 1 page)─▶ liste de pages (plafonnée) ─▶ pages en code
DESIGN.md ─(tokens, composants, landing existante)─▶ intégration on-page (mécanisme 3-B)
pages en code ─▶ on-page 3-B + extension du socle ─▶ unlighthouse (gate CWV) ─▶ gate humain ─▶ PUBLIÉ
PUBLIÉ + temps ─▶ Google Search Console (si provisionné) ─▶ itération (mécanisme 5)
```

Rien ne remonte : l'étape 16 **consomme** les phases 1-4 (positioning, PRD, design, build), ne les réécrit pas. Un input manquant → mode dégradé honnête (voir chaque mécanisme), **jamais** d'invention de mots-clés ou de métriques.

---

## Mécanisme 1 — Mots-clés → clusters

But : trouver les bons mots-clés **selon la niche** (jamais au hasard, jamais page blanche) et les structurer en clusters exploitables. Détail complet : `keyword-research.md`. Ici, l'ossature procédurale et les critères.

### Sous-procédure
1. **Ancrer** sur le projet : lire `research/positioning.md` (catégorie, angle, niche), `research/idea-brief.md` (cible, écosystème), le PRD (features = intentions de recherche). C'est ça qui cadre — pas l'imagination.
2. **Choisir la source data** via la **matrice M1** (`decision-matrices.md`) : **fallback gratuit = défaut assumé** (Google Suggest, People Also Ask, recherches associées, concurrents de `research/market.md` — recherche web manuelle + heuristiques) ; DataForSEO / Ahrefs = **upgrade optionnel, seulement si provisionné en amont via `infra-setup`** (jamais de config d'API demandée en cours d'étape). GSC n'entre qu'au mécanisme 5.
3. **Seed** : dériver 10-30 mots-clés graines de la niche + positionnement + features.
4. **Étendre** : via la data — variations, longue traîne, questions.
5. **Qualifier** chaque mot-clé via la **matrice M2** (intention) et le **scoring d'opportunité M3** : on garde la **longue traîne accessible**, on jette les génériques concurrentiels.
6. **Clusteriser** par **SERP-overlap** (mêmes résultats en SERP ⇒ même cluster) : une **pillar** + des clusters priorisés.
7. **Mapper** : cluster clé → **une page** + le **maillage interne** (pillar ↔ clusters, anti-orphelins).
- **Critère de passage :** `seo/topic-cluster-map.md` rempli — 1 pillar + N clusters priorisés (intention · difficulté · volume · opportunité) + mapping page + maillage. Chaque cluster retenu a un « pourquoi on peut gagner ici » explicite.
- **Mode dégradé :** le fallback gratuit n'en est **pas un** — c'est le régime nominal (M1) : volumes marqués `[estimé, non mesuré]`, ne **jamais** inventer un chiffre de volume précis, prioriser par fit × accessibilité (M3). Positioning absent → s'arrêter proprement, dire qu'il faut la Phase 1, ne pas fabriquer une niche.

---

## Mécanisme 2 — Stratégie + génération MESURÉE de pages

But : produire **la landing + 3 à 8 pages** de **haute qualité** (une par cluster clé), sous **plafond dur**. C'est ici que se joue la différence avec une ferme de contenu.

### Sous-procédure
1. **Fixer le nombre de pages** via la **matrice M4** (`decision-matrices.md`) : landing (toujours) + N pages, N ∈ [3, 8], **une par cluster clé** de la carte. Dépasser le plafond = **refusé** (`quality-guardrails.md` §1).
2. **Sélectionner les N clusters** : les plus **accessibles ET les plus alignés produit** (scoring M3). On ne prend pas les 8 plus gros volumes ; on prend ceux où on peut réellement se placer **et** qui portent une intention proche du produit.
3. **Vérifier l'anti-cannibalisation** (matrice M5) : deux pages ne ciblent **jamais** la même intention. Si deux clusters partagent la SERP → les fusionner en une page, pas deux.
4. **Rédiger chaque page** — soigné, spécifique à la niche, first-hand : **réutilise `content-creation` (vendoré)**. Pas de remplissage, pas de generic-SEO-copy.
5. **Passer le self-assessment Helpful Content par page** (forcing-checklist `forcing-questions.md` §1 ; garde-fou `quality-guardrails.md` §2) **avant** de retenir la page. Échec → améliorer ou couper. On ne garde pas une page « pour faire nombre ».
6. **Consigner** dans `seo/plan.md` (template) : le tableau des pages (page · cluster/intention · mot-clé principal · PASS/à revoir).
- **Critère de passage :** N ≤ plafond ; chaque page retenue a un **PASS** Helpful Content ; zéro paire cannibale ; chaque page mappe **un** cluster de la carte.
- **Mode dégradé :** moins de 3 clusters vraiment défendables → produire **moins** de pages (p. ex. landing + 1), le dire, ne **pas** gonfler jusqu'à 3 pour « remplir le plancher ». Le plafond est un maximum, pas un quota à atteindre.

---

## Mécanisme 3 — Technique + on-page, en deux temps (3-A socle · 3-B éditorial)

But : générer le code SEO dans le micro-SaaS. **Vendore les libs éprouvées, ne réinvente pas.** Détail complet : `technical-seo.md`. Ici, l'ossature et les critères. Deux temps de nature différente — un livrable de **code sans gate**, puis l'on-page du **contenu gaté**.

### 3-A. Socle technique — livrable (a), code committé SANS gate humain (s'exécute EN PREMIER)
Dès l'entrée d'étape, sur les **routes existantes** (landing de l'étape 12, pages légales) — **avant** même la recherche de mots-clés :
1. **Sitemap + robots** : **natifs du framework** — router via la **matrice M7** (Next.js App Router `app/sitemap.ts` + `app/robots.ts` ; Astro `@astrojs/sitemap` ; sinon `next-sitemap`). `robots` **bloque les zones authentifiées** (`/dashboard`, `/api`, zones privées) et référence le sitemap.
2. **Metadata + canonical par route** : title/description par route publique (nom du produit via `lib/brand.ts` + `title.template`, jamais en dur), **canonical sur chaque route** (anti-duplication).
3. **Structured data (JSON-LD)** : **`schema-dts`** — type via la **matrice M6** selon le type de site (`SoftwareApplication`/`Product` pour la landing, `BreadcrumbList` partout). Type-safe, **jamais de faux markup**.
4. **Core Web Vitals** : lancer **`unlighthouse`** (MIT) en CI — audit CWV/perf/SEO, en **gate** contre les seuils de la **matrice M8** (LCP / CLS / INP).
5. **Committer + consigner** : le socle part en **code committé immédiatement** — aucun gate humain (plomberie d'indexation, pas contenu public) — et s'ajoute au **livret QA** (`qa/test-booklet.md`, section « SEO technique ») : un check par élément, vérifié **comme une feature**.
- **Critère de passage :** `app/sitemap.ts` + `app/robots.ts` **committés** (robots bloque les zones auth) ; metadata + canonical sur chaque route publique ; JSON-LD valide ; `unlighthouse` **vert** ; section « SEO technique » du livret QA remplie.
- **Mode dégradé :** framework non couvert par les recettes → générer sitemap/robots au standard (XML sitemap + robots.txt), le documenter. `unlighthouse` échoue à s'installer → lancer Lighthouse simple, consigner les 3 métriques manuellement, ne pas sauter le check. Dans tous les cas : **on committe** — repousser le socle « en attente d'une validation » est un mode d'échec.

### 3-B. On-page des pages éditoriales (après les mécanismes 1-2)
1. **On-page par page** : title (≤60c) + description (≤155c) **uniques**, un seul **H1**, hiérarchie Hn logique, URL propre avec mot-clé, Open Graph / Twitter Card, **maillage interne** depuis la carte de clusters.
2. **Étendre le socle** aux pages retenues : entrée sitemap, canonical, JSON-LD (type via M6 : `Article`, `FAQPage` si Q/R réelles).
3. **Mobile** : responsive déjà couvert par le design system (étape 8) — vérifier, ne pas re-designer.
- **Critère de passage :** chaque page éditoriale a meta uniques + 1 H1 + canonical + schema valide + entrée sitemap ; `unlighthouse` re-passé **vert** avec les nouvelles pages (seuils M8, SEO + a11y OK).

---

## Mécanisme 4 — Gate qualité + publication (contenu éditorial SEULEMENT)

But : la **seule** porte du **contenu éditorial** vers le public. Aucune page éditoriale ne se publie sans passer la checklist bloquante **et** le gate humain. C'est le frein que l'open-source n'a pas. **Le socle technique (3-A) n'est pas concerné** : déjà committé, il n'attend pas ce gate et ne se re-négocie pas ici.

### Sous-procédure
1. **Passer la checklist bloquante** (`checklists-modes-echec.md` + `quality-guardrails.md`) : plafond respecté · chaque page PASS Helpful Content · E-E-A-T présent · zéro cannibalisation · technique verte.
2. **Un échec de checklist = retour arrière** : contenu → mécanisme 2 ; on-page → mécanisme 3-B. On ne « publie et on corrigera » pas.
3. **Gate humain** (`AskUserQuestion`, forcing-recipe dans `forcing-questions.md`) : montrer à l'humain **les pages + les mots-clés visés + le nombre**, et obtenir un **OK explicite**. Publier du contenu public au nom de l'utilisateur sans son OK = interdit (`_shared/safety-rails.md` §1).
4. **Publier** seulement après OK — l'indexation réelle se fait au déploiement (étape 17) ; ici on prépare et on valide.
- **Critère de passage :** checklist 100 % verte + **OK humain tracé** (date). Sinon : on ne publie pas.
- **Mode dégradé :** l'humain ne répond pas / veut réfléchir → **ne pas publier les pages éditoriales**, livrer l'état « prêt, en attente de validation », le consigner — le **socle technique reste committé** : le produit sort indexable proprement quoi qu'il advienne du gate. Ne jamais forcer la publication au budget de boucle (safety-rails §7 : présenter l'état, laisser trancher).

---

## Mécanisme 5 — Itération (post-lancement, GSC)

But : affiner sur de la **donnée réelle**, **dans la limite mesurée**. Ne s'ouvre qu'après le déploiement.

### Sous-procédure
1. **Lire Google Search Console** — **si provisionné en amont via `infra-setup`** (MCP GSC, gratuit ; M1) — une fois le site live et indexé (plusieurs jours de données minimum). Pas provisionné → constat honnête « pas de source de données réelles », suggérer le provisionnement (hors étape, via `infra-setup`), ne **rien** inventer.
2. **Lire les vrais signaux** : impressions, clics, CTR, position moyenne par page/requête.
3. **Router l'action** via la **matrice M9** (`decision-matrices.md`) : forte impression + faible CTR → retravailler title/description ; position 11-20 → renforcer la page (profondeur, maillage) ; requête non visée qui performe → l'intégrer à une page **existante** (pas une nouvelle page). 
4. **Rester sous le plafond** : l'itération **améliore** les pages existantes ; elle ne relance pas une production de masse. Ajouter une page = repasser par les mécanismes 1-4 (dont le gate), et seulement si un cluster défendable émerge des données.
- **Critère de passage :** au moins une action d'amélioration décidée sur donnée réelle, ou le constat honnête « trop tôt / trop peu de données, on re-regarde dans X jours ».
- **Mode dégradé :** pas encore de données GSC → **ne pas inventer** de tendance ; dire « pas assez de données », fixer un rappel, s'arrêter. C'est un mode d'échec classique de vouloir « optimiser » sur du bruit.

---

## Definition-of-Done du mécanisme (vue d'ensemble)
Le détail par artefact est dans `checklists-modes-echec.md`. En une ligne : **socle technique committé sans gate + consigné au livret QA**, **carte de clusters ancrée niche**, **N ≤ plafond de pages toutes PASS Helpful Content**, **technique verte (`unlighthouse`)**, **gate humain OK et tracé pour les pages éditoriales publiées** (sinon « prêt, en attente » consigné), **zéro secret**, état mis à jour, étape 17 annoncée.
