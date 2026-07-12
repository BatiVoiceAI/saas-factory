# Orchestration playbook — Phase 3 (le flux exécutable)

La profondeur de l'orchestrateur. Le SKILL.md donne l'aperçu ; ici vit la mécanique : **comment enchaîner, calibrer, tenir l'autonomie**, sans jamais faire le travail des étapes à leur place. Lu à l'usage. La tenue de l'état, le protocole d'autonomie et les retours arrière ont leur propre référence : `state-and-decisions.md`.

## Ce que fait (et ne fait pas) l'orchestrateur

L'orchestrateur n'écrit **aucun artefact `tech/*`**, ne conçoit **aucune archi**, ne provisionne **rien lui-même**, ne pose **aucune question technique** (« Postgres ou Mongo ? » = échec — c'est le CTO de l'étape 9 qui tranche). Sa valeur tient en quatre gestes, répétés à chaque étape :

1. **Enchaîner** — invoquer le bon skill expert, dans l'ordre, une fois l'artefact amont écrit.
2. **Calibrer** — adapter le périmètre des 3 étapes au type (public / interne / perso) et à la présence de la config infra.
3. **Tenir l'état** — mettre à jour `.saas-factory/state.md` après chaque étape (cf. `state-and-decisions.md`).
4. **Garantir l'audit trail** — s'assurer que chaque décision autonome est **loguée** (ADR pour la stack, section audit du plan, `provisioning-log`) et que les points sensibles sont **`[SÉCU]`**. Aucune porte utilisateur ne remplace ce log — l'audit *est* la traçabilité de la phase.

Anti-pattern à s'interdire : **faire le travail de l'étape** (dessiner l'architecture soi-même, improviser un graphe de tâches, provisionner à la main). Si un expert semble « lent », on l'invoque quand même — la répétabilité vient de sa procédure normée, pas d'un raccourci de l'orchestrateur.

## Table de séquence (le contrat d'enchaînement)

Chaque ligne = une étape. On ne passe à la suivante que lorsque l'artefact **écrit** existe et que `state.md` est à jour.

| # | Skill expert | Rôle | Lit | Écrit | Moteur | Décisions |
|---|---|---|---|---|---|---|
| 9 | `09-architecture` | Exigences (NFR) → découpage → stack + ADR + split réutiliser/build | `product/*`, `DESIGN.md`, `research/idea-brief.md` | `tech/architecture.md`, `tech/decisions.md` | `_shared/stack-defaults.md` (défaut sauf exigence) · `_shared/archetypes/` · `_shared/blocks/` | tranchées + **loguées en ADR** · `[SÉCU]` signalés |
| 10 | `10-execution-plan` | Graphe TDD ordonné + lanes // + délégation + spec de validation | `tech/architecture.md`, `tech/decisions.md`, `product/*`, `DESIGN.md`, `_shared/blocks/`, `_shared/validation-cascade.md` | `tech/execution-plan.md` | principes encodés (`skills/10-execution-plan/references/decision-principles.md`) | tranchées + **audit trail** · `[SÉCU]` signalés |
| 11 | `11-project-setup` | Scaffold + `CLAUDE.md` + provisioning automatique (sous-agents) | `tech/*`, `_shared/archetypes/`, `_shared/blocks/`, `~/.saas-factory/config.json` | repo, `CLAUDE.md`, `tech/provisioning-log.md`, `status/provision-*.md` | **MCP officiels** (GitHub, Supabase, Cloudflare, Vercel, Stripe opt.) | idempotent + rollback partiel + **provisioning-log** |

**Précondition d'invocation** : avant d'appeler l'étape N, vérifier que l'artefact attendu par N (colonne « Lit ») existe. S'il manque (reprise partielle) → signal de reprise (voir `state-and-decisions.md`), **pas** un feu pour improviser le contenu manquant. Cas particulier étape 9 : si le PRD amont (`product/*`) est **flou, incomplet ou contradictoire**, l'expert **renvoie à la Phase 2** au lieu de combler côté produit — l'orchestrateur relaie ce renvoi, il ne le contourne pas.

## Calibrage & routage par type

Le `Type / route` (public / interne / perso) et l'`Ambition` (court / complet) sont fixés dès la Phase 1 et lus dans `state.md`. En Phase 3, les **3 étapes restent actives** (on a toujours besoin d'une archi, d'un plan et d'un repo) ; ce qui varie, c'est le **périmètre** de chaque étape — jamais sa rigueur. La matrice ci-dessous est **clé par `type`**, l'ambition (court / complet) étant rappelée entre parenthèses.

### Matrice de calibrage

| Type / route | 09-architecture | 10-execution-plan | 11-project-setup |
|---|---|---|---|
| **public** (complet) | archi complète : NFR full, multi-tenant/RLS, scalabilité, sécurité | graphe complet, lanes // maximales, délégation multi-agents, cascade paramétrée full | provisioning **réel** complet (repo+CI, BDD+RLS, sous-domaine+host, email) |
| **interne** (court) | archi centrée sur le fit outils/process/sécu de la boîte ; NFR resserrée sur les contraintes internes | graphe simplifié, parallélisme selon la taille réelle du produit | provisioning réel **si** config présente ; scope adapté à un déploiement interne |
| **perso** (court) | archi minimale mais tracée (stack par défaut sauf exigence), pas de sur-ingénierie | graphe court, walking skeleton en priorité, peu de lanes | provisioning léger si config ; sinon **fallback local** assumé |

### Règles de calibrage
- **Périmètre ≠ bâclage.** Une route courte (perso/interne) allège l'*étendue* (moins de features, moins de lanes, infra plus légère), pas la *discipline* (TDD, ADR, spec de validation, log restent).
- **La stack par défaut est le point de départ dans tous les cas** (`_shared/stack-defaults.md`) : on ne dévie que sur exigence technique justifiée par un ADR — même en perso.
- **Le fallback local (11) est un calibrage assumé, pas un échec** : sans `config.json`, on scaffolde en local + `tech/api-keys-guide.md`, et on invite à lancer `infra-setup`. On ne provisionne **rien de réel** sans config (safety-rails §1 bis / §6).
- **Trace le calibrage** dans `state.md` (`Type / route`, décisions verrouillées) : une décision de périmètre est loguée, jamais silencieuse.

## Pré-vol infra (la bascule réel ↔ fallback)

Avant l'étape 11 (idéalement dès le démarrage de la phase, pour prévenir tôt) :

```
lire ~/.saas-factory/config.json ?
  ├─ présente  → étape 11 = provisioning RÉEL (MCP officiels, sandbox, dépense loguée)
  └─ absente   → prévenir l'utilisateur : « lance infra-setup une fois pour l'auto-provisioning »
                 → étape 11 = FALLBACK : scaffold local + tech/api-keys-guide.md
                 → ne provisionne AUCUNE ressource réelle
```

C'est le seul point où l'absence de setup change le comportement de la phase. Ce n'est **pas** une porte (on ne bloque pas, on informe et on route vers le fallback). L'étape 11 porte elle-même la machine à états idempotente ; l'orchestrateur se contente de **signaler le mode** (réel vs fallback) et de le noter dans `state.md`.

## Discipline « lire `_shared` une fois »

Objectif : progressive disclosure, pas de rechargement inutile de contexte.

- **Au démarrage de la phase**, l'orchestrateur lit **une fois** : `references/conventions.md`, `_shared/lessons.md`, `_shared/safety-rails.md`, `_shared/stack-defaults.md`, `_shared/blocks/README.md`, `_shared/validation-cascade.md`. Ces règles priment sur le comportement par défaut et restent valables toute la phase.
- **Ne recharge pas** ces blocs entre deux étapes. Chaque skill expert relit lui-même ce dont il a besoin à son propre démarrage (`_shared/*`, `conventions.md`) — c'est son travail, pas celui de l'orchestrateur.
- **Charge le détail au moment utile** : les `references/` d'une étape (9/10/11) se lisent quand cette étape s'exécute, pas avant. Le SKILL et ce playbook restent volontairement courts pour tenir en contexte tout du long.
- **Ne réinjecte pas** le contenu des `_shared/*` dans `state.md` ni dans les artefacts `tech/*` — on y référence, on n'y recopie pas. Et **jamais de secret** dans les artefacts de projet ni dans `state.md` (les accès vivent dans `~/.saas-factory/`, cf. `safety-rails`).

## Boucle nominale (pseudo-procédure)

```
lire une fois : conventions.md + lessons.md + safety-rails.md + stack-defaults.md
               + blocks/README.md + validation-cascade.md
reprendre l'état : state-and-decisions.md → (nouveau ? state.md à jour : reprendre à l'étape courante)

pré-vol infra : config.json présente ? → noter le mode (réel | fallback) dans state.md

invoquer 09-architecture → architecture.md + decisions.md
  (si PRD flou/contradictoire → relayer le renvoi à la Phase 2, ne pas combler)
  résumer en 2 lignes · mettre à jour state.md (stack verrouillée, ADR, split)

invoquer 10-execution-plan → execution-plan.md
  résumer en 2 lignes · mettre à jour state.md (audit trail présent, [SÉCU] relevés)

invoquer 11-project-setup → repo + CLAUDE.md + provisioning-log.md
  (échec d'une ressource → rollback partiel + repli honnête, pas de succès simulé)
  résumer en 2 lignes · mettre à jour state.md (provisioning : repo/BDD/host/email)

fin de phase : repo prêt + infra provisionnée (ou fallback documenté) → annoncer Phase 4 (12-build)
```

Voir `state-and-decisions.md` pour la tenue précise de `state.md`, la reprise, le protocole d'autonomie (zéro porte + audit) et la matrice de retour arrière.
