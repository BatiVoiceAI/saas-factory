---
name: 19-retro
description: >-
  Étape 19 (Phase 6 · après) de SaaS Factory — Retro, mémoire & kill/continue (rôles Eng Manager / CEO). La boucle se referme : rétrospective (ce qui a marché/raté — build, méthode, produit), capture des leçons dans la mémoire qui compound (learnings.jsonl + lessons.md), et décision explicite kill/continue selon un critère écrit (+ post-mortem 5 lignes si kill). Se déclenche pour « rétro », « bilan », « kill or continue », en fin de cycle.
allowed-tools: Read, Write, Edit, AskUserQuestion, Bash
---

# SaaS Factory — Étape 19 : Retro, mémoire & kill/continue (Eng Manager / CEO)

La boucle se referme. Deux jobs : **apprendre** (pour que le prochain projet soit meilleur) et **décider** (continuer ou tuer, sans s'acharner). La rétro n'est pas de la cérémonie — c'est le mécanisme qui rend SaaS Factory meilleur à chaque cycle et qui empêche l'acharnement sur un mort.

## HARD GATE — périmètre : on apprend et on décide, on ne construit pas
Cette étape **ne code rien** et ne relance aucun build : on mène la rétro, on capture la mémoire, on tranche kill/continue. Si « Continue » sort de la porte, on ne réimplémente pas ici — on **réamorce l'étape 18** avec un budget d'itérations borné. Toute action qui sort de « rétro + mémoire + décision » est hors périmètre.

## À lire d'abord (une fois)
- `_shared/lessons.md` — la mémoire à enrichir (les règles d'or déjà capitalisées).
- `_shared/safety-rails.md` — les garde-fous (budget de boucle §7, secrets §4).
- **Inputs** : le bilan métriques (`metrics/review.md`, étape 18) + le critère de kill posé au lancement (`.saas-factory/state.md`) + l'historique des leçons (`~/.saas-factory/learnings.jsonl`).

## Références (charge à l'usage)
- `references/retro-procedure.md` — comment mener la rétro 3-plans + les forcing-questions anti-flagornerie.
- `references/kill-continue.md` — le critère écrit, la matrice de décision, la porte.
- `references/memory-compound.md` — le schéma `learnings.jsonl`, le barème de confiance, la règle transverse.

## Le moteur (on s'inspire)
gstack `/retro` (rétro d'ingénierie) + la mémoire compound déjà prévue dans la méthode (`_shared/lessons.md`, `learnings.jsonl`).

## Procédure (aperçu — détail dans les références)
1. **Rétro** — ce qui a **marché** / **raté**, sur 3 plans : le **build** (la machine a-t-elle bien tourné ?), la **méthode** (le pipeline SaaS Factory lui-même), le **produit** (a-t-il trouvé son marché ?). Procédure exhaustive + forcing-questions → `references/retro-procedure.md`.
2. **Mémoire qui compound** — capture les leçons dans `~/.saas-factory/learnings.jsonl` (leçon + confiance + source + date) ; si une leçon est **transverse**, mets à jour `_shared/lessons.md`. C'est ce qui rend chaque projet suivant meilleur. Schéma, barème, dédup → `references/memory-compound.md`.
3. **Kill / Continue** — applique le **critère écrit** (`references/kill-continue.md`). **Continue** → boucle d'itération (retour étape 18 / plus haut). **Kill** → post-mortem 5 lignes + archive propre (façon dossier `Echec/`).

## La porte (kill/continue)
Présente le bilan (métriques + rétro) + le critère, puis `AskUserQuestion` : **Continuer** (itérer) · **Kill** (arrêter proprement) · **Pause/park**. Un kill documenté n'est pas un échec — c'est une décision rapide qui **libère l'énergie**. Ne franchis pas sans décision explicite. Recette de la porte (Ask exact / Push-until / Red-flags / routage) → `references/kill-continue.md`.

## Contrat d'artefacts
- **Lit** : `metrics/review.md` (étape 18), `_shared/lessons.md`, `.saas-factory/state.md` (critère de kill posé au lancement), `~/.saas-factory/learnings.jsonl` (historique).
- **Écrit** : `retro/retro.md` (template), `~/.saas-factory/learnings.jsonl` (append), MAJ `_shared/lessons.md` (si leçon transverse), MAJ `.saas-factory/state.md`. Si Kill : la section post-mortem (5 lignes) de `retro/retro.md` remplie + archive `Echec/`.

## Garde-fous
- **Honnêteté d'abord** (`_shared/lessons.md`, anti-flagornerie) : on nomme les échecs, on ne les moyenne pas. Une rétro flatteuse est inutile.
- **Kill explicite** : le critère est celui **écrit au lancement**, pas réécrit après coup pour se donner raison (`references/kill-continue.md`, mode d'échec « déplacement des poteaux »).
- **Décision à la porte** : jamais de kill ni de continue au feeling — voir `_shared/safety-rails.md` §7 (budget de boucle : si Continue, on repart avec un budget d'itérations borné, pas en boucle infinie).
- **Secrets** : rien de sensible dans `retro.md`, `learnings.jsonl`, ni `state.md` (`_shared/safety-rails.md` §4).

## Sortie & état
`retro/retro.md` (template) + mémoire mise à jour (`learnings.jsonl`, `lessons.md`). Mets à jour `.saas-factory/state.md`. **Fin du cycle** — le pipeline complet (idée → déployé → mesuré → appris) est bouclé. Continue → réamorce à l'étape 18. Kill → cycle clos, mémoire enrichie pour le prochain projet.
