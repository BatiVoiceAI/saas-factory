# Protocole — faire exécuter un moteur vendoré par un sous-agent

Plusieurs étapes **pilotent un moteur vendoré** (`{PLUGIN_ROOT}/vendor/…`) au lieu de refaire la méthode : 02-market → `startup-competitors`, etc. Le SKILL dit « exécute le moteur » ; ce fichier dit **COMMENT** un sous-agent (`Task`) l'exécute réellement. **D'abord résoudre le chemin (§0)**, puis deux options, une règle de choix.

## §0 — Résoudre `{PLUGIN_ROOT}` (obligatoire avant TOUT accès `vendor/`)

**Le piège** : au runtime, le répertoire de travail est **le projet du client**, pas le plugin. Un `Read vendor/…` nu échoue → l'agent improvise la méthode à la main — exactement ce que le vendoring devait éviter. C'est le mode d'échec n°1 de l'usage des moteurs.

`{PLUGIN_ROOT}` = la racine du plugin : le dossier qui contient `.claude-plugin/plugin.json`, `vendor/`, `_shared/`, `skills/`, `agents/`. Résolution, **dans l'ordre** :

1. **Contexte de session** — le hook SessionStart du plugin annonce `[saas-factory] {PLUGIN_ROOT} = /chemin/absolu`. Si la ligne est présente, c'est la valeur.
2. **Chemin du SKILL courant** — tu connais l'emplacement du SKILL.md que tu exécutes : remonte jusqu'au dossier contenant `.claude-plugin/plugin.json` (depuis `skills/<étape>/SKILL.md` : deux niveaux au-dessus).
3. **Recherche de l'install** — `find ~/.claude/plugins -maxdepth 6 -type f -path "*saas-factory*" -name "plugin.json" 2>/dev/null` (couvre l'install marketplace et l'install locale). Prendre le dossier parent de `.claude-plugin/`.
4. **Introuvable** → **le déclarer** (à l'utilisateur + dans `state.md`) au lieu de bluffer, et basculer en Option B avec la procédure des `references/` natives du skill (densifiées, elles couvrent le fond).

**Vérification systématique** : après résolution, `Read` le fichier moteur visé **avant** de dispatcher le sous-agent. Un Read qui échoue = on redescend l'échelle, on ne dispatche pas un brief vers un chemin mort.

**Règle absolue de brief** : un brief de sous-agent ne contient **jamais** un chemin relatif `vendor/…` nu — toujours le chemin **absolu résolu** (`/…/saas-factory/vendor/…`). Le sous-agent ne voit pas ton contexte : un chemin relatif ne se résout pas chez lui.

> Partout ailleurs dans les skills/references du plugin, la notation `{PLUGIN_ROOT}/vendor/…` désigne un chemin à résoudre par CE §0. Même règle pour `_shared/…` et `agents/…` passés à un sous-agent.

## Le problème
Un sous-agent lancé via `Task` **ne voit pas** le contexte de l'orchestrateur : il ne connaît que le brief qu'on lui passe. Dire « exécute le moteur » ne suffit pas — il faut lui donner soit le **chemin** du moteur, soit la **procédure** distillée. Sinon il improvise (exactement ce que le moteur vendoré évite).

## Option A — passer le CHEMIN (le sous-agent LIT le moteur)
Le brief dit au sous-agent : *« Lis `<ABS>/vendor/…/references/<phase>.md` (chemin absolu résolu via §0) et **suis-le à la lettre**. »* Le sous-agent ouvre le fichier moteur lui-même et l'applique.
- **Pour** : fidélité maximale, zéro perte à la traduction, le moteur reste la source de vérité (une MAJ du vendor profite tout de suite).
- **Contre** : le sous-agent consomme du contexte à lire le moteur ; il faut **cadrer** sa sortie (chemins NOS, HARD GATE) sinon il produit le livrable natif du moteur, pas le nôtre.

## Option B — DISTILLER la procédure dans le brief
L'orchestrateur lit le moteur, en **extrait les gestes utiles** pour cette phase, et écrit un brief autoportant (le sous-agent n'ouvre rien).
- **Pour** : brief court et ciblé, découpage/cadrage déjà fait par l'orchestrateur, pas de dérive vers le livrable natif.
- **Contre** : risque de **perte de fidélité** (l'orchestrateur oublie un geste) ; se désynchronise si le vendor évolue. À **re-vérifier** contre le moteur.

## Quand choisir
| Signal | Option |
|---|---|
| Phase moteur **dense/procédurale** (waves de recherche, vérif adversariale) — la fidélité prime | **A** (chemin) |
| On ne garde qu'une **tranche** du moteur (ex. W3 GTM → marché only) | **B** (distiller la tranche, jeter le reste) |
| Sous-agent **jetable** sur une sous-tâche étroite | **B** (brief autoportant, moins de contexte) |
| Le moteur est **la** valeur et évolue souvent | **A** (source de vérité unique) |
| Doute | **A par défaut** — la fidélité au moteur éprouvé est le but même du vendoring |

> **Règle des trois, quelle que soit l'option** : (0) tout chemin moteur du brief est **absolu, résolu et vérifié** (§0) ; (1) le brief impose **NOS chemins de sortie** + le **HARD GATE** de l'étape (le moteur ne connaît ni l'un ni l'autre) ; (2) on **conserve le brut** que l'aval réutilise. Un sous-agent bien cadré exécute le moteur *et* range ses sorties chez nous.
