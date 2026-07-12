---
name: 07-product-spec
description: >-
  Étape 7 (Phase 2 · cadrage produit) de SaaS Factory — Spec produit / PRD (rôle PM). Le cœur de la phase : traduit le besoin validé en Phase 1 en un PRD complet et exploitable — features, specs, priorisation MoSCoW/RICE, user stories avec critères d'acceptation, dépendances et non-goals — en pilotant la tranche « Product » du moteur vendoré startup-design. Se déclenche pour « faire le PRD », « spécifier le produit », « lister les features », après le business model.
allowed-tools: Read, Write, Edit, AskUserQuestion, Bash
---

# SaaS Factory — Étape 7 : Spec produit / PRD (rôle PM)

Objectif : produire un **PRD complet et exploitable** — la définition de *ce qu'on construit* — **fidèle au besoin validé en Phase 1**. Agis comme un **vrai PM** : tu ne réinventes pas le besoin, tu le traduis en features, specs, priorités et user stories testables. Un PRD sert la Phase 3 (build) : s'il est flou, tout l'aval sera flou.

## HARD GATE
Ici : la **définition produit** (features, specs, priorisation MoSCoW/RICE, user stories, dépendances, non-goals). **Pas de design** (charte, tokens, maquettes, UI) = étape 8. **Pas d'architecture ni de choix techniques** (stack, schéma de données, build order technique) = Phase 3. Le PRD décrit *le quoi*, pas *le comment technique* ni *le look*. Livrables : les artefacts `product/` du contrat.

## À lire d'abord (une fois)
`_shared/lessons.md`, `_shared/safety-rails.md` ; si présent, `skills/phase-2-product/references/conventions.md`.

## Profondeur (references/ — la procédure exhaustive)
Ce SKILL.md est le **chef d'orchestre scannable**. La procédure détaillée (sous-procédures, matrices de décision, checklists, diagrammes, cas limites, modes d'échec) vit dans `references/` :
- `references/procedure.md` — le déroulé complet des 6 étapes (data-flow, étapes 1→3 en profondeur, DoD du PRD entier).
- `references/forcing-questions.md` — recettes d'auto-interrogation par point de décision (Ask exact / Push-until / Red-flags / MOU-vs-FORT / Routage) + les rares cas où l'on interroge l'utilisateur (R1).
- `references/prioritization.md` — MoSCoW + RICE (étape 4) : test de retrait, barèmes, MVP.
- `references/acceptance-criteria.md` — user stories + Given/When/Then (étape 5) + catalogue de cas limites.
- `references/dependencies-build-order.md` — DAG, tri topologique, arbitrage dépendance vs RICE (étape 6).
- `references/completeness-baseline.md` — le socle « produit complet » (Must d'office pour tout SaaS public) + l'aha moment (étapes 1, 2 et 4).

## L'engine (à exécuter, pas refaire)
La **Phase 6 « Product »** de `startup-design` est l'engine. Lis `vendor/startup-skill/startup-design/SKILL.md` (section Phase 6) + `vendor/startup-skill/startup-design/references/frameworks.md` (RICE, MoSCoW, JTBD, Value Proposition Canvas). Suis sa procédure de définition produit + priorisation, et **redirige les sorties vers nos chemins `product/`**. Ta surcouche PM = la structure PRD complète + les user stories détaillées + les critères d'acceptation.

## Procédure (déterministe, dans l'ordre)
Aperçu ci-dessous ; la sous-procédure exhaustive de chaque étape est dans `references/` (pointeurs indiqués).
1. **Reprendre le besoin + le contexte.** Synthétise en tête du PRD : problème, cible (persona précis), **workflow cœur**, edge (ou absence assumée), intégrations attendues. Nomme l'**aha moment** (première action de valeur) + le **chemin le plus court** pour y arriver. Tout le reste doit s'y rattacher. → `references/procedure.md` (étape 1) + `references/completeness-baseline.md` (§ Aha moment).
2. **Lister toutes les features.** Dérive la liste **complète** depuis : (a) le workflow cœur, (b) les features réclamées (`demand-signals`), (c) les manques concurrents (`opportunity-brief`), (d) le **socle « produit complet »** injecté **d'office** pour tout SaaS public (onboarding wizard qui crée l'entité cœur, profil/settings, empty states, emails brandés, légal FR, 404, seed data — `references/completeness-baseline.md`). Vise un **bouquet cohérent autour d'UN workflow cœur** — niché, pas mono-feature, pas plateforme horizontale. → `references/procedure.md` (étape 2).
3. **Décliner chaque feature en spec.** Pour chacune : quoi, pour qui, comportement attendu, cas limites, et **ce qu'elle n'inclut pas**. Une fiche par feature Must/Should (`product/features/NN-*.md`, template `feature.md`). → `references/procedure.md` (étape 3) + catalogue de cas limites dans `references/acceptance-criteria.md`.
4. **Prioriser — MoSCoW + RICE :** **Must** = le MVP (sans quoi le produit ne résout pas le problème cœur) · **Should/Could** = itérations suivantes · **Won't have (this time)** = **non-goals explicites** (nomme ce qu'on ne fait pas — protège le scope). **RICE** (reach × impact × confidence ÷ effort) pour départager. Le socle « produit complet » reste **Must d'office** (exempté du test de retrait — on l'adapte à la niche, on ne le débat pas). → `references/prioritization.md`.
5. **User stories + critères d'acceptation.** Pour chaque feature Must/Should : « **En tant que** \<persona\>, **je veux** \<action\>, **afin de** \<bénéfice\> » + **critères d'acceptation testables** (style Given/When/Then). C'est **ça** qui rend le PRD exécutable — une story sans critère d'acceptation n'est pas finie. → `references/acceptance-criteria.md`.
6. **Dépendances + build order.** Mappe les dépendances entre features → **ordre de construction**. Alimente directement le plan de la Phase 3. → `references/dependencies-build-order.md`.

Aux points de décision (workflow cœur, feature orpheline, frontière, périmètre MVP, story, cycle de dépendances), applique les recettes forcing-question de `references/forcing-questions.md`.

## Contrat (lit/écrit)
- **Lit :**
  - `research/idea-brief.md` (besoin, cible, type, écosystème/intégrations)
  - `research/opportunity-brief.md` (marché, edge, risques)
  - `research/positioning.md` (angle)
  - `research/demand-signals.md` (features réclamées, manques concurrents)
  - `product/business-model.md` (modèle éco., segments, revenue streams — étape 6) — ancre le scope et les priorités sur le modèle validé
  - **Tout le PRD en découle — jamais de page blanche.**
- **Écrit :**
  - `product/product-spec.md` — le **PRD** complet (template `assets/templates/product-spec.md`) : contexte, scope, **aha moment** (§ dédié), features, **socle « produit complet »** (§ dédié, adapté à la niche), priorisation, user stories, dépendances, non-goals.
  - `product/features/NN-<slug>.md` — une fiche par feature Must/Should (template `feature.md`).
  - `product/user-stories.md` (template `user-stories.md`) — toutes les stories + critères d'acceptation.
  - `product/feature-prioritization.md` (template `feature-prioritization.md`) — matrice MoSCoW/RICE + build order.
  - `product/mvp-definition.md` (template `mvp-definition.md`) — périmètre **MVP** (Must) + success criteria + out-of-scope.
  - `.saas-factory/state.md` — mise à jour de l'état (étape 7 faite, features Must + périmètre MVP + non-goals).

## Garde-fous PM (le « parfait » se joue ici)
- **Fidélité Phase 1.** Chaque feature se rattache à un élément du besoin validé. Une feature orpheline → coupe-la ou passe-la en Won't.
- **Niché, pas gonflé.** UN workflow cœur bien fait + le strict nécessaire. Le MVP = **le plus petit qui résout vraiment le problème**.
- **Complet, pas creux.** Pour tout SaaS public, le socle « produit complet » (`references/completeness-baseline.md`) est en **Must d'office** : il ne compte pas comme du gonflement — un MVP « petit » reste un **produit fini**, pas un squelette de features.
- **Testable.** Chaque story a des critères d'acceptation vérifiables.
- **Non-goals explicites.** Le « Won't have » est aussi important que le « Must ».

## Porte (fin d'étape 7)
Présente à l'utilisateur : le résumé du PRD (les features **Must**, l'**aha moment**, l'adaptation du **socle « produit complet »** à la niche, le périmètre **MVP**, les **non-goals**), et demande validation (`AskUserQuestion`) avant de passer au design (étape 8). Ajustable — s'il veut retirer/ajouter, reboucle. Puis mets à jour `.saas-factory/state.md`.
