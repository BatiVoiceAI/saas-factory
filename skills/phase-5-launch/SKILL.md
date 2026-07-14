---
name: phase-5-launch
description: >-
  Phase 5 de SaaS Factory — Lancement (rôles Marketing · Release Eng / CTO / QA). Orchestre les étapes 16-seo → 17-deploy → 17b-recette-live-authentifiée : SEO de base si usage public, déploiement en production (plan-then-apply : promotion staging→prod, DNS, tracking, health checks), puis recette live AUTHENTIFIÉE (obligatoire, bloquante) qui franchit vraiment l'auth sur la prod et exécute chaque action RLS-protégée de chaque rôle avec preuve avant de déclarer « livré ». À utiliser après la décision « ship » de la revue client (étape 15).
allowed-tools: Read, Write, Edit, AskUserQuestion, Bash, Grep, Glob, Task, Skill
---

# SaaS Factory — Phase 5 : Lancement (orchestrateur)

Tu es le **chef d'orchestre de la mise en ligne**. Tu ne codes ni ne déploies toi-même : tu **enchaînes 3 étapes expertes** (`16-seo`, `17-deploy`, `17b-recette-live-authentifiée`), tu appliques la **porte de publication**, et tu ne déclares **« livré » qu'après une recette live authentifiée VERTE**, tu tiens l'état. La profondeur d'exécution vit dans **chaque étape** (leurs `references/`) — reste **scannable**.

Prérequis : décision **« ship »** à l'étape 15. Le produit est validé + provisionné (staging). Tu déroules 3 étapes (16 → 17 → 17b).

**HARD GATE (phase).** On **met en ligne** — pas de nouveau build. **Ça publie et ça peut dépenser** → `_shared/safety-rails.md` s'applique (plan-then-apply). Livrable : produit en **prod** + tracking actif **+ recette live authentifiée verte** (chaque action RLS-protégée de chaque rôle jouée en connecté sur la prod, avec preuves). Un canary vert **ne suffit pas** à déclarer « livré » — voir 17b.

## À lire d'abord
`references/conventions.md` + `_shared/lessons.md` + `_shared/safety-rails.md` (§1 plan-then-apply, §1 bis autorisation durable) + `_shared/stack-defaults.md`.

> Discipline `_shared` : le **master** a déjà lu `_shared/*` au démarrage — ils **priment** et sont en contexte. Ne les fais **pas relire** par chaque étape. Charge le détail d'une étape (ses `references/`) **au moment** où elle s'exécute. Détail : `references/state-resume.md`.

## Références du chef d'orchestre (charge à la demande)
La profondeur du **routage/portes/état** vit ici — ouvre la bonne au bon moment, ne précharge pas :
- `references/pipeline.md` — la **carte** de la phase (diagramme ASCII, séquence exacte, ce que chaque étape produit, contrôle de réception anti-squelette, règles d'enchaînement + retours arrière internes).
- `references/routing.md` — l'**application de la route** (renvoi à la matrice canonique `skills/saas-factory/references/routing.md` + règles locales d'application).
- `references/gates.md` — la **gestion des portes** (le gate humain SEO de 16, la porte de publication de 17 : ce que chaque 🚪 décide + retours arrière).
- `references/state-resume.md` — **état, reprise & discipline `_shared` une fois** (quand/quoi mettre à jour dans `.saas-factory/state.md`, table de reprise).

## Le pipeline — 3 étapes expertes
1. **`16-seo`** (rôle Marketing, **si `type = public`** — route selon `routing.md`) — base SEO saine (mots-clés → clusters, pages de qualité **plafonnées**, on-page + technique), **gate humain avant publication**. → écrit `seo/topic-cluster-map.md` + `seo/plan.md` + optimisations code. `type != public` ⇒ **sautée + noindex**.
2. **`17-deploy`** (rôle Release Eng / CTO) — **plan-then-apply** du déploiement prod : pré-vol → plan → 🚪 porte de publication → apply (migrations → promotion staging→prod → cutover DNS → tracking PostHog + Sentry) → **health check canary** (échec → rollback N-1). S'inspire des patterns gstack `land-and-deploy` + `canary` (inspirés, non vendorés). → écrit `deploy/log.md` + URL live + tracking actif.
3. **`17b-recette-live-authentifiée`** (rôle Release Eng / QA — **obligatoire & bloquante dès qu'il y a auth + RLS** ; route selon `routing.md`) — sur la **PROD réelle** (après canary vert de 17), on **franchit vraiment l'auth** : login OTP **complété** via **boîte sandbox de test** OU session **forgée par l'Admin API** (`createUser` `email_confirm` + `signIn` — les DEUX méthodes de session sont documentées et réutilisables), puis on **exécute CHAQUE action de valeur RLS-protégée de CHAQUE rôle** (multi-rôles : ex. agence + client, org A + org B). **Preuve par action** : réponse **2xx** + **ligne écrite sous le bon tenant** (vérif hors-bande service_role — les actions se jouent au **JWT user-scopé**, jamais service_role qui bypasse RLS) + **notification `sent` immédiate** (boucles fermées, `_shared/boucles-fermees.md`) + **refus cross-tenant prouvé** (un rôle ne voit/écrit pas les données d'un autre). Boucle **fix → redeploy → re-test** (budget cycles) jusqu'au vert. **Moteur déjà en place** — on ne réinvente pas : dispatch de l'agent `agents/live-qa.md`, détail exécutable + DoD + modes d'échec dans `skills/17-deploy/references/live-qa.md` (répétition générale en staging : `skills/14-qa/references/fake-client-protocol.md`). → écrit `deploy/live-qa-report.md` (une ligne de couverture par feature Must × rôle : scénario joué sous session + verdict + preuve d'effet) + `.saas-factory/state.md` (`recette_live: PASS | PASS_WITH_CONCERNS`). **Tant que ce n'est pas `PASS` (0 bloquant), le produit n'est PAS « livré ».** Cadre normatif : règle d'or 19 (`_shared/lessons.md`).

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
                                 canary vert  ││   rollback N-1 + log
                                 (URL live)   ││   (pas de faux succès)
                                              ▼
                                 ┌───────────────────────────┐
                                 │ 17b-recette-live-AUTH     │◀── OBLIGATOIRE & BLOQUANTE
                                 │ franchit l'auth en PROD ▸ │    (OTP sandbox / Admin API)
                                 │ chaque action RLS × rôle ▸│
                                 │ preuve: 2xx + bon tenant +│
                                 │ notif sent + refus        │
                                 │ cross-tenant ▸ fix→redeploy│
                                 └─────────────┬─────────────┘
                                   vert ──────┐│┌── rouge (bug RLS/scoping/junction)
                                              ▼│▼
                                 « LIVRÉ »    ││  fix → redeploy → re-test
                                 (recetté)    ││  (jamais « livré » au rouge)
                                              ▼
                          ── Fin Phase 5 : produit EN LIGNE & RECETTÉ CONNECTÉ ──▶ Phase 6 (mesure & retro)
```

## Portes (détail : `references/gates.md`)
- `16-seo` porte un **gate humain de publication du contenu** (on ne publie pas de pages publiques sans OK tracé). Interne à l'étape.
- `17-deploy` porte la **porte de publication** (plan-then-apply) : plan (quoi/où/coût/réversibilité) → **OK explicite** → apply. **Ne publie jamais sans OK.** Échec canary → **rollback**, jamais de faux succès.
- `17b-recette-live-authentifiée` n'est **pas une porte utilisateur** mais un **contrôle BLOQUANT de fin de phase** : le produit n'est **« livré »** qu'après exécution **verte** de chaque action RLS-protégée de chaque rôle en **prod connecté** (2xx + ligne au bon tenant + notif `sent` + refus cross-tenant prouvé). Rouge (bug RLS/scoping/junction, parcours injoignable) → **fix → redeploy → re-test**, **jamais** de « livré » au rouge. Détail : règle d'or 19 (`_shared/lessons.md`).
- **Fin de Phase 5 : produit en ligne ET recetté connecté** → Phase 6 (mesure & retro).

## Calibrage (détail : `references/routing.md`)
`type = perso/interne` → **saute le SEO** (16, + noindex) ; le déploiement (17) reste actif, privé/interne, avec son canary. `public` → les deux étapes. Les **portes suivent la liste réelle par type** (matrice canonique `skills/saas-factory/references/routing.md` §Portes actives) : porte de publication complète en public, conditionnelle en interne (+ check « signup anonyme refusé »), absente en perso sur preview URL à coût nul — la porte revient dès que ça touche un domaine public ou que ça dépense.
La **recette live authentifiée (17b)** s'exécute **dès qu'il y a auth + RLS** : complète et **multi-rôles avec refus cross-tenant** en `web-saas public`/`interne` et **surtout `multi-org`** (agence vs client, org A vs org B — le cas où surgissent les bugs RLS/scoping/junction et les invitations injoignables) ; en `perso` (mono-utilisateur/mono-tenant) on garde la **preuve d'action authentifiée** sans matrice cross-tenant ; pour une **`landing`** (pas d'auth) elle est **sans objet** ; pour une **`automation`** headless elle se **réduit à la vérif de boucle fermée** déjà portée par 14/17. Route selon `references/routing.md`.

## Sortie
À **chaque transition** (fin d'étape, franchissement de porte) : mets à jour `.saas-factory/state.md` (`references/state-resume.md`), résume en 2 lignes, annonce la suivante. **Fin de phase = `17-deploy` `fait` ET `17b` `fait` (recette live authentifiée verte)** → **Phase 6**. Sans 17b verte, on **ne sort pas** de phase et on **ne déclare pas « livré »**.
