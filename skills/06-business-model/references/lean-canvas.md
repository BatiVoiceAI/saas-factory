# Référence — Lean Canvas (mouvements 1-4)

Procédure exhaustive pour poser le **business model en 1 page** (`product/business-model.md`). Tu **exécutes** le moteur vendoré `startup-design` (Phase 4 « Strategy », `references/frameworks.md`) ; tu ne refais pas la stratégie. Le Lean Canvas d'un micro-SaaS niché est **déjà largement tranché en Phase 1** — ce fichier dit exactement **quel bloc vient d'où**, **dans quel ordre**, et **quoi faire quand la source manque**.

## Le principe qui gouverne tout : brancher, pas ré-interroger
Sur 9 blocs, **5 sont déjà décidés** par les artefacts Phase 1. Les **4 restants** sont une esquisse (channels, revenue, coûts, métriques). Tu **n'ouvres jamais** un intake qui ré-interroge l'utilisateur sur un bloc déjà couvert — c'est un mode d'échec (voir plus bas). Annonce en une ligne : « données Phase 1 utilisées comme point de départ », puis remplis.

## Data-flow : d'où vient chaque bloc

```
                       PHASE 1 (déjà validé)                         ÉTAPE 6
  ┌────────────────────────────────┐
  │ research/opportunity-brief.md  │──┐
  │  · cible / segment             │  │   ┌─────────────────────────────────┐
  │  · problème + alternatives     │  ├──▶│ 1. Problème (+ alternatives)    │◀─ brief + positioning
  │  · edge (avantage)             │  │   │ 2. Segments (+ early adopters)  │◀─ brief (cible)
  │  · concurrents / risques       │  │   │ 3. UVP                          │◀─ positioning (Onliness)
  └────────────────────────────────┘  │   │ 4. Solution (top 3)             │◀─ brief (edge, resserré)
  ┌────────────────────────────────┐  │   │ 9. Avantage déloyal             │◀─ positioning (edge)
  │ research/positioning.md        │──┘   ├─────────────────────────────────┤
  │  · statement Onliness (UVP)    │      │ 5. Canaux            ┐          │
  │  · catégorie de marché         │      │ 6. Sources de revenu ├ ESQUISSE │◀─ à compléter ici
  │  · value themes / edge         │      │ 7. Structure de coûts│ (niveau  │   (les 4 blocs que
  └────────────────────────────────┘      │ 8. Indicateurs AARRR ┘  brouillon)│   la Phase 1 ne couvre pas)
                                          └─────────────────────────────────┘
                                                        │
                                          bloc 6 (modèle) ──▶ détaillé dans product/pricing.md
```

**Règle de traçabilité :** chaque bloc écrit dans `business-model.md` porte, entre parenthèses, **sa source** (`← opportunity-brief`, `← positioning`, ou `[esquisse]`). Un bloc sans source rattachée = un bloc inventé = red flag.

## Ordre de remplissage (canonique — ne pas dévier)

L'ordre n'est pas décoratif : chaque bloc **contraint** le suivant. Hors ordre, le canvas devient une liste sans logique (mode d'échec « canvas plat »).

```
1 Problème ─▶ 2 Segments ─▶ 3 UVP ─▶ 4 Solution ─▶ 5 Canaux ─▶ 6 Revenus ─▶ 7 Coûts ─▶ 8 Métriques ─▶ 9 Avantage déloyal
   (le job)     (pour qui)   (promesse) (top 3)     (accès)     (capte)     (dépense)  (mesure)       (défend)
```

Pourquoi cet ordre : l'UVP (3) n'a de sens qu'après avoir figé le problème (1) et le segment (2) ; la Solution (4) ne doit adresser **que** les problèmes du bloc 1 (pas de feature orpheline) ; les revenus (6) et coûts (7) découlent du modèle porté par 3-4-5.

## Sous-procédure par bloc

### Bloc 1 — Problème (+ alternatives actuelles)
- **Source :** `opportunity-brief` (problème central + concurrents/alternatives) croisé avec `positioning` (competitive alternatives à la Dunford — inclut le manuel, le tableur, « ne rien faire »).
- **Extraire :** les **1 à 3** problèmes du haut de la liste, chacun avec son **alternative actuelle** (ce que la cible fait aujourd'hui faute de l'outil).
- **Critère de passage :** chaque problème est formulé du **point de vue de la cible**, pas du produit (« je perds 2 h à recopier mes devis » ✓ ; « manque d'automatisation » ✗ trop abstrait).
- **Décision :**

  | Condition | Action |
  |---|---|
  | Le brief liste >3 problèmes | Garder les 3 les plus **aigus** (fréquence × douleur), reléguer le reste en note |
  | Un « problème » est en fait une feature souhaitée | Le reformuler en manque/douleur ; sinon il appartient à l'étape 7 |
  | Aucune alternative actuelle identifiable | Suspect : si la cible ne fait **rien** aujourd'hui, la douleur est peut-être faible → noter comme risque, ne pas inventer une alternative |

### Bloc 2 — Segments clients (dont early adopters)
- **Source :** `opportunity-brief` (cible / segment).
- **Extraire :** le segment principal **+** un sous-ensemble **early adopters** nommé distinctement (qui ressent la douleur le plus fort, aujourd'hui).
- **Critère de passage :** l'early adopter est décrit par des **caractéristiques observables** (« artisan solo qui facture >15 devis/mois »), pas un persona flou (« PME moderne »).
- **Décision :**

  | Condition | Action |
  |---|---|
  | Deux segments distincts dans le brief | En choisir **un** comme cible primaire du modèle ; l'autre = note « expansion possible » |
  | Early adopter = segment entier | Resserrer : qui ressent la douleur **maintenant**, pas « à terme » |

### Bloc 3 — UVP (proposition de valeur unique)
- **Source :** `positioning` (statement Onliness / la seule chose que le produit est le meilleur au monde à faire).
- **Extraire / formuler :** formule canonique du moteur — **« On aide [cible] à [résoudre problème] grâce à [mécanisme] ».**
- **Critère de passage :** une **seule** phrase, compréhensible par un inconnu du domaine, sans jargon interne. Si elle tient en un tweet et distingue du concurrent → OK.
- **Red flag :** UVP interchangeable avec un concurrent (« la solution tout-en-un simple et puissante ») → revenir au `positioning`, reprendre l'Onliness réel.

### Bloc 4 — Solution (top 3 features)
- **Source :** `opportunity-brief` (edge), **resserré**.
- **Extraire :** exactement **3** features max, chacune **mappée à un problème du bloc 1**.
- **Critère de passage :** table implicite problème→feature complète ; aucune feature qui n'adresse aucun problème listé.
- **Frontière (HARD GATE) :** ici on **nomme** les 3 features, on ne les **spécifie pas**. La spec = étape 7. Si tu écris des critères d'acceptation, tu débordes.

### Bloc 5 — Canaux `[esquisse]`
- **Source :** aucune Phase 1 dédiée → **esquisse** à partir de la catégorie (`positioning`) et de la cible.
- **Procédure :** distinguer **inbound** (SEO, contenu, référral, communautés) et **outbound** (ads, cold outreach, partenariats). Pour un micro-SaaS niché : privilégier 1-2 canaux **cohérents avec la cible**, pas une liste exhaustive.
- **Décision (choix du canal dominant) :**

  | Où se trouve la cible | Canal dominant à esquisser |
  |---|---|
  | Cherche activement une solution (intention haute) | **SEO / contenu** sur le job à résoudre (relie à l'étape 16 SEO) |
  | Regroupée dans des communautés (forums, Slack, sous-r) | **Présence communautaire** + bouche-à-oreille |
  | Diffuse, faible intention, faible ticket | **Product-led** (freemium viral) — recouper avec le modèle de pricing |
  | Peu nombreuse, ticket élevé | **Outbound ciblé** / partenariats |

- **Critère de passage :** 1-2 canaux nommés, chacun justifié par « la cible s'y trouve / y cherche ». Pas de plan GTM détaillé (hors Phase 2).

### Bloc 6 — Sources de revenus `[esquisse → pricing.md]`
- **Source :** décision de modèle prise ici, **détaillée dans `product/pricing.md`** (voir `references/pricing-procedure.md`).
- **Ici, dans le canvas :** ne poser que le **type** (abonnement récurrent freemium / free-trial + paliers) et l'**axe de scaling** en une ligne. Le détail des paliers va dans `pricing.md`, pas dans le canvas.
- **Critère de passage :** le bloc renvoie explicitement à `pricing.md` et ne duplique pas la table des paliers.
- **Types non publics :** `interne` → le bloc 6 se lit « **valeur captée** » et porte le **ROI interne** ~10 lignes (coût évité, temps gagné, seuil de rentabilité — SKILL.md §« Mode interne »), **sans** renvoi à `pricing.md` (non produit) ; `perso` → « pricing hors périmètre » assumé en une ligne.

### Bloc 7 — Structure de coûts `[esquisse]`
- **Source :** esquisse. Postes typiques d'un micro-SaaS.
- **Procédure :** lister les **postes principaux**, ordre de grandeur qualitatif (pas de chiffres précis — financials hors Phase 2) :
  - **Infra** (hébergement, base, CDN) — souvent faible et variable.
  - **API / LLM** (le poste qui **scale avec l'usage** si le produit est IA — le surveiller, il conditionne la marge et donc l'axe de pricing usage).
  - **Acquisition** (CAC : contenu, ads, temps).
  - **Outils / services tiers** (email, paiement — commission Stripe, monitoring).
- **Critère de passage :** le poste qui **croît avec l'usage** est identifié et signalé (input direct du bloc 6 / de l'axe de scaling du pricing).
- **Décision :**

  | Condition | Action |
  |---|---|
  | Coût marginal par utilisateur significatif (LLM lourd, calcul, stockage) | Signaler → l'axe de pricing devrait être **usage/volume**, pas siège plat |
  | Coût marginal quasi nul (SaaS CRUD classique) | Axe **siège / features** viable ; marge élevée |

### Bloc 8 — Indicateurs clés `[esquisse]` — AARRR
- **Source :** framework Pirate Metrics du moteur. Esquisse.
- **Procédure :** nommer **1 métrique par lettre**, la plus parlante pour ce produit (3-5 au total, pas un tableau de bord) :
  - **A**cquisition — comment on est découvert (ex. visiteurs → inscrits).
  - **A**ctivation — le moment « aha » (ex. premier livrable produit / première action à valeur).
  - **R**étention — l'usage répété qui signale l'accroche (ex. % actifs J30).
  - **R**evenu — conversion payante (ex. free → payant %).
  - **R**éférence — bouche-à-oreille (ex. invitations, partages).
- **Critère de passage :** l'**activation** correspond au **job résolu** du bloc 1 (pas à une vanity metric comme « signups »). C'est le lien avec l'étape 18 (metrics).

### Bloc 9 — Avantage déloyal
- **Source :** `positioning` (edge).
- **Extraire :** ce qui **ne se copie ni ne s'achète** facilement — savoir d'insider, autorité personnelle, communauté, données propriétaires, effet de réseau, plateforme existante.
- **Honnêteté (anti-flagornerie) :** un micro-SaaS naissant a **souvent aucun** avantage déloyal durable. **Ne pas en fabriquer un.** Écrire « aucun avantage déloyal durable à ce stade — le fossé sera l'exécution/niche/vitesse » est une réponse **valide et honnête**. Un faux moat est pire que pas de moat.

## Checklist Definition-of-Done (business-model.md)
- [ ] Les 9 blocs sont remplis, **dans l'ordre canonique**.
- [ ] Chaque bloc porte sa **source** rattachée (`← artefact` ou `[esquisse]`).
- [ ] Les blocs 1-4 et 9 **ne ré-interrogent pas** l'utilisateur (branchés Phase 1).
- [ ] Solution = **3 features max**, chacune mappée à un problème du bloc 1.
- [ ] UVP = **une phrase**, non interchangeable avec un concurrent.
- [ ] Bloc 6 **renvoie** à `pricing.md` sans dupliquer la table des paliers (`public`) — ou porte le **ROI interne** (`interne`) / « hors périmètre » (`perso`).
- [ ] Bloc 7 identifie le **poste de coût qui scale avec l'usage**.
- [ ] Bloc 8 : l'activation = le **job résolu**, pas une vanity metric.
- [ ] Bloc 9 : avantage déloyal **réel** ou **absence assumée** (jamais fabriqué).
- [ ] Zéro financials détaillés, zéro spec de feature (frontières respectées).
- [ ] Une page dense, pas de remplissage.

## Modes d'échec (et comment les gérer)

| Mode d'échec | Symptôme | Correction |
|---|---|---|
| **Ré-interrogation redondante** | Tu poses à l'utilisateur une question déjà tranchée en Phase 1 | Stop. Relis `opportunity-brief` / `positioning` ; branche la donnée existante |
| **Canvas plat** | Blocs remplis hors ordre, sans lien entre eux | Recommencer dans l'ordre 1→9 ; vérifier que chaque bloc contraint le suivant |
| **Dérive de scope** | Le canvas re-décide la cible, l'edge ou la catégorie | Fidélité Phase 1 : mêmes cible/edge/catégorie ; toute nouveauté = red flag |
| **Feature orpheline** | Une feature du bloc 4 n'adresse aucun problème du bloc 1 | La couper (ou la renvoyer à l'étape 7 comme « could ») |
| **Faux moat** | Bloc 9 invente un avantage déloyal flatteur | Le remplacer par l'absence assumée + la vraie source de défense (vitesse/niche) |
| **Débordement financier** | Projections chiffrées, LTV/CAC calculés | Retirer : financials détaillés hors Phase 2, rester en esquisse |
| **Débordement spec** | Critères d'acceptation, user stories dans le canvas | Retirer : ça appartient à l'étape 7 |

## Micro-exemples (niche-agnostiques)

- **UVP FORTE vs MOLLE.**
  - MOLLE : « La plateforme intelligente qui simplifie votre travail. » (interchangeable, zéro cible, zéro mécanisme)
  - FORTE : « On aide les [cible précise] à [éliminer une douleur nommée] grâce à [mécanisme différenciant]. » (formule canonique, testable)
- **Activation bien choisie.** Produit = générateur de X. Activation = « premier X généré **et exporté** » (le job accompli), **pas** « compte créé ».
- **Poste de coût qui scale.** Produit IA : le coût LLM par action est le poste qui grimpe avec l'usage → pousse l'axe de pricing vers **usage/volume** plutôt qu'un forfait siège plat (recoupe `pricing-procedure.md`).
- **Avantage déloyal honnête.** « Aucun moat durable aujourd'hui ; défense = niche trop petite pour les gros, vitesse d'itération, relation directe aux early adopters. » — valide et lucide.
