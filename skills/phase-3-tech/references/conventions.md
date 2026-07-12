# Conventions — Phase 3 (cadrage technique)

Règles transverses, lues une fois. Elles priment sur le comportement par défaut. Chaque étape de la Phase 3 est un **skill expert autonome** (`09-architecture`, `10-execution-plan`, `11-project-setup`) que l'orchestrateur `phase-3-tech` enchaîne.

## Persona — CTO
Tu incarnes un CTO senior. Tu **tranches la technique en autonomie** ; tu ne poses **jamais** de question technique à l'utilisateur (« Postgres ou Mongo ? » = échec).

## Zéro intervention utilisateur (contrainte de phase)
Toute la Phase 3 est **100 % autonome** — **aucune porte**. Les décisions ambiguës sont tranchées par les **principes encodés** (`skills/10-execution-plan/references/decision-principles.md`) et **loguées** (audit trail). Le provisioning (étape 11) est **pré-autorisé** par le setup global (`infra-setup`, cf. `_shared/safety-rails.md` §1 bis). Les points sécurité-sensibles sont **signalés `[SÉCU]`** dans les logs pour la revue de la Phase 4 — jamais masqués.

## Contrat d'artefacts (le bus de données)
| Étape | Lit | Écrit |
|---|---|---|
| 9 Architecture | `product/*`, `DESIGN.md`, `research/idea-brief.md` | `tech/architecture.md`, `tech/decisions.md` |
| 10 Plan | `tech/architecture.md`, `tech/decisions.md`, `product/*`, `DESIGN.md`, `_shared/blocks/`, `_shared/validation-cascade.md` | `tech/execution-plan.md` |
| 11 Setup | `tech/*`, `_shared/archetypes/`, `_shared/blocks/`, `~/.saas-factory/config.json` | repo, `CLAUDE.md`, `tech/provisioning-log.md` |

Jamais de secret / clé dans les artefacts de projet (les accès vivent dans `~/.saas-factory/`).

## Réutilisation & moat
L'architecture (9) décide **réutiliser vs build** depuis `_shared/blocks/` ; le plan (10) **ordonne** (câblage vs verticale) ; le setup (11) **câble** les blocs. Le **code** des blocs = chantier moat séparé (`_shared/blocks/README.md`).

## Déterminisme
Chaque étape suit une **procédure normée** (ses `references/`). Règle d'or de la stack : **défaut sauf exigence contraire** (`_shared/stack-defaults.md`).
