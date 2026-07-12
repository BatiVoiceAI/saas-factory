---
name: phase-5-launch
description: >-
  Phase 5 de SaaS Factory — Lancement (rôles Marketing · Release Eng / CTO). Orchestre les 2 étapes (16-seo → 17-deploy) : SEO de base si usage public, puis déploiement en production (plan-then-apply : promotion staging→prod, DNS, tracking, health checks). À utiliser après la décision « ship » de la revue client (étape 15).
allowed-tools: Read, Write, Edit, AskUserQuestion, Bash, Grep, Glob, Task
---

# SaaS Factory — Phase 5 : Lancement (orchestrateur)

Tu es le **chef d'orchestre de la mise en ligne**. Tu ne codes ni ne déploies toi-même : tu **enchaînes 2 étapes expertes** (`16-seo`, `17-deploy`), tu appliques la **porte de publication**, tu tiens l'état. La profondeur d'exécution vit dans **chaque étape** (leurs `references/`) — reste **scannable**.

Prérequis : décision **« ship »** à l'étape 15. Le produit est validé + provisionné (staging). Tu déroules 2 étapes.

**HARD GATE (phase).** On **met en ligne** — pas de nouveau build. **Ça publie et ça peut dépenser** → `_shared/safety-rails.md` s'applique (plan-then-apply). Livrable : produit en **prod** + tracking actif.

## À lire d'abord
`references/conventions.md` + `_shared/lessons.md` + `_shared/safety-rails.md` (§1 plan-then-apply, §1 bis autorisation durable) + `_shared/stack-defaults.md`.

> Discipline `_shared` : le **master** a déjà lu `_shared/*` au démarrage — ils **priment** et sont en contexte. Ne les fais **pas relire** par chaque étape. Charge le détail d'une étape (ses `references/`) **au moment** où elle s'exécute. Détail : `references/state-resume.md`.

## Références du chef d'orchestre (charge à la demande)
La profondeur du **routage/portes/état** vit ici — ouvre la bonne au bon moment, ne précharge pas :
- `references/pipeline.md` — la **carte** de la phase (diagramme ASCII, séquence exacte, ce que chaque étape produit, règles d'enchaînement + retours arrière internes).
- `references/routing.md` — le **calibrage** `type` → route (public / interne / perso → étapes actives/sautées).
- `references/gates.md` — la **gestion des portes** (le gate humain SEO de 16, la porte de publication de 17 : ce que chaque 🚪 décide + retours arrière).
- `references/state-resume.md` — **état, reprise & discipline `_shared` une fois** (quand/quoi mettre à jour dans `.saas-factory/state.md`, table de reprise).

## Le pipeline — 2 étapes expertes
1. **`16-seo`** (rôle Marketing, **si `type = public`**) — base SEO saine (mots-clés → clusters, pages de qualité **plafonnées**, on-page + technique), **gate humain avant publication**. → écrit `seo/topic-cluster-map.md` + `seo/plan.md` + optimisations code. `type != public` ⇒ **sautée**.
2. **`17-deploy`** (rôle Release Eng / CTO) — **plan-then-apply** du déploiement prod : pré-vol → plan → 🚪 porte de publication → apply (migrations → promotion staging→prod → cutover DNS → tracking PostHog + Sentry) → **health check canary** (échec → rollback N-1). S'inspire des patterns gstack `land-and-deploy` + `canary` (inspirés, non vendorés). → écrit `deploy/log.md` + URL live + tracking actif.

## Diagramme de flux (détail : `references/pipeline.md`)
```
                 [Phase 4 · étape 15] ── décision « ship » ──┐
                                                             ▼
                              ┌──────────────  type ?  ──────────────┐
                       public │                                      │ perso / interne
                              ▼                                      ▼
                    ┌───────────────────┐                   (SEO sauté — routing.md)
                    │  16-seo  (Mktg)   │                            │
                    │  clusters + pages │                            │
                    │  plafonnées       │                            │
                    │  🚪 gate humain   │                            │
                    │     publication   │                            │
                    └─────────┬─────────┘                            │
                              │ seo/plan.md + code                   │
                              └───────────────┬──────────────────────┘
                                              ▼
                                 ┌───────────────────────────┐
                                 │   17-deploy (Release/CTO) │
                                 │   pré-vol ▸ plan ▸        │
                                 │   🚪 PORTE publication ▸  │◀── plan-then-apply
                                 │   apply ▸ canary          │      (safety-rails §1)
                                 └─────────────┬─────────────┘
                                   sain ──────┐│┌────── dégradé/échec
                                              ▼│▼
                                 URL live +   ││   rollback N-1 + log
                                 tracking     ││   (pas de faux succès)
                                              ▼
                                  ── Fin Phase 5 : produit EN LIGNE ──▶ Phase 6 (mesure & retro)
```

## Portes (détail : `references/gates.md`)
- `16-seo` porte un **gate humain de publication du contenu** (on ne publie pas de pages publiques sans OK tracé). Interne à l'étape.
- `17-deploy` porte la **porte de publication** (plan-then-apply) : plan (quoi/où/coût/réversibilité) → **OK explicite** → apply. **Ne publie jamais sans OK.** Échec canary → **rollback**, jamais de faux succès.
- **Fin de Phase 5 : produit en ligne** → Phase 6 (mesure & retro).

## Calibrage (détail : `references/routing.md`)
`type = perso/interne` → **saute le SEO** (16) ; le déploiement (17) peut être privé/interne (mais garde sa porte + son canary). `public` → les deux étapes. Le routage saute une **étape**, jamais la porte de publication de 17.

## Sortie
À **chaque transition** (fin d'étape, franchissement de porte) : mets à jour `.saas-factory/state.md` (`references/state-resume.md`), résume en 2 lignes, annonce la suivante. Fin de phase → **Phase 6**.
