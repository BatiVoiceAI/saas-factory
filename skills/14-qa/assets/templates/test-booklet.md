# Livret de test — {nom du projet}
> Tenu par le QA Analyst, alimenté au fil des étapes 12/13/14. *Ce qui en ressort.* {mis à jour en continu}

## Tableau de compilation (feature × type)
| Feature | Technique | Sécurité | Fonctionnel | Design/a11y | Métier/CEO | Intégration |
|---|---|---|---|---|---|---|
| {feature} | PASS/CONCERNS/FAIL | … | … | … | … | … |

> Chaque cellule : verdict + lien vers la preuve (`status/<feature>.md` / `qa/report.md`).

## Parcours d'arrivée réelle (étape 14 — parcours #0, imposé)
| Critère | Verdict | Preuve |
|---|---|---|
| Landing conforme au playbook (5-second test OK, zéro placeholder) | PASS/FAIL | {screenshot} |
| Signup **OTP/magic link** — code réellement reçu et saisi (jamais mot de passe seul) | … | … |
| Onboarding crée l'**entité cœur** (données réalistes, tous champs) | … | … |
| Dashboard d'arrivée **non-vide** ; toute liste vide a un empty state avec CTA | … | … |
| Job cœur accompli de bout en bout | … | … |
| Branding complet (`<title>`/favicon/og) + pages légales FR + 404 brandée, zéro lien mort | … | … |
| Checklist anti-slop (`_shared/design-doctrine.md`) passée, desktop + mobile | … | … |
| **Verdict d'ensemble : « pro et complet » / « démo creuse »** | … | … |

## Boucles fermées (étape 14 — les deux rôles vérifiés, `_shared/boucles-fermees.md`)
| Action de valeur | Acteur reçoit (trace durable) | Contrepartie notifiée | Réversibilité (avis à l'autre partie) | Verdict |
|---|---|---|---|---|
| {créer l'entité — ex. résa} | {email sandbox reçu — preuve} | {gérant notifié — preuve} | {annulation par le salon → cliente avisée} | PASS/FAIL |
| {annuler / modifier} | … | … | … | … |

> Canal variable selon le type (email client / email pro / notif in-app / webhook) — **jamais l'existence** de la boucle. Une boucle muette = `FAIL` bloquant.

## Porte « plan soldé, prouvé par exécution » (P0.1 — `references/plan-solde-gate.md`)
| Condition | État | Preuve |
|---|---|---|
| Chaque `[SÉCU]` du plan tracé *fait (fichier) / repoussé (raison + décision humaine)* | OUVERTE/FERMÉE | `tech/plan-ledger.md` |
| Tests du plan **committés** (fichiers, pas prose) | … | `git ls-files tests/ e2e/` |
| **≥1 E2E du parcours cœur exécuté vert** (pas relu) | … | {trace Playwright} |

## Détail par feature
### {feature}
- **Technique** (12/13) : {verdict + preuve}
- **Sécurité** (13) : {…}
- **Fonctionnel** (13/14) : {…}
- **Design / a11y** (13/14) : {…}
- **Métier / CEO** (13) : {…}
- **Intégration** (14) : {…}

## Ce qui en ressort (synthèse — fin de Phase 4)
- **Santé globale** : {n} features · {n} tout-vert · {n} avec `CONCERNS` · {n} `FAIL` restants.
- **Arrivée réelle (parcours #0)** : {pro et complet / démo creuse} — {réserves éventuelles}.
- **Par type** : technique / sécurité / fonctionnel / design / métier / intégration — {état de chacun}.
- **Régressions ajoutées** : {n}.
- **Reste à surveiller** (`CONCERNS` / `WAIVED`) : {liste} → transmis au **client-review (étape 15)**.
