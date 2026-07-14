---
name: 06-business-model
description: >-
  Étape 6 (Phase 2 · cadrage produit) de SaaS Factory — Business model & pricing (rôle CEO + PM). Pose le modèle économique (lean canvas) et le pricing (modèle + paliers ancrés sur la valeur et le benchmark concurrent) — pricing marché produit SEULEMENT si le produit est public ; interne = ROI interne (coût évité, temps gagné) ; perso = étape sautée (ni business model ni pricing). Pilote la tranche « Strategy » du moteur vendoré startup-design. Se déclenche pour « business model », « pricing », « combien le vendre », après validation de l'opportunité (Phase 1).
allowed-tools: Read, Write, Edit, Bash
---

# SaaS Factory — Étape 6 : Business model & pricing (rôle CEO + PM)

Étape **volontairement légère** : c'est la moins critique de la Phase 2. Mais un pricing propre, ancré sur la valeur, vaut toujours mieux qu'un prix au doigt mouillé — c'est la seule variable qui touche directement le revenu, donc on soigne cette moitié.

## Sommaire

- À lire d'abord (une fois)
- Ce que fait cette étape (et pourquoi)
- Entrées / sortie (contrat)
- Principe : tu EXÉCUTES le moteur, tu ne refais pas la stratégie
- Références (profondeur, chargées au besoin)
- Procédure normée
- Mode interne — ROI interne, pas de pricing marché (~10 lignes)
- Archétype `automation` — contrat d'artefact : `product/roi.md` (rapport ROI PLEIN, PAS le canvas)
- Garde-fous
- Clôture d'étape

## À lire d'abord (une fois)
`_shared/lessons.md`, `_shared/safety-rails.md` ; si présent, `skills/phase-2-product/references/conventions.md`.

## Ce que fait cette étape (et pourquoi)
Tu poses deux choses : le **business model** (comment le produit crée et capte de la valeur, en 1 page lean canvas) et le **pricing** (combien, sous quels paliers, ancré sur quoi). Le modèle d'un micro-SaaS niché est déjà **largement déterminé par la Phase 1** (cible, problème, edge, catégorie) : on ne réinvente rien, on formalise proprement.

**HARD GATE / frontière (anti-doublon).** Ici : business model + pricing. Les **features et specs** = étape 7. Les **projections financières détaillées** = hors Phase 2. Un seul traitement par décision.

## Entrées / sortie (contrat)
> 🚨 **Lecture des inputs CONDITIONNÉE PAR ARCHÉTYPE.** Le contrat ci-dessous est celui de l'archétype **`web-saas`**. Modèle des 3 axes = `_shared/state-schema.md` §Modèle à 3 axes ; routage/skip-set = `routing.md` (fait foi). Deltas :
> - **`landing`** → 06 **sautée** (ou simple teaser pricing si la landing l'affiche) — voir `routing.md`.
> - **`automation`** → **contrat d'artefact dédié** (§« Archétype `automation` » ci-dessous) : lit `idea-brief.md` (dont **§Intake automation** : boucle, seuils, systèmes) + `opportunity-brief.md` ; **ne lit PAS `positioning.md`** (03 **sautée** en automation — chercher un fichier absent est un faux manque) ni `market.md` (02 sautée, pas de pricing). Écrit **`product/roi.md`** (rapport ROI plein), **pas** `business-model.md`.
- **Lit (`web-saas`) :** `research/idea-brief.md` (**type/route** — pilote le sort du pricing), `research/opportunity-brief.md` (marché, edge, concurrents, risques) + `research/positioning.md` (angle, catégorie, value themes — **absent si 03 sautée**, ne pas le fabriquer). Pour le **pricing uniquement** : `research/market.md` (prix concurrents relevés à l'étape 2) — l'ancre de marché.
- **Écrit (`web-saas`) :** `product/business-model.md` (template `assets/templates/business-model.md`) quand l'étape est active — soit `public`, soit `interne`. `product/pricing.md` (template `assets/templates/pricing.md`) **SEULEMENT si `type = public`** (produit vendu sur un marché) : c'est le livrable dont dépend le **contrôle de réception de la Phase 2** (« pricing = livré » quand public) et que lit `08-design-system` — s'il manque en public, l'étape est à refaire, pas la porte à présenter. **`interne`** → pas de `pricing.md` : le bloc 6 du canvas porte un **ROI interne** d'environ 10 lignes (voir §« Mode interne ») dans `business-model.md`. **`perso`** → **étape entièrement sautée** : ni `business-model.md` ni `pricing.md` ; le saut est tracé dans `.saas-factory/state.md` par l'orchestrateur de Phase 2 (pas ici). **Défaut prudent si le type manque = `public`.**
- **Ne duplique pas la matrice de routage** : le skip-set étape × (archétype × type) vit à un seul endroit — `skills/saas-factory/references/routing.md` (route selon elle). Ci-dessus = le calibrage de profondeur propre à cette étape, pas le routage.
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
- `{PLUGIN_ROOT}/vendor/startup-skill/startup-design/SKILL.md` — section **Phase 4 « Strategy »**.
- `{PLUGIN_ROOT}/vendor/startup-skill/startup-design/references/frameworks.md` — **Lean Canvas** (Ash Maurya, 9 blocs, ordre de remplissage) + **Value Proposition Canvas** (jobs / pains / gains).
> **Résolution du chemin** : `{PLUGIN_ROOT}` se résout en chemin ABSOLU avant tout accès (hook SessionStart ou échelle de fallback), Read de vérification avant dispatch, jamais de `vendor/…` relatif dans un brief de sous-agent — `_shared/vendored-engine-protocol.md` **§0**.

Pourquoi lire d'abord : le Lean Canvas se remplit dans un **ordre précis** (problème → segment → UVP → solution → …). Hors ordre, il devient une liste sans logique.

### 2. Branche nos artefacts (ne ré-interroge pas)
La plupart des 9 blocs sont **déjà tranchés en Phase 1** : Problème + alternatives ← `opportunity-brief` + `positioning` · Segments (early adopters) ← `opportunity-brief` (cible) · UVP ← `positioning` (Onliness) · Solution (top 3) ← `opportunity-brief` (edge) · Unfair advantage ← `positioning` (edge, ou absence assumée). Annonce « données Phase 1 utilisées comme point de départ ». **Saute tout intake redondant.**

### 3. Complète les seuls blocs restants
De la Phase 4, n'exécute que ce que la Phase 1 **ne couvre pas** : **channels**, **revenue streams**, **cost structure**, **key metrics** (AARRR). Reste au niveau **esquisse** (financials détaillés hors Phase 2).

### 4. Écris le livrable de modèle (branché par archétype)
> 🚨 **Branche d'archétype AVANT d'écrire.** Si **`archetype = automation`** : **n'écris PAS le canvas** — écris **`product/roi.md`** (rapport ROI plein, §« Archétype `automation` » ci-dessus) et saute les mouvements 5-6. Sinon (`web-saas`) : continue ci-dessous.

Le **lean canvas 9 blocs** consolidé (`web-saas`). Une page, dense, chaque bloc rattaché à un artefact Phase 1. Sous-procédure bloc par bloc, ordre de remplissage, matrices et DoD : `references/lean-canvas.md`.

### 5. Pose le pricing (procédure normée micro-SaaS)
> **Garde archétype × type (lu dans `research/idea-brief.md` + `state.md`).** **`archetype = automation`** → mouvements 5-6 **sautés**, livrable = **`product/roi.md`** (rapport plein, §« Archétype `automation` »), pas de canvas ni de pricing. Sinon (`web-saas`), garde `type` : les mouvements 5-6 ne s'exécutent que si **`type = public`**. `interne` → saute-les et écris le **ROI interne** (§« Mode interne » ci-dessous) dans `business-model.md`. `perso` → l'étape 06 entière est **sautée** par routage (`routing.md`) : rien n'est produit ici (ni `business-model.md` ni `pricing.md`) ; le saut est tracé dans `state.md` par l'orchestrateur.
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

> ⚠️ **Le « ~10 lignes » ci-dessus vaut pour `web-saas` + `interne`** (ROI = bloc 6 d'un canvas par ailleurs plein). Pour l'archétype **`automation`**, le ROI n'est pas une annexe de canvas mais **le livrable principal de 06** → **rapport plein `roi.md`**, pas 10 lignes (voir §suivante).

## Archétype `automation` — contrat d'artefact : `product/roi.md` (rapport ROI PLEIN, PAS le canvas)
<!-- 🚨 S'applique quand `archetype = automation` (le plus souvent `interne`). Porte le recadrage automation DANS le corps de la skill, pas seulement dans `routing.md`. Modèle des axes : `_shared/state-schema.md` §Modèle à 3 axes. -->
Une automation headless interne **ne se vend pas** et n'a **pas de marché** : le **lean canvas 9 blocs est structurellement inadapté** — au moins **4 blocs sur 9 sont N/A** (Canaux · Segments-marché · Avantage déloyal · UVP déjà portée par l'opportunity mono-utilisateur). On **ne produit donc PAS `business-model.md`** ; le ROI **remplace tout le bloc pricing** et devient le **cœur** de l'étape.

- **Livrable :** **`product/roi.md`** (template `assets/templates/roi.md`), **PAS** `business-model.md` ni `pricing.md`. Le saut du canvas est explicite (« canvas 9 blocs sans objet — automation interne : voir `roi.md` »).
- **Profondeur = RAPPORT, pas ~10 lignes.** Aligné sur la doctrine « qualité avant vitesse / vrais rapports comme base » (mémoire profondeur PM/CEO). Structure attendue :
  1. **Cadre & profil** — le process actuel remplacé, qui le subit, à quelle cadence (branché sur `idea-brief §Intake automation`).
  2. **Leviers de valeur CHIFFRÉS** — chaque levier gain isolé et estimé (temps gagné · pertes/erreurs évitées · coûts portés hors P&L) avec son hypothèse écrite, `[Estimate]`/`[Assumption]` — jamais un chiffre nu.
  3. **Coût récurrent** — infra + maintenance + coût du/des système(s) source-cible (ordre de grandeur).
  4. **Seuil de rentabilité FALSIFIABLE** — une phrase vérifiable (« l'automation se paie si ≥ N h/mois économisées OU ≥ 1 <événement coûteux évité>/trimestre ») **reliée au critère de KILL** de l'`idea-brief` (le KILL automation = utilité/adoption propriétaire, pas un marché).
  5. **Convention de prudence** — bénéfices bas / coûts hauts, pour que le ROI reste positif même en croisement défavorable.
  6. **Hypothèses `[Assumption]`** — à confirmer par le **propriétaire** (revue étape 15, persona propriétaire).
- **Interdits :** paliers/freemium/benchmark concurrent, `pricing.md`, `business-model.md`, et **ne pas chercher `positioning.md`/`market.md`** (03/02 sautées en automation).

## Garde-fous
- **Léger, pas bâclé.** Un lean canvas + un pricing ancré suffisent. Pas de projections financières.
- **Valeur, pas coût.** Un prix cost-plus laisse de l'argent sur la table et sous-vend l'edge.
- **Fidèle Phase 1.** Mêmes cible / edge / catégorie ; aucune dérive de modèle.
- **Le prix est une hypothèse.** Marque les prix `[Assumption]` à valider.

## Clôture d'étape
Mets à jour `.saas-factory/state.md` (étape 6 faite, modèle + palier cible). Résume en 2 lignes, puis annonce l'**étape 7 (`07-product-spec`)** — le cœur de la phase.
