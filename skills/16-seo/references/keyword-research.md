# Référence — Recherche de mots-clés → clusters (mécanisme 1)

Procédure normée : trouver les bons mots-clés et les structurer, **selon la niche** (pas au hasard).

## Sources (ancrage projet)
`research/positioning.md` (catégorie, angle, niche), `research/idea-brief.md` (cible, écosystème), le PRD (features = intentions de recherche). C'est ça qui cadre les mots-clés — jamais de page blanche.

## Data (une source par défaut)
- **Défaut : MCP DataForSEO** (Apache, cheap) — volume, difficulté, SERP.
- **Option : MCP Ahrefs** (si connecté) — premium.
- **Itération : MCP Google Search Console** (gratuit) — données **réelles** post-lancement.
- **Fallback gratuit** (sans MCP) : Google Suggest, People Also Ask, analyse des concurrents (de `research/market.md`).

## Procédure
1. **Seed** : dérive 10-30 mots-clés graines de la niche + positionnement + features.
2. **Étendre** : via la data (variations, longue traîne, questions).
3. **Qualifier** : intention (informationnelle / commerciale / transactionnelle), difficulté, volume, **fit produit**. On vise la **longue traîne accessible** — un micro-SaaS ne se place **pas** sur les mots génériques concurrentiels.
4. **Clusteriser** : regroupe par **intention/thème** (technique **SERP-overlap** : mêmes résultats ⇒ même cluster). Une **pillar** + des clusters priorisés.
5. **Mapper** : cluster → **une page** par cluster clé + le **maillage interne** (pillar ↔ clusters, anti-orphelins).

## Sortie
`seo/topic-cluster-map.md` (template) : pillar + clusters priorisés (intention, difficulté, volume) + mapping page + maillage. **Priorise la longue traîne où on peut réellement gagner.**

---

## Détail des 5 étapes (quoi faire / critère de passage)

### 1. Seed — 10-30 graines ancrées niche
Trois puits, jamais la page blanche :
- **Niche + positionnement** (`positioning.md`) : la catégorie, l'angle, le vocabulaire du best-fit client.
- **Features du PRD** : chaque feature Must est une **intention de recherche** (« comment faire {tâche} », « outil pour {tâche} »).
- **Vocabulaire de la cible** : les mots que l'utilisateur tape, pas le jargon interne.
- **Critère de passage :** 10-30 graines, chacune reliée à un élément concret (angle / feature / douleur). Une graine sans ancrage = à jeter.

### 2. Étendre — via la data (M1)
Chaque graine → variations, longue traîne, questions :
- **DataForSEO / Ahrefs** : suggestions, « also rank for », questions.
- **Fallback gratuit** : Google Suggest (autocomplétion), People Also Ask, colonne « recherches associées », mots-clés visibles chez les concurrents (`research/market.md`).
- **Critère de passage :** chaque graine a produit ses variations longue traîne + les questions associées. On a un pool large avant de trier.

### 3. Qualifier — intention + opportunité (M2, M3)
Pour chaque mot-clé du pool :
- **Intention** (M2 de `decision-matrices.md`) : info / commerciale / transactionnelle / navigationnelle.
- **Difficulté** : qui rank déjà ? (gros acteurs en SERP ⇒ difficulté haute ⇒ on écarte).
- **Volume** : mesuré (M1) ou `[estimé, non mesuré]` — **jamais** un faux chiffre.
- **Fit produit** : la page répondrait-elle vraiment à cette requête ?
- **Scoring** (M3) : priorité ≈ **fit × accessibilité avant volume**. On vise la **longue traîne accessible** ; un micro-SaaS ne se place **pas** sur les génériques concurrentiels.
- **Critère de passage :** chaque mot-clé retenu passe M3 (fit fort + accessible). Les génériques et le hors-périmètre sont écartés, tracés « rejet + raison ».

### 4. Clusteriser — par SERP-overlap
Regrouper par **intention/thème** avec la technique **SERP-overlap** : si deux mots-clés renvoient **la même SERP** (mêmes URLs classées), Google les traite comme la même intention ⇒ **même cluster ⇒ une seule page** (sinon cannibalisation, M5). On obtient **une pillar** (thème cœur) + des **clusters priorisés**.
- **Critère de passage :** chaque cluster = une intention homogène ; aucun mot-clé orphelin ; pillar identifiée.

### 5. Mapper — cluster → page + maillage
- **Cluster clé → une page** (dans la limite du plafond, M4).
- **Maillage interne** : pillar ↔ clusters, chaque page reliée (anti-orphelins). La pillar pointe vers ses clusters ; chaque cluster remonte vers la pillar.
- **Critère de passage :** carte complète — 1 pillar, N clusters priorisés, mapping page, maillage sans orphelin.

## Micro-exemple (niche-agnostique)
Niche : *outil de {tâche} pour {métier de terrain}*.
- Graine : « logiciel {tâche} {métier} » (générique, difficulté haute → **pas une page cible**, mais la pillar).
- Longue traîne accessible : « {tâche} depuis mobile en {contexte de terrain} », « modèle {document} pour {métier} », « comment éviter {douleur précise} » → **clusters cibles** (fit fort, concurrence faible).
- SERP-overlap : « modèle {document} {métier} » et « exemple {document} {métier} » partagent la SERP → **un seul cluster, une page**.
- Résultat : 1 pillar + 3-4 pages longue traîne, pas 20 pages génériques.

## Modes d'échec fréquents
- **Viser le générique** (« logiciel {catégorie} ») : on ne rankera jamais → longue traîne (M3).
- **Volume inventé** : chiffres précis sans source → `[estimé]` ou brancher M1.
- **Clusters cannibales** : deux pages même SERP → fusionner (M5).
- **Page blanche** : mots-clés sortis de l'imagination → toujours ancrer sur positioning + PRD.
