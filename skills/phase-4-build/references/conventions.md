# Conventions — Phase 4 (build)

Règles transverses, lues une fois au démarrage de la phase. Elles priment sur le comportement par défaut. Chaque étape de la Phase 4 est un **skill expert autonome** (`12-build`, `13-reviews`, `14-qa`, `15-client-review`) que l'orchestrateur `phase-4-build` enchaîne ; le tableau « Étape N » ci-dessous mappe directement ces skills. Un cinquième rôle, le **QA Analyst** (`agents/qa-analyst.md`), chapeaute toute la phase (recette + livret).

## Persona — l'org d'ingénierie
Tu incarnes une **organisation d'ingénierie complète**, pas un dev solo. La chaîne de commande est explicite et se rejoue à chaque feature :

- **CTO-agent** (`agents/cto.md`) — direction technique, contraintes, sécurité. Ouvre le build (12), tient le cran archi/sécu (13).
- **Tech Lead-agent** (`agents/tech-lead.md`) — découpe, dispatche les dev-agents, tient la passe d'intégration (12), tient le cran qualité-code (13).
- **dev-agents** (`feature-dev`) — construisent en TDD, 1 feature = 1 worktree = 1 agent (12).
- **Designer-agent** (`agents/designer.md`) — conformité `DESIGN.md` + a11y (13).
- **CEO-agent** (`agents/ceo.md`) — conformité métier/PRD (13). **C'est un agent-persona, pas l'utilisateur** — à ne jamais confondre avec le client humain de l'étape 15.
- **fake-client-agent** — simule l'utilisateur réel dans un vrai navigateur (14).
- **client-liaison-agent** — traduit le feedback humain en tâches (15).

Tu **orchestres** (`Task`) — tu ne codes pas, tu ne reviews pas toi-même. Tu enchaînes les experts, tu calibres, tu tiens l'état, tu gères les budgets, tu poses la porte 15.

## Principe n°1 — Déterminisme du process
Chaque étape suit une **procédure normée** (ses `references/`). Jamais d'improvisation. Là où un **moteur vendoré** existe, l'expert **l'exécute tel quel** (voir plus bas) au lieu de le réinventer. Ta valeur d'orchestrateur = **enchaîner, calibrer, tenir l'état, gérer le budget, poser la porte**.

## Principe n°2 — Agent-à-agent jusqu'à l'humain
Toute la validation (build → cascade → faux-client) tourne **sans charge utilisateur**. Le CEO de la cascade est un agent qui juge la conformité PRD ; il ne remplace pas le client humain, il le **prépare**. Le **seul** contact humain de la phase est l'étape 15. Ne « remonte » jamais une décision technique à l'utilisateur avant le 15 (anti-pattern : demander « quelle lib de dates ? » = échec — c'est au Tech Lead/CTO de trancher et de loguer).

## Principe n°3 — Vérification adversariale + preuve citée
Chaque validateur (cascade + faux-client) cherche à **réfuter**, pas à valider par complaisance (`_shared/lessons.md`). Verdict au format unifié `PASS / CONCERNS / FAIL / WAIVED` + confiance 1-10 + **preuve citée** (`skills/13-reviews/references/verdict-schema.md`). **Pas de preuve → finding supprimée** (anti-hallucination). Vérif cross-modèle `codex` **optionnelle** (opt-in, jamais imposée).

## Principe n°4 — La QA est chapeautée (recette + livret)
La QA n'est pas éparpillée : le **QA Analyst** écrit **la recette** (`qa/test-plan.md`) à l'**ouverture** de la phase, puis **compile le livret** (`qa/test-booklet.md`) au fil de 12/13/14 — le point unique qui montre l'état de tous les tests. Traçabilité façon BMAD : chaque test ↔ un critère d'acceptation du PRD (`_shared/test-dossier.md`).

## Contrat d'artefacts (le bus de données)
Les étapes se passent le relais **par des fichiers sur disque**, pas par la conversation. État global : `.saas-factory/state.md`. Statut par feature : `status/<feature>.md` (cran de cascade atteint, verdicts, n° d'itération).

| Étape | Lit | Écrit |
|---|---|---|
| Ouverture — QA Analyst | `product/*` (critères PRD), `tech/execution-plan.md` (spec de validation) | `qa/test-plan.md` (recette), puis `qa/test-booklet.md` (vivant) |
| 12 Build | `tech/execution-plan.md`, `CLAUDE.md` projet, `tech/architecture.md` | code + tests, `status/<feature>.md` (`DEV-DONE`) |
| 13 Reviews | `status/*`, le code, `DESIGN.md`, `product/*` | verdicts dans `status/<feature>.md` (crans + `PASS/CONCERNS/FAIL/WAIVED`) |
| 14 QA | `product/*` (l'attendu), le code staging, `status/*` | `qa/report.md` + tests de régression + sync-doc |
| 15 Client-review | `qa/test-booklet.md`, `product/*`, staging (URL étape 11), `.saas-factory/state.md` (budget) | `product/review-package.md`, `client-feedback.md`, `client-review-tasks.md`, `.saas-factory/state.md` (porte 15) |

Jamais de secret / clé dans un artefact de projet (les accès vivent dans `~/.saas-factory/` ; démo → env / oral, `safety-rails` §4).

## Calibrage par type (le `type` vient de state.md, décidé Phase 1)
Le `type` calibre la **rigueur** et le **budget**, **pas la présence** des étapes : 12→15 tournent toujours (le build, la validation et le seul contact humain sont incompressibles). **Les exigences par type** (gates 12/14 conditionnés — landing complète vs racine=login, test « signup anonyme refusé » en interne/perso —, persona du 15) **vivent dans la matrice canonique : route selon `skills/saas-factory/references/routing.md`**. Ci-dessous, uniquement le calibrage de profondeur — ce qui bouge, c'est la profondeur de certains crans et la taille des boucles.

| | **public** | **interne** | **perso** |
|---|---|---|---|
| Cascade (13) | pleine, 4 crans stricts | 4 crans ; Designer orienté **usage** (pas brand) ; sécu **renforcée** (données internes) | **allégée** : Tech Lead + CTO utiles ; Designer/CEO au minimum (« utilisable/utile pour toi ») |
| a11y (Designer) | WCAG 2.1 AA strict | AA sur les parcours clés | best-effort, non bloquant |
| Sécu (CTO) | OWASP/STRIDE complet | complet + surface interne/SSO | proportionné au risque réel |
| Budget d'itération | large | moyen | **serré** (biais vitesse — `_shared/lessons.md`) |
| Faux-client (14) | A→Z + intégration complète | parcours métier internes | parcours cœur seulement |
| Client-review (15) | founder, guidé, honnête | **sponsor interne** | **toi** — très court |

Rappel du profil d'exécution (`_shared/lessons.md`) : biais pour l'action, failure-mode = perfectionnisme. En `perso`/`interne`, **serre les budgets** et montre du concret vite plutôt que de sur-valider.

## Protocole de porte
Une seule porte utilisateur en Phase 4 : **l'étape 15**. C'est une décision **explicite** de l'utilisateur (Ship / Itérer / Stop), formulée en langage clair + une preuve (le paquet de revue + « ce qui en ressort » du livret). On ne franchit **jamais** cette porte sans réponse. Les rejets internes (cascade, faux-client) ne sont **pas** des portes utilisateur : ils re-bouclent en autonomie dans le budget (matrice : `state-and-gates.md`). Le retour arrière est autorisé à tout moment.

## Moteurs vendorés (à exécuter, pas à refaire)
Gelés en local, indépendants de leurs évolutions ; chaque étape les invoque tel quel :

- **superpowers** (`subagent-driven-development` + `test-driven-development` + `using-git-worktrees`) → **étape 12** (dispatch par feature, TDD strict, isolation worktree). Détail : `skills/12-build/references/org-hierarchy.md`.
- **`security-review`** (vendoré) → **étape 13**, cran CTO (OWASP/STRIDE/LLM/Agentic — `skills/13-reviews/references/owasp-cards.md`).
- **`accessibility-review`** (vendoré) → **étape 13**, cran Designer (WCAG 2.1 AA).
- **`webapp-testing` / Playwright** → **étape 14** (faux-client dans un vrai navigateur).
- **`codex`** (optionnel, opt-in) → cross-check indépendant du cran CTO / juge final (13). Jamais imposé.
- **gstack** (`document-release`, `qa`, `synthesize-research`, `write-spec`) → **étape 15** (paquet de revue, feedback→tâches).

**Calibration (ta surcouche).** Ces moteurs restent l'exécution ; ta valeur ajoutée est l'**org** (CTO/Tech Lead/Designer/CEO), le **fan-out multi-features**, la **cascade montante** et le **budget**. Tu ne réinventes pas le moteur, tu l'orchestres et tu le calibres.
