# Référence — Carte réutilisation vs build (le 80/20)

Étape [2] du composer. L'architecture (étape 9) a déjà décidé **quels modules réutilisent un bloc** et **lesquels sont custom** ; le composer **traduit ce split en tâches** : câblage rapide vs build de verticale. On ne rebuild jamais ce que le châssis (`_shared/blocks/`) fournit — c'est le **moat** (cf. `_shared/blocks/README.md`).

## Principe — châssis commun + verticale métier
Un micro-SaaS ≈ **80 % châssis** (blocs réutilisables) + **20 % verticale** (le custom différenciant). Le plan doit refléter ce ratio : la majorité des tâches sont du **câblage**, une minorité est du **build**.

```
        MODULE (de tech/architecture.md)
                     │
        ┌────────────┴────────────┐
   couvert par un bloc ?      non couvert ?
        │                         │
   TÂCHE DE CÂBLAGE          TÂCHE DE BUILD
   (rapide, config+glue)     (verticale, TDD complet)
   réutilise _shared/blocks   custom
```

## Matrice de décision — bloc vs custom
| Le module… | Décision | Type de tâche |
|---|---|---|
| correspond à un bloc du catalogue V1 (auth, repo-ci, hosting, ui-shell, crud, notifications, observability, billing) | **Réutiliser** | Câblage |
| est une variante mineure d'un bloc (un champ, un rôle en plus) | **Réutiliser + étendre** | Câblage + 1 tâche d'extension |
| porte l'**edge produit** / la logique métier différenciante | **Custom** | Build (verticale) |
| est une intégration tierce spécifique (API du domaine) | **Custom** | Build (adaptateur) |
| ressemble à un bloc mais le catalogue ne l'a pas (encore) | **Custom**, mais **noter** comme candidat-bloc futur | Build + note moat |

> ⚠️ Le **code** des blocs est un chantier moat séparé (cf. `_shared/blocks/README.md`) : le plan reste « block-aware » (il sait sélectionner/ordonner/câbler) même si un bloc n'est pas encore implémenté. Si un bloc requis n'existe pas en code, le composer le **note** dans l'audit et planifie le câblage comme s'il existait — la Phase 4 fera le repli honnête si besoin.

## Recette (déterministe)
1. Reprends la section « découpage en modules » de `tech/architecture.md` et son verdict réutiliser/custom par module.
2. Pour chaque module **réutilisé** → **1 tâche de câblage** : router/hook/composant/table à brancher + la **config requise** (variables d'env / clés — collectées au déploiement, jamais en dur). **Marque `[pré-câblé]`** chaque tâche dont le bloc figure dans la matrice de câblage du scaffold (`skills/11-project-setup/references/scaffold-procedure.md`) : l'étape 11 posera ce code **avant** la Phase 4 (voir section suivante).
3. Pour chaque module **custom** → renvoie à `task-graph.md` (découpage TDD par couture verticale).
4. Remplis la **table réutilisation vs build** (§2 du template) : Module | réutilise `_shared/blocks/{bloc}` | ou custom — tags `[pré-câblé]` inclus.
5. Vérifie le **ratio** : si <60 % des modules réutilisent un bloc, challenge — soit l'archétype est mal choisi (retour implicite à l'étape 9 via l'audit), soit on sur-custome. Loge le constat.

## Tâches « pré-câblées au scaffold » (anti faux-TDD)
Le scaffold de l'étape 11 **pose le code** des blocs « réutiliser » avant la Phase 4 (matrice de câblage : `skills/11-project-setup/references/scaffold-procedure.md`). Une tâche de câblage sur un de ces blocs est donc **déjà partiellement faite** quand l'agent de build la prend — écrire un « test rouge » sur ce que le scaffold livre déjà est du **faux TDD** (le rouge est impossible, ou joué).

- **Marqueur** : la tâche porte le tag **`[pré-câblé]`** dans la table §2 **et** dans le graphe §4 du plan.
- **Contenu réel de la tâche en Phase 4** : vérifier que le bloc posé tourne (build + smoke), le **configurer** pour le projet (env, routes, entités réelles), et **compléter le delta** (extension, branchement spécifique).
- **Le test rouge d'entrée porte sur le delta**, jamais sur le comportement générique du bloc : « le rôle `reviewer` est refusé sur `/admin` » (extension), pas « un OTP invalide est refusé » (livré par le bloc).
- Une tâche `[pré-câblé]` **sans delta identifiable** = une **tâche de vérification** (checklist exécutée, pas TDD) — nomme-la ainsi, ne fabrique pas un rouge.

## Forcing-question — « faut-il vraiment builder ça ? »
- **Ask exact** : « Le catalogue de blocs, l'archétype, ou une convention du châssis couvre-t-il déjà cette capacité, même partiellement ? »
- **Push-until** : on ne classe « custom » qu'après avoir écarté chaque bloc du catalogue **et** confirmé qu'aucune extension mineure d'un bloc ne suffit.
- **Red-flags (à refuser)** :
  - Re-builder auth / notifications / observability / CRUD « pour maîtriser » → **DRY violé** (P4) → câbler le bloc.
  - Classer « custom » un module qui est un bloc à 90 % → **réutiliser + étendre**.
  - Étendre un bloc au point de le réécrire → alors c'est **vraiment custom**, assume-le et note-le comme candidat-bloc.
- **MOU** : « on fera l'auth nous-mêmes ». **FORT** : « module auth = bloc `auth` (OTP → mot de passe + sessions + rôles + RLS) → 1 tâche câblage ; la seule extension custom est le rôle `reviewer` → 1 petite tâche d'extension ».
- **Routage par cas** : bloc exact → câblage. Bloc + variante → câblage + extension. Edge produit → build. Intégration domaine → build adaptateur. Ni bloc ni edge mais absent du catalogue → build + note moat.

## Modes d'échec
| Mode d'échec | Symptôme | Correctif |
|---|---|---|
| **Not-invented-here** | Tâches de build pour des capacités bloc | Reclasser en câblage |
| **Sur-réutilisation** | Forcer un bloc sur l'edge produit qui a besoin de custom | L'edge produit mérite du custom ; ne pas l'écraser dans un bloc |
| **Ratio custom trop haut** | >40 % de modules custom | Challenger l'archétype ou le découpage ; loger |
| **Bloc fantôme** | Câbler un bloc dont le code n'existe pas, sans le noter | Noter dans l'audit ; la Phase 4 fera le repli honnête |
| **Faux TDD sur du déjà-fait** | Test rouge écrit pour un comportement que le scaffold pose déjà (rouge impossible ou joué) | Tag `[pré-câblé]` ; le test d'entrée cible le delta (config / extension), sinon tâche de vérification |

## Sortie (dans `tech/execution-plan.md`)
La table **réutilisation vs build** (§2, tags `[pré-câblé]` inclus) + l'alimentation directe du graphe de tâches (câblage vs build).
