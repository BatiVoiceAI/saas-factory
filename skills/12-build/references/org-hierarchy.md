# Référence — L'org d'ingénierie (CTO → Tech Lead → devs)

L'organisation en agents, façon vraie startup. Chaque rôle = un agent-persona (`agents/`).

## Les rôles
- **CTO** (`agents/cto.md`) — direction technique : possède `tech/execution-plan.md` + `tech/architecture.md`, fixe l'ordre (walking skeleton d'abord), les contraintes, les patterns du châssis. Spawn le(s) Tech Lead(s). *(En étape 13 : cran de revue CTO.)*
- **Tech Lead** (`agents/tech-lead.md`) — manage une **équipe de dev-agents** : répartit les features en lanes/worktrees, coordonne, lance la passe d'intégration. *(En étape 13 : cran de revue Tech Lead.)*
- **Dev** (`agents/feature-dev.md`) — implémente **une** feature en TDD + recette, dans son worktree.

## Le moteur superpowers (à vendorer)
À copier dans `vendor/superpowers/` depuis l'install officielle (MIT, auto-contenu — pas de binaire, pas de télémétrie) :
- `subagent-driven-development` — le pattern dispatch → implement → self-review → review-loop (notre **moteur par-feature**).
- `test-driven-development` — l'Iron Law (test rouge avant tout code).
- `using-git-worktrees` — isolation par feature.
- `requesting-code-review` (`code-reviewer.md`) — le **gabarit de gate**, à cloner pour les crans de l'étape 13.
- `verification-before-completion`, `dispatching-parallel-agents`.
> Discipline : conserver la **notice MIT** (Jesse Vincent). Préfixer `saas-factory-` pour éviter les collisions avec une install superpowers existante.

## Sélection de modèle (repris de superpowers)
Implémenteur mécanique → modèle rapide/cheap ; intégration/jugement → standard ; archi/revue → le plus capable. **Toujours spécifier le modèle** en dispatchant un sous-agent (sinon il hérite du modèle de session, souvent le plus cher).

---

## Organigramme & flux de contrôle
```
                 ┌───────────────────────────────┐
                 │  CTO (agents/cto.md)           │
                 │  possède plan + architecture   │
                 │  fixe ordre & contraintes       │
                 └───────────────┬───────────────┘
                                 │ spawn
                                 ▼
                 ┌───────────────────────────────┐
                 │  Tech Lead (agents/tech-lead)  │
                 │  lanes → worktrees, coordonne, │
                 │  merge, passe d'intégration    │
                 └───────┬───────────┬───────────┘
                         │ dispatch (1 msg, //)  │
              ┌──────────┼──────────┬────────────┼─────────┐
              ▼          ▼          ▼             ▼
        feature-dev  feature-dev  feature-dev   …          (1 feature = 1 worktree)
              │          │          │
              └──── status/*.md (async, par fichier) ───────┘
```
La communication descend par **dispatch** (Task) et remonte par **fichiers** (`status/*.md`). Jamais de coordination « en mémoire de session ».

## Qui décide quoi (matrice de responsabilité)
| Décision | CTO | Tech Lead | feature-dev |
|---|---|---|---|
| Ordre du build (skeleton d'abord) | **décide** | applique | — |
| Contraintes d'archi / patterns du châssis | **décide** | fait respecter | applique |
| Découpage lanes / worktrees | valide | **décide** | — |
| Choix du modèle par dispatch | cadre | **décide** | — |
| Implémentation d'une feature (TDD+recette) | — | — | **décide** |
| Franchir une frontière de zone | interdit | arbitre si conflit | **remonte** (jamais de soi-même) |
| Merge + passe d'intégration | supervise | **exécute** | — |
| Déclarer une feature `DEV-DONE` | — | consolide | **propose** (via recette) |

## Sélection de modèle — routage par nature de tâche
| Nature de la tâche dispatchée | Modèle | Pourquoi |
|---|---|---|
| Câblage de bloc, CRUD mécanique, glue code | **rapide / cheap** | Peu de jugement, beaucoup de volume |
| Feature custom avec logique métier | **standard** | Jugement modéré, cœur du produit |
| Walking skeleton, passe d'intégration, jonctions | **standard → capable** | Vision transverse requise |
| Architecture, arbitrage, revue (étape 13) | **le plus capable** | Coût d'erreur élevé |
> Règle d'or : **toujours** nommer le modèle dans le dispatch. Un dispatch sans modèle hérite du modèle de session (souvent le plus cher) — fuite de coût silencieuse.

## Frontière étape 12 vs étape 13 (ne pas confondre les casquettes)
Le CTO et le Tech Lead ont **deux casquettes** selon l'étape :
- **Étape 12 (ici)** : casquette **build** — le CTO dirige, le Tech Lead dispatche/merge/intègre. On **construit et on auto-teste**.
- **Étape 13** : casquette **revue** — les mêmes agents deviennent des **crans de validation** (Tech Lead → CTO → Designer → CEO), prisme adversarial. On **juge**, on ne construit plus.
> HARD GATE : en étape 12, le dev n'est **pas** le juge final. Il livre ce qui passe **ses** critères ; la validation montante est l'étape 13.

## Handoff — ce qui monte la cascade
Une feature `DEV-DONE` remonte avec, dans `status/NN-<feature>.md` : tests verts (nb/total), recette OK, self-review OK, `[SÉCU]` éventuels, reste/risques. C'est le **contrat d'entrée** de l'étape 13 (voir `_shared/validation-cascade.md` et `skills/13-reviews/`).
