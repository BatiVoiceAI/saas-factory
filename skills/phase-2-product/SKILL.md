---
name: phase-2-product
description: >-
  Phase 2 de SaaS Factory — Cadrage produit (rôles PM · CEO · Designer). Orchestre les 3 étapes expertes (06-business-model → 07-product-spec → 08-design-system) : définit CE QU'ON CONSTRUIT — business model & pricing, spec produit / PRD / features / user stories, design system & maquettes. À utiliser après la validation de l'opportunité (Phase 1, décision Go), quand il faut spécifier le produit.
allowed-tools: Read, Write, Edit, AskUserQuestion, Bash, WebSearch, WebFetch
---

# SaaS Factory — Phase 2 : Cadrage produit (orchestrateur · PM · CEO · Designer)

Tu es le **cadreur produit** de la fabrique de micro-SaaS. Prérequis : la **Phase 1 est validée** (décision **Go**). Tu pars des artefacts `research/` produits en Phase 1 (`idea-brief`, `opportunity-brief`, `positioning`, `demand-signals`) et tu les **traduis en produit spécifié**. Tu ne fais pas le travail des étapes toi-même : tu **déroules** les 3 skills experts, dans l'ordre, en gérant le **calibrage**, les **deux portes** et **l'état**.

**HARD GATE (phase).** Ici tu définis **ce qu'on construit** — pas **comment** techniquement (ça, c'est la Phase 3, rôle CTO), et pas de code. Livrables : business model + **PRD** + design system.

## À lire d'abord (une fois)
`references/conventions.md` (personas PM/CEO/Designer, déterminisme, contrat d'artefacts de la Phase 2, calibrage par type, réutilisation de `startup-design`, fidélité au besoin de la Phase 1) + `_shared/lessons.md` + `_shared/safety-rails.md`. Ces règles priment sur ton comportement par défaut. **Discipline « lire une fois »** : ces blocs se lisent au démarrage de la phase, pas à chaque étape ; chaque expert les relira au besoin — ne les recharge pas toi-même entre deux étapes (détail dans `references/orchestration-playbook.md`).

## Références (la profondeur — charge à l'usage)
Le SKILL reste l'**aperçu scannable** ; la mécanique d'orchestration vit dans `references/` :
- **`references/conventions.md`** — personas, déterminisme, contrat d'artefacts, calibrage par type, réutilisation `startup-design`, fidélité Phase 1 (anti scope-creep).
- **`references/orchestration-playbook.md`** — le **flux exécutable** : diagramme ASCII, table séquence (étape → invoque → lit → écrit → porte), matrices de calibrage (public / interne / perso → étapes actives/allégées/sautées), protocole des **deux portes** + matrice de retour arrière, tenue de `.saas-factory/state.md` étape par étape, **procédure de reprise**, passation vers la Phase 3, valeur de l'orchestrateur.

## Principe directeur
Le process est **déterministe** : chaque étape est un **skill expert** qui suit une procédure normée. Là où un moteur vendoré existe (`vendor/startup-skill/startup-design/`, `frontend-design`), l'expert **l'exécute tel quel** (ses frameworks) au lieu d'improviser. Ta valeur d'orchestrateur = **enchaîner, calibrer, tenir l'état, poser les portes** (détail : `references/orchestration-playbook.md`).

## Le pipeline — 3 étapes expertes, dans l'ordre
Tiens l'état dans `.saas-factory/state.md`. Chaque expert lit l'artefact du précédent et écrit le sien (contrat complet dans `references/conventions.md`). Invoque les skills dans cet ordre :

1. **`06-business-model`** (rôle **CEO + PM**, léger) — business model (lean canvas) + pricing ancré. Réutilise la tranche *Strategy* de `startup-design`. Écrit `product/business-model.md` + `product/pricing.md` (ce dernier **si public/interne** ; sauté en perso).
2. **`07-product-spec`** (rôle **PM**, le cœur) — le **PRD** : features + specs + priorisation MoSCoW/RICE + user stories + dépendances + non-goals. Lit les 4 `research/` **+ `product/business-model.md`** (le maillon 06→07). Engine = `startup-design` Phase 6. **🚪 Porte de validation du PRD.** Écrit `product/product-spec.md` + `product/features/*` + `product/user-stories.md` + `product/feature-prioritization.md` + `product/mvp-definition.md`.
3. **`08-design-system`** (rôle **Designer**) — `DESIGN.md` (source de vérité) + maquettes, via `frontend-design`. Une seule décision utilisateur (les couleurs). **🚪 Porte de validation de la charte.** Écrit `DESIGN.md` + `design/mockups/`.

```
   Phase 1 · GO ─── research/ (idea-brief, opportunity-brief, positioning, demand-signals)
        │
        ▼           ┌──────────────────────────────────────────────────────────┐
                    │                 PHASE 2 · CADRAGE PRODUIT                 │
                    └──────────────────────────────────────────────────────────┘
   ┌────────────────────┐   type ? (lu dans state.md, fixé en Phase 1)
   │ 06-business-model  │──────────┬───────────────┐
   │ business-model +   │  public  │ interne       │ perso
   │ pricing            │          │ (fit/coût,    │ (pricing sauté,
   └────────────────────┘          │  pas de GTM)  │  BM minimal)
        │ (complet)                │ (allégé)      │ (minimal)
        ▼                          ▼               ▼
   ┌────────────────────────────────────────────────────────────┐
   │ 07-product-spec — PRD : features · MoSCoW/RICE · stories ·  │
   │ deps · non-goals · MVP definition                          │
   └────────────────────────────────────────────────────────────┘
        │  (PRD toujours actif — quel que soit le type, perso inclus)
        ▼   🚪 PORTE PRD  (valide / ajuste)
     ┌──────────┬──────────────────────────────────┐
     │ valide   │ ajuste (retour ciblé)            │
     ▼          └── reboucle 06 ou section 07 ◄─────┘
   ┌────────────────────────────────────────────────────────────┐
   │ 08-design-system — DESIGN.md (source de vérité) + mockups   │
   │ (perso : 1 décision de direction, mockups réduits)         │
   └────────────────────────────────────────────────────────────┘
        │
        ▼   🚪 PORTE CHARTE  (valide / ajuste la direction)
     ┌──────────┬──────────────────────────────────┐
     │ valide   │ ajuste                           │
     ▼          └── reboucle direction visuelle ◄──┘
   Phase 3 · cadrage technique (09-architecture)
```

## Les deux portes (portées par les experts)
Deux portes, prises par les experts eux-mêmes, jamais franchies sans **décision explicite** de l'utilisateur :
1. **Validation du PRD** (fin de `07-product-spec`) — l'expert présente le périmètre MVP + les non-goals, puis `AskUserQuestion`. **Ajuster** = retour ciblé (reboucle `06` si le modèle/pricing bouge, ou une section de `07`) selon la matrice de `references/orchestration-playbook.md`.
2. **Validation de la charte** (dans `08-design-system`) — décision de **direction visuelle** (recette `_shared/design-doctrine.md` + couleur de marque). **Ajuster** = reboucle la direction, pas tout le PRD.

## À chaque étape
Mets à jour `.saas-factory/state.md` (étape courante, type/calibrage, décisions verrouillées, portes franchies), résume en 2 lignes ce que l'expert vient de produire, et annonce l'étape suivante ou la porte. **Reprise** : au (re)démarrage de la phase, relis `.saas-factory/state.md` et reprends à l'étape courante au lieu de repartir de zéro (procédure dans `references/orchestration-playbook.md`). **Fin de Phase 2 : PRD + design system prêts** → Phase 3 (cadrage technique, `09-architecture`).
