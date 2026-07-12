# État & portes — Phase 1 (reprise, gate, retour arrière)

Comment l'orchestrateur **tient `.saas-factory/state.md`**, **reprend** un projet en cours, **pose la porte** de l'étape 5, et **route un retour arrière**. Complément de `orchestration-playbook.md` (le flux) et de `conventions.md` (le contrat d'artefacts). Format de référence du fichier d'état : `_shared/state-schema.md`.

## 1. `.saas-factory/state.md` — quoi écrire, quand

Le fichier d'état est le **bus de reprise** : il permet de reprendre la phase sans relire toute la conversation. Il ne contient **jamais de secret ni de clé** (les accès vivent dans `~/.saas-factory/`). On y écrit du **statut**, pas du contenu de recherche (celui-ci vit dans `research/*`).

Champs tenus par l'orchestrateur en Phase 1 (sous-ensemble du schéma global) :

| Champ | Renseigné | Exemple |
|---|---|---|
| `Type / route` | à l'étape 1, dès captation | `public` |
| `Phase` | fixe en Phase 1 | `1` |
| `Étape` | mise à jour après chaque étape | `03` |
| `Statut` | en continu | `en cours` / `porte en attente` / `fait` |
| Étapes sautées | à l'application du routage | `02-market : sautée (route perso)` |
| Portes franchies | à la décision utilisateur | `Opportunité (étape 5) · Go · 2026-07-11` |
| `Critère de KILL` | si écrit au lancement | `< X avis concurrents crédibles` |

**Cadence d'écriture** : une mise à jour **en sortie de chaque étape** (étape courante + résumé implicite) et **une à la porte** (décision + date). Pas d'écriture au milieu d'une étape — c'est l'expert qui travaille.

**Écrivain unique** : c'est **toi, l'orchestrateur**, qui écris `state.md` — **jamais** les experts/sous-agents. Règle canonique + l'unique exception (`01-discover` peut initialiser `state.md` sur projet neuf, sans parallélisme) : `skills/saas-factory/references/state-resume.md` §Écrivain unique. Ne redéfinis pas la règle ici.

## 2. Reprise (reprenabilité)

Au (re)démarrage de la phase, **avant d'invoquer quoi que ce soit** :

```
si .saas-factory/state.md n'existe pas :
    → nouveau projet. git init si besoin ; créer state.md (schéma _shared/state-schema.md)
    → démarrer à 01-discover
sinon :
    → lire state.md : Type/route, Étape, Statut
    → vérifier sur disque que les artefacts research/* attendus jusqu'à l'étape courante existent
    → reprendre à l'étape courante (ou à la porte si Statut = « porte en attente »)
    → NE PAS relancer les étapes déjà faites (leurs artefacts font foi)
```

Règles de reprise :
- **L'artefact fait foi**, pas la mémoire conversationnelle : si `research/market.md` existe et que `state.md` dit « étape 03 », on reprend à l'étape 3 sans re-miner.
- **Incohérence état ↔ disque** (state.md dit « étape 04 » mais `positioning.md` manque) : ne pas deviner — signaler l'incohérence à l'utilisateur et proposer de reprendre à la dernière étape réellement complète.
- **Route respectée à la reprise** : on relit `Type / route` et on reprend la **bonne** séquence (une reprise perso ne réactive pas 02-04).

## 3. Protocole de porte (étape 5)

La porte est **portée par `05-opportunity`** (`skills/05-opportunity/references/gate-and-routing.md`), mais l'orchestrateur garantit la règle : **on ne franchit jamais une porte sans décision explicite de l'utilisateur, en langage clair + une preuve.**

- **La preuve** = le bloc **§Décision** en tête de `research/opportunity-brief.md` (non-tech = le POURQUOI ; ex-`opportunity-summary.md`, fusionné §5). L'utilisateur ne lit **jamais** un artefact technique pour décider.
- **La décision** = `AskUserQuestion` à quatre issues : **Go / Ajuster / Go-test / No-Go**. Pas de franchissement implicite, pas de « je suppose que c'est go ».
- **Le verdict reste humble** : demande *plausible*, jamais *prouvée* (signal par proxy, cf. `conventions.md` principe n°3). Un résumé qui rassure à tort est un échec.
- **En sortie de porte**, écrire la ligne dans « Portes franchies » de `state.md` (décision + date), puis router selon l'issue (§4).

## 4. Matrice de retour arrière (« Ajuster »)

« Ajuster » = l'idée n'est pas morte mais un maillon est faible. On **reboucle sur l'étape faible**, pas sur toute la phase. L'étape 5 (`gate-and-routing.md`) diagnostique le maillon ; l'orchestrateur ré-enchaîne à partir de là.

| Faiblesse diagnostiquée à la porte | Reboucle sur | Effet en cascade |
|---|---|---|
| Cible/problème flous, brief ambigu | `01-discover` | ré-exécute 2→5 (le brief irrigue tout) |
| Marché mal cerné, concurrents incomplets | `02-market` | ré-exécute 3→5 |
| Positionnement mou, angle indistinct | `03-positioning` | ré-exécute 4→5 |
| Demande faible / edge non tranché | `04-demand-edge` | ré-exécute 5 |
| Synthèse/verdict à revoir seulement | `05-opportunity` | ré-exécute 5 |

Règles de retour arrière :
- **Le retour arrière est autorisé à tout moment**, pas seulement à la porte (cf. `conventions.md` — protocole de porte).
- **Un rebouclage ré-exécute les étapes en aval** de l'étape reprise (leurs artefacts dépendent d'elle) ; met à jour `state.md` (Étape ← étape reprise, Statut ← en cours).
- **Budget anti-boucle-infinie** : si l'idée reboucle plusieurs fois sans converger, présenter l'état et proposer explicitement « ship l'apprentissage / No-Go » plutôt que d'itérer sans fin (esprit `safety-rails` §7).

## 5. Issues terminales

- **Go** → Statut `fait`, porte inscrite, Phase 1 close. Passation Phase 2 : `research/opportunity-brief.md` (la matière traçable **+** son bloc §Décision en tête = le POURQUOI) est l'entrée de `phase-2-product`. Annoncer le passage au cadrage produit.
- **No-Go** → `05-opportunity` écrit `research/post-mortem.md` (5 lignes : ce qui l'a tué, ce qu'on a appris). **Arrêt propre** : porte inscrite (`No-Go` + date), pas de suite produit, projet archivé sans bluff. Un No-Go honnête et rapide est un **succès** de la phase, pas un échec.
- **Go-test** *(route public)* → landing+waitlist shippée à **seuil pré-enregistré** avant tout build (ce n'est **pas** un démarrage de Phase 2 : le HARD GATE tient, la landing ne construit rien du produit) ; au terme de la fenêtre, **retour à la porte** (étape 5) avec la donnée réelle — seuil atteint → Go, sinon → Ajuster/No-Go. On reste en Phase 1. Détail : `skills/05-opportunity/references/go-test-playbook.md`.
- **Ajuster** → §4, on reste en Phase 1.
