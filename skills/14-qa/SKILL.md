---
name: 14-qa
description: >-
  Étape 14 (Phase 4 · build) de SaaS Factory — Test global « faux-client » + QA (A→Z). Une fois toutes les features validées par la cascade (étape 13), un agent fake-client imite l'utilisateur réel et teste TOUT dans un vrai navigateur : chaque feature ré-vérifiée seule, puis toutes ensemble (intégration), contre l'attendu du PRD. Génère un test de régression par bug, resynchronise la doc (sync-doc). Non conforme → retour cascade/dev. Conforme → prêt pour le client humain (étape 15). S'appuie sur webapp-testing (Playwright). Se déclenche après la cascade de validation (étape 13).
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Task
---

# SaaS Factory — Étape 14 : Test global « faux-client » + QA (A→Z)

Le **dernier filtre autonome** avant l'humain. La cascade (étape 13) a validé chaque feature **isolément** ; ici on prouve que **le produit entier tourne** — chaque feature **encore une fois**, puis **toutes ensemble** (intégration), du point de vue de l'utilisateur réel, dans un **vrai navigateur**.

**HARD GATE.** On **teste et on prouve** (on ne re-spécifie pas). Non conforme → **retour cascade/dev** (avec contexte). Conforme → **prêt pour l'étape 15** (le vrai client humain).

## À lire d'abord
`_shared/validation-cascade.md`, `_shared/lessons.md` (éval-driven, sync-doc), `_shared/safety-rails.md` (sandbox, repli honnête), `_shared/design-doctrine.md` + `_shared/landing-playbook.md` (les checklists binaires — anti-slop, landing — que le faux-client rejoue sur le produit réel), `_shared/boucles-fermees.md` (le faux-client rejoue les DEUX rôles et **vérifie la réception** de chaque boucle) ; le PRD (`product/product-spec.md` + user stories) = **l'attendu** ; le plan `tech/execution-plan.md` (les items `[SÉCU]` + tâches d'intégration + tests exigés → la porte « plan soldé »). Le `type` (state.md) **conditionne** les gates (parcours upgrade, landing/signup) : **route selon `skills/saas-factory/references/routing.md`** (lignes `14-qa`) — jamais recopier la matrice. Références (la profondeur) :
- `references/fake-client-protocol.md` — posture, deux passes, **boucles fermées (deux rôles)**, forcing-questions, MOU-vs-FORT, modes d'échec.
- `references/integration-journeys.md` — dresser le plan (étape 1) + parcours A→Z + **catalogue des jonctions** (passe 2).
- `references/edge-cases-catalog.md` — les 4 états + checklist exhaustive de cas limites.
- `references/qa-engine.md` — Playwright, **régression par bug**, éval-driven, sync-doc, outillage.
- `references/plan-solde-gate.md` — **porte « plan soldé, prouvé par exécution »** : registre `[SÉCU]`/intégration, tests committés, E2E cœur exécuté (P0.1).
- `references/verdict-and-routing.md` — verdict global, matrices, budget, DoD (étape 6).

Verdict au format `skills/13-reviews/references/verdict-schema.md` (`PASS/CONCERNS/FAIL/WAIVED` + preuve citée). Moteur navigateur : **`webapp-testing` (Playwright)**. Le **QA Analyst** (`_shared/test-dossier.md`) a écrit la **recette** (`qa/test-plan.md`) à l'ouverture de la Phase 4 et **compile le livret** (`qa/test-booklet.md`) — le faux-client y verse ses résultats (fonctionnel / intégration / global).

## Le principe
- **Faux-client = simulation utilisateur**, pas revue de code (ça, c'était l'étape 13). Il **clique, parcourt, vérifie** comme un vrai client.
- **Exécuter, pas constater l'écran** : « build vert / route 200 / écran de confirmation » ≠ « la feature marche ». Le faux-client **exécute chaque action de valeur** et **observe son EFFET** (l'entité persiste et réapparaît côté contrepartie / après refresh ; l'email arrive dans la boîte sandbox ; la réponse réseau de l'action est **200, pas un 500 avalé**). Un **code OTP de mauvaise longueur** et un **RPC 500 masqué par un message générique** ne se voient **qu'à l'exécution** — jamais au build (les **deux bugs vécus** en prod). C'est la répétition générale de la recette live de l'étape 17, en staging.
- **Deux passes** : (1) **chaque feature ré-vérifiée seule** (rien n'a cassé depuis la cascade) ; (2) **intégration** — toutes ensemble, les **parcours de bout en bout** (les bugs de jonction, ton coût caché Spendly, sortent ici).
- **Contre l'attendu du PRD** : chaque parcours est jugé sur les **critères d'acceptation** (user stories), pas au feeling.
- **Vrai navigateur** (Playwright) : clics, formulaires, états (loading/vide/erreur/succès), responsive.

## Procédure
1. **Dresser le plan de test** depuis le PRD : liste des features + **parcours utilisateur cœur** (A→Z) + cas limites/états. → `references/integration-journeys.md` (§1) + `references/edge-cases-catalog.md`.
2. **Gate de compilation — BUILD RÉEL** (avant tout navigateur) : lance le **build de l'archétype**, pas `tsc` seul (`web-saas` : `next build` **+** `next lint`, tsconfig strict `noUncheckedIndexedAccess`). Build/lint KO = **`FAIL` produit** → retour dev, on ne teste pas une app qui ne build pas. Un défaut qui passe `tsc` mais casse `next build` (ex. `export const` dans `"use server"`) est pris ici. → `references/qa-engine.md` (gate de compilation).
3. **Passe 1 — features seules** : dispatche `fake-client` (`Task`) pour re-tester chaque feature dans le navigateur (4 états + cas limites). Bug → **test de régression généré** + retour dev (via cascade). → `references/fake-client-protocol.md` (passe 1) + `references/edge-cases-catalog.md`.
4. **Passe 2 — intégration A→Z** : `fake-client` joue les **parcours complets**. Le **premier parcours est imposé — l'arrivée réelle** : landing → signup **OTP/magic link** (réception ET saisie réelle du code — **le code reçu doit tenir dans l'input** : un code plus long que le nombre de cases = **`FAIL` bloquant**, bug vécu code `8` chiffres vs input `6` cases) → onboarding complet (création de l'**entité cœur** — ex. profil salon) → job cœur accompli → verdict « **pro et complet** » vs « **démo creuse** » (→ `references/fake-client-protocol.md`, « Parcours #0 »). Puis les autres parcours (calibrés par type : **parcours upgrade seulement si public + billing** — `skills/saas-factory/references/routing.md`, ligne `14-qa`). Les bugs de **jonction** entre features sortent ici. Bug → régression + retour dev. → `references/integration-journeys.md` (jonctions, data-flow, combinaisons réalistes).
5. **Boucles fermées — les DEUX rôles** (`_shared/boucles-fermees.md`) : pour chaque **action de valeur** du workflow cœur (créer / modifier / annuler l'entité métier), le faux-client **exécute l'action et vérifie son effet** — réponse réseau **200** (pas un 500 avalé par un toast générique), **entité réellement persistée** (elle réapparaît côté contrepartie / après refresh) — puis joue l'**acteur** et la **contrepartie** et **vérifie la réception réelle** de chaque côté (email dans la boîte sandbox, notification in-app). Résa créée → **email client reçu** ET **gérant notifié** ; annulation → **l'autre partie reçoit** l'avis. Une **boucle silencieuse OU une action confirmée à l'écran mais non persistée = `FAIL` bloquant** (jamais « l'écran confirme, donc ça marche »). → `references/fake-client-protocol.md` (« Boucles fermées ») + `references/integration-journeys.md` (jonction *action → notif*).
6. **Éval-driven (features IA)** : gold sets, vérifie que les sorties IA tiennent le niveau attendu (pas de régression de prompt). → `references/qa-engine.md` (éval-driven).
7. **Sync-doc** : `CLAUDE.md`/`README`/état reflètent le code réel (cause d'échec documentée — `_shared/lessons.md`). → `references/qa-engine.md` (sync-doc, matrice divergence).
8. **Porte « plan soldé, prouvé par exécution »** (P0.1) : relis `tech/execution-plan.md` et **exécute** le registre `tech/plan-ledger.md` (posé par l'étape 12) — chaque item `[SÉCU]` et chaque tâche d'intégration a une ligne *fait (fichier) / repoussé (raison tracée + décision humaine)* ; **un `[SÉCU]` sans ligne = porte FERMÉE** ; les tests du plan sont **committés** (`git ls-files`) ; **≥1 E2E du parcours cœur exécuté vert** (trace, pas relecture). → `references/plan-solde-gate.md`.
9. **Verdict global** : conforme → étape 15 ; sinon → liste des non-conformités (avec contexte) → cascade/dev, dans le **budget d'itération**. → `references/verdict-and-routing.md` (matrices, machine à états, DoD).

## Contrat d'artefacts
- **Lit** : `product/*` (l'attendu), `qa/test-plan.md` (la recette), `tech/execution-plan.md` (items `[SÉCU]` + tâches d'intégration + tests exigés → porte « plan soldé »), `tech/plan-ledger.md` (le registre posé par l'étape 12 — à **exécuter et signer**), `_shared/design-doctrine.md` + `_shared/landing-playbook.md` (checklists rejouées sur le produit réel), `_shared/boucles-fermees.md` (les boucles à vérifier des deux côtés), `state.md` (le `type` → gates conditionnés, cf. `routing.md`), le code déployé/staging, `status/*`.
- **Écrit** : `qa/report.md` (template), `tests/` + `e2e/` (les **tests de régression** générés — un par bug — et la trace de l'E2E cœur exécuté), la **signature/verdict d'exécution** apposée sur `tech/plan-ledger.md` (frontière : 12 pose les lignes, 14 les exécute et signe — n'écrase pas le contenu de 12), sync-doc (`CLAUDE.md`/`README`/état), `.saas-factory/state.md`.
- **Propriété de `qa/test-booklet.md`** (frontière noir sur blanc) : le **QA Analyst le COMPILE** (structure + recette, il en est propriétaire) ; l'**étape 14 / faux-client y VERSE ses résultats** (fonctionnel / intégration / global) sans le récrire. Le faux-client alimente, il ne compile pas.

## Sortie & état
Produit conforme (ou non-conformités listées). Mets à jour `.saas-factory/state.md`. Résume (parcours testés / bugs / régressions ajoutées). Annonce l'**étape 15** (revue client humaine).
