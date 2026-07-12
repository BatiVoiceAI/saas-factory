---
name: 13-reviews
description: >-
  Étape 13 (Phase 4 · build) de SaaS Factory — Cascade de validation par feature (Tech Lead → CTO → Designer → CEO). Chaque feature dev-validée (étape 12) monte une cascade de revue stricte, chaque cran avec droit de veto : Tech Lead (qualité code + intégration) → CTO (archi + sécurité OWASP/STRIDE) → Designer (conformité DESIGN.md + a11y) → CEO (validation fonctionnelle/métier). Verdict PASS/CONCERNS/FAIL/WAIVED + preuve citée obligatoire. FAIL à n'importe quel cran → retour dev (étape 12) avec le contexte du pourquoi → re-grimpe. Boucle jusqu'à validation CEO, par feature, en parallèle. Se déclenche après le build (étape 12), pour « valider », « reviewer les features », « faire monter la cascade ».
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Task
---

# SaaS Factory — Étape 13 : Cascade de validation (Tech Lead → CTO → Designer → CEO)

Le **cœur de la qualité**. Chaque feature dev-validée (étape 12) doit **monter la cascade** : quatre crans de revue, chacun avec droit de veto. Tu orchestres (`Task`) : tu fais monter chaque feature cran par cran, et tu gères les rejets.

**HARD GATE.** Ici on **valide** (on lit + on cite la preuve), on ne construit pas ; les corrections repartent à l'**étape 12** (dev). Une feature sort d'ici seulement **validée par le CEO**. Le faux-client (test global A→Z) = étape 14.

## À lire d'abord
`_shared/validation-cascade.md` (la convention), `_shared/lessons.md` (vérif adversariale) ; `references/verdict-schema.md` (le format de verdict — **central**), `references/cascade-protocol.md` (la mécanique du rejet-qui-remonte), `references/orchestration.md` (conduite parallèle + budget + data-flow), `references/review-gates.md` (les 4 lentilles) → `references/reviewer-playbooks.md` (la **sous-procédure exhaustive de chaque cran** — où on va pour *exécuter*), `references/rejection-contract.md` (le `FAIL` actionnable), `references/owasp-cards.md` (cran CTO), `_shared/design-doctrine.md` (cran Designer — la **checklist anti-slop**, passée point par point). Gabarit de verdict : `assets/templates/cascade-verdict.md`. Outils vendorés : `security-review` + `accessibility-review`. Les **verdicts des crans** alimentent le **livret de test** (`_shared/test-dossier.md` — QA Analyst).

## Le principe (ta règle)
- **Monter cran par cran** : `PASS` → soumis au cran du dessus.
- **`FAIL` à n'importe quel cran → RETOUR DEV** (étape 12) **avec le contexte du POURQUOI** (quoi / où / pourquoi / quoi faire — jamais « refais ») → la feature **re-grimpe** toute la cascade.
- **Boucle jusqu'à validation CEO.** Chaque feature indépendamment, **en parallèle**.
- **Verdict structuré** (`verdict-schema.md`) : `PASS / CONCERNS / FAIL / WAIVED` + confiance 1-10 + **preuve citée**. **Pas de preuve → finding supprimée** (anti-hallucination).
- **Budget d'itération** : épuisé → `DONE_WITH_CONCERNS` + on remonte (pas de boucle infinie).

## Les 4 crans (agents + lentilles)
Chaque cran = un agent-persona, lentille propre, verdict au format `verdict-schema.md`. Lentilles : `references/review-gates.md`. **Sous-procédures exhaustives** (ordre de lecture, critères de passage, forcing-question, DoD, cas limites, modes d'échec) : `references/reviewer-playbooks.md`.
1. **Tech Lead** (`agents/tech-lead.md`) — qualité code + intégration + fonctionnel.
2. **CTO** (`agents/cto.md`) — archi + **sécurité** (`security-review` + `references/owasp-cards.md` : OWASP/STRIDE/LLM/Agentic) + fonctionnel.
3. **Designer** (`agents/designer.md`) — conformité `DESIGN.md` + UX + **accessibilité** (`accessibility-review`) + **checklist anti-slop** de `_shared/design-doctrine.md` (binaire, point par point — **un marqueur coché = `FAIL`** → retour dev).
4. **CEO** (`agents/ceo.md`) — validation **fonctionnelle/métier** finale (conformité PRD : workflow cœur, edge). *Agent, pas l'humain.*

## Vérification cross-modèle (OPTIONNELLE)
Si le skill `codex` est présent **et** activé par l'utilisateur, lance-le en cross-check indépendant (cran CTO ou juge final) — la seule vraie sortie du biais mono-modèle. **Non imposé, aucune API forcée** (cf. `verdict-schema.md`).

## Procédure (par feature, en parallèle)
Pour chaque feature `DEV-DONE` (`status/<feature>.md`), lance sa cascade :
1. **Tech Lead** → `PASS` : cran 2. `FAIL` : `feature-dev` (12) + contexte → re-grimpe depuis cran 1.
2. **CTO** (+ sécu) → `PASS` : cran 3. `FAIL` → retour dev → re-grimpe.
3. **Designer** → `PASS` : cran 4. `FAIL` → retour dev → re-grimpe.
4. **CEO** → `PASS` : **feature validée**. `FAIL` → retour dev → re-grimpe.

Chaque verdict (+ preuve + contexte) dans `status/<feature>.md` (gabarit : `assets/templates/cascade-verdict.md`). Suis en **lisant** les status, pas en mémoire. Conduite parallèle, budget et acheminement des verdicts : `references/orchestration.md`. Format du `FAIL` (quoi/où/pourquoi/quoi faire) : `references/rejection-contract.md`.

## Contrat d'artefacts
- **Lit** (entrée) : `status/<feature>.md` des features **`DEV-DONE`** (le livrable à valider), `DESIGN.md` (cran Designer — la charte de référence), `_shared/design-doctrine.md` (cran Designer — la checklist anti-slop), `product/product-spec.md` (cran CEO — l'attendu PRD).
- **Écrit** (sortie) : les **mêmes** `status/<feature>.md` **enrichis des verdicts** (chaque cran ajoute son verdict + preuve + contexte, gabarit `assets/templates/cascade-verdict.md`), `.saas-factory/state.md`.
- **Frontière entrée↔sortie du même `status/<feature>.md`** : on **lit** l'état `DEV-DONE` posé par l'étape 12, on **écrit** par-dessus les verdicts de cascade (on n'écrase pas le contenu dev, on l'**augmente**).

## Sortie & état
Features **validées CEO** (ou `DONE_WITH_CONCERNS`, listées). Mets à jour `.saas-factory/state.md`. Résume (validées / en boucle / concerns). Annonce l'**étape 14** (faux-client, test global A→Z).
