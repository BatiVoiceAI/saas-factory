# Orchestration Playbook — Phase 4 (build)

Le **flux exécutable** de la phase. Le SKILL est l'aperçu ; ici, la mécanique complète : quoi invoquer, dans quel ordre, ce qui entre et sort de chaque étape, comment le budget de cascade se gère, et comment tenir la discipline « lire une fois ». Tu es l'orchestrateur — tu ne codes pas, tu **conduis l'org**.

## Diagramme du flux (avec les rôles-agents)
```
 Phase 3 : tech/execution-plan.md + repo provisionné + CLAUDE.md projet
     │
     ▼  OUVERTURE
 ┌────────────────────────────────────────────────────────────────────┐
 │ qa-analyst : lit product/* + execution-plan → écrit qa/test-plan.md │
 │ (LA RECETTE) et ouvre qa/test-booklet.md (LE LIVRET, vivant)        │
 └────────────────────────────────────────────────────────────────────┘
     │
     ▼  ÉTAPE 12 — invoke 12-build   (niveau DEV de la cascade)
   CTO ──► Tech Lead ──► [ feature-dev · feature-dev · feature-dev … ]
     │        │            1 feature = 1 worktree = 1 agent (TDD + recette)
     │        └── walking skeleton d'abord ──► fan-out ──► passe d'intégration
     │
     ▼  features DEV-DONE (status/<feature>.md)
     ▼  ÉTAPE 13 — invoke 13-reviews (par feature, EN PARALLÈLE)
   ┌───────────┐  PASS   ┌───────┐  PASS   ┌──────────┐  PASS   ┌──────┐  PASS
   │ Tech Lead │────────►│  CTO  │────────►│ Designer │────────►│ CEO  │──────► validée
   │  code     │         │ +sécu │         │ +a11y    │         │ PRD  │
   └───────────┘         └───────┘         └──────────┘         └──────┘
        ▲  FAIL @ n'importe quel cran ──► RETOUR DEV (étape 12) + contexte
        └──────────────────────────────── re-grimpe TOUTE la cascade
                                           (budget cascade — voir §budget)
     │
     ▼  features validées CEO
     ▼  ÉTAPE 14 — invoke 14-qa      (dernier filtre autonome)
   fake-client (Playwright) : passe 1 (chaque feature seule) → passe 2 (intégration A→Z)
        + éval-driven (features IA) + sync-doc + régression par bug
        │ non conforme ──► retour cascade/dev + contexte (budget)
     │
     ▼  produit prouvé   ──► qa-analyst COMPILE le livret (« ce qui en ressort »)
     ▼  ÉTAPE 15 — invoke 15-client-review   🚪 LE CLIENT HUMAIN
   client-liaison : paquet de revue → test guidé → feedback verbatim → tâches classées
        │
        ▼  🚪 PORTE  (AskUserQuestion)
     Ship ──► Phase 5    │    Itérer ──► 12→13→14 (budget client)    │    Stop ──► park
```

## Table séquence (le contrat, ligne à ligne)
| # | Invoque | Rôle-agent | Lit | Écrit | Porte |
|---|---|---|---|---|---|
| 0 | `qa-analyst` | QA Analyst | `product/*`, `tech/execution-plan.md` | `qa/test-plan.md`, `qa/test-booklet.md` | — |
| 1 | `12-build` | CTO → Tech Lead → devs | `tech/execution-plan.md`, `CLAUDE.md`, `tech/architecture.md` | code + tests, `status/*` (`DEV-DONE`) | — |
| 2 | `13-reviews` | Tech Lead → CTO → Designer → CEO | `status/*`, code, `DESIGN.md`, `product/*` | verdicts dans `status/*` | — (agent-à-agent) |
| 3 | `14-qa` | fake-client | `product/*`, code staging, `status/*` | `qa/report.md`, régressions, sync-doc | — (agent-à-agent) |
| 4 | `15-client-review` | client-liaison + **humain** | `qa/test-booklet.md`, `product/*`, staging, `state.md` | `review-package.md`, `client-feedback.md`, `client-review-tasks.md`, `state.md` | 🚪 **Ship / Itérer / Stop** |

Entre chaque ligne : tu mets à jour `.saas-factory/state.md`, tu résumes en 2 lignes, tu annonces la suivante. Le QA Analyst n'est pas « une étape » linéaire : il **ouvre** (ligne 0) puis **repasse** compiler le livret après 12/13/14 (voir §QA Analyst).

## Ouverture — la discipline du QA Analyst
Avant 12, **toujours** : invoque `qa-analyst` pour écrire la recette. Sans recette écrite d'abord, les tests dev/cascade/faux-client n'ont pas de référentiel commun et le livret ne se compile pas.
- **Ligne 0 (ouverture)** : recette (`qa/test-plan.md`) dérivée des critères d'acceptation (PRD, étape 7) + spec de validation (plan, étape 10). Par feature × par niveau : quel test, quel critère de passage.
- **Au fil de 12/13/14** : chaque expert verse ses résultats (dev→technique ; cascade→fonctionnel/sécu/design/métier ; faux-client→intégration/global) dans `status/*` et `qa/report.md`.
- **Avant 15** : le QA Analyst **relit** `status/*` + `qa/report.md` et **consolide** dans `qa/test-booklet.md` (« ce qui en ressort » : santé test globale + `CONCERNS`/`WAIVED`). C'est ce livret que l'étape 15 présente à l'humain. Détail : `_shared/test-dossier.md`.

## Gestion du budget de cascade (le cœur de l'autonomie bornée)
La cascade (13) et le faux-client (14) **bouclent** : un `FAIL` renvoie au dev (12) et la feature re-grimpe. Sans borne, c'est la boucle infinie (anti-pattern `safety-rails` §7). Ta discipline d'orchestrateur :

1. **Budget attaché par feature** par l'étape 10 (`_shared/validation-cascade.md`) : un plafond de tours + un critère de sortie. Il vit dans `.saas-factory/state.md` (section « Budget d'itération ») et se décrémente à chaque re-grimpe.
2. **Boucle normale** : `FAIL` → retour dev **avec contexte actionnable** (quoi / où `fichier:ligne` / pourquoi-impact / quoi faire — **jamais « refais »**) → re-grimpe toute la cascade.
3. **Budget épuisé** : on ne bloque pas. On **loge l'état**, on marque la feature `DONE_WITH_CONCERNS`, on remonte le `CONCERNS` documenté dans le livret, et on continue. L'humain tranchera au 15.
4. **Calibrage** : le budget est **large en public, serré en perso/interne** (`references/conventions.md`). En perso, préfère `DONE_WITH_CONCERNS` + avancer plutôt que boucler.
5. **Parallélisme** : chaque feature a son propre budget et re-grimpe indépendamment ; ne sérialise pas la cascade sur une feature bloquée pendant que les autres avancent.

## Parallélisme — ce que tu tiens à l'œil
- **12** : fan-out multi-worktrees, **zones de code disjointes** (jamais 2 devs sur la même zone). Walking skeleton **séquentiel** d'abord (mergé `main`), **puis** fan-out. Après merge : **passe d'intégration** obligatoire (les bugs de jonction sont le coût du parallélisme — `_shared/lessons.md`).
- **13** : les features montent la cascade **en parallèle**, chacune son budget. Communication **async par fichiers** (`status/*`), jamais par la conversation.
- **14** : passe 1 (features seules) **avant** passe 2 (intégration A→Z) — c'est en passe 2 que sortent les bugs de jonction que la cascade par-feature ne voit pas.

## Discipline « lire `_shared` une fois »
Les blocs partagés (`_shared/validation-cascade.md`, `_shared/test-dossier.md`, `_shared/lessons.md`, `_shared/safety-rails.md`) + `references/conventions.md` se lisent **au démarrage de la phase**, par toi l'orchestrateur. **Ne les recharge pas** entre deux étapes. Chaque skill expert relira ce dont il a besoin à son propre démarrage (c'est écrit dans son « À lire d'abord ») — tu ne le fais pas à sa place. Ça évite le rechargement en boucle et garde le contexte propre.

## Valeur de l'orchestrateur (ce que TU fais, vs les experts)
| Toi (`phase-4-build`) | Les experts (12/13/14/15) |
|---|---|
| Ouvrir avec le QA Analyst (recette) | Faire le travail de leur niveau |
| Enchaîner 12→13→14→15 dans l'ordre | Exécuter leur procédure normée + moteur vendoré |
| Calibrer par `type` (rigueur, budget) | Rendre leurs verdicts / artefacts |
| Tenir `.saas-factory/state.md` + budgets | Écrire `status/*`, `qa/*` |
| Router les rejets (cascade/faux-client → dev) | Produire le contexte de rejet actionnable |
| Faire compiler le livret avant 15 | — |
| **Poser la porte 15** (Ship/Itérer/Stop) | 15 conduit le contact humain ; toi tu actes la décision + l'état |

Tu ne codes pas, tu ne reviews pas, tu ne testes pas toi-même. Tu **conduis l'org**.
