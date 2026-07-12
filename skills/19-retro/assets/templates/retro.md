# Rétro — {nom du projet}
> Étape 19 (Eng Manager / CEO). Fin de cycle. {date}

## Ce qui a marché / raté
> Chaque case = un fait daté ou chiffré, pas une impression (cf. `references/retro-procedure.md`). Les deux colonnes remplies pour chaque plan.

| Plan | A marché | A raté |
|---|---|---|
| Build (la machine) | … | … |
| Méthode (le pipeline) | … | … |
| Produit (le marché) | … | … |

## Leçons (→ mémoire)
> Chaque leçon part aussi dans `~/.saas-factory/learnings.jsonl` (une ligne JSON). Transverse & confiance ≥ 5 → remonte dans `_shared/lessons.md`. Voir `references/memory-compound.md`.

| Leçon (actionnable) | Plan | Confiance /10 | Transverse ? (→ `lessons.md`) |
|---|---|---|---|
| … | build/méthode/produit | … | oui / non |

## Kill / Continue
> Le critère se cite **tel qu'écrit** au lancement, pas reformulé. Décision via `AskUserQuestion`. Voir `references/kill-continue.md`.

- **Critère écrit** (du lancement, `state.md`) : {…}
- **Confronté aux métriques** (`metrics/review.md`) : {…}
- **Décision** : Continuer | Kill | Pause — le {date}
- **Si Continuer** : budget d'itérations = {…} ; pistes (1-3, chacune reliée à une métrique) : {…}
- **Si Pause** : date de réévaluation : {…}

## Si Kill — post-mortem (5 lignes)
> Froid, sans dramatiser. Archive propre (dossier `Echec/`).
1. Le produit en une phrase : …
2. Le fait qui tue (critère atteint) : …
3. Ce qu'on a appris (le point non évident) : …
4. Ce qui aurait pu changer la donne : …
5. Statut : Kill + {date}.
