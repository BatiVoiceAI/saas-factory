---
name: 06-business-model
description: >-
  Étape 6 (Phase 2 · cadrage produit) de SaaS Factory — Business model & pricing (rôle CEO + PM). Pose le modèle économique (lean canvas) et le pricing (modèle + paliers ancrés sur la valeur et le benchmark concurrent) — pricing marché produit SEULEMENT si le produit est public ; interne = ROI interne (coût évité, temps gagné) ; perso = étape sautée (ni business model ni pricing). Pilote la tranche « Strategy » du moteur vendoré startup-design. Se déclenche pour « business model », « pricing », « combien le vendre », après validation de l'opportunité (Phase 1).
allowed-tools: Read, Write, Edit, Bash
---

# SaaS Factory — Étape 6 : Business model & pricing (rôle CEO + PM)

Étape **volontairement légère** : c'est la moins critique de la Phase 2. Mais un pricing propre, ancré sur la valeur, vaut toujours mieux qu'un prix au doigt mouillé — c'est la seule variable qui touche directement le revenu, donc on soigne cette moitié.

## À lire d'abord (une fois)
`_shared/lessons.md`, `_shared/safety-rails.md` ; si présent, `skills/phase-2-product/references/conventions.md`.

## Ce que fait cette étape (et pourquoi)
Tu poses deux choses : le **business model** (comment le produit crée et capte de la valeur, en 1 page lean canvas) et le **pricing** (combien, sous quels paliers, ancré sur quoi). Le modèle d'un micro-SaaS niché est déjà **largement déterminé par la Phase 1** (cible, problème, edge, catégorie) : on ne réinvente rien, on formalise proprement.

**HARD GATE / frontière (anti-doublon).** Ici : business model + pricing. Les **features et specs** = étape 7. Les **projections financières détaillées** = hors Phase 2. Un seul traitement par décision.

## Entrées / sortie (contrat)
- **Lit :** `research/idea-brief.md` (**type/route** — pilote le sort du pricing), `research/opportunity-brief.md` (marché, edge, concurrents, risques) + `research/positioning.md` (angle, catégorie, value themes). Pour le **pricing uniquement** : `research/market.md` (prix concurrents relevés à l'étape 2) — l'ancre de marché.
- **Écrit :** `product/business-model.md` (template `assets/templates/business-model.md`) quand l'étape est active — soit `public`, soit `interne`. `product/pricing.md` (template `assets/templates/pricing.md`) **SEULEMENT si `type = public`** (produit vendu sur un marché) : c'est le livrable dont dépend le **contrôle de réception de la Phase 2** (« pricing = livré » quand public) et que lit `08-design-system` — s'il manque en public, l'étape est à refaire, pas la porte à présenter. **`interne`** → pas de `pricing.md` : le bloc 6 du canvas porte un **ROI interne** d'environ 10 lignes (voir §« Mode interne ») dans `business-model.md`. **`perso`** → **étape entièrement sautée** : ni `business-model.md` ni `pricing.md` ; le saut est tracé dans `.saas-factory/state.md` par l'orchestrateur de Phase 2 (pas ici). **Défaut prudent si le type manque = `public`.**
- **Ne duplique pas la matrice de routage** : le skip-set étape × type vit à un seul endroit — `skills/saas-factory/references/routing.md` (route selon elle). Ci-dessus = le calibrage de profondeur propre à cette étape, pas le routage.
- Rien d'autre. Jamais de secret ni de clé dans le fichier.

## Principe : tu EXÉCUTES le moteur, tu ne refais pas la stratégie
Le moteur vendoré `startup-design` (**Phase 4 « Strategy »**) est gelé en local. Tu suis **sa** procédure, tu gardes **la seule tranche business model**, et tu **calibres** pour un micro-SaaS. **Calibration :** on ne garde que **lean canvas + value proposition + business model**. Le `go-to-market`, la brand, les financials et la validation de `startup-design` sont **ignorés ici** (déjà couverts en Phase 1 ou hors périmètre).

## Références (profondeur, chargées au besoin)
Le SKILL.md est le chef d'orchestre ; la procédure exhaustive vit dans `references/` (progressive disclosure) :
- `references/lean-canvas.md` — sous-procédure des 9 blocs (ordre, source par bloc, matrices de décision, data-flow, DoD, modes d'échec). Ouvre-le pour les mouvements 1-4.
- `references/pricing-procedure.md` — pricing pas à pas (benchmark → valeur → modèle → paliers), matrices freemium/trial & axe de scaling, échelle ancrée, DoD, anti-patterns. Ouvre-le pour les mouvements 5-6.
- `references/forcing-questions.md` — recettes (Ask exact / Push-until / Red-flags / MOU-vs-FORT / routage) pour chaque point où l'on tranche, + les seuls cas où l'on interroge vraiment l'utilisateur.

## Procédure normée
### 1. Charge le moteur (lis, dans l'ordre)
- `vendor/startup-skill/startup-design/SKILL.md` — section **Phase 4 « Strategy »**.
- `vendor/startup-skill/startup-design/references/frameworks.md` — **Lean Canvas** (Ash Maurya, 9 blocs, ordre de remplissage) + **Value Proposition Canvas** (jobs / pains / gains).

Pourquoi lire d'abord : le Lean Canvas se remplit dans un **ordre précis** (problème → segment → UVP → solution → …). Hors ordre, il devient une liste sans logique.

### 2. Branche nos artefacts (ne ré-interroge pas)
La plupart des 9 blocs sont **déjà tranchés en Phase 1** : Problème + alternatives ← `opportunity-brief` + `positioning` · Segments (early adopters) ← `opportunity-brief` (cible) · UVP ← `positioning` (Onliness) · Solution (top 3) ← `opportunity-brief` (edge) · Unfair advantage ← `positioning` (edge, ou absence assumée). Annonce « données Phase 1 utilisées comme point de départ ». **Saute tout intake redondant.**

### 3. Complète les seuls blocs restants
De la Phase 4, n'exécute que ce que la Phase 1 **ne couvre pas** : **channels**, **revenue streams**, **cost structure**, **key metrics** (AARRR). Reste au niveau **esquisse** (financials détaillés hors Phase 2).

### 4. Écris `product/business-model.md`
Le **lean canvas 9 blocs** consolidé. Une page, dense, chaque bloc rattaché à un artefact Phase 1. Sous-procédure bloc par bloc, ordre de remplissage, matrices et DoD : `references/lean-canvas.md`.

### 5. Pose le pricing (procédure normée micro-SaaS)
> **Garde type (lu dans `research/idea-brief.md`).** Les mouvements 5-6 ne s'exécutent que si **`type = public`**. `interne` → saute-les et écris le **ROI interne** (§« Mode interne » ci-dessous) dans `business-model.md`. `perso` → l'étape 06 entière est **sautée** par routage (`routing.md`) : rien n'est produit ici (ni `business-model.md` ni `pricing.md`) ; le saut est tracé dans `state.md` par l'orchestrateur.
> On **vendorera plus tard** un skill de pricing dédié (`coreyhaines31/marketingskills:pricing`). En attendant, applique cette procédure — ne l'improvise pas. Version exhaustive (matrices freemium/trial, choix d'axe de scaling, échelle ancrée, DoD, anti-patterns) : `references/pricing-procedure.md`.
1. **Benchmark.** Relève les prix concurrents dans `research/market.md` : point d'entrée, point haut, inclus par palier, axe de scaling. L'**ancre de marché**.
2. **Ancrage sur la valeur (pas cost-plus).** Le prix se justifie par la **valeur du job résolu** (VPC), pas le coût de hosting. Situe-le face à l'**alternative actuelle** (ce que la cible paie/perd aujourd'hui sans l'outil).
3. **Modèle & paliers.** Un modèle micro-SaaS standard : **freemium** ou **free-trial** + **2 à 3 paliers payants** (Starter / Pro / Team), avec un **axe de scaling** clair (siège / usage / volume / features). Évite >3 paliers payants (paralysie de choix).
4. **Ancrage des paliers.** Un palier « ancre » haut rend le palier cible **raisonnable** ; un point d'entrée bas réduit la friction. **Nomme** le palier que l'early adopter prendra en premier.

### 6. Écris `product/pricing.md`
Modèle + **table des paliers** (nom · prix · pour qui · inclus · limite) + justification d'ancrage (valeur + benchmark) + hypothèses à tester. **Type `public` uniquement** (garde du mouvement 5).

## Mode interne — ROI interne, pas de pricing marché (~10 lignes)
Un outil interne ne se vend pas : des paliers Starter/Pro/Team ou un freemium n'ont **aucun objet** (aligné sur le playbook Phase 2 : « coût évité », pas « destiné à être vendu »). À la place, le bloc 6 du canvas — lu comme « **valeur captée** » — porte un **ROI interne d'environ 10 lignes** :
1. **Coût évité** — ce que le process actuel coûte (heures × taux horaire interne, erreurs, licences de l'outil remplacé). `[Estimate]` avec hypothèse écrite.
2. **Temps gagné** — heures/mois économisées, et **par qui** (les utilisateurs internes concernés).
3. **Coût de l'outil** — infra + maintenance, ordre de grandeur (recoupe le bloc 7 du canvas).
4. **Seuil de rentabilité** — une phrase **falsifiable** : « l'outil se paie si ≥ N heures/mois économisées ».
5. **Hypothèses `[Assumption]`** — à valider auprès du **sponsor interne** (revue étape 15, persona sponsor).

Interdits en mode interne : paliers, freemium/trial, benchmark concurrent, `product/pricing.md` (réservé au type `public`).

## Garde-fous
- **Léger, pas bâclé.** Un lean canvas + un pricing ancré suffisent. Pas de projections financières.
- **Valeur, pas coût.** Un prix cost-plus laisse de l'argent sur la table et sous-vend l'edge.
- **Fidèle Phase 1.** Mêmes cible / edge / catégorie ; aucune dérive de modèle.
- **Le prix est une hypothèse.** Marque les prix `[Assumption]` à valider.

## Clôture d'étape
Mets à jour `.saas-factory/state.md` (étape 6 faite, modèle + palier cible). Résume en 2 lignes, puis annonce l'**étape 7 (`07-product-spec`)** — le cœur de la phase.
