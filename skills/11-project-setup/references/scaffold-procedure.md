# Référence — Scaffold local (étape 1 : repo + blocs câblés + CLAUDE.md)

La **première** étape, séquentielle, dont tout dépend. Elle crée l'arbre local, câble les blocs au niveau code, et génère le `CLAUDE.md` projet — la source de vérité des agents de build (Phase 4). Aucun appel réseau ici : c'est du disque local. Le provisioning distant vient après (`provisioning-plan.md`).

## Sous-procédure (ordre exact)
1. **Lire les entrées** : `tech/architecture.md` (stack + modèle de données + split réutiliser/build), `tech/execution-plan.md` (ordre, points `[SÉCU]`), `_shared/archetypes/<archétype>.md`, `_shared/blocks/README.md`, `_shared/stack-defaults.md`, `~/.saas-factory/config.json`.
2. **Dériver le `slug`** : nom projet → slug déterministe (voir règle plus bas). Le slug est la **clé** de toutes les ressources distantes → il doit être stable.
3. **`git init`** + `.gitignore` (env, node_modules, .next, secrets). Commit vide initial `chore: scaffold`.
4. **Poser la structure** de l'archétype (arbre `web-saas` ci-dessous).
5. **Câbler les blocs** décidés « réutiliser » à l'étape 9 (matrice de câblage plus bas) : poser code + points d'accroche + `.env.example` (**noms** de variables, jamais de valeurs).
5 bis. **Annoter le plan d'exécution** (réconciliation 10/11) : pour chaque tâche de `tech/execution-plan.md` couverte — même partiellement — par un bloc câblé ici, ajouter la mention « **pré-câblée au scaffold (étape 11)** ». La Phase 4 (12-build) traite ces tâches en **vérification/extension** du code posé, pas en TDD from scratch (sinon : faux tests rouges sur du code déjà existant, double travail masqué).
6. **Générer le `CLAUDE.md`** racine depuis `assets/templates/project-claude-md.md`, rempli avec les données réelles du projet.
7. **Poser `.saas-factory/`** (état pipeline) + `README.md` minimal.
8. **Commit** `chore: wire blocks + CLAUDE.md`. Prêt pour le push (étape 2, `provisioner-repo`).

## Sélection des blocs par archétype
Avant de câbler quoi que ce soit, la sous-procédure **choisit l'ensemble de blocs** en fonction de l'`archetype` (`_shared/state-schema.md` §modèle 3 axes — SOURCE UNIQUE). Le `type` (public|interne|perso) reste **orthogonal** : il *adapte* le socle, il ne choisit pas les blocs — la seule exception est `access-gate`, sélectionné si `type≠public`. Le `tenancy` (single|multi-org) **module** la composition `web-saas` uniquement.

- **`web-saas`** (défaut) → `skeleton` + `ui-shell` + `auth` + (`access-gate` **si** `type≠public`) + `crud` + `notifications` + `observability` + (`billing` **si** le projet vend) + `repo-ci` + `hosting`. **Si `tenancy=multi-org` → + `org-tenancy`** (entité **Org** + membres + invitations + switch d'org + rôles org, **`org_id` comme tenant** + **RLS par org** ; options `org-sso` / `org-billing`). Arbre complet + matrice ci-dessous ; contrats : `_shared/blocks/README.md`, `_shared/archetypes/web-saas.md`.
- **`landing`** → `skeleton` (qui porte **déjà** `components/landing/*` + backstops + gabarits légaux) + **`waitlist`** (leads + accusé de confirmation via `notifications`) + `notifications` + **légal** (pages du `skeleton`, sélection par `jurisdiction`) + `repo-ci` + `hosting`. **SANS** `auth`, `access-gate`, `crud`, dashboard, `billing`. Concrètement : **aucune** migration `0001_auth` / `0002_items` / `0003_billing` n'entre dans l'arbre ; **pas** d'entité cœur CRUD, **pas** d'onboarding wizard, **pas** de `app/(app)/` dashboard. Le seul SQL = la table leads du bloc `waitlist` (+ `0004_notifications` pour l'accusé). Contrats : `_shared/blocks/README.md` §waitlist, `_shared/archetypes/landing.md`. `landing` **ne réclame pas d'arbre séparé** : il s'assemble par sélection d'un **sous-ensemble** du châssis `web-saas`.
- **`automation`** → châssis **`_shared/blocks/automation/`** (worker **headless**, socle **AU1-AU5** : config/secrets validés `src/config.ts`, historique de runs + logs `src/runs.ts`, healthcheck `src/health.ts`, boucle fermée propriétaire `src/notify.ts`, idempotence `src/idempotency.ts`, orchestrés par `src/index.ts`) — **PAS** le châssis `web-saas` **ni** l'assemblage `landing`. **Dependency-light** (Node 20+ built-ins + `zod`, ESM TS strict, `tsc`-vérifiable) ; déploiement **worker / cron externe / conteneur**, **pas Next.js/Vercel**. Ne pas forcer l'arbre `web-saas` ni l'assemblage `landing` dessus. Fiche (modèle + pipeline + critères) : `_shared/archetypes/automation.md` ; manifeste bloc → fichiers réels : `_shared/blocks/automation/README.md` (fait foi pour les chemins).
- **`ecommerce`** → **réutilise le socle `web-saas`** (`skeleton` + `ui-shell` + `auth` *(compte client **léger et optionnel** — le **checkout invité** est le défaut e-commerce)* + `crud` (produits/commandes) + `notifications` (confirmations) + `observability` + **légal** (CGV/mentions de vente par `jurisdiction`) + `repo-ci` + `hosting`) **MAIS remplace `billing` (abonnement) par un checkout Stripe ONE-SHOT** (`mode:payment`, *jamais* `mode:subscription` — différence dure avec `billing`) et **ajoute** les blocs commerce **catalogue / panier / checkout / commandes / stock**. Ces blocs vivront dans le châssis **`_shared/blocks/ecommerce/`** (**à bâtir**) ; en attendant, ils sont **codés en blocs custom** autour du socle web-saas (le CTO 09 architecture les patterns + pièges **P1-P3**, le DEV 12 code). Le **back-office admin** (produits+commandes) = **socle EC**, PAS un dashboard SaaS. Ne pas classer une boutique en `web-saas` ni forcer l'assemblage `landing`/`automation` dessus. Fiche : `_shared/archetypes/ecommerce.md` §Socle EC1-EC5 + §Structure du châssis + §Pièges.

> **Rappel exemples retirés.** `0002_items` et le CRUD `items` de démo restent **retirés au build** en `web-saas` (CONVENTIONS §10). En **`landing`**, ils ne sont même **pas sélectionnés** — aucune migration auth/crud n'entre dans l'arbre.

## Arbre généré (archétype web-saas)
> **Note de couverture (modèle 3 axes — `_shared/state-schema.md` §modèle 3 axes).** La sous-procédure lit `_shared/archetypes/<archétype>.md` **génériquement** puis **sélectionne les blocs par archétype** (voir §Sélection des blocs par archétype ci-dessus). **`web-saas`** dispose de l'arbre complet ci-dessous (+ bloc **`org-tenancy`** si `tenancy=multi-org`). **`landing`** ne réclame **pas** d'arbre séparé : il s'assemble par **sélection d'un sous-ensemble** du châssis `web-saas` — `skeleton` (qui porte déjà `components/landing/*` + gabarits légaux) + **`waitlist`** + `notifications` + `repo-ci` + `hosting`, **sans** auth/crud/dashboard/billing. **`automation`** (socle AU1-AU5) dispose désormais de son **châssis headless propre** `_shared/blocks/automation/` (livré **C2c**, dependency-light Node 20+ built-ins + `zod`, worker/cron externe/conteneur — **pas Next.js/Vercel**) → ne pas forcer l'arbre `web-saas` ni l'assemblage `landing` dessus. Le 3ᵉ axe `tenancy` (single|multi-org) module le câblage `crud`/RLS **dans** `web-saas` et **ajoute** `org-tenancy` en multi-org ; il ne change pas l'arbre `landing`. **`ecommerce`** réutilise l'arbre `web-saas` en **remplaçant `billing` (abonnement) par un checkout one-shot** + les blocs commerce (catalogue/panier/checkout/commandes/stock) ; son châssis assemblé `_shared/blocks/ecommerce/` est **à bâtir** → aujourd'hui codé en blocs custom autour du socle web-saas (fiche : `_shared/archetypes/ecommerce.md`).
```
app/            # routes (App Router)
components/     # UI (design system issu de 08-design-system)
lib/            # accès données, clients (supabase, stripe)
supabase/
  migrations/   # SQL versionné (appliqué par provisioner-db)
tests/          # tests dès la 1re feature
.github/workflows/  # CI (lint/test/build/deploy) — poussée par provisioner-repo
.saas-factory/  # état du pipeline
.env.example    # NOMS de variables uniquement
DESIGN.md · CLAUDE.md · README.md · .gitignore
```

## Règle de dérivation du slug
- minuscules, `[a-z0-9-]`, pas d'accent, pas d'espace (→ `-`), pas de `_`.
- longueur 3–30 ; unique par org.
- **déterministe** : même nom projet → même slug (pas de suffixe aléatoire au 1er run).
- collision détectée à l'étape idempotence (repo/db existant au bon slug mais contenu inattendu → conflit, cf. `idempotence-rollback.md`), **pas** en inventant un slug-2 ici.

## Matrice de câblage des blocs (réutiliser → quoi poser)
Le split réutiliser/build vient de l'étape 9. Ici on **câble le code** des blocs « réutiliser ».

| Bloc (si « réutiliser ») | Code posé | Points d'accroche | `.env.example` (noms) |
|---|---|---|---|
| `auth` | middleware session, routes login/callback, helper rôles | `lib/supabase`, guard des routes | `SUPABASE_URL`, `SUPABASE_ANON_KEY` |
| `repo-ci` | `.github/workflows/*.yml` | — (poussé par repo) | — |
| `ui-shell` | layout, nav, tokens depuis `DESIGN.md`, shadcn | `components/`, `app/layout` | — |
| `crud` | scaffolds CRUD par entité du modèle de données | `lib/`, `app/(entité)` | — |
| `notifications` | client Resend + templates React Email | `lib/email` | `RESEND_API_KEY` |
| `observability` | init Sentry + PostHog | `app/layout`, `lib/analytics` | `SENTRY_DSN`, `POSTHOG_KEY` |
| `billing` *(si le projet vend)* | checkout + webhooks + portail | `app/api/stripe`, `lib/stripe` | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| `waitlist` *(archétype `landing`)* | table leads + formulaire email + route POST + accusé de confirmation **via `notifications`** (`enqueueJob`/`dispatchEntityJobs`) | section landing (`components/landing/*`), `lib/`, **réutilise** `lib/notifications/*` | — *(Resend porté par `notifications`)* |
| `org-tenancy` *(si `tenancy=multi-org`)* | migration **Org + membres + invitations** + `org_id` tenant + **RLS par org** + switch d'org + rôles org ; **étend** le tenant des entités `crud` (billing/enrollment → org) | `lib/`, `app/(app)`, session/middleware (dérive `org_id`) | Supabase *(déjà connecté)* |

> Un bloc décidé « build » (custom) à l'étape 9 n'est **pas** câblé ici — juste un dossier + un TODO pour la Phase 4. On ne pré-implémente pas la verticale (HARD GATE : pas de feature).

## Recette forcing — câbler vs stub
Décision interne (aucune question utilisateur).
- **Ask exact** : « ce bloc est-il marqué "réutiliser" dans le split de l'étape 9 ? »
- **Décider jusqu'à** : présence explicite dans `tech/architecture.md`, pas une supposition.
- **Red-flags — refuser de câbler** :
  - un bloc non listé dans le split → ne pas l'inventer (pas de `billing` si le projet ne vend pas).
  - poser une **valeur** de secret dans `.env.example` (→ uniquement des noms).
  - implémenter une feature métier (→ HARD GATE, c'est la Phase 4).
- **Routage** : « réutiliser » → câble (code + accroche + env names). « build » → dossier + TODO. non listé → rien.

## Definition of Done — scaffold
- [ ] `git init` fait, ≥1 commit, `.gitignore` couvre env/secrets/build.
- [ ] Arbre de l'archétype présent.
- [ ] Tous les blocs « réutiliser » du split étape 9 câblés (code + accroche + noms d'env).
- [ ] Tâches du plan couvertes par les blocs câblés **annotées « pré-câblée au scaffold (étape 11) »** dans `tech/execution-plan.md` (étape 5 bis).
- [ ] Aucun bloc « build » pré-implémenté (juste dossier + TODO).
- [ ] `.env.example` = **noms uniquement**, zéro valeur.
- [ ] `CLAUDE.md` racine généré et rempli (aucun secret).
- [ ] `supabase/migrations/` contient le SQL du modèle de données (prêt pour `provisioner-db`).
- [ ] Points `[SÉCU]` de `tech/execution-plan.md` reportés dans le `CLAUDE.md` / log.
- [ ] Rien de commité qui soit un secret.

## Modes d'échec + traitement

| Mode | Symptôme | Traitement |
|---|---|---|
| Secret commité | valeur dans `.env` traqué / dans le code | `.gitignore` d'abord ; si déjà commité localement → réécrire avant tout push distant |
| Slug non déterministe | slug aléatoire → reprise casse l'idempotence | slug = fonction pure du nom |
| Bloc fantôme | câblage d'un bloc absent du split | ne câbler que ce que l'étape 9 liste |
| Feature pré-buildée | verticale implémentée ici | STOP — HARD GATE, laisser en TODO Phase 4 |
| `CLAUDE.md` vide/générique | template non rempli avec les vraies données | remplir depuis `tech/*` + `product/*`, jamais laisser les `{placeholders}` |
| Chevauchement 10/11 masqué | la Phase 4 « re-builde » en faux TDD une tâche déjà couverte par un bloc câblé | annoter « pré-câblée au scaffold (étape 11) » dans `tech/execution-plan.md` (étape 5 bis) ; 12-build vérifie/étend au lieu de refaire |
| Migrations absentes | `supabase/migrations/` vide | dériver le SQL du modèle de données étape 9 (tables + RLS) avant le scaffold DB |
