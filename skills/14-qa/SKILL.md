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
`_shared/validation-cascade.md`, `_shared/lessons.md` (éval-driven, sync-doc), `_shared/safety-rails.md` (sandbox, repli honnête), `_shared/design-doctrine.md` + `_shared/landing-playbook.md` (les checklists binaires — anti-slop, landing — que le faux-client rejoue sur le produit réel) ; le PRD (`product/product-spec.md` + user stories) = **l'attendu**. Références (la profondeur) :
- `references/fake-client-protocol.md` — posture, deux passes, forcing-questions, MOU-vs-FORT, modes d'échec.
- `references/integration-journeys.md` — dresser le plan (étape 1) + parcours A→Z + **catalogue des jonctions** (passe 2).
- `references/edge-cases-catalog.md` — les 4 états + checklist exhaustive de cas limites.
- `references/qa-engine.md` — Playwright, **régression par bug**, éval-driven, sync-doc, outillage.
- `references/verdict-and-routing.md` — verdict global, matrices, budget, DoD (étape 6).

Verdict au format `skills/13-reviews/references/verdict-schema.md` (`PASS/CONCERNS/FAIL/WAIVED` + preuve citée). Moteur navigateur : **`webapp-testing` (Playwright)**. Le **QA Analyst** (`_shared/test-dossier.md`) a écrit la **recette** (`qa/test-plan.md`) à l'ouverture de la Phase 4 et **compile le livret** (`qa/test-booklet.md`) — le faux-client y verse ses résultats (fonctionnel / intégration / global).

## Le principe
- **Faux-client = simulation utilisateur**, pas revue de code (ça, c'était l'étape 13). Il **clique, parcourt, vérifie** comme un vrai client.
- **Deux passes** : (1) **chaque feature ré-vérifiée seule** (rien n'a cassé depuis la cascade) ; (2) **intégration** — toutes ensemble, les **parcours de bout en bout** (les bugs de jonction, ton coût caché Spendly, sortent ici).
- **Contre l'attendu du PRD** : chaque parcours est jugé sur les **critères d'acceptation** (user stories), pas au feeling.
- **Vrai navigateur** (Playwright) : clics, formulaires, états (loading/vide/erreur/succès), responsive.

## Procédure
1. **Dresser le plan de test** depuis le PRD : liste des features + **parcours utilisateur cœur** (A→Z) + cas limites/états. → `references/integration-journeys.md` (§1) + `references/edge-cases-catalog.md`.
2. **Gate de compilation — BUILD RÉEL** (avant tout navigateur) : lance le **build de l'archétype**, pas `tsc` seul (`web-saas` : `next build` **+** `next lint`, tsconfig strict `noUncheckedIndexedAccess`). Build/lint KO = **`FAIL` produit** → retour dev, on ne teste pas une app qui ne build pas. Un défaut qui passe `tsc` mais casse `next build` (ex. `export const` dans `"use server"`) est pris ici. → `references/qa-engine.md` (gate de compilation).
3. **Passe 1 — features seules** : dispatche `fake-client` (`Task`) pour re-tester chaque feature dans le navigateur (4 états + cas limites). Bug → **test de régression généré** + retour dev (via cascade). → `references/fake-client-protocol.md` (passe 1) + `references/edge-cases-catalog.md`.
4. **Passe 2 — intégration A→Z** : `fake-client` joue les **parcours complets**. Le **premier parcours est imposé — l'arrivée réelle** : landing → signup **OTP/magic link** (réception ET saisie réelle du code) → onboarding complet (création de l'**entité cœur** — ex. profil salon) → job cœur accompli → verdict « **pro et complet** » vs « **démo creuse** » (→ `references/fake-client-protocol.md`, « Parcours #0 »). Puis les autres parcours (ex. action cœur → paiement → résultat). Les bugs de **jonction** entre features sortent ici. Bug → régression + retour dev. → `references/integration-journeys.md` (jonctions, data-flow, combinaisons réalistes).
5. **Éval-driven (features IA)** : gold sets, vérifie que les sorties IA tiennent le niveau attendu (pas de régression de prompt). → `references/qa-engine.md` (éval-driven).
6. **Sync-doc** : `CLAUDE.md`/`README`/état reflètent le code réel (cause d'échec documentée — `_shared/lessons.md`). → `references/qa-engine.md` (sync-doc, matrice divergence).
7. **Verdict global** : conforme → étape 15 ; sinon → liste des non-conformités (avec contexte) → cascade/dev, dans le **budget d'itération**. → `references/verdict-and-routing.md` (matrices, machine à états, DoD).

## Contrat d'artefacts
- **Lit** : `product/*` (l'attendu), `qa/test-plan.md` (la recette), `_shared/design-doctrine.md` + `_shared/landing-playbook.md` (checklists rejouées sur le produit réel), le code déployé/staging, `status/*`.
- **Écrit** : `qa/report.md` (template), `tests/` (les **tests de régression** générés — un par bug), sync-doc (`CLAUDE.md`/`README`/état), `.saas-factory/state.md`.
- **Propriété de `qa/test-booklet.md`** (frontière noir sur blanc) : le **QA Analyst le COMPILE** (structure + recette, il en est propriétaire) ; l'**étape 14 / faux-client y VERSE ses résultats** (fonctionnel / intégration / global) sans le récrire. Le faux-client alimente, il ne compile pas.

## Sortie & état
Produit conforme (ou non-conformités listées). Mets à jour `.saas-factory/state.md`. Résume (parcours testés / bugs / régressions ajoutées). Annonce l'**étape 15** (revue client humaine).
