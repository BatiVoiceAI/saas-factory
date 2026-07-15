# Contribuer au plugin SaaS Factory — doctrine de dev

> Ce fichier est **dev-facing** (hors runtime utilisateur). Il grave la discipline qui empêche le plugin de régresser. Le plugin **est le livrable** : chaque changement se traite avec le même soin qu'un produit livré.

## Le plugin tourne depuis un SNAPSHOT (cache)
La copie exécutée par Claude Code vit dans `~/.claude/plugins/cache/felix-saas-factory/saas-factory/<version>/` — un **snapshot** du working tree au moment de l'install, PAS un lien vers ce dépôt. **Après toute modif destinée à être testée** :
```bash
claude plugin marketplace update felix-saas-factory && claude plugin update saas-factory
```
Sans ça, on teste l'ancienne version. On **édite ce dépôt** (`plugin/saas-factory/`), jamais le cache.

## Protocole anti-régression (obligatoire pour toute vague de changement)
web-saas est **prouvé** (runs coiffeur, Poser, AgencyDesk). Règle n°1 : **aucun changement ne dégrade le chemin web-saas.** Le risque réel n'est pas le changement, c'est la **détection** — le code est gardé par tsc/lint/tests, les **prompts** (SKILL.md, agents, gates) ne sont testables par rien d'automatique.

- **G1 — Tag de rollback avant tout** : `git tag vX.Y.Z-pre-<vague>` avant le premier changement.
- **G2 — Édition additive/conditionnelle uniquement** : on ne réécrit **jamais** le chemin web-saas. On **ajoute** des branches archétype (`si archetype=automation → …`) et on **conditionne** les nouveaux gates par `type`/`archetype`. Le comportement web-saas doit rester inchangé à l'octet d'effet près. *(Preuve : `git diff | grep '^-'` ne doit montrer que des lignes rallongées, jamais une logique web-saas retirée.)*
- **G3 — Vérif de code sur les DEUX châssis** après tout changement de `_shared/blocks/*` : `tsc --noEmit` + `npm run verify:machine` verts sur `web-saas` **et** `automation`.
- **G4 — Preuve d'invariance** après un changement d'un fichier partagé (cascade 13, doctrine) : relire le diff, prouver que le chemin web-saas est intact.
- **G5 — Smoke re-run web-saas** avant de déclarer une vague finie : au moins un run partiel (P4 build→revue→QA sur une feature). Le seul filet contre une régression de prompt.
- **G6 — Discipline de vague** : chaque vague finit par **`bash evals/run.sh` VERT** (agrège les 3 batteries de hooks + l'audit archétype + les 2 planchers `verify:machine`) **+ commit + entrée CHANGELOG + tag**. Rollback toujours corrélable.

## Auto-audit de couverture archétype
`node scripts/audit-archetype-coverage.mjs` vérifie que **chaque skill critique** (12, 13, 14, 18, 19) traite bien `automation` (pas seulement web-saas) et que le gate de mesure existe en 12-build. **À lancer à chaque vague (G6).** Un archétype vivant qui perd son traitement dans un skill = exit ≠ 0. C'est ce qui a manqué avant : 13/18/19 avaient dérivé à 0 mention d'automation.

## Moteurs vendorés
Toute référence à un moteur (`vendor/…`) passe par `{PLUGIN_ROOT}/vendor/…`, résolu en chemin **absolu** via `_shared/vendored-engine-protocol.md` §0 (hook SessionStart → fallback). Jamais de `vendor/…` relatif dans un brief de sous-agent.

## Frontière de périmètre (Thème C — non couvert clé-en-main)
**Couverts** : **`web-saas`** + **`automation`** (châssis complets) + **`ecommerce`** (châssis **logique commerce + SQL + pièges P1/P2/P3 livré et testé** — `_shared/blocks/ecommerce/` ; l'**UI se dérive du châssis web-saas** en remplaçant `billing` par le checkout one-shot). **Différés (Thème C)** : `landing` (pas de châssis `_shared/blocks/landing/` assemblé) et le **substrat org/multi-org**, dits explicitement dans `skills/saas-factory/references/routing.md` + `_shared/state-schema.md`. Ne pas laisser un run bluffer dessus : il doit s'arrêter en le disant.
