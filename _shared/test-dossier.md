# Dossier de test — convention partagée (la recette + le livret)

La QA de SaaS Factory est **chapeautée par un QA Analyst** (`agents/qa-analyst.md`) sur **toute la Phase 4**. Deux artefacts, un rôle qui les tient.

## 1. La recette — `qa/test-plan.md` (écrite en premier)
*Comment on teste.* Écrite à l'**ouverture de la Phase 4**, dérivée des **critères d'acceptation du PRD** (étape 7) + la **spec de validation** du plan (étape 10). Par feature × par niveau : quel test, quels cas, quel critère de passage.

## 2. Le livret de test — `qa/test-booklet.md` (vivant, compilé)
*Ce qui en ressort.* Carnet alimenté **au fil des étapes 12/13/14**. Une ligne par feature × par type de test, avec verdict + preuve. C'est **le point unique** qui montre l'état de tous les tests.

## 3. Les types de test et qui les produit (la compilation)
| Type | Produit par | Étape |
|---|---|---|
| **Technique** (TDD, build, perf, dette) | dev · CTO | 12 · 13 |
| **Sécuritaire** (OWASP/STRIDE) | CTO (`security-review`) | 13 |
| **Fonctionnel** (comportement, user story) | Tech Lead · faux-client | 13 · 14 |
| **Design / UX / a11y** | Designer · faux-client (live) | 13 · 14 |
| **Métier / global CEO** (conformité PRD) | CEO · faux-client (A→Z) | 13 · 14 |
| **Intégration** (parcours A→Z, jonctions) | faux-client | 14 |

## 4. Comment chaque étape alimente le livret
- **12 (build)** : chaque `feature-dev` produit ses tests dev (TDD, recette) → reportés dans le livret (type *technique*).
- **13 (cascade)** : chaque cran (tech-lead / CTO / designer / CEO) rend son verdict dans `status/<feature>.md` → reporté (types *fonctionnel / sécuritaire / design / métier*).
- **14 (faux-client)** : passes seule + intégration + éval → reportées (types *fonctionnel / intégration / global*).

Le **QA Analyst** lit les `status/*` + `qa/report.md` et consolide dans `qa/test-booklet.md`.

## 5. Le flux
```
Ouverture Phase 4 : QA Analyst écrit LA RECETTE (qa/test-plan.md)
   12 · 13 · 14 exécutent leurs tests ──► résultats dans LE LIVRET (qa/test-booklet.md)
QA Analyst COMPILE ──► « ce qui en ressort » (santé test globale) → accompagne l'étape 15
```

> **Traçabilité** (façon BMAD) : chaque test ↔ un critère d'acceptation du PRD. Verdict au format `PASS/CONCERNS/FAIL/WAIVED` (`skills/13-reviews/references/verdict-schema.md`).
