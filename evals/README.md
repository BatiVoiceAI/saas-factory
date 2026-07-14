# evals/ — la source de vérité de l'efficacité du plugin

> Best-practice officielle Claude Code : **« construire les évals AVANT le contenu »** — « Evaluations are your source of truth for measuring Skill effectiveness ». Il n'existe **pas** de runner d'éval intégré → ce dossier fournit les deux moitiés : les évals **mécaniques** (exécutables) et les évals de **comportement** (rubriques).

## Deux types d'évals

### 1. Mécaniques — `run.sh` (exécutable, zéro-dépendance)
Agrège en **une commande** toutes les vérifs déterministes du plugin :
```bash
bash evals/run.sh
```
- les 3 batteries de **gardes** (`safety-guard` 80 · `mcp-guard` 21 · `machine-gate` 7) ;
- l'**auto-audit de couverture archétype** (`scripts/audit-archetype-coverage.mjs`) ;
- les **planchers** des deux châssis (`verify:machine` web-saas + automation).

Vert = les mécanismes tiennent. **À lancer à chaque vague** (garde-fou G6 de `CONTRIBUTING.md`) : c'est le filet anti-régression du plugin sur lui-même.

*(Les tests qui exigent `npm install` — vitest, playwright, `node --test` automation — se lancent séparément dans chaque châssis ; `run.sh` ne porte que le socle zéro-dep.)*

### 2. Comportement — `scenarios/*.json` (rubriques, prompt-level)
Les comportements d'agent (une porte qui doit échouer, un verdict qui doit être supprimé, un archétype qui ne doit PAS être recalé) **ne sont pas automatisables** aujourd'hui. On les consigne en **rubriques** au format officiel (`{skills, scenario, expected_behavior, fail_if}`), **dérivées des tables « modes d'échec »** déjà écrites dans les skills. Elles servent de source de vérité pour l'évaluation **manuelle** (ou lors d'un run réel) et pour la non-régression quand on modifie un skill.

Scénarios actuels : `12-build` (anti-scaffolding), `13-reviews` (verdict sans preuve → supprimé), `14-qa` (faux-négatif d'archétype). Chacun a un `expected_behavior` (ce qui doit arriver) et un `fail_if` (le mode d'échec précis à ne jamais laisser passer).

## Ajouter une éval
- **Comportement** : quand tu écris/modifies un skill, extrais ses **modes d'échec** en un `scenarios/<skill>-<sujet>.json`. « Construire l'éval AVANT le contenu » : d'abord le scénario qui échoue sans le skill, puis le contenu minimal qui le fait passer.
- **Mécanique** : si tu ajoutes un check déterministe (lint, garde, audit), ajoute-le à `run.sh`.

## À faire (suivi campagne)
Rendre les **lints du châssis évaluables contre des fixtures cassées** (marqueur slop / secret en dur / plpgsql sans `#variable_conflict`) — nécessite un override `LINT_ROOT` des scripts de lint pour les pointer vers `evals/fixtures/`. Prouverait mécaniquement que les oracles de qualité attrapent bien les régressions.
