---
name: 07-product-spec
description: >-
  Étape 7 (Phase 2 · cadrage produit) de SaaS Factory — Spec produit / PRD (rôle PM, profondeur exigée). Le cœur de la phase : traduit le besoin validé en Phase 1 en un PRD complet et exploitable — features, priorisation MoSCoW/RICE, MVP, dépendances, non-goals — et des fiches feature PROFONDES par Must (objectif, flow détaillé, tous les états, règles métier, boucles fermées, critères d'acceptation testables, volet technique/contrat logique). Pilote la tranche « Product » du moteur vendoré startup-design. Se déclenche pour « faire le PRD », « spécifier le produit », « lister les features », après le business model.
allowed-tools: Read, Write, Edit, AskUserQuestion, Bash
---

# SaaS Factory — Étape 7 : Spec produit / PRD (rôle PM)

Objectif : produire un **PRD complet et exploitable** — la définition de *ce qu'on construit* — **fidèle au besoin validé en Phase 1**. Agis comme un **vrai PM / vrai CEO** : tu ne réinventes pas le besoin, tu le traduis en features, priorités et fiches **profondes** (vraies descriptions produit, fonctionnelles **et** techniques, critères testables). **Qualité avant vitesse** : ici on ne cherche pas la rapidité mais la profondeur actionnable — chaque feature Must exécutée avec le plus grand soin. Un PRD sert la Phase 3 (build) : s'il est flou, tout l'aval sera flou.

## HARD GATE
Ici : la **définition produit** — features, priorisation MoSCoW/RICE, MVP, **fiches feature profondes**, boucles fermées, dépendances, non-goals. Le PRD décrit *le quoi* (fonctionnel **et** contrat logique), pas *le comment technique concret* ni *le look*.
- **Pas de design** (charte, tokens, maquettes, UI) = étape 8.
- **Pas d'archi ni de choix techniques concrets** (stack, schéma SQL, index, migrations, routes exactes, découpage services) = Phase 3. Le **volet technique** du PRD reste le **contrat logique** : entités touchées, actions logiques, validations, invariants — cohérent avec 09, jamais son travail.
- **Échec du gate** si une feature **Must** n'a pas **flow + états + critères testables + volet technique** (`references/feature-spec-depth.md`), ou si une **action de valeur** n'a pas sa **boucle fermée** documentée (`_shared/boucles-fermees.md`).

Livrables : les artefacts `product/` du contrat.

## À lire d'abord (une fois)
`_shared/lessons.md`, `_shared/safety-rails.md`, `_shared/boucles-fermees.md` (doctrine — dérivation des boucles) ; si présent, `skills/phase-2-product/references/conventions.md`.

## Profondeur (references/ — la procédure exhaustive)
Ce SKILL.md est le **chef d'orchestre scannable**. La procédure détaillée (sous-procédures, matrices de décision, checklists, diagrammes, cas limites, modes d'échec) vit dans `references/` :
- `references/procedure.md` — le déroulé complet des 6 étapes (data-flow, fusion §5, DoD du PRD entier).
- `references/forcing-questions.md` — recettes d'auto-interrogation par point de décision (Ask exact / Push-until / Red-flags / MOU-vs-FORT / Routage) + les rares cas où l'on interroge l'utilisateur (R1).
- `references/prioritization.md` — MoSCoW + RICE (étape 3) : test de retrait, barèmes, MVP.
- `references/feature-spec-depth.md` — **l'anatomie de la fiche feature profonde** (étape 5) : les 11 sections, catalogue d'états, règles métier, frontière du volet technique avec 09.
- `references/acceptance-criteria.md` — user stories + Given/When/Then + catalogue de cas limites (méthode appliquée dans la fiche).
- `references/dependencies-build-order.md` — DAG, tri topologique, arbitrage dépendance vs RICE (étape 6).
- `references/completeness-baseline.md` — le socle « produit complet » **conditionné par l'archétype** (Must d'office : web-saas → S1-S8 · landing → LP1-LP4 · automation → AU1-AU5 ; renvoi `_shared/state-schema.md` §socle-par-archétype) + l'aha moment (étapes 1, 2 et 3). Le calibrage par **type** (public/interne/perso) s'ajoute par-dessus, il ne remplace pas l'archétype.

## L'engine (à exécuter, pas refaire)
La **Phase 6 « Product »** de `startup-design` est l'engine. Lis `{PLUGIN_ROOT}/vendor/startup-skill/startup-design/SKILL.md` (section Phase 6) + `{PLUGIN_ROOT}/vendor/startup-skill/startup-design/references/frameworks.md` (RICE, MoSCoW, JTBD, Value Proposition Canvas). Suis sa procédure de définition produit + priorisation, et **redirige les sorties vers nos chemins `product/`**. Ta surcouche PM = la structure PRD complète + les user stories détaillées + les critères d'acceptation.
> **Résolution du chemin** : `{PLUGIN_ROOT}` se résout en chemin ABSOLU avant tout accès (hook SessionStart ou échelle de fallback), Read de vérification avant dispatch, jamais de `vendor/…` relatif dans un brief de sous-agent — `_shared/vendored-engine-protocol.md` **§0**.

## Procédure (déterministe, dans l'ordre)
Aperçu ci-dessous ; la sous-procédure exhaustive de chaque étape est dans `references/` (pointeurs indiqués). **On priorise (3) AVANT de spécifier en profondeur (5)** : la priorisation est *cheap*, la profondeur est *chère* — on ne déploie les fiches complètes que sur les **Must**.
1. **Reprendre le besoin + le contexte.** Synthétise en tête du PRD : problème, cible (persona précis), **type de produit**, **workflow cœur**, edge, intégrations. **Nomme les actions de valeur** (créer/modifier/annuler l'entité) et l'**aha moment** (première action de valeur) + le **chemin le plus court** pour y arriver. → `references/procedure.md` (étape 1) + `references/completeness-baseline.md` (§ Aha moment).
2. **Lister toutes les features.** Dérive la liste **complète** depuis : (a) le workflow cœur, (b) les features réclamées (`demand-signals`), (c) les manques concurrents (`opportunity-brief`), (d) le **socle « produit complet » CONDITIONNÉ PAR L'ARCHÉTYPE** injecté **d'office** — **web-saas → S1-S8** (onboarding wizard qui crée l'entité cœur, profil/settings, empty states, emails/notifs brandés, légal adapté à la juridiction (`jurisdiction`/`locale`, jamais « FR » en dur), 404, seed data, **metadata/favicon**) · **landing → LP1-LP4** (sections landing-playbook, légal juridiction, waitlist/CTA, métadonnées — **pas** d'onboarding/dashboard/entité CRUD) · **automation → AU1-AU5** (config/secrets, historique runs/logs, healthcheck, boucle fermée, idempotence — **pas** d'UI produit) — voir `references/completeness-baseline.md` + `_shared/state-schema.md` §socle-par-archétype, portes par archétype dans `routing.md`. Le calibrage par **type** (public/interne/perso) module ensuite le canal/mode. **Bouquet cohérent autour d'UN workflow cœur** — niché, pas mono-feature, pas plateforme. → `references/procedure.md` (étape 2).
3. **Prioriser — MoSCoW + RICE → figer le MVP.** **Must** = le MVP · **Should/Could** = itérations · **Won't (this time)** = **non-goals explicites**. **RICE** pour départager. Socle « produit complet » = **Must d'office** (exempté du test de retrait — on l'adapte, on ne le débat pas). Écrit dans `product-spec.md` § Priorisation **et** § MVP (fusion §5). → `references/prioritization.md`.
4. **Boucles fermées — aucune action de valeur muette.** Pour **chaque** action de valeur, remplis les **5 questions** (`_shared/boucles-fermees.md`) → confirmations, notifications à la contrepartie, liens réversibles, rappels, traces. Universel aux 3 types (canal adapté). Chaque « oui » = une exigence répercutée dans la fiche + un critère. Écrit dans `product-spec.md` § Boucles fermées. → `references/procedure.md` (étape 4).
5. **Fiches feature profondes (le cœur de la qualité).** Pour **chaque Must** : une fiche `product/features/NN-*.md` (template `feature.md`) avec **objectif/job, persona, user story, flow détaillé étape par étape, tous les états (vide/chargement/succès/erreur/edge), règles métier, boucles fermées, critères d'acceptation testables (Given/When/Then), volet technique (entités/actions/validations/invariants — contrat logique cohérent avec 09)**. Should = fiche allégée. → `references/feature-spec-depth.md` + `references/acceptance-criteria.md`.
6. **Dépendances + build order.** Mappe les dépendances entre features → **ordre de construction** (`product-spec.md` § Dépendances & build order). Alimente directement le plan de la Phase 3. → `references/dependencies-build-order.md`.

Aux points de décision (workflow cœur, feature orpheline, périmètre MVP, boucle muette, flow/états, frontière, volet technique, cycle de dépendances), applique les recettes forcing-question de `references/forcing-questions.md` (Q1-Q11).

## Contrat (lit/écrit)
- **Lit :**
  - `research/idea-brief.md` (besoin, cible, type, écosystème/intégrations)
  - `research/opportunity-brief.md` (marché, edge, risques)
  - `research/positioning.md` (angle)
  - `research/demand-signals.md` (features réclamées, manques concurrents)
  - `product/business-model.md` (modèle éco., segments, revenue streams — étape 6) — ancre le scope et les priorités
  - `_shared/boucles-fermees.md` (doctrine — dérivation des 5 questions par action de valeur)
  - **Tout le PRD en découle — jamais de page blanche.**
- **Écrit :**
  - `product/product-spec.md` — le **PRD** unique (template `product-spec.md`) : contexte + type + **archétype**, scope + actions de valeur, **aha moment**, features, **socle « produit complet » conditionné par l'archétype** (web-saas → S1-S8 · landing → LP1-LP4 · automation → AU1-AU5 ; puis adapté au type/à la niche — `_shared/state-schema.md` §socle-par-archétype), **§ Priorisation (MoSCoW + RICE)**, **§ MVP** (hypothèse + Must + success criteria + out-of-scope), **§ Boucles fermées**, **§ Dépendances & build order**, **§ Périmètre livré (référence pricing)**, **§ Non-goals**. Absorbe l'ex-priorisation + l'ex-MVP (fusion §5).
  - `product/features/NN-<slug>.md` — une fiche **profonde** par Must (allégée par Should), template `feature.md`. **Foyer unique** de la user story + des critères d'acceptation.
  - `.saas-factory/state.md` — mise à jour de l'état (étape 7 faite, features Must + périmètre MVP + non-goals).
  - **Renvois (compatibilité aval — fusion §5, à repointer côté aval) :** `product/feature-prioritization.md`, `product/mvp-definition.md`, `product/user-stories.md` = simples **pointeurs** vers `product-spec.md` / les fiches (templates de même nom), **zéro contenu dupliqué**.

## Garde-fous PM (le « parfait » se joue ici)
- **Fidélité Phase 1.** Chaque feature se rattache à un élément du besoin validé. Une feature orpheline → coupe-la ou passe-la en Won't.
- **Niché, pas gonflé.** UN workflow cœur bien fait + le strict nécessaire. Le MVP = **le plus petit qui résout vraiment le problème**.
- **Profond, pas titré.** Chaque Must a **flow + états + règles + critères + volet technique** (`feature-spec-depth.md`). Une fiche d'une ligne = spec non finie = échec du gate.
- **Complet, pas creux.** Le socle « produit complet » (`completeness-baseline.md`) est **Must d'office**, **CONDITIONNÉ PAR L'ARCHÉTYPE** (web-saas → S1-S8 · landing → LP1-LP4 · automation → AU1-AU5 ; `_shared/state-schema.md` §socle-par-archétype), puis calibré par type (canal adapté) : un MVP « petit » reste un **produit fini** de son archétype, pas un squelette. **Ne jamais exiger onboarding+dashboard d'un landing ou d'une automation headless** (faux-négatif de porte — les portes de complétude sont par archétype, `routing.md`).
- **Aucune action de valeur muette.** Chaque action ferme sa boucle (`_shared/boucles-fermees.md`) : confirmation à l'acteur, notification à la contrepartie, trace consultable. Canal adapté au type, existence jamais optionnelle.
- **Le QUOI, pas le COMMENT.** Le volet technique reste le **contrat logique** (entités/actions/validations/invariants), jamais le schéma/stack/archi (= 09).
- **Non-goals explicites.** Le « Won't have » est aussi important que le « Must ».
- **Amorce pricing.** La liste des Must (§ Périmètre livré) est la **référence** du gate « pricing = features livrées » : le pricing (06) ne vend que ce que les Must couvrent ; 12/15 vérifient le livré.

## Porte (fin d'étape 7)
**D'abord, rends le PRD en DOCUMENT accessible** (exigence fondateur : la liste des fonctionnalités métier se lit comme un document, pas du markdown brut) :
```bash
node {PLUGIN_ROOT}/scripts/render-report.mjs product/product-spec.md product/product-spec.html "Fonctionnalités du produit"
```
→ `product/product-spec.html` (stylé, Imprimer → PDF). **Présente ce document à l'utilisateur** (ouvre-le / preview ; à défaut pointe le chemin).

Puis présente le résumé du PRD (les features **Must** avec profondeur, l'**aha moment**, l'adaptation du **socle « produit complet »**, les **boucles fermées** des actions de valeur, le périmètre **MVP** + **Périmètre livré (référence pricing)**, les **non-goals**), et demande validation (`AskUserQuestion`) avant de passer au design (étape 8). **Ajustable — s'il veut retirer/ajouter/modifier une fonctionnalité, reboucle** (re-rends le document). Puis mets à jour `.saas-factory/state.md`.
