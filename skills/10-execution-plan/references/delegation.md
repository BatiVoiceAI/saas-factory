# Référence — Délégation aux agents (worktrees, async)

Comment mapper le graphe de tâches (`task-graph.md`) sur des agents de build parallèles. C'est l'étape [5] du composer.

---

## Règle : 1 feature = 1 worktree = 1 agent
Chaque **lane parallèle** part dans un **worktree git isolé**, piloté par un sous-agent `feature-dev`. Les zones de code étant disjointes (garanti par `task-graph.md`), les agents n'entrent pas en collision.

```
main
 ├─ worktree/skeleton   ← feature-dev (séquentiel, EN PREMIER)
 ├─ worktree/lane-B     ← feature-dev  ┐
 ├─ worktree/lane-C     ← feature-dev  ├─ EN PARALLÈLE (zones disjointes)
 ├─ worktree/lane-D     ← feature-dev  ┘  (après leurs dépendances)
 └─ worktree/integration← feature-dev (séquentiel, EN DERNIER, après merges)
```

## Communication async par fichiers (jamais par la conversation)
Chaque agent écrit son avancement et son verdict dans `status/NN-<feature>.md` : tâche courante, tests, blocage, niveau de validation atteint (cf. `_shared/validation-cascade.md`). L'orchestrateur **lit** ces fichiers pour suivre — pas de mémoire partagée en contexte.

### Schéma du fichier de statut (`status/NN-<feature>.md`)
```markdown
# Statut — NN <feature>
Lane: B · Worktree: worktree/lane-B · Agent: feature-dev
Tâche courante: T7 (rouge→vert)
Tests: 12 verts / 1 rouge (T7 en cours)
Niveau cascade atteint: Développeur (auto-test OK) → en attente Tech Lead
Blocage: — (ou: « attend T-types mergé »)
Itération: 2 / budget 4
```
Cette structure est ce que l'orchestrateur Phase 4 **parse** pour piloter la cascade sans charger le contexte de chaque agent.

## Ce qui se délègue vs ce qui reste séquentiel
- **Délégable en parallèle** : les lanes à zones disjointes (features indépendantes).
- **Séquentiel** : le walking skeleton (avant tout le reste), les tâches sur une zone partagée, les tâches dépendantes.
- **Intégration** : la passe d'intégration après merge (séquentielle, une fois les lanes revenues).

### Matrice de délégation
| Nature de la lane | Worktree | Lancement | Quand |
|---|---|---|---|
| Walking skeleton | dédié | seul | **en premier**, bloque tout le reste |
| Tâche socle amont (types, schéma partagé) | dédié | seul | après skeleton, avant les parallèles qui en dépendent |
| Feature indépendante | 1 par lane | parallèle | après ses dépendances |
| Lane dépendante (export, dashboard) | dédié | séquentiel | après les lanes qu'elle consomme |
| Intégration | dédié | seul | **en dernier**, après tous les merges |

## Dimensionnement
Ne sur-parallélise pas : plus de lanes = plus de bugs de jonction. Regroupe les petites tâches liées dans une même lane. Le bon découpage suit les **frontières de modules** de l'architecture (étape 9), pas un découpage arbitraire.

### Forcing-question — combien de lanes parallèles ?
- **Ask exact** : « Cette lane correspond-elle à une **frontière de module** de `tech/architecture.md`, ou l'ai-je inventée pour paralléliser plus ? »
- **Push-until** : chaque lane = une frontière de module réelle + zones de code disjointes des autres lanes.
- **Red-flags (à refuser)** :
  - Plus de lanes que de frontières de modules → tu fabriques du parallélisme → **regroupe**.
  - Deux lanes qui partagent >1 fichier → ce ne sont pas des lanes disjointes → **fusionne ou séquentialise**.
  - Une lane d'une seule micro-tâche isolée → **fusionne** dans une lane voisine liée.
- **MOU** : « on parallélise tout ce qui peut l'être ». **FORT** : « 3 lanes = 3 modules disjoints (`app/a`, `app/b`, `app/reports`) ; export dépend des deux premiers donc lane séquentielle ; pas de 4ᵉ lane car ça éclaterait le module reports ».
- **Routage** : module disjoint sans dép → lane //. Module couplé/dépendant → même lane séq. Glue transverse → tâche socle amont (pas une lane //).

## Variante AUTOMATION — pas de lane Designer, l'edge passe au CEO-persona
> **Conditionné par `archetype = automation`.** En `web-saas` (défaut), tout ce qui précède est **inchangé**. En automation (headless), la délégation se **simplifie et se recentre** :

- **Aucune lane « design / UI »** : sans surface visuelle, il n'y a pas de feature d'écran à déléguer, et le **cran Designer de la cascade est dégradé/N-A** (`validation-spec.md` §Variante AUTOMATION). Ne fabrique pas une lane pour des états visuels qui n'existent pas.
- **Le walking skeleton = la tranche cron cœur** : déclenchement (one-shot) → lecture **source** → transformation métier → écriture **cible** → **boucle fermée** (notif/rapport au propriétaire) → **claim d'idempotence**. C'est cette verticale, pas un flux auth→UI, qui part **en premier** en séquentiel.
- **Frontières de module typiques** (à mapper en lanes disjointes) : `config`/secrets · `store` (runs + entités, service-role) · `source`/ingestion · `logique métier pure` · `boucle fermée`/notify · `dispatch RUN_MODE` (sync vs digest). Une lane par frontière réelle, comme en web-saas.
- **L'edge (boucle fermée + idempotence) est porté au cran CEO-persona** (propriétaire de l'automatisation), pas au Designer : le fichier de statut `status/NN-<feature>.md` doit donc remonter, pour les features cœur, le **niveau cascade atteint jusqu'au CEO-persona** (et non « en attente Designer »), avec la preuve boucle fermée + idempotence (run **et** entité).

## Modes d'échec (délégation)
| Mode d'échec | Symptôme | Correctif |
|---|---|---|
| Collision de merge | 2 lanes // éditent le même fichier | Extraire tâche socle amont, ou séquentialiser + drapeau |
| Agent bloqué silencieux | `status/NN` pas mis à jour, dépendance non prête | Rendre la dépendance explicite dans la carte + ordre de lancement |
| Sur-parallélisation | N lanes > N modules | Regrouper par frontière de module |
| Statut non parsable | fichier de statut libre, hors schéma | Imposer le schéma `status/NN-<feature>.md` ci-dessus |

## Sortie (dans `tech/execution-plan.md`)
La **carte de délégation** : pour chaque lane → agent, worktree, zones de code, dépendances, fichier de statut.
