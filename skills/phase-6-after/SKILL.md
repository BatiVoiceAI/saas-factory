---
name: phase-6-after
description: >-
  Phase 6 de SaaS Factory — Après (rôles PM / CEO / Eng Manager). Orchestre les 2 étapes (18-metrics → 19-retro) : une fois le SaaS en ligne, mesure les métriques d'activation et propose des itérations, puis fait la rétro, enrichit la mémoire qui compound, et tranche kill/continue. À utiliser après le déploiement (Phase 5).
allowed-tools: Read, Write, Edit, AskUserQuestion, Bash, Grep, Glob, Task, Skill
---

# SaaS Factory — Phase 6 : Après (orchestrateur)

Prérequis : produit **en ligne** (fin Phase 5, `17-deploy`). Tu déroules 2 étapes. La boucle se referme : **mesurer → apprendre → décider**. Tu es le **chef d'orchestre** de la phase — tu n'analyses pas toi-même, tu délègues à `18-metrics` puis `19-retro`, tu tiens l'état, tu portes la porte finale.

**HARD GATE (phase).** On **mesure et on décide** — pas de build. Aucune ligne de code produit ici : toute itération repart en Phase 4/5. Livrable : bilan métriques + rétro + décision **kill/continue** + mémoire enrichie.

## À lire d'abord
`references/conventions.md` + `_shared/lessons.md` (baseline de leçons **livrée avec le plugin**, lecture seule). La mémoire qu'on **nourrit** ici vit **hors plugin** : `~/.saas-factory/lessons-learned.md` (transverse) + `~/.saas-factory/learnings.jsonl` (projet), écrites par `19-retro` (elles survivent aux updates). Ces blocs `_shared/*` sont **déjà en contexte** (lus une fois par le master) : ne les fais pas relire par les étapes.

## Le flux de la phase
```
   fin P5 (produit EN LIGNE, tracking actif : PostHog + Sentry)
        │
        ▼
  ┌─────────────┐   metrics/review.md    ┌──────────────┐
  │ 18-metrics  │ ─────────────────────▶ │  19-retro    │
  │ PM / CEO    │  funnel + santé +      │ EngMgr / CEO │
  │             │  1-3 pistes d'itér.    │              │
  └─────────────┘                        └──────┬───────┘
   lit: PostHog/Sentry,                         │  🚪 KILL / CONTINUE
        product/*, pricing.md                    │  (confronte critère écrit
                                                 │   dans state.md aux chiffres)
                          ┌──────────────────────┼──────────────────────┐
                          ▼                                              ▼
                   CONTINUE ─▶ itère : retour Phase 4          KILL ─▶ post-mortem 5 lignes
                   (nouvelle feature) ou Phase 5 (relance)     + archive propre + mémoire
                          │                                              │
                          └──────────────▶ mémoire enrichie ◀───────────┘
              (~/.saas-factory/lessons-learned.md transverse · learnings.jsonl projet)
```
Détail exhaustif de la séquence (lit/produit/persona par étape) + calibrage par `type` : `references/flow.md`.

## Le pipeline
1. **`18-metrics`** — funnel d'activation (PostHog) + santé (Sentry) → **1-3 pistes d'itération** priorisées. Écrit `metrics/review.md`.
2. **`19-retro`** — rétro + **mémoire qui compound** + **porte kill/continue**. Écrit `retro/retro.md` + met à jour `~/.saas-factory/learnings.jsonl` / `~/.saas-factory/lessons-learned.md` (hors plugin ; `_shared/lessons.md` reste en lecture seule).

## Portes
`19-retro` porte l'unique porte de la phase : la **décision kill/continue**.
- **Continue** → on itère : retour **Phase 4** (build d'une nouvelle piste) ou **Phase 5** (relance/déploiement).
- **Kill** → **post-mortem** de 5 lignes + archive propre + leçons remontées dans la mémoire.

Jamais de kill **ni** de continue au feeling : on **confronte le critère de KILL écrit au lancement** (dans `state.md`) aux chiffres de `metrics/review.md`. Protocole de la porte + graphe des retours arrière : `references/gate-and-state.md`.

## Calibrage par `type`
- **Public** → funnel complet + santé + itération priorisée + porte kill/continue argumentée.
- **Interne / perso** → métriques **allégées** (usage réel, pas d'obsession du funnel d'activation), mais **rétro + mémoire toujours** : elles compound quel que soit le type. Profondeur : `references/flow.md` ; skip-set et portes par type : matrice canonique `skills/saas-factory/references/routing.md` (route selon elle).

## Sortie
Cycle bouclé (**idée → déployé → mesuré → appris**). À chaque étape : mets à jour `.saas-factory/state.md`, résume en 2 lignes, annonce la suite (itération ou clôture). MAJ d'état + reprenabilité de la phase : `references/gate-and-state.md`.
