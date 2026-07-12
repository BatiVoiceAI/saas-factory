# Référence — Fan-out multi-features (worktrees parallèles)

Comment lancer plusieurs dev-agents en parallèle sans collision.

## La règle
- **Lanes parallèles** (du plan `tech/execution-plan.md`) = zones de code **disjointes** → **un worktree + un `feature-dev` par lane**, dispatchés **en un seul message** (= exécution concurrente).
- **Features liées** (zone partagée / dépendance) = **même lane, séquentielle** (un seul agent, ou en série).
- **Jamais** deux dev-agents sur la **même** zone en parallèle (superpowers l'interdit — collisions de merge).

## Procédure
1. Crée un worktree isolé par lane parallèle (`using-git-worktrees`), branche `feature/<slug>`.
2. Dispatche les `feature-dev` en parallèle, chacun avec : son **brief de feature** (du PRD/plan, passé **en fichier** pas collé), ses **critères d'acceptation** (recette), sa **zone**, son `status/<feature>.md`, et **le modèle** (cf. `org-hierarchy.md`).
3. Suis l'avancement en **lisant** les `status/*.md` (jamais « en mémoire »).
4. Au retour : vérifie l'absence de conflit, **merge**, puis lance la **passe d'intégration**.

## Anti-patterns (repris de superpowers)
- Ne colle pas l'historique des tâches précédentes dans les dispatches : **un dispatch = une tâche**, pas la session. Artefacts lourds = par fichier.
- Ne sur-parallélise pas : plus de lanes = plus de bugs de jonction. Suis les frontières de modules de l'architecture (étape 9).

---

## Data-flow du fan-out (plan → worktrees → merge → intégration)
```
tech/execution-plan.md  (§5 lanes · §6 carte de délégation)
        │  le Tech Lead lit lanes + zones + spec de validation (§7)
        ▼
   walking skeleton mergé sur main  ← PRÉ-REQUIS (voir walking-skeleton.md)
        │
        ├── worktree feature/A ─ feature-dev(A) ─┐
        ├── worktree feature/B ─ feature-dev(B) ─┤  EN PARALLÈLE
        └── worktree feature/C ─ feature-dev(C) ─┘  (1 seul message)
                    │ chacun boucle son dev-loop, écrit status/NN-*.md
                    ▼
        Tech Lead LIT les status/*.md (jamais « en mémoire »)
                    ▼
        merge séquentiel A → B → C sur main (voir integration-pass.md)
                    ▼
        PASSE D'INTÉGRATION (bugs de jonction) → DEV-DONE consolidé
```

## Étape 1 — Dériver les lanes depuis le plan (procédure)
Le plan (étape 10, §5) donne déjà les lanes, mais tu **re-vérifies** avant de dispatcher :
1. Liste, par tâche : **zones de code touchées** + **dépend de**.
2. Deux tâches à zones **disjointes** et **sans dépendance** croisée → **lanes parallèles**.
3. Zone **partagée** ou dépendance → **même lane, séquentielle**.
4. Applique le **matelas de sécurité** : dans le doute sur un chevauchement de zone → séquentialise (le coût d'un merge en série < le coût d'un bug de jonction).

## Matrice de routage — parallèle vs séquentiel
| Relation entre deux features | Zone de code | Dépendance | Décision |
|---|---|---|---|
| Indépendantes | disjointes | aucune | **Lanes parallèles** (dispatch groupé) |
| L'une consomme la sortie de l'autre | disjointes | oui (B dépend de A) | **Séquentiel** : A finit → B démarre |
| Touchent le même module/fichier | partagée | — | **Même lane, séquentielle** (jamais 2 en //) |
| Partagent un contrat/schéma commun (types, migration) | frontière | implicite | Écris le **contrat d'abord** (1 tâche), puis parallélise les consommateurs |
| Chevauchement incertain | flou | flou | **Séquentialise par prudence** + drapeau de conflit dans status |

## Matrice — combien de lanes en parallèle
| Situation | Largeur de fan-out |
|---|---|
| Features vraiment disjointes, architecture nette (étape 9) | Parallélise large — c'est le gain |
| Frontières de modules floues, beaucoup de types partagés | Réduis : 2-3 lanes max, plus de séquentiel |
| Walking skeleton pas encore vert sur main | **0 fan-out** — le skeleton d'abord, séquentiel |
| Migration de schéma BDD impliquée | La migration en **solo** d'abord, puis fan-out des consommateurs |

## Anatomie d'un dispatch (voir `dispatch-brief.md` pour le détail)
Chaque `feature-dev` reçoit, **par fichier** pour les artefacts lourds, **inline** pour les pointeurs :
1. Le **brief de feature** (extrait PRD + critères d'acceptation) — **en fichier**.
2. Sa **zone de code** exacte (worktree/branche + dossiers autorisés).
3. Le **chemin de son `status/NN-<feature>.md`**.
4. Le **modèle** à utiliser (cf. `org-hierarchy.md` — jamais implicite).
5. Les invariants : TDD strict, budget d'itération, pas de secret, ne pas sortir de la zone.

## Forcing-question — « ce dispatch est-il prêt à partir ? »
Avant d'envoyer un `feature-dev`, force la vérification :
- **Ask exact** : *« Ce dispatch contient-il tout pour finir SANS revenir poser une question, et RIEN d'une autre feature ? »*
- **Push-until** : prêt quand les 5 éléments d'anatomie sont présents **et** que la zone est disjointe de toutes les autres lanes actives.
- **Red-flags — dispatch à ne pas envoyer** :
  - brief collé depuis la conversation (contexte de session parasite) au lieu d'un fichier,
  - zone qui chevauche une lane déjà lancée,
  - modèle non spécifié (l'agent hériterait du modèle de session, souvent le plus cher),
  - critères d'acceptation absents (le dev n'aurait pas de recette → pas de critère d'arrêt).
- **MOU vs FORT** :
  - MOU : *« Construis la feature de commentaires. »*
  - FORT : *« Feature `08-comments`, worktree `feature/comments`, zones `src/comments/**` + `src/api/comments.ts` uniquement, brief `briefs/08-comments.md`, critères d'acceptation inclus, status `status/08-comments.md`, modèle rapide. TDD strict, budget 5 tours. »*

## Suivi de l'avancement (async par fichiers)
- Tu **lis** `status/*.md`, tu ne te fies **jamais** à ta mémoire de session.
- États attendus : `PENDING` → `DEV-DONE` → (`DONE_WITH_CONCERNS` si budget épuisé, `BLOCKED` si dépendance/clé manquante).
- Un dev `BLOCKED` **ne bloque pas** les autres lanes : elles continuent ; tu traites le blocage à la convergence.

## Modes d'échec du fan-out
| Mode d'échec | Symptôme | Parade |
|---|---|---|
| **Sur-parallélisation** | Merges pleins de conflits, jonctions cassées | Moins de lanes, suis les frontières de modules (étape 9) |
| **Zones qui se chevauchent** | Deux devs éditent le même fichier | Ne jamais lancer : séquentialise, drapeau de conflit |
| **Contexte de session collé** | Le dispatch traîne l'historique d'autres tâches | Un dispatch = une tâche ; artefacts en fichier |
| **Dispatch en série au lieu de groupé** | Pas de concurrence réelle (attente entre agents) | Lanes indépendantes = **un seul message** avec tous les dispatches |
| **Modèle implicite** | Coût qui explose | Toujours spécifier le modèle par dispatch |
| **Blocage propagé** | Un dev bloqué gèle tout | Isole : les autres lanes avancent, on résout à la convergence |
