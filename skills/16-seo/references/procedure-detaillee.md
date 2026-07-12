# Référence — Procédure détaillée (mécanismes 1-5)

Sous-procédure exhaustive de l'étape 16. Le SKILL.md est le chef d'orchestre ; ici vit le **quoi faire / dans quel ordre / avec quel critère de passage** pour chacun des 5 mécanismes. Principe directeur non négociable, qui prime sur tout : **qualité mesurée, jamais du volume** (`quality-guardrails.md`). Aucun mécanisme ne produit une page qui n'a pas passé le self-assessment Helpful Content, et **rien ne se publie sans le gate humain**.

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

## Machine à états — le pipeline des 5 mécanismes

```
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
 │ 3. On-page + technique       (technical-seo.md)                     │
 │    meta/Hn/URL/OG · schema-dts JSON-LD · sitemap/robots/canonical   │
 │    · Core Web Vitals (unlighthouse en CI)                           │
 └───────────────────────────────┬────────────────────────────────────┘
                                 ▼
 ┌────────────────────────────────────────────────────────────────────┐
 │ 4. GATE qualité + publication  (quality-guardrails.md)              │
 │    checklist bloquante → GATE HUMAIN (AskUserQuestion) → publier    │
 │    ┌── refus/à revoir ──▶ retour au mécanisme concerné (2 ou 3)     │
 └────┴──────────────────────────┬────────────────────────────────────┘
                          publié │
                                 ▼
 ┌────────────────────────────────────────────────────────────────────┐
 │ 5. Itération (post-lancement, GSC)                                  │
 │    impressions/clics/position réels → affiner DANS la limite mesurée│
 └────────────────────────────────────────────────────────────────────┘
```

**Règle de convergence :** les mécanismes 1→3 se font **avant** toute publication. Le mécanisme 4 est la **seule** porte de sortie vers le public ; un « à revoir » y renvoie en 2 (contenu) ou 3 (technique), jamais en avant. Le mécanisme 5 ne s'ouvre qu'**après** le déploiement (étape 17) — on ne peut pas itérer sur de la donnée GSC qui n'existe pas encore.

## Data-flow — qui alimente quoi

```
research/positioning.md ─(catégorie, angle, niche, feel)─┐
research/idea-brief.md ──(cible, écosystème, type)────────┼─▶ seeds mots-clés ─▶ topic-cluster-map.md
product/product-spec.md ─(features = intentions)──────────┘                          │
research/market.md ──────(concurrents = SERP à observer)──────────────────────────────┤
                                                                                       ▼
topic-cluster-map.md ─(1 cluster clé = 1 page)─▶ liste de pages (plafonnée) ─▶ pages en code
DESIGN.md ─(tokens, composants, landing existante)─▶ intégration on-page (mécanisme 3)
pages en code ─▶ meta/schema/sitemap ─▶ unlighthouse (gate CWV) ─▶ gate humain ─▶ PUBLIÉ
PUBLIÉ + temps ─▶ Google Search Console ─▶ itération (mécanisme 5)
```

Rien ne remonte : l'étape 16 **consomme** les phases 1-4 (positioning, PRD, design, build), ne les réécrit pas. Un input manquant → mode dégradé honnête (voir chaque mécanisme), **jamais** d'invention de mots-clés ou de métriques.

---

## Mécanisme 1 — Mots-clés → clusters

But : trouver les bons mots-clés **selon la niche** (jamais au hasard, jamais page blanche) et les structurer en clusters exploitables. Détail complet : `keyword-research.md`. Ici, l'ossature procédurale et les critères.

### Sous-procédure
1. **Ancrer** sur le projet : lire `research/positioning.md` (catégorie, angle, niche), `research/idea-brief.md` (cible, écosystème), le PRD (features = intentions de recherche). C'est ça qui cadre — pas l'imagination.
2. **Choisir la source data** via la **matrice M1** (`decision-matrices.md`) : MCP DataForSEO (défaut) / Ahrefs (si connecté) / fallback gratuit (Google Suggest, People Also Ask, concurrents de `research/market.md`). GSC n'entre qu'au mécanisme 5.
3. **Seed** : dériver 10-30 mots-clés graines de la niche + positionnement + features.
4. **Étendre** : via la data — variations, longue traîne, questions.
5. **Qualifier** chaque mot-clé via la **matrice M2** (intention) et le **scoring d'opportunité M3** : on garde la **longue traîne accessible**, on jette les génériques concurrentiels.
6. **Clusteriser** par **SERP-overlap** (mêmes résultats en SERP ⇒ même cluster) : une **pillar** + des clusters priorisés.
7. **Mapper** : cluster clé → **une page** + le **maillage interne** (pillar ↔ clusters, anti-orphelins).
- **Critère de passage :** `seo/topic-cluster-map.md` rempli — 1 pillar + N clusters priorisés (intention · difficulté · volume · opportunité) + mapping page + maillage. Chaque cluster retenu a un « pourquoi on peut gagner ici » explicite.
- **Mode dégradé :** aucune source data disponible (pas de MCP, pas d'accès) → fallback gratuit (Suggest + PAA + concurrents), marquer les volumes `[estimé, non mesuré]`, ne **jamais** inventer un chiffre de volume précis. Positioning absent → s'arrêter proprement, dire qu'il faut la Phase 1, ne pas fabriquer une niche.

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

## Mécanisme 3 — On-page + technique

But : générer le code SEO dans le micro-SaaS. **Vendore les libs éprouvées, ne réinvente pas.** Détail complet : `technical-seo.md`. Ici, l'ossature et les critères.

### Sous-procédure
1. **On-page par page** : title (≤60c) + description (≤155c) **uniques**, un seul **H1**, hiérarchie Hn logique, URL propre avec mot-clé, Open Graph / Twitter Card, **maillage interne** depuis la carte de clusters.
2. **Structured data (JSON-LD)** : **`schema-dts`** — sélectionner le type via la **matrice M6** (Product / FAQPage / Article / SoftwareApplication…). Type-safe, pas de JSON-LD à la main bancal.
3. **Sitemap + robots + canonical** : **natifs du framework** — router via la **matrice M7** (Next.js App Router `sitemap.ts`+`robots.ts` ; Astro `@astrojs/sitemap` ; sinon `next-sitemap`). **Canonical** sur chaque page (anti-duplication).
4. **Core Web Vitals** : lancer **`unlighthouse`** (MIT) en CI — audit CWV/perf/SEO sur tout le site, en **gate** contre les seuils de la **matrice M8** (LCP / CLS / INP).
5. **Mobile** : responsive déjà couvert par le design system (étape 8) — vérifier, ne pas re-designer.
- **Critère de passage :** chaque page a meta uniques + 1 H1 + canonical + schema valide ; sitemap/robots générés ; `unlighthouse` **vert** (CWV dans les seuils M8, SEO + a11y OK).
- **Mode dégradé :** framework non couvert par les recettes → générer sitemap/robots au standard (XML sitemap + robots.txt), le documenter. `unlighthouse` échoue à s'installer → lancer Lighthouse simple, consigner les 3 métriques manuellement, ne pas sauter le check.

---

## Mécanisme 4 — Gate qualité + publication

But : la **seule** porte vers le public. Rien ne se publie sans passer la checklist bloquante **et** le gate humain. C'est le frein que l'open-source n'a pas.

### Sous-procédure
1. **Passer la checklist bloquante** (`checklists-modes-echec.md` + `quality-guardrails.md`) : plafond respecté · chaque page PASS Helpful Content · E-E-A-T présent · zéro cannibalisation · technique verte.
2. **Un échec de checklist = retour arrière** : contenu → mécanisme 2 ; technique → mécanisme 3. On ne « publie et on corrigera » pas.
3. **Gate humain** (`AskUserQuestion`, forcing-recipe dans `forcing-questions.md`) : montrer à l'humain **les pages + les mots-clés visés + le nombre**, et obtenir un **OK explicite**. Publier du contenu public au nom de l'utilisateur sans son OK = interdit (`_shared/safety-rails.md` §1).
4. **Publier** seulement après OK — l'indexation réelle se fait au déploiement (étape 17) ; ici on prépare et on valide.
- **Critère de passage :** checklist 100 % verte + **OK humain tracé** (date). Sinon : on ne publie pas.
- **Mode dégradé :** l'humain ne répond pas / veut réfléchir → **ne pas publier**, livrer l'état « prêt, en attente de validation », le consigner. Ne jamais forcer la publication au budget de boucle (safety-rails §7 : présenter l'état, laisser trancher).

---

## Mécanisme 5 — Itération (post-lancement, GSC)

But : affiner sur de la **donnée réelle**, **dans la limite mesurée**. Ne s'ouvre qu'après le déploiement.

### Sous-procédure
1. **Brancher Google Search Console** (MCP GSC, gratuit) une fois le site live et indexé (plusieurs jours de données minimum).
2. **Lire les vrais signaux** : impressions, clics, CTR, position moyenne par page/requête.
3. **Router l'action** via la **matrice M9** (`decision-matrices.md`) : forte impression + faible CTR → retravailler title/description ; position 11-20 → renforcer la page (profondeur, maillage) ; requête non visée qui performe → l'intégrer à une page **existante** (pas une nouvelle page). 
4. **Rester sous le plafond** : l'itération **améliore** les pages existantes ; elle ne relance pas une production de masse. Ajouter une page = repasser par les mécanismes 1-4 (dont le gate), et seulement si un cluster défendable émerge des données.
- **Critère de passage :** au moins une action d'amélioration décidée sur donnée réelle, ou le constat honnête « trop tôt / trop peu de données, on re-regarde dans X jours ».
- **Mode dégradé :** pas encore de données GSC → **ne pas inventer** de tendance ; dire « pas assez de données », fixer un rappel, s'arrêter. C'est un mode d'échec classique de vouloir « optimiser » sur du bruit.

---

## Definition-of-Done du mécanisme (vue d'ensemble)
Le détail par artefact est dans `checklists-modes-echec.md`. En une ligne : **carte de clusters ancrée niche**, **N ≤ plafond de pages toutes PASS Helpful Content**, **technique verte (`unlighthouse`)**, **gate humain OK et tracé**, **zéro secret**, état mis à jour, étape 17 annoncée.
