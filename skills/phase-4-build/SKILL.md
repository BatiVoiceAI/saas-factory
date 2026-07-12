---
name: phase-4-build
description: >-
  Phase 4 de SaaS Factory — Build (l'org d'ingénierie complète). Orchestre les 4 étapes (12-build → 13-reviews → 14-qa → 15-client-review) + le QA Analyst : construit les features en parallèle (org CTO→Tech Lead→devs), les fait monter la cascade de validation (Tech Lead→CTO→Designer→CEO), les teste de A→Z (faux-client), puis les soumet au client humain. 100 % autonome jusqu'au client-review. À utiliser après le cadrage technique (Phase 3).
allowed-tools: Read, Write, Edit, AskUserQuestion, Bash, Grep, Glob, Task
---

# SaaS Factory — Phase 4 : Build (orchestrateur · l'org)

Prérequis : Phase 3 faite (repo scaffané + provisionné + `tech/execution-plan.md`). Tu déroules le build **multi-agents**, avec ta **cascade de validation**. **Autonome jusqu'au client-review** (le seul contact humain). Tu ne fais pas le travail des étapes toi-même : tu **enchaînes** les 4 skills experts, tu **calibres**, tu **tiens l'état**, tu **poses la porte 15**.

**HARD GATE (phase).** On construit + on valide en autonomie ; l'humain n'entre qu'à l'étape 15. Livrable : produit validé (par la cascade + le faux-client + l'humain), prêt pour le lancement.

## À lire d'abord (une fois)
`references/conventions.md` (persona l'org, déterminisme, contrat d'artefacts, calibrage par type, protocole de porte, moteurs vendorés) + `_shared/validation-cascade.md` (la cascade — niveaux, règles, budget) + `_shared/test-dossier.md` (recette + livret) + `_shared/lessons.md` + `_shared/safety-rails.md`. Ces règles priment sur ton comportement par défaut. **Discipline « lire une fois »** : ces blocs se lisent au démarrage de la phase, pas à chaque étape ; chaque expert les relira au besoin — ne les recharge pas toi-même entre deux étapes (détail : `references/orchestration-playbook.md`).

## Références (la profondeur — charge à l'usage)
Le SKILL reste l'**aperçu scannable** ; la mécanique d'orchestration vit dans `references/` :
- **`references/conventions.md`** — persona (l'org d'ingénierie), déterminisme, contrat d'artefacts (12/13/14/15 lit/écrit), calibrage par type (public / interne / perso), protocole de porte, moteurs vendorés.
- **`references/orchestration-playbook.md`** — le **flux exécutable** : diagramme ASCII de la Phase 4, table séquence (étape → invoque → lit → écrit → porte), ouverture QA Analyst, gestion du **budget de cascade**, discipline « lire `_shared` une fois », valeur de l'orchestrateur.
- **`references/state-and-gates.md`** — tenue de `.saas-factory/state.md` étape par étape, **procédure de reprise**, protocole de la porte 15 (ce qu'elle décide), **matrice de retour arrière** (rejet cascade → étape 12 ; Itérer → 12→13→14 ; Stop → park), épuisement de budget, passation vers la Phase 5.

## Ouverture — le QA Analyst
Avant de builder, invoque **`qa-analyst`** : il écrit **la recette** (`qa/test-plan.md`) — comment on teste chaque feature, par niveau. Puis il **tient le livret** (`qa/test-booklet.md`) au fil des 4 étapes (procédure : `references/orchestration-playbook.md`).

## Le pipeline — 4 étapes expertes, dans l'ordre
Tiens l'état dans `.saas-factory/state.md`. Chaque expert lit l'artefact du précédent et écrit le sien (contrat complet : `references/conventions.md`). Invoque les skills dans cet ordre :
1. **`12-build`** — org CTO→Tech Lead→devs, fan-out multi-worktrees, TDD + recette. → features `DEV-DONE`.
2. **`13-reviews`** — cascade **Tech Lead→CTO→Designer→CEO** (rejet → dev → re-grimpe, verdict `PASS/CONCERNS/FAIL/WAIVED`). → features validées CEO.
3. **`14-qa`** — **faux-client** A→Z + intégration (Playwright) + `verifier`. → produit prouvé.
4. **`15-client-review`** — 🚪 **le client humain** : paquet de revue → test guidé → feedback→tâches → budget → **ship / itérer / stop**.

```
   Phase 3 : repo prêt + provisionné (tech/execution-plan.md)
        │
        ▼   ouverture : qa-analyst écrit LA RECETTE (qa/test-plan.md)
   ┌─────────────────────────────────────────────────────────────────┐
   │                     PHASE 4 · BUILD (autonome)                    │
   └─────────────────────────────────────────────────────────────────┘
        │
        ▼
   ┌──────────────┐   org CTO→Tech Lead→devs · fan-out worktrees · TDD
   │  12-build    │   walking skeleton → parallèle → passe d'intégration
   │  status/*    │
   └──────────────┘
        │ features DEV-DONE
        ▼
   ┌──────────────┐   CASCADE (par feature, en parallèle)
   │  13-reviews  │   Tech Lead → CTO(+sécu) → Designer(+a11y) → CEO
   │  status/*    │◄──────────────┐
   └──────────────┘   FAIL @ tout │ cran → RETOUR DEV (12) + contexte
        │ validées CEO            │ → re-grimpe toute la cascade
        │                         │  (budget cascade — state-and-gates.md)
        ▼─────────────────────────┘
   ┌──────────────┐   faux-client A→Z (Playwright)
   │  14-qa       │   passe 1 : chaque feature seule
   │  qa/report   │   passe 2 : intégration (jonctions) · éval · sync-doc
   └──────────────┘   non conforme ─► retour cascade/dev (budget)
        │ produit prouvé
        ▼   qa-analyst COMPILE le livret (qa/test-booklet.md)
   ┌─────────────────────────────────────────────────────────┐
   │  15-client-review — 🚪 LE CLIENT HUMAIN                   │
   │  paquet de revue → test guidé → feedback → tâches        │
   └─────────────────────────────────────────────────────────┘
        │
        ▼   🚪 PORTE Ship / Itérer / Stop  (budget client)
     ┌──────────┬───────────────────────────┬──────────────┐
     │ Ship     │ Itérer                    │ Stop / park  │
     ▼          ▼ (retour 12→13→14, budget) ▼
  Phase 5   reboucle build ────────────►   park propre + post-mortem
 (lancement) (matrice : state-and-gates.md)
```

## Portes
**Aucune porte utilisateur** avant `15-client-review` (tout est agent-à-agent — la cascade tourne sans charge humaine). `15` porte la **décision humaine** (Ship → Phase 5). Le **budget d'itération** (`_shared/validation-cascade.md`) borne toutes les boucles (cascade interne + itération client) — procédure et matrice de retour arrière dans `references/state-and-gates.md`. **Ne franchis jamais la porte 15 sans décision explicite.**

## Calibrage (par type)
Le `type` (state.md, décidé Phase 1) calibre la **rigueur**, pas la présence des étapes : les 4 tournent toujours. `public` → cascade pleine (a11y + sécu strictes), budget large. `interne` → sécu/fonctionnel stricts, cran Designer orienté usage (pas brand), sponsor interne au 15. `perso` → cascade allégée (Designer/CEO au minimum utile), budget serré, 15 très court (l'humain = toi). Matrice détaillée : `references/conventions.md`.

## À chaque étape
Mets à jour `.saas-factory/state.md` (étape courante, features/crans, budget consommé, portes), résume en 2 lignes, annonce la suivante. **Reprise** : au (re)démarrage, relis `.saas-factory/state.md` + `status/*` + `qa/test-booklet.md` et reprends à l'étape/feature courante au lieu de repartir de zéro (procédure : `references/state-and-gates.md`).

## Sortie
Produit validé par l'humain (ou itéré). Mets à jour `.saas-factory/state.md`. **Ship** → Phase 5 (lancement).
