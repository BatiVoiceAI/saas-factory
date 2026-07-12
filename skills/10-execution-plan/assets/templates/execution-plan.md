# Plan d'exécution — {nom du projet}
> Produit par l'étape 10 (composer). Graphe de tâches pour les agents de build (Phase 4). **Pas un calendrier.**
> Archétype : {web-saas} · Date : {AAAA-MM-JJ}

## 1. Synthèse
{Nb de features · nb de lanes parallèles · le walking skeleton en une phrase.}

## 2. Réutilisation vs build (80/20)
| Module | Réutilise un bloc | ou Custom (verticale) |
|---|---|---|
| … | `_shared/blocks/{bloc}` | — |
| … | — | build custom |

## 3. Walking skeleton (à faire en premier)
{La tranche verticale mince : auth → action cœur → persistance → affichage. Les tâches qui la composent.}

## 4. Graphe de tâches
> Chaque tâche : 1 test rouge d'entrée, 1 zone de code dominante, committable seule (voir `references/task-graph.md`).

| # | Tâche (TDD) | Feature | Zone de code | Dépend de | Réutilise / Custom | Test rouge d'entrée |
|---|---|---|---|---|---|---|
| T1 | … | … | … | — | … | … |

## 5. Lanes (parallélisation)
- **Lane A** (séquentielle) : walking skeleton → …
- **Lane B** (parallèle) : {tâches à zones disjointes}
- **Lane C** (parallèle) : …
- **Ordre de lancement** : walking skeleton → {A + B + C en parallèle} → intégration.
- **Drapeaux de conflit** : {lanes touchant une zone commune, le cas échéant}

## 6. Carte de délégation
> 1 feature = 1 worktree = 1 agent · zones disjointes · statut async au schéma de `references/delegation.md`.

| Lane | Agent | Worktree | Zones de code | Dépend de | Fichier de statut |
|---|---|---|---|---|---|
| … | feature-dev | … | … | — | `status/NN-*.md` |

## 7. Spec de validation par feature (pour la cascade Phase 4)
| Feature | Critères d'acceptation | DoD | Budget d'itération |
|---|---|---|---|
| … | {issus des user stories} | … | {plafond + critère de sortie} |

## 8. Passe d'intégration
{Tâche(s) d'intégration après merge des lanes parallèles — adresse les bugs de jonction.}

## 9. Audit trail des décisions autonomes
> Une ligne par décision non triviale. Chaque ligne cite UN principe P1-P6 (`references/decision-principles.md`). Tag `[SÉCU]` sur tout choix auth / PII / paiement / permissions → repris par la revue sécu de la Phase 4.

| # | Décision | Principe | Alternative écartée | Réversibilité | [SÉCU] ? |
|---|---|---|---|---|---|
| … | … | … | … | … | — |
