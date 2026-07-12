# Référence — Pricing (mouvements 5-6)

Procédure normée pour poser le prix (`product/pricing.md`). C'est la **seule variable qui touche directement le revenu** — donc la moitié qu'on soigne, même dans une étape volontairement légère.

> **Garde type — `type = public` UNIQUEMENT.** Cette procédure produit un pricing **marché** : elle ne s'exécute que pour un produit public (type lu dans `research/idea-brief.md`). `interne` → pas de paliers ni de freemium : **ROI interne** ~10 lignes dans `business-model.md` (SKILL.md §« Mode interne »). `perso` → sautée. `product/pricing.md` n'existe que pour le type `public`.

> **Vendoring à venir.** On vendorera plus tard un skill de pricing dédié (`coreyhaines31/marketingskills:pricing`). En attendant, applique **cette** procédure — ne l'improvise pas.

## L'axiome : ancrer sur la VALEUR, jamais sur le coût
Un prix **cost-plus** (« mon hosting coûte X, je mets une marge ») laisse de l'argent sur la table et **sous-vend l'edge**. Le prix se justifie par la **valeur du job résolu** (Value Proposition Canvas) mesurée **contre l'alternative actuelle** — ce que la cible **paie ou perd aujourd'hui** sans l'outil.

```
  ALTERNATIVE ACTUELLE  ─────────────────────────────────────────▶  plafond de valeur
  (ce que la cible paie / perd aujourd'hui : temps, erreurs,
   outil concurrent, salaire d'un remplaçant humain)
        │
        │   ← ton prix se situe ICI : une fraction de la valeur créée,
        │      au-dessus de ton coût, ancré par le benchmark concurrent
        ▼
  BENCHMARK CONCURRENT  ───────────────────────────────────────────  ancre de marché
  (point d'entrée / point haut relevés dans research/market.md)
        │
        ▼
  COÛT MARGINAL  ──────────────────────────────────────────────────  plancher (à ne PAS utiliser comme prix)
  (infra + API/LLM par utilisateur)
```

Le prix vit dans la bande **entre le benchmark et le plafond de valeur**, jamais collé au plancher de coût.

## Procédure (déterministe, 4 mouvements)

### 5.1 — Benchmark : relever l'ancre de marché
- **Source :** `research/market.md` (prix concurrents relevés à l'étape 2). **Ne re-scrape rien** — la donnée existe.
- **Relever** pour 3-5 concurrents : **point d'entrée** (palier payant le moins cher), **point haut** (palier le plus cher hors « enterprise sur devis »), **inclus par palier**, **axe de scaling** utilisé (siège / usage / volume / features).
- **Produire** deux chiffres de cadrage : le **plancher de marché** (entrée la plus basse) et le **plafond de marché** (haut le plus élevé), + le **whitespace** (une bande de prix / un axe que personne n'occupe).
- **Critère de passage :** tu peux nommer où se situe le marché **et** un trou tarifaire crédible.
- **Mode dégradé :** si `market.md` n'a pas de prix relevés → le dire honnêtement dans `pricing.md` (« benchmark absent, prix posés aux premiers principes, `[Assumption]` renforcée »), ne pas inventer de faux relevés.

### 5.2 — Ancrage sur la valeur
- Reprendre le **job résolu** (bloc 1 du canvas / VPC) et l'**alternative actuelle**.
- Chiffrer, même grossièrement, la **valeur** : heures économisées × taux horaire, erreurs évitées, coût de l'outil remplacé, revenu débloqué.
- Situer le prix comme une **fraction** de cette valeur (le client garde le surplus → raison d'acheter).
- **Critère de passage :** une phrase du type « l'alternative coûte ~V ; à un prix P << V, le client gagne V−P » figure dans la justification.

### 5.3 — Choisir modèle & axe de scaling
Modèle micro-SaaS standard : **freemium** ou **free-trial** + **2 à 3 paliers payants** (Starter / Pro / Team) avec **un** axe de scaling clair.

**Décision — freemium vs free-trial :**

| Condition | Choix | Pourquoi |
|---|---|---|
| Coût marginal par utilisateur gratuit **quasi nul** + le produit gagne à être **viral / vu** | **Freemium** | Le gratuit est un canal d'acquisition, pas une charge |
| Coût marginal par utilisateur **significatif** (LLM lourd, calcul, stockage) | **Free-trial** (limité dans le temps) | Un gratuit permanent saigne la marge (recoupe bloc 7 coûts) |
| Valeur évidente en <14 j, cible pressée | **Free-trial** court (7-14 j) | Force la décision d'achat |
| « Aha » lent, valeur qui s'accumule | **Freemium** (plafond bas) | Laisse le temps à l'accroche |

**Décision — axe de scaling (une seule métrique de valeur) :**

| Nature du produit | Axe de scaling | Métrique |
|---|---|---|
| Valeur ∝ nombre d'utilisateurs internes | **Par siège** | utilisateurs / membres |
| Valeur ∝ volume produit (coût marginal ∝ usage) | **Par usage** | actions, générations, requêtes/mois |
| Valeur ∝ taille gérée | **Par volume** | contacts, projets, Go stockés |
| Solo par nature (1 utilisateur = tout le job) | **Par features / limites** | débloque capacités, pas des sièges |

- **Règle :** **une seule** métrique de valeur pour scaler (pas siège **et** usage **et** volume — illisible). Elle doit **corréler à la valeur perçue** ET, si le coût marginal scale, **protéger la marge**.
- **Nombre de paliers :** **2 à 3 payants**. **Jamais >3** (paralysie du choix). 2 si l'offre est simple, 3 si un palier « équipe » se justifie.

### 5.4 — Ancrer les paliers (structure de l'échelle)
Trois rôles, dans cet ordre de conception :

```
   ┌─────────────────────────────────────────────────────────┐
   │  ANCRE (haut)   Team / Pro+   prix élevé                 │  ← rend le palier cible "raisonnable"
   ├─────────────────────────────────────────────────────────┤
   │  CIBLE          Pro           ●●●  le palier que         │  ← celui que l'early adopter prend en 1er
   │                               l'early adopter prend       │     (à NOMMER explicitement)
   ├─────────────────────────────────────────────────────────┤
   │  ENTRÉE         Starter       prix bas                   │  ← réduit la friction d'essai
   ├─────────────────────────────────────────────────────────┤
   │  (Free / Trial) accroche                                 │
   └─────────────────────────────────────────────────────────┘
```

- **Ancre haute** : un palier volontairement premium **rend le palier cible raisonnable** par contraste (effet d'ancrage). Il n'a pas besoin de se vendre beaucoup.
- **Cible** : le palier que l'early adopter prend **en premier** — celui qu'on **optimise** et qu'on **nomme explicitement** dans le doc.
- **Entrée bas** : réduit la friction ; ne doit pas cannibaliser la cible (garder une limite qui pousse à monter).
- **Critère de passage :** le palier cible est nommé ; l'écart de prix entre paliers est **justifié par un saut de valeur** (pas +5 € arbitraire) ; chaque palier a une **limite** claire sur l'axe de scaling qui motive l'upgrade.

## Écrire `product/pricing.md`
Template `assets/templates/pricing.md`. Doit contenir :
1. **Modèle** (freemium/trial + N paliers) et **axe de scaling** en une ligne.
2. **Table des paliers** : Palier · Prix · Pour qui · Inclus · Limite.
3. **Palier cible** nommé.
4. **Ancrage** : benchmark (entrée/haut/whitespace ← `market.md`) **+** ancrage valeur (vs alternative actuelle).
5. **Hypothèses** : tous les prix marqués **`[Assumption]`** — à valider, pas une vérité.

## Checklist Definition-of-Done (pricing.md)
- [ ] Benchmark relevé depuis `market.md` (ou mode dégradé assumé si absent).
- [ ] Prix **ancré valeur**, pas cost-plus (justification vs alternative actuelle présente).
- [ ] **Un seul** axe de scaling, corrélé à la valeur (et à la marge si le coût scale).
- [ ] Modèle freemium **ou** trial choisi via la matrice coût marginal.
- [ ] **2-3** paliers payants, **jamais >3**.
- [ ] Rôles ancre / cible / entrée présents ; **palier cible nommé**.
- [ ] Chaque palier : limite claire sur l'axe de scaling.
- [ ] Écarts de prix justifiés par un saut de valeur.
- [ ] Tous les prix marqués **`[Assumption]`**.
- [ ] Cohérent Phase 1 (mêmes cible/edge) et cohérent bloc 7 du canvas (coûts).
- [ ] Aucun secret / clé dans le fichier.

## Modes d'échec (et comment les gérer)

| Mode d'échec | Symptôme | Correction |
|---|---|---|
| **Cost-plus** | « hosting = X, donc prix = X × marge » | Repartir de la valeur du job vs alternative actuelle ; le coût n'est qu'un plancher |
| **Sous-tarification de l'edge** | Prix collé au plancher de marché alors que la valeur est supérieure | Remonter dans la bande valeur ; l'edge justifie une prime |
| **Trop de paliers** | 4+ paliers, colonnes qui se ressemblent | Fusionner ; 3 max ; supprimer les paliers sans saut de valeur |
| **Axe de scaling multiple** | Prix à la fois par siège, usage et volume | En choisir **un** : celui qui corrèle le mieux à la valeur perçue |
| **Paliers indistincts** | Impossible de dire pourquoi upgrader | Poser une **limite** nette sur l'axe de scaling à chaque palier |
| **Freemium qui saigne** | Gratuit permanent avec coût marginal élevé | Basculer en free-trial (matrice 5.3) |
| **Prix présenté comme vérité** | Aucun `[Assumption]`, ton affirmatif | Marquer chaque prix `[Assumption]` + lister les hypothèses à tester |
| **Benchmark fabriqué** | Prix concurrents « inventés » faute de `market.md` | Mode dégradé honnête : dire que le benchmark manque, prix aux premiers principes |
| **Débordement financier** | Projections MRR, cohortes, LTV/CAC | Retirer : financials détaillés hors Phase 2 |

## Micro-exemples (niche-agnostiques)

- **Ancrage valeur vs cost-plus.**
  - Cost-plus (✗) : « L'API me coûte 0,02 €/action, je facture 0,05 €. »
  - Valeur (✓) : « Chaque livrable remplace ~1 h de travail manuel (~40 € de valeur) ; à 15 €/mois pour 50 livrables, le client garde l'essentiel du surplus. »
- **Choix d'axe.** Produit IA au coût marginal réel → **par usage** (générations/mois) : le prix suit la valeur **et** protège la marge. Un CRUD collaboratif au coût quasi nul → **par siège**.
- **Échelle ancrée (forme, prix illustratifs `[Assumption]`).**
  - Free : 3 unités/mois (accroche).
  - **Starter** (entrée) : petit prix, plafond bas — pour tester.
  - **Pro** (cible ●) : le sweet spot de l'early adopter, limite généreuse.
  - **Team** (ancre) : premium multi-sièges — rend Pro raisonnable par contraste.
- **Écart justifié.** Pro → Team ne se justifie **pas** par « +10 € » mais par « sièges partagés + rôles + limite ×5 » (un vrai saut de valeur).
