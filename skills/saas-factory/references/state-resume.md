# État, reprise & discipline `_shared` — la mémoire de session du master

Le master est le **tenant de l'état** : c'est lui qui garantit qu'on peut **reprendre** un projet interrompu à la bonne phase/étape, et que `_shared/*` n'est lu **qu'une fois**.

## Démarrage — la séquence exacte (une fois par session)

```
1. LIRE _shared/* (une seule fois)   ── priment sur le comportement par défaut
       lessons.md · safety-rails.md · stack-defaults.md
       blocks/README.md · validation-cascade.md · test-dossier.md
                    │
                    ▼
2. REPRENDRE l'état : lire .saas-factory/state.md
       existe ? ──oui──▶ reprends à { Phase, Étape, Statut } courants
              └──non──▶ crée-le (schéma _shared/state-schema.md) ; `git init` si besoin
                    │
                    ▼
3. PRÉ-VOL INFRA : ~/.saas-factory/config.json existe ?
       non ──▶ suggère infra-setup UNE FOIS (débloque provisioning P3/P5)
               refus/skip ──▶ mode local/fallback (jamais bloquant)
       oui ──▶ provisioning auto pré-autorisé (safety-rails §1 bis)
                    │
                    ▼
4. CALIBRER : propage `type` → `Type / route` + `Ambition` (routing.md)
                    │
                    ▼
5. DÉROULER les phases (pipeline.md)
```

## Discipline « lire `_shared` une fois » (progressive disclosure)
- Le **master** lit `_shared/*` au démarrage. Il **ne fait pas relire** ces blocs par chaque orchestrateur de phase — ils sont déjà en contexte et priment.
- Le **détail d'une étape** (ses `references/`) se charge **au moment** où cette étape s'exécute, pas avant.
- Garde ce SKILL + les descriptions **courts** (toujours en contexte). Confie le lourd / parallèle aux **subagents** (`agents/`).
- Objectif : contexte minimal, zéro relecture redondante, la profondeur ne se charge qu'à la demande.

## Mise à jour de l'état — quand & quoi
À **chaque transition** (fin d'étape, fin de phase, franchissement de porte), mets à jour `.saas-factory/state.md` (format `_shared/state-schema.md`) :
- **Phase & étape courantes** + **Statut** (`en cours` | `porte en attente` | `fait`).
- **Cadrage** : `Type / route`, `Archétype`, `Ambition`, `Critère de KILL` (écrit au lancement).
- **Portes franchies** : ajoute (porte, décision, date) à chaque 🚪 (cf. `gates.md`).
- **Décisions verrouillées** : stack (défaut/ADR), provisioning (repo, sous-domaine, BDD, host).
- **Budget d'itération** : plafonds cascade (13) et client (15), tours consommés.
- **Features** : renvoi à `status/<feature>.md` (cran de cascade par feature).

Puis **résume en 2 lignes** où on en est et annonce la prochaine phase / porte.

## Écrivain unique de `state.md` (règle canonique — les phases y renvoient)
Un seul processus écrit `.saas-factory/state.md` à un instant donné : **l'orchestrateur en charge** — le master entre les phases, l'orchestrateur de phase pendant sa phase. **Jamais** un skill expert ni un sous-agent : ils produisent leurs artefacts (`research/*`, `product/*`, `tech/*`, `status/*`, `seo/*`, `metrics/*`…) et rapportent ; l'orchestrateur seul consigne, à la frontière d'étape. C'est ce qui évite les MAJ concurrentes/incohérentes quand plusieurs agents tournent en parallèle (format : `_shared/state-schema.md`).

**Exception unique, documentée : `01-discover`.** Première étape d'un projet neuf, exécutée sans aucun parallélisme : elle peut **initialiser** `state.md` et y inscrire le `type` capté si l'orchestrateur de P1 ne l'a pas encore créé. Dès la sortie de l'étape 1, l'orchestrateur reprend la main (il vérifie/complète cette entrée) et la règle générale s'applique sans autre exception.

Les fichiers de phase **renvoient** à ce paragraphe — la règle ne se redéfinit nulle part ailleurs.

## Interdits d'état (sécurité)
- **Jamais de secret / clé** dans `.saas-factory/state.md` ni dans aucun artefact de projet (`_shared/safety-rails.md` §4). Les accès infra vivent dans `~/.saas-factory/` (config + `.env` chmod 600) ou côté connecteur MCP/OAuth.
- Jamais de secret loggé, commité, ni collé en conversation.

## Reprise — les cas
| Situation à l'ouverture de `state.md` | Action du master |
|---|---|
| `Statut = porte en attente` | ne rejoue pas la phase : **re-présente la porte** et attends la décision |
| `Statut = en cours` sur étape N | reprends l'étape N (ré-invoque l'orchestrateur de sa phase, qui reprend l'étape) |
| `Statut = fait` sur la dernière étape d'une phase | enchaîne la **phase suivante** |
| pas de fichier d'état | nouveau projet → crée l'état, démarre P1 |
| `type` déjà fixé | **ne repose pas** le cadrage — applique le routage enregistré (`routing.md`) |
| décision de porte déjà inscrite | **ne redemande pas** — c'est acquis, route selon la décision |

La reprenabilité est un contrat : deux sessions successives sur le même projet doivent produire le **même** enchaînement déterministe à partir de l'état.
