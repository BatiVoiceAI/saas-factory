# État, autonomie & retours arrière — Phase 3

Comment l'orchestrateur **tient l'état**, **reprend** un run interrompu, **garantit l'autonomie sans porte** (et pourquoi c'est sûr), et **rebrousse chemin** quand un garde-fou interne se déclenche. Lu à l'usage. Le flux d'enchaînement et le calibrage sont dans `orchestration-playbook.md` ; le schéma d'état canonique est `_shared/state-schema.md`.

## Tenue de `.saas-factory/state.md`

Le fichier d'état est le **journal de reprise** du projet. En Phase 3, on met à jour après **chaque** étape. Champs pertinents ici (schéma complet : `_shared/state-schema.md`) :

- **Phase / Étape / Statut** — `Phase : 3` ; `Étape : 09 | 10 | 11` ; `Statut : en cours | fait`. (Pas de `porte en attente` en Phase 3 — il n'y a pas de porte.)
- **Décisions verrouillées** — mis à jour à l'étape 9 : `Stack : {défaut / déviations ADR}`. Mis à jour à l'étape 11 : `Provisioning : {repo, sous-domaine, BDD, host, email}`.
- **Mode infra** — noter au pré-vol : `réel` (config présente) ou `fallback local` (config absente). C'est ce qui explique, à la reprise, pourquoi l'étape 11 a scaffolé sans provisionner.
- **Type / route** — déjà posé en Phase 1 ; on le **lit** pour calibrer (cf. matrice du playbook), on ne le réécrit pas.

Règles dures : **aucun secret / clé** dans `state.md` (les accès vivent dans `~/.saas-factory/`, safety-rails §4) ; on **référence** les `_shared/*`, on n'y recopie pas leur contenu. **Écrivain unique** : seul **l'orchestrateur** écrit `state.md` — jamais les experts/sous-agents (ils produisent `tech/*` et te le rapportent). Règle canonique (+ l'unique exception `01-discover`) : `skills/saas-factory/references/state-resume.md` §Écrivain unique.

### À écrire après chaque étape

| Après | Écrire dans `state.md` |
|---|---|
| 09 | `Étape : 09 = fait` · `Stack : {défaut + déviations ADR}` · split réutiliser/build noté · `[SÉCU]` éventuels relevés |
| 10 | `Étape : 10 = fait` · audit trail présent dans `execution-plan.md` · budget d'itération de la cascade paramétré · `[SÉCU]` reportés |
| 11 | `Étape : 11 = fait` · `Provisioning : {repo ✓, BDD ✓, host ✓, email ✓}` (ou mode fallback) · renvoi à `tech/provisioning-log.md` |

## Procédure de reprise

Au (re)démarrage de la phase, **ne repars jamais de zéro**. Relis `state.md` et reprends :

```
lire state.md
  ├─ Étape 09 non faite → (re)lancer 09-architecture
  ├─ Étape 09 faite, 10 non faite → vérifier tech/architecture.md + tech/decisions.md existent → lancer 10
  ├─ Étape 10 faite, 11 non faite → vérifier tech/execution-plan.md existe → pré-vol infra → lancer 11
  └─ Étape 11 en cours (run interrompu) → NE PAS relancer à blanc :
        l'étape 11 est IDEMPOTENTE — elle relit status/provision-*.md,
        détecte les ressources déjà créées et reprend là où ça s'est arrêté
        (machine à états de 11-project-setup : skills/11-project-setup/references/idempotence-rollback.md)
```

Précondition manquante à la reprise (ex. `tech/architecture.md` absent alors que `state.md` dit « 09 fait ») = **incohérence d'état**, pas une invitation à improviser l'artefact : relancer l'étape qui le produit.

## Protocole d'autonomie — pourquoi zéro porte, et comment ça reste sûr

La Phase 3 n'a **aucune porte utilisateur** (contrainte de phase). Ce n'est pas un relâchement : c'est un **déplacement** de la validation, de « demander à l'humain » vers « trancher par principe + tout loguer ». Trois piliers :

1. **Décision par principes encodés.** Toute ambiguïté technique se tranche via des règles écrites, pas au feeling :
   - Stack/archi (étape 9) : **« défaut sauf exigence contraire »** (`_shared/stack-defaults.md`), chaque déviation justifiée par un **ADR** dans `tech/decisions.md`.
   - Plan/ordonnancement (étape 10) : les **principes encodés** (`skills/10-execution-plan/references/decision-principles.md`).
   - Provisioning (étape 11) : **MCP officiels** + skills de référence des éditeurs (RLS/DNS corrects, pas d'hallucination).
2. **Audit trail systématique.** Chaque décision est tracée là où on pourra la relire : ADR (9), section audit du plan (10), `tech/provisioning-log.md` (11). L'audit **remplace** la porte comme mécanisme de traçabilité — rien n'est masqué.
3. **Marqueurs `[SÉCU]`.** Tout point sécurité-sensible tranché en autonomie est **signalé `[SÉCU]`** dans les logs, pour la **revue sécu de la Phase 4** — jamais enterré. L'autonomie ne fait pas disparaître le risque, elle le **rend visible en aval**.

Garde-fous safety-rails toujours actifs (l'autonomie est **bornée**) : provisioning pré-autorisé **seulement** sous sandbox (§2), dépense **visible et loguée** (§1 bis), secrets en env (§4), **repli honnête** si un accès manque (§6). Une action qui sortirait de ce cadre (toucher une prod existante, dépense non loguée, secret en dur) **n'est pas** couverte par l'autorisation durable — on s'arrête et on le dit.

## Matrice de retour arrière (les garde-fous internes)

« Zéro porte » ne veut pas dire « jamais de retour arrière ». Quand un garde-fou interne se déclenche, on **rebrousse chemin de façon déterministe** — sans jamais simuler un succès.

| Déclencheur | Détecté à | Retour arrière |
|---|---|---|
| **PRD flou / incomplet / contradictoire** | étape 9 (ingestion du fonctionnel) | **Renvoi à la Phase 2** : on ne comble pas côté produit. L'orchestrateur relaie le renvoi, note le manque, et attend un PRD corrigé avant de reprendre en 9. |
| **Archi incohérente avec le plan** (le plan révèle un trou d'archi) | étape 10 | Reboucler sur **09-architecture** pour trancher/ajouter l'ADR manquant, puis reprendre 10. Tracé dans `state.md`. |
| **Config infra absente** | pré-vol / étape 11 | Bascule en **fallback local** (scaffold + `tech/api-keys-guide.md`), invite à `infra-setup`. Pas de provisioning réel. Ce n'est pas un échec — c'est un mode documenté. |
| **Échec de provisioning d'une ressource** | étape 11 | **Rollback partiel** (défaire proprement ce que ce run a créé, ou laisser un état re-jouable documenté) + **repli honnête** (safety-rails §6) : s'arrêter, le dire, produire un guide pas-à-pas. **Jamais** de demi-provisioning silencieux ni de succès fabriqué. |
| **Accès / KYC / capacité manquante** (clé indisponible, quota) | étape 11 | Repli honnête : état clair + guide. On ne bluffe pas un résultat plausible. |

## Passation vers la Phase 4

Fin de Phase 3 quand les trois artefacts existent et que `state.md` le reflète :
- `tech/architecture.md` + `tech/decisions.md` (stack verrouillée, ADR, split réutiliser/build),
- `tech/execution-plan.md` (graphe TDD + lanes + spec de validation + audit),
- repo scaffané + `CLAUDE.md` projet + `tech/provisioning-log.md` (ou fallback local documenté).

Livrable de phase : **repo prêt à builder + infra provisionnée**. On met `state.md` à jour (`Étape : 11 = fait`, provisioning consigné) et on **annonce la Phase 4 (`12-build`)** — qui lit `tech/execution-plan.md` et le `CLAUDE.md` projet comme source de vérité des agents de build. Les `[SÉCU]` relevés en Phase 3 sont l'entrée de la **revue sécu** de la Phase 4.
