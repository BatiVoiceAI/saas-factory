# Référence — Matrices de décision (étape 16)

Condition → action, pour chaque point où l'étape **tranche sans interroger l'utilisateur** (le seul arrêt utilisateur est le gate humain de publication du contenu **éditorial**, mécanisme 4 — le socle technique 3-A se committe sans gate). On applique la matrice, on n'improvise pas. Ces matrices rendent l'étape **déterministe** et gardent le SEO du côté « qualité mesurée », jamais « volume ».

---

## Sommaire

- M1 — Source de données mots-clés → outil (mécanisme 1.2)
- M2 — Mot-clé → intention de recherche (mécanisme 1.5)
- M3 — Scoring d'opportunité d'un mot-clé (mécanisme 1.5 & 2.2)
- M4 — Combien de pages générer ? (mécanisme 2.1) — LE PLAFOND DUR
- M5 — Deux clusters se cannibalisent-ils ? (mécanisme 2.3)
- M6 — Type de schema JSON-LD à poser (mécanismes 3-A et 3-B, `schema-dts`)
- M7 — Sitemap / robots selon le stack (mécanisme 3-A — socle committé sans gate)
- M8 — Seuils Core Web Vitals (mécanisme 3-A, re-passé en 3-B — `unlighthouse` en gate)
- M9 — Action d'itération sur donnée GSC (mécanisme 5.3)

## M1 — Source de données mots-clés → outil (mécanisme 1.2)

**Le défaut est GRATUIT et assumé** : recherche web manuelle + heuristiques. Les outils data sont un **upgrade optionnel**, utilisés **seulement s'ils ont été provisionnés en amont via `infra-setup`** — on ne demande **jamais** une config d'API en cours d'étape. Une seule source à la fois, on ne cumule pas.

| Situation | Source à utiliser | Ce qu'on en tire | Limite |
|---|---|---|---|
| **Défaut** (rien de provisionné) | **Fallback gratuit assumé** : Google Suggest + People Also Ask + recherches associées + concurrents (`research/market.md`), via recherche web manuelle | intentions, longue traîne, questions, SERP observée | volumes **estimés**, à marquer `[estimé, non mesuré]` |
| **DataForSEO provisionné** (`infra-setup`) | **MCP DataForSEO** (upgrade optionnel — Apache, cheap) | volume, difficulté, SERP mesurés | coût minime à la requête |
| **Ahrefs provisionné** (`infra-setup`) | **MCP Ahrefs** (upgrade optionnel — premium) | métriques riches, backlinks | uniquement si déjà branché |
| **Post-lancement, GSC provisionné** | **MCP Google Search Console** (gratuit) | données **réelles** (impressions/clics) | seulement au mécanisme 5 ; sans GSC → constat honnête « pas de données », rien d'inventé |

**Règles :**
- Le fallback gratuit n'est **pas un mode dégradé** : c'est le régime nominal, suffisant pour une base SEO de qualité mesurée (la priorisation M3 pèse fit × accessibilité **avant** volume).
- Ne **jamais** inventer un chiffre de volume. Sans source mesurée (le cas par défaut), les volumes sont `[estimé]` et on priorise par pertinence produit + longue traîne, pas par un faux chiffre.
- Un outil non provisionné ne se configure pas ici : c'est le job de `infra-setup`, une fois, en amont. Pas de demande de clé API ad hoc en cours de route.
- La **garde d'entrée par type reste inchangée** : `type != public` ⇒ pas de SEO du tout (garde d'entrée, `procedure-detaillee.md`) — aucune source, gratuite ou payante, ne s'y substitue.

---

## M2 — Mot-clé → intention de recherche (mécanisme 1.5)

Classer chaque mot-clé. L'intention décide le **type de page** et si le mot-clé sert le produit.

| Intention | Signaux typiques | Type de page qui répond | Priorité micro-SaaS |
|---|---|---|---|
| **Informationnelle** | « comment », « qu'est-ce que », « guide » | article / ressource / pillar | moyenne (haut de funnel) |
| **Commerciale** | « meilleur », « vs », « alternative à », « avis » | page comparaison / cas d'usage | **haute** (proche de l'achat) |
| **Transactionnelle** | « prix », « logiciel de {tâche} », « outil {métier} » | landing / page produit | **haute** (bas de funnel) |
| **Navigationnelle** | nom de marque (concurrent) | — | **basse** (on ne se place pas dessus) |

**Règle :** un micro-SaaS priorise **commercial + transactionnel proche du produit** (conversion) et **une** pillar informationnelle d'ancrage. Le pur informationnel générique = trafic non qualifié, on ne s'y disperse pas.

---

## M3 — Scoring d'opportunité d'un mot-clé (mécanisme 1.5 & 2.2)

Garder la **longue traîne accessible**. On ne se place PAS sur les génériques concurrentiels. Trancher condition par condition :

| Condition | Verdict | Action |
|---|---|---|
| Difficulté **basse** + fit produit **fort** + intention comm./trans. | **Cible prioritaire** | en faire un cluster clé → une page |
| Difficulté basse + fit produit fort + intention info | **Cible secondaire** | pillar ou section, pas une page dédiée si peu de volume |
| Difficulté **haute** (mot générique, gros acteurs en SERP) | **Rejet** | un micro-SaaS ne gagne pas là ; chercher la longue traîne du même thème |
| Volume **nul** ET pas de valeur de conversion | **Rejet** | personne ne cherche, pas de page |
| Fit produit **faible** (hors périmètre) | **Rejet** | trafic non qualifié, ignore |
| Longue traîne, volume modeste, **fit fort**, difficulté basse | **Cible idéale** | c'est là qu'un micro-SaaS gagne — priorise |

**Heuristique de tri :** priorité ≈ (fit produit × accessibilité) **avant** volume. Une requête à 50 recherches/mois qu'on peut gagner et qui convertit > une requête à 5000 qu'on ne rankera jamais.

---

## M4 — Combien de pages générer ? (mécanisme 2.1) — LE PLAFOND DUR

| Nb de clusters clés défendables | Pages à produire | Note |
|---|---|---|
| 0 cluster défendable | **Landing seule** | on ne fabrique pas de contenu pour du contenu |
| 1-2 clusters | Landing + 1-2 pages | rester sous le plafond, ne pas gonfler |
| 3-8 clusters | Landing + **3 à 8 pages** (1/cluster) | zone nominale |
| **> 8 clusters** | **Landing + 8 max** | garder les 8 meilleurs (M3) ; le reste attend l'itération (M9) |

**Règles dures :**
- Le plafond (landing + 8) est un **maximum**, pas un quota. Produire moins est parfaitement valide.
- Dépasser le plafond = **refusé** (`quality-guardrails.md` §1 : au-delà = `scaled content abuse` Google).
- **Interdit :** générer N pages depuis une DB / un template varié en masse (programmatic SEO). Une page = un cluster = une rédaction soignée.

---

## M5 — Deux clusters se cannibalisent-ils ? (mécanisme 2.3)

| Condition | Verdict | Action |
|---|---|---|
| Deux clusters partagent **l'essentiel de la SERP** (mêmes URLs classées) | **Cannibalisation** | **fusionner** en une seule page, une seule intention |
| Deux intentions **distinctes** malgré un thème commun | OK | deux pages, chacune son intention |
| Une page existante couvre déjà l'intention | **Doublon** | enrichir l'existante, ne pas créer de 2e page |

**Règle :** deux pages ne ciblent **jamais** la même intention — sinon elles se concurrencent dans les SERP et diluent le signal (`quality-guardrails.md` §4).

---

## M6 — Type de schema JSON-LD à poser (mécanismes 3-A et 3-B, `schema-dts`)

| Page | Type schema.org | Champs clés |
|---|---|---|
| **Landing produit SaaS** | `SoftwareApplication` (ou `Product`) | name, description, offers (prix), aggregateRating si réel |
| **Page comparaison / cas d'usage** | `Article` (+ `BreadcrumbList`) | headline, author, datePublished |
| **Page avec Q/R** | `FAQPage` | mainEntity (question/acceptedAnswer) — **uniquement si les Q/R existent vraiment** |
| **Article / guide (pillar)** | `Article` | headline, author, datePublished, dateModified |
| **Toutes** | `BreadcrumbList` | fil d'ariane cohérent avec l'URL |

**Règles :**
- **Type-safe via `schema-dts`** — pas de JSON-LD écrit à la main.
- **Jamais de faux markup** : pas de `aggregateRating` sans avis réels, pas de `FAQPage` sans FAQ visible sur la page (Google pénalise le structured data trompeur).

---

## M7 — Sitemap / robots selon le stack (mécanisme 3-A — socle committé sans gate)

Router selon le framework généré par la Factory (Phase 3). **Natif d'abord.**

| Stack | Sitemap | Robots | Canonical |
|---|---|---|---|
| **Next.js App Router** | `app/sitemap.ts` (natif) | `app/robots.ts` (natif) | `metadata.alternates.canonical` par page |
| **Astro** | `@astrojs/sitemap` (intégration) | `public/robots.txt` | `<link rel="canonical">` dans le layout |
| **Autre / SSR custom** | `next-sitemap` (MIT) ou génération XML au standard | `robots.txt` statique | balise canonical manuelle |
| **Framework non couvert** | générer un `sitemap.xml` au standard + le documenter | `robots.txt` au standard | canonical manuel, vérifié |

**Règle :** **canonical sur chaque page** (anti-duplication). On ne réinvente pas un générateur de sitemap : natif > lib éprouvée > standard manuel.

---

## M8 — Seuils Core Web Vitals (mécanisme 3-A, re-passé en 3-B — `unlighthouse` en gate)

| Métrique | Seuil « bon » (gate PASS) | À revoir | Mauvais |
|---|---|---|---|
| **LCP** (Largest Contentful Paint) | ≤ 2,5 s | 2,5-4,0 s | > 4,0 s |
| **CLS** (Cumulative Layout Shift) | ≤ 0,1 | 0,1-0,25 | > 0,25 |
| **INP** (Interaction to Next Paint) | ≤ 200 ms | 200-500 ms | > 500 ms |

**Règle :** `unlighthouse` en **gate** — les 3 métriques dans le vert (+ score SEO et a11y OK) avant de considérer le mécanisme 3-A (puis 3-B) fait. « À revoir » ou « mauvais » sur une métrique → corriger (image lourde → optimiser/lazy, layout shift → dimensions fixes, JS bloquant → défer) puis re-mesurer. On ne publie pas une landing rouge.

---

## M9 — Action d'itération sur donnée GSC (mécanisme 5.3)

| Signal GSC réel | Diagnostic | Action (sous plafond) |
|---|---|---|
| Fortes impressions + **CTR faible** | title/description peu incitatifs | retravailler meta title + description de la page |
| Position **11-20** (page 2) | contenu presque suffisant | renforcer la page (profondeur, maillage interne, exemples) |
| Position **21+** stable | trop concurrentiel pour ce cluster | accepter / réorienter vers une longue traîne plus accessible |
| **Requête non visée** qui performe | intention proche non couverte | l'intégrer à une page **existante** (pas une nouvelle page) |
| Page **zéro impression** après semaines | non indexée ou hors intention | vérifier indexation/canonical ; sinon envisager de la couper |
| Pas assez de données | trop tôt | **ne rien inventer**, re-regarder plus tard |

**Règle :** l'itération **améliore l'existant**. Créer une nouvelle page = repasser par les mécanismes 1-4 (dont le gate humain), et seulement si un **cluster défendable** émerge des données réelles — jamais pour « couvrir plus de mots-clés ».
