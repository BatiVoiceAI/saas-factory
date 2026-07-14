# Livret de test — {nom du projet}
> Tenu par le QA Analyst, alimenté au fil des étapes 12/13/14. *Ce qui en ressort.* {mis à jour en continu}

## Tableau de compilation (feature × type)
| Feature | Technique | Sécurité | Fonctionnel | Design/a11y | Métier/CEO | Intégration |
|---|---|---|---|---|---|---|
| {feature} | PASS/CONCERNS/FAIL | … | … | … | … | … |

> Chaque cellule : verdict + lien vers la preuve (`status/<feature>.md` / `qa/report.md`).

## Parcours #0 (étape 14 — imposé, joué en PREMIER) — **CONDITIONNÉ PAR ARCHÉTYPE**
> 🚨 La FORME du parcours #0 dépend de l'`archetype` du run (`state.md`) — 🚨 SOURCE `_shared/state-schema.md` §socle-par-archétype ; portes 14 par archétype `skills/saas-factory/references/routing.md` (ligne `14-qa`). **Remplir UNIQUEMENT le bloc de l'archétype du run** ; supprimer les deux autres. **Ne recale jamais un `landing`/`automation` faute d'onboarding/dashboard** — ces éléments n'existent pas dans leur archétype (faux-négatif).

### Branche `web-saas` — arrivée réelle (socle S1-S8)
| Critère | Verdict | Preuve |
|---|---|---|
| Landing conforme au playbook (5-second test OK, zéro placeholder) | PASS/FAIL | {screenshot} |
| Signup **OTP → mot de passe** — code réellement reçu et saisi puis **mot de passe posé** ; retour en e-mail + mot de passe (jamais mot de passe **sans vérif OTP préalable**, jamais de magic link) | … | … |
| Onboarding crée l'**entité cœur** (données réalistes, tous champs) | … | … |
| Dashboard d'arrivée **non-vide** ; toute liste vide a un empty state avec CTA | … | … |
| Job cœur accompli de bout en bout | … | … |
| Branding complet (`<title>`/favicon/og) + pages légales **adaptées à la juridiction** (`jurisdiction`/`locale` — jamais « FR » en dur) + 404 brandée, zéro lien mort | … | … |
| Checklist anti-slop (`_shared/design-doctrine.md`, 19 pts) passée, desktop + mobile | … | … |
| **Porte distinctiveness** : pas de convergence (ne ressemble ni à une recette brute ni à un autre projet) · rationale par page (`DESIGN.md`) présent **et tenu** par le rendu · `prefers-reduced-motion` respecté | … | … |
| **Verdict d'ensemble : « pro et complet » / « démo creuse »** | … | … |

### Branche `landing` — visiteur (socle LP1-LP4 ; **PAS de signup/onboarding/dashboard**)
| Critère | Verdict | Preuve |
|---|---|---|
| Landing conforme au playbook (5-second test OK, sections attendues, zéro placeholder) | PASS/FAIL | {screenshot} |
| **CTA / waitlist fonctionne** — soumission → **200** → confirmation reçue (message + email sandbox si prévu) | … | … |
| Métadonnées/**OG** + responsive desktop/mobile ; anti-slop **+ distinctiveness** passée (pas de convergence · rationale par page tenu · reduced-motion) | … | … |
| Pages légales **adaptées à la juridiction** (jamais « FR » en dur), footer sans lien mort | … | … |
| **Verdict : « pro et convaincante » / « page creuse »** | … | … |

### Branche `automation` — run (socle AU1-AU5, **headless** ; pas d'UI produit)
| Critère | Verdict | Preuve |
|---|---|---|
| Déclencheur réel (cron/webhook/manuel) → **run exécuté** ; historique + logs enregistrés | PASS/FAIL | {log} |
| **Effet réel + idempotence** (effet vérifié à la source ; re-run ne double pas) | … | … |
| **Boucle fermée** — run réussi comme raté **notifie/rapporte au propriétaire** (`_shared/boucles-fermees.md`) | … | … |
| **Verdict : « fiable et observable » / « boîte noire muette »** | … | … |

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
- **Parcours #0 (forme selon l'`archetype`)** : {web-saas : pro et complet / démo creuse · landing : pro et convaincante / page creuse · automation : fiable et observable / boîte noire muette} — {réserves éventuelles}.
- **Par type** : technique / sécurité / fonctionnel / design / métier / intégration — {état de chacun}.
- **Régressions ajoutées** : {n}.
- **Reste à surveiller** (`CONCERNS` / `WAIVED`) : {liste} → transmis au **client-review (étape 15)**.
