# Protocole — faire exécuter un moteur vendoré par un sous-agent

Plusieurs étapes **pilotent un moteur vendoré** (`vendor/…`) au lieu de refaire la méthode : 02-market → `startup-competitors`, etc. Le SKILL dit « exécute le moteur » ; ce fichier dit **COMMENT** un sous-agent (`Task`) l'exécute réellement. Deux options, une règle de choix.

## Le problème
Un sous-agent lancé via `Task` **ne voit pas** le contexte de l'orchestrateur : il ne connaît que le brief qu'on lui passe. Dire « exécute le moteur » ne suffit pas — il faut lui donner soit le **chemin** du moteur, soit la **procédure** distillée. Sinon il improvise (exactement ce que le moteur vendoré évite).

## Option A — passer le CHEMIN (le sous-agent LIT le moteur)
Le brief dit au sous-agent : *« Lis `vendor/…/references/<phase>.md` et **suis-le à la lettre**. »* Le sous-agent ouvre le fichier moteur lui-même et l'applique.
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

> **Règle des deux, quelle que soit l'option** : (1) le brief impose **NOS chemins de sortie** + le **HARD GATE** de l'étape (le moteur ne connaît ni l'un ni l'autre) ; (2) on **conserve le brut** que l'aval réutilise. Un sous-agent bien cadré exécute le moteur *et* range ses sorties chez nous.
