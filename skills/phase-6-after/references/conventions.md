# Conventions — Phase 6 (après)

Règles transverses. Chaque étape est un skill expert autonome (`18-metrics`, `19-retro`) enchaîné par `phase-6-after`. Le rôle de cette phase : **refermer la boucle** (mesurer → apprendre → décider) et **capitaliser** — c'est la phase qui rend le *prochain* projet meilleur.

## Personas
- **PM / CEO** (18) — lecture des métriques, décision d'itération, honnête. Ne romance pas les chiffres : un funnel qui fuit est un funnel qui fuit. Sort **1-3 pistes** actionnables, pas une liste de vœux.
- **Eng Manager / CEO** (19) — rétro, mémoire, kill/continue. Tranche **au critère écrit**, pas au moral du moment. Un projet mort proprement archivé vaut mieux qu'un zombie qu'on traîne.

## Contrat d'artefacts
| Étape | Lit | Écrit |
|---|---|---|
| 18 Metrics | tracking (PostHog / Sentry), `product/*`, `product/pricing.md` | `metrics/review.md` |
| 19 Retro | `metrics/review.md`, `_shared/lessons.md`, `state.md` (critère de kill) | `retro/retro.md`, `~/.saas-factory/learnings.jsonl`, MAJ `_shared/lessons.md` |

Le chaînage est **par artefact sur disque** : `18` ne parle pas à `19` autrement qu'en écrivant `metrics/review.md`. Si `metrics/review.md` manque quand `19` démarre → l'étape le signale et ne fabrique pas de chiffres (repli honnête, `_shared/safety-rails.md` §6).

### Contrat amont / aval (chaînage inter-phases)
- **Amont** : la phase suppose un produit **en ligne** avec tracking **actif** (posé en `17-deploy` : PostHog + Sentry + health checks). Sans données réelles, `18` le dit et propose d'attendre une fenêtre de mesure plutôt que d'inventer un funnel.
- **Aval** : la sortie de `19` **re-alimente** le pipeline — `continue` renvoie à `phase-4-build` (nouvelle piste) ou `phase-5-launch` (relance) ; `kill` clôt le projet. Les noms d'étapes et de phases ne changent jamais entre les runs (déterminisme du process).

## Moteurs vendorés
- **PostHog** — funnel d'activation, rétention, événements produit. Lu par `18` (côté tracking déjà branché en Phase 5).
- **Sentry** — santé applicative (erreurs, crash rate, régressions). Lu par `18` pour distinguer « les gens n'activent pas » de « ça casse ».
Ces moteurs sont **déjà provisionnés** (Phase 5) ; la Phase 6 les **lit**, elle ne les configure pas.

## Mémoire qui compound (le principe clé)
La Phase 6 **enrichit la mémoire** pour que le prochain projet soit meilleur. Les leçons **transverses** (valables au-delà de ce projet) remontent dans `_shared/lessons.md` ; les leçons **projet** (spécifiques) vivent dans `~/.saas-factory/learnings.jsonl`. C'est **l'actif long terme** de SaaS Factory — la seule chose qui survit à un kill.

Règle de tri : *« Est-ce que je referais l'erreur / rejouerais le coup sur un projet **différent** ? »* → oui = `lessons.md` (transverse) ; non = `learnings.jsonl` (projet). En cas de doute, projet.

## Kill explicite
Le critère de kill est **écrit au lancement** (dans `state.md`, champ `Critère de KILL`) et **confronté** aux métriques à l'étape 19. Jamais de kill (ni de continue) au feeling. C'est la règle d'or n°9 des `_shared/lessons.md` : *un critère écrit déclenche l'archivage + un post-mortem de 5 lignes.*

## Discipline `_shared` (progressive disclosure)
Les blocs `_shared/*` (`lessons.md`, `safety-rails.md`, …) sont lus **une seule fois** par le master et priment déjà en contexte. Cette phase **ne les fait pas relire** par `18`/`19`. Le détail d'une étape (ses `references/`) se charge **au moment** où elle s'exécute, pas avant.
