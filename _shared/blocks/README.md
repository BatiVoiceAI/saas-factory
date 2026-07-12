# Blocs réutilisables — catalogue partagé (le châssis commun)

Le **moat** : des blocs auto-contenus, réutilisés d'un projet à l'autre (≈ 80 % d'un micro-SaaS). Un micro-SaaS = **châssis commun (ces blocs) + verticale métier (le custom)**. On construit le custom, on **réutilise** le reste.

## Ce qu'est un « bloc »
Un module auto-contenu avec un **contrat** clair :
- **Fournit** : la capacité (ex. « auth passwordless OTP/magic link + sessions + rôles »).
- **Interface** : les points d'accroche (routes, hooks, composants, tables).
- **Config / clés** : ce que le projet doit fournir (variables d'env, clés API — **collectées au déploiement, jamais en dur**).
- **Tests** : livrés avec le bloc (le bloc arrive « vert »).

## Comment le pipeline l'utilise
- **Étape 9 (architecture)** : décide **quels blocs** ce projet réutilise vs ce qui est **custom** (le split 80/20).
- **Étape 10 (plan)** : ordonne — câblage des blocs (tâches rapides) vs build de la verticale (tâches custom).
- **Étape 11 (setup)** : scaffold le repo avec les blocs câblés.
- **Phase 4 (build)** : remplit la verticale ; les blocs sont déjà là.

## Catalogue V1 (archétype `web-saas`)
| Bloc | Fournit | Config requise |
|---|---|---|
| `auth` | Passwordless e-mail (OTP + magic link — pas de mot de passe, cf. `web-saas/BLOCKS.md`), sessions, rôles, multi-tenant (RLS) | Supabase connecté |
| `repo-ci` | Repo GitHub + GitHub Actions (lint / test / build / deploy) | GitHub connecté |
| `hosting` | Déploiement + sous-domaine + SSL (Vercel / CF Pages / Coolify) | hébergeur + domaine |
| `ui-shell` | Layout, nav, tokens (mappe `DESIGN.md`), composants shadcn | — |
| `crud` | Scaffolds CRUD + RLS par entité | (dérivé du modèle de données) |
| `notifications` | Email transactionnel (+ in-app) — Resend | clé Resend |
| `observability` | Sentry (erreurs) + PostHog (activation) | clés Sentry / PostHog |
| `billing` *(optionnel)* | Stripe checkout + webhooks + portail client | Stripe connecté *(seulement si le projet vend)* |

> ✅ **Statut : le CODE des blocs est implémenté sous `_shared/blocks/web-saas/` (V1)** — skeleton + 7 blocs (`ui-shell`, `auth`, `crud`, `notifications`, `observability`, `billing` *(optionnel)*, `repo-ci`), `hosting` fourni au déploiement. Voir le manifeste `web-saas/BLOCKS.md` (bloc → fichiers réels) et `web-saas/MOAT-STATUS.md` (livré / reste / limites). Ce README reste la source du **catalogue et des contrats**. Le pipeline est « block-aware » : il sélectionne (étape 9), ordonne (étape 10) et câble (étape 11) les blocs à partir de ce template.
