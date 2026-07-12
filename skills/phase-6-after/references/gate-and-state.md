# Porte kill/continue, état & reprise — Phase 6

La phase porte **une seule porte** (à `19-retro`) mais c'est la plus lourde de conséquence : elle décide si le projet **vit ou meurt**. Ce fichier détaille le protocole de la porte, le graphe des retours arrière, la mise à jour d'état et la reprenabilité.

## La porte : KILL / CONTINUE

### Ce qu'elle décide
Au vu de `metrics/review.md` **confronté** au `Critère de KILL` écrit dans `state.md` au lancement, l'utilisateur tranche :
- **CONTINUE** — le produit mérite une itération. On repart en build/lancement.
- **KILL** — le critère de mort est atteint (ou le porteur décide d'arrêter). On clôt proprement.

### Protocole (comme toute porte SaaS Factory)
1. **Présenter en langage business + preuve** : le critère écrit, les chiffres réels en face, l'écart. Jamais faire lire un artefact technique brut — synthétiser.
2. **Ne jamais trancher à la place de l'utilisateur** : la porte est **sa** décision. On recommande, argumenté, mais on attend l'OK explicite.
3. **Honnêteté anti-flagornerie** : si les chiffres disent kill, on dit kill — on ne romance pas pour faire plaisir. Si l'utilisateur veut continuer contre les chiffres, on le note (décision + raison) sans le maquiller.
4. **Inscrire la décision** dans `state.md` (porte, décision, date) — elle devient acquise et ne se re-demande pas.

### Graphe des retours arrière
```
                      🚪 19-retro : KILL / CONTINUE
                                 │
        ┌────────────────────────┴────────────────────────┐
        ▼ CONTINUE                                         ▼ KILL
  quelle nature d'itération ?                     post-mortem 5 lignes
        │                                          (règle d'or n°9)
   ┌────┴─────────────┐                                   │
   ▼ nouvelle piste   ▼ relance / correctif        archive propre du projet
- **CONTINUE vers Phase 5 (SEO)** — si `metrics/review.md` revele une **fuite d'acquisition SEO** (impressions hautes / CTR bas, pages non rankees) : re-boucle sur `16-seo` mecanisme 5 (iteration contenu/technique) puis re-deploy, coherent avec `18-metrics/references/iteration-engine.md`.
  Phase 4 (build)    Phase 5 (deploy)              (repo, ressources, état = clos)
   → 12-build …       → 17-deploy                          │
        │                   │                              │
        └──────┬────────────┘                              │
               ▼                                           ▼
       à terme, re-boucle en Phase 6            leçons remontées en mémoire
       (mesurer la nouvelle itération)          (lessons.md + learnings.jsonl)
```
- **CONTINUE → Phase 4** quand l'itération est une **nouvelle feature / piste** (les 1-3 pistes de `metrics/review.md`) : on re-descend d
- **KILL** → **post-mortem de 5 lignes**, archive propre, et surtout : **on capitalise** — c'est un kill qui a de la valeur seulement si la mémoire en sort enrichie.
- Le retour arrière **traverse toujours l'orchestrateur de la phase cible** (jamais d'appel direct à une étape hors de sa phase) — cohérence avec le master.

## Kill = pas un échec (cadrage)
Un kill au critère écrit est un **succès de méthode** : il évite le zombie (règle d'or n°9, anti-pattern « projet qu'on traîne »). Le post-mortem répond en 5 lignes : *quoi, pourquoi ça n'a pas pris, ce qu'on a appris, ce qu'on referait autrement, ce qui remonte en mémoire.* Puis on archive — sans dramatiser, sans effacer les leçons.

## Mise à jour de l'état — quand & quoi
Format : `_shared/state-schema.md`. À **chaque transition** de la phase, mettre à jour `.saas-factory/state.md` :
- **Étape courante** (`18-metrics` → `19-retro`) + **Statut** (`en cours` | `porte en attente` | `fait`).
- **Porte franchie** : ajouter `(kill/continue, décision, date)` une fois tranchée.
- **Si CONTINUE** : noter la **cible du retour** (Phase 4 nouvelle piste, ou Phase 5 relance) + la piste retenue depuis `metrics/review.md`.
- **Si KILL** : marquer le projet **clos** + lien vers `retro/retro.md` (post-mortem).
- **Mémoire** : cocher que `learnings.jsonl` et `_shared/lessons.md` ont été enrichis (l'actif long terme est le vrai livrable).

**Écrivain unique** : seul **l'orchestrateur** écrit `state.md` — jamais 18/19 ni un sous-agent. Ils produisent leur artefact (`metrics/*`, `retro/*`) et te le rapportent ; toi seul consignes, à chaque transition. Règle canonique (+ l'unique exception `01-discover`) : `skills/saas-factory/references/state-resume.md` §Écrivain unique.

**Interdit d'état (sécurité)** : jamais de secret / clé dans `state.md` ni dans aucun artefact de projet (`safety-rails.md` §4). La mémoire projet vit dans `~/.saas-factory/` ; aucun secret n'y est écrit non plus.

Puis **résumer en 2 lignes** où on en est et annoncer la suite (itération vers P4/P5, ou clôture).

## Reprise — les cas
| Situation à l'ouverture de `state.md` | Action de la phase |
|---|---|
| `Statut = porte en attente` sur la porte kill/continue | ne rejoue **pas** `18`/`19` : **re-présente la porte** avec `metrics/review.md` + critère, attends la décision |
| `Statut = en cours` sur `18-metrics` | reprends `18` ; s'il a déjà écrit `metrics/review.md`, enchaîne `19` |
| `Statut = en cours` sur `19-retro` | reprends `19` (rétro/mémoire), puis présente la porte |
| `Statut = fait` sur `19-retro`, décision `continue` inscrite | **ne redemande pas** la porte — route vers la cible enregistrée (P4/P5) |
| `Statut = fait`, décision `kill` inscrite | projet **clos** — ne rien relancer ; la mémoire est déjà enrichie |

La reprenabilité est un contrat : deux sessions successives sur le même projet produisent le **même** enchaînement déterministe à partir de l'état. Une décision de porte déjà inscrite est **acquise** — jamais re-demandée.

## Discipline `_shared` une fois
Les blocs `_shared/*` sont déjà en contexte (lus une fois par le master) et priment. Cette phase **ne les fait pas relire** par `18`/`19`. Seul le détail d'une étape (ses propres `references/`) se charge au moment où l'étape s'exécute. Objectif : contexte minimal, zéro relecture redondante.
