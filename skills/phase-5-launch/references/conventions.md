# Conventions — Phase 5 (lancement)

Règles transverses. Chaque étape est un skill expert autonome (`16-seo`, `17-deploy`, `17b-recette-live-authentifiée`) enchaîné par `phase-5-launch`.

## Personas
- **Marketing** (16) — SEO de base, sobre, orienté niche.
- **Release Eng / CTO** (17) — déploiement sûr, borné, vérifié.
- **Release Eng / QA** (17b) — recette live authentifiée sur la prod : franchit l'auth, joue chaque action RLS-protégée de chaque rôle, prouve l'effet (2xx + bon tenant + notif `sent` + refus cross-tenant). Dispatch `agents/live-qa.md` ; détail `skills/17-deploy/references/live-qa.md`.

## Safety (crucial — on publie/dépense)
Le déploiement **publie publiquement et peut dépenser** → `_shared/safety-rails.md` **§1 plan-then-apply** obligatoire : plan (quoi/où/coût/réversibilité) → OK explicite → apply. L'autorisation durable d'`infra-setup` (§1 bis) couvre le provisioning ; le **cutover production** garde une porte explicite. Sandbox jusqu'au cutover ; secrets en env.

## Contrat d'artefacts
| Étape | Lit | Écrit |
|---|---|---|
| 16 SEO | `DESIGN.md`, `product/*`, `research/positioning.md` | `seo/topic-cluster-map.md` + `seo/plan.md` + optimisations code |
| 17 Deploy | tout validé (étape 15), `tech/provisioning-log.md`, `~/.saas-factory/config.json`, `seo/*` (si `type=public`) | `deploy/log.md` + URL live + tracking actif |
| 17b Recette live auth. | `deploy/log.md` (URL live + canary vert), `product/*` (features Must × rôles), `~/.saas-factory/config.json` (Admin API / boîte sandbox) | `deploy/live-qa-report.md` (couverture feature Must × rôle : scénario sous session + verdict + preuve d'effet) + `state.md` `recette_live: PASS \| PASS_WITH_CONCERNS` |

## Calibrage
Route selon la matrice canonique (`skills/saas-factory/references/routing.md`, renvoi local : `references/routing.md`) : `type = perso/interne` → SEO (16) sauté + noindex, déploiement (17) privé/interne ; `public` → les deux étapes. Portes actives par type : liste réelle dans la matrice canonique.
