# Rapport QA — {nom du projet}
> Étape 14 (faux-client + QA). {AAAA-MM-JJ}

## Health global
- Parcours testés : {n} · Passés : {n} · Échoués : {n}
- Features (passe 1 — seules) : {n}/{total} conformes
- Intégration (passe 2 — A→Z) : {parcours testés → résultat}

## Non-conformités (→ retour cascade/dev)
| Parcours / feature | Écran | Attendu | Obtenu | Régression ajoutée | Contexte (quoi/où/pourquoi) |
|---|---|---|---|---|---|
| … | … | … | … | oui/non | … |

## Éval IA (si applicable)
{gold sets — résultat, régressions de prompt éventuelles}

## Sync-doc
{écarts doc/code détectés et corrigés}

## Portes de fin de build (bloquantes)
- **Boucles fermées** (`_shared/boucles-fermees.md`) : {chaque action de valeur → acteur ET contrepartie reçoivent, vérifié en sandbox — OK / boucle muette bloquante}.
- **Plan soldé** (P0.1, `references/plan-solde-gate.md`) : {registre `tech/plan-ledger.md` — chaque `[SÉCU]` fait/repoussé ; tests du plan committés ; ≥1 E2E cœur exécuté vert — OUVERTE / FERMÉE}.

## Verdict
{**Conforme** → étape 15 (client humain)} | {**Non conforme** → non-conformités ci-dessus renvoyées à la cascade, budget d'itération}
