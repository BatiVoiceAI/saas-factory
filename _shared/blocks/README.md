# Blocs réutilisables — catalogue partagé (le châssis commun)

Le **moat** : des blocs auto-contenus, réutilisés d'un projet à l'autre (≈ 80 % d'un micro-SaaS). Un micro-SaaS = **châssis commun (ces blocs) + verticale métier (le custom)**. On construit le custom, on **réutilise** le reste.

## Ce qu'est un « bloc »
Un module auto-contenu avec un **contrat** clair :
- **Fournit** : la capacité (ex. « auth OTP → mot de passe (vérif e-mail par OTP puis mot de passe) + sessions + rôles »).
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
| `auth` | E-mail **OTP → mot de passe** (l'OTP vérifie l'e-mail à l'inscription, puis l'utilisateur pose un mot de passe ; connexion e-mail + mot de passe ; **PLUS DE magic link**, cf. `web-saas/BLOCKS.md`), sessions, rôles, multi-tenant (RLS), **enrollment par type** (public ouvert / interne invitations ou allowlist domaine / perso compte seedé) | Supabase connecté |
| `access-gate` *(interne/perso)* | Déploiement privé réel : middleware `noindex` (`X-Robots-Tag`) + redirection de bord des visiteurs non authentifiés. Sélectionné par l'étape 9 si `type ≠ public` | `APP_ACCESS_MODE` (posé au provisioning) |
| `repo-ci` | Repo GitHub + GitHub Actions (lint / test / build / deploy) | GitHub connecté |
| `hosting` | Déploiement + sous-domaine + SSL (Vercel / CF Pages / Coolify) | hébergeur + domaine |
| `ui-shell` | Layout, nav, tokens (mappe `DESIGN.md`), composants shadcn | — |
| `crud` | Scaffolds CRUD + RLS par entité | (dérivé du modèle de données) |
| `notifications` | Email transactionnel (+ in-app) — Resend | clé Resend |
| `observability` | Sentry (erreurs) + PostHog (activation) | clés Sentry / PostHog |
| `billing` *(optionnel)* | Stripe checkout + webhooks + portail client | Stripe connecté *(seulement si le projet vend)* |

> ✅ **Statut : le CODE des blocs est implémenté sous `_shared/blocks/web-saas/` (V1)** — skeleton + 8 blocs (`ui-shell`, `auth`, `access-gate` *(interne/perso)*, `crud`, `notifications`, `observability`, `billing` *(optionnel)*, `repo-ci`), `hosting` fourni au déploiement. Voir le manifeste `web-saas/BLOCKS.md` (bloc → fichiers réels) et `web-saas/MOAT-STATUS.md` (livré / reste / limites). Ce README reste la source du **catalogue et des contrats**. Le pipeline est « block-aware » : il sélectionne (étape 9), ordonne (étape 10) et câble (étape 11) les blocs à partir de ce template.

> ⚠️ **Artefacts d'exemple ≠ produit livré.** Le châssis embarque une entité
> `items` et un shell authentifié de **démo** (dashboard + sidebar) comme **patron
> de référence pour le DÉVELOPPEUR** — jamais pour l'utilisateur final. Le build
> (walking skeleton, étape 12) les **RETIRE** du produit et génère la vraie nav à
> partir des features livrées (jamais les liens hardcodés « Éléments »/« Facturation »
> de la démo ; un lien optionnel comme la facturation n'apparaît **que si** le bloc
> `billing` est câblé — sinon `/billing` = 404). Un fondateur non-tech ne doit
> jamais voir cette tuyauterie d'exemple. Contrat : `web-saas/CONVENTIONS.md` §10
> (exemples retirés au build) & §11 (nav feature-driven).

## Bloc `waitlist` — capture de leads *(câblé pour l'archétype `landing`)*

✅ **Livré (C2, build-vérifié `tsc`+`next build`)** ; fichiers réels du bloc → `web-saas/BLOCKS.md` (bloc `waitlist`) : `0005_waitlist.sql`, `components/waitlist/waitlist-form.tsx`, `app/api/waitlist/route.ts`, `lib/schemas/waitlist.ts`, `lib/waitlist/confirmation-email.ts`. Cette entrée est **le contrat + la règle de sélection**, pas une recopie du code.

Sélectionné par l'étape 9 pour l'archétype **`landing`** (page marketing seule, `../archetypes/landing.md`) — et, optionnellement, pour un `web-saas` en **pré-lancement** qui veut capter des emails avant l'ouverture du produit. **Ce n'est PAS un CRUD produit** : ni auth, ni dashboard, ni entité cœur. Il **réutilise le bloc `notifications`** pour l'accusé (pas d'envoi Resend ad hoc).

| Bloc | Fournit | Config requise |
|---|---|---|
| `waitlist` *(archétype `landing`)* | Capture de leads pré-produit : **table leads** (`email` + `source` + horodatage, RLS deny-by-default, insert public contrôlé), **formulaire email + bouton**, **route POST**, **accusé de confirmation** (page `/merci` + email) **via le bloc `notifications`** (`enqueueJob`/`dispatchEntityJobs`). Seuil/fenêtre go-test : `../../skills/05-opportunity/references/go-test-playbook.md` | Supabase connecté ; Resend **porté par `notifications`** (pas de clé propre) |

> **Règle de sélection.** `waitlist` est la brique concrète de l'archétype **`landing`** (avec `skeleton` + `notifications` + légal + `repo-ci` + `hosting`) — **jamais** accompagné d'`auth`/`crud`/`dashboard`/`billing` dans ce cadre. En `web-saas`, il reste **optionnel** (pré-lancement). Composition complète : `../../skills/11-project-setup/references/scaffold-procedure.md` §Sélection des blocs par archétype.

## Bloc `org-tenancy` — substrat B2B multi-org *(câblé si `tenancy=multi-org`)*

✅ **Livré (C2, build-vérifié `tsc`+`next build`)** — cœur du bloc scaffoldé : `0006_org_tenancy.sql` (orgs + org_members + org_invitations, RLS par org), `lib/org/{context,invitations,billing}.ts`, `components/org/org-switcher.tsx`. Options `org-sso` / `org-billing` = extensions documentées (SSO = config Supabase Auth ; billing par org = bascule de granularité, `web-saas/CONVENTIONS.md` §13). *(Runtime SQL des RLS = smoke-test per-projet, lesson #14.)*

Sélectionné par l'étape 9 **uniquement** quand `tenancy=multi-org` (axe défini et conditionné dans `_shared/state-schema.md` §tenancy — **source unique**, aucune copie ici). `tenancy` ne concerne que l'archétype `web-saas` ; `single` (défaut, mono-compte/mono-org) ne câble **pas** ce bloc. Composition (web-saas + `org-tenancy`) : `../../skills/11-project-setup/references/scaffold-procedure.md` §Sélection des blocs par archétype.

| Bloc | Fournit | Config requise |
|---|---|---|
| `org-tenancy` *(si `multi-org`)* | Substrat **org-based** : création d'**Org self-serve**, **invitations d'équipe**, **switch d'org**, **rôles org** (`admin` / `member`), **`org_id` comme tenant**. **Réutilise le pattern Org déjà modélisé** (`ORG ‖—o{ MEMBER ‖—o{ RESOURCE`, `org_id` tenant, RLS par org) en `skills/09-architecture/references/data-model.md` — rien à réinventer côté modèle | Supabase connecté (substrat existant) |
| `org-sso` *(option de `org-tenancy`)* | SSO d'entreprise **SAML / OIDC** rattaché à l'org (login fédéré par org) | IdP par org *(seulement si vendu à des entreprises qui l'exigent)* |
| `org-billing` *(option de `org-tenancy`)* | **Billing PAR ORG** : l'abonnement Stripe est rattaché à l'**Org** (un client = une org), pas à l'utilisateur — voir le basculement de granularité en `web-saas/CONVENTIONS.md` §13 | Stripe connecté |

> **Ce que `multi-org` bascule** (contrat, pas code) : `org_id` devient le tenant sur **toutes** les entités tenantées + **RLS par org** (deny-by-default, `org_id` dérivé de la session — jamais du client), et **billing / enrollment passent de l'UTILISATEUR à l'ORG**. Détail du contrat côté châssis : `web-saas/CONVENTIONS.md` §13. Modèle, dérivation et règle de conditionnement : `_shared/state-schema.md` §tenancy (**y renvoyer, ne pas recopier**).

## Châssis `automation` — worker headless *(archétype `automation`, livré C2c)*

✅ **Livré (C2c, `tsc --noEmit`-vérifiable).** Châssis **séparé et parallèle à `web-saas/`** : `automation/`. Ce **n'est PAS** un bloc du châssis `web-saas` ni un sous-ensemble comme `landing` — c'est un **livrable headless** (worker / cron / bot / intégration, **sans UI produit** : ni onboarding, ni dashboard, ni entité cœur CRUD). Sélectionné par l'étape 9 **uniquement** quand `archetype=automation` (`_shared/state-schema.md` §modèle 3 axes) ; **ne jamais** forcer l'arbre `web-saas` ni l'assemblage `landing` dessus (`../../skills/11-project-setup/references/scaffold-procedure.md` §Sélection des blocs par archétype).

**Dependency-light** (pour rester `tsc`-vérifiable sans install lourde) : **Node 20+ built-ins** au runtime (`fetch` global, `node:crypto`, `process.env`), **une seule dép externe** — `zod` (validation config). **Pas** de `@supabase/supabase-js` ni de SDK `resend` : Supabase (état d'automatisation) et Resend / webhooks (boucle fermée) sont appelés **en REST via `fetch`**. ESM TypeScript strict. **Déploiement** : worker long-running / **cron externe** (crontab, GitHub Actions `schedule`, cron de l'hôte) / conteneur / process one-shot — **pas Next.js/Vercel**.

| Socle (non négociable) | Fournit | Fichier réel *(indicatif)* |
|---|---|---|
| **AU1 — config/secrets** | Paramètres du job + secrets d'intégration **validés** (zod), hors code, jamais en dur | `src/config.ts` |
| **AU2 — historique de runs + logs** | Chaque run journalisé (début/fin/statut/volume/erreur), consultable — un headless sans historique est une boîte noire | `src/runs.ts` |
| **AU3 — healthcheck / statut** | État d'exécution (le job tourne-t-il ? dernier run OK ? retard vs planning ?) | `src/health.ts` |
| **AU4 — boucle fermée propriétaire** 🚨 | Succès **comme** échec **notifie/rapporte au propriétaire** (email Resend / webhook) — application headless **autonome** de `../boucles-fermees.md` (accusé au **propriétaire du job**, pas à un client final) | `src/notify.ts` |
| **AU5 — idempotence** | Re-run sûr (retry, double-cron, redelivery webhook) = **même effet**, via clé/curseur | `src/idempotency.ts` |

> Config requise : Supabase connecté (état d'automatisation), le canal de boucle fermée (Resend et/ou webhook), et les **secrets d'intégration** des systèmes source/cible — collectés **une fois en amont via `infra-setup`**, jamais en dur (`.env.example` = **noms uniquement**). Fiche archétype (modèle + pipeline + critères d'acceptation) : `../archetypes/automation.md`. Manifeste bloc → fichiers réels *(fait foi pour les chemins `src/*`)* : `automation/README.md`.

## Châssis `ecommerce` — boutique en ligne *(archétype `ecommerce`, à bâtir)*

🔨 **À bâtir (parité future avec `web-saas/` et `automation/`).** L'archétype **`ecommerce`** est de **première classe** (`../archetypes/ecommerce.md`), mais son châssis assemblé **`_shared/blocks/ecommerce/`** n'existe **pas encore**. Les blocs commerce — **catalogue, panier, checkout one-shot, commandes, stock** — y vivront (structure cible : `../archetypes/ecommerce.md` §Structure du châssis). Sélectionné par l'étape 9 **uniquement** quand `archetype=ecommerce` (`_shared/state-schema.md` §modèle 3 axes) ; **ne jamais** forcer l'assemblage `landing`/`automation` dessus.

**Statut honnête : aujourd'hui, une boutique se build en blocs custom** autour du socle **web-saas** (le modèle « socle léger + blocs codés par projet ») : on **réutilise** `skeleton` + `ui-shell` + `auth` *(compte client léger et **optionnel** — le **checkout invité** est le défaut e-commerce)* + `crud` (produits/commandes) + `notifications` (confirmations) + légal + `repo-ci` + `hosting`, et on **remplace le bloc `billing` (abonnement Stripe) par un checkout Stripe ONE-SHOT** (`mode:payment`, *jamais* `mode:subscription` — c'est la différence dure avec `billing`). Le CTO (09) architecture les patterns, le DEV (12) code les blocs commerce.

| Socle (non négociable — `../archetypes/ecommerce.md` §Socle EC1-EC5) | Fournit |
|---|---|
| **EC1 — Catalogue produits** | `products`/`variants`/`categories`, page liste + détail, lecture **publique** (RLS `select` anon sur publiés), CRUD admin |
| **EC2 — Panier** | état de panier + persistance, sous-totaux **recalculés côté serveur** (jamais un total client) |
| **EC3 — Checkout + paiement ONE-SHOT** | Stripe Checkout / Payment Intents (`mode:payment`), **checkout invité**, montant calculé serveur, commande confirmée **au webhook** |
| **EC4 — Commandes + boucle fermée** | `orders`/`order_items` (snapshot du prix), confirmation **client** ET notif **marchand** (aucune vente muette), back-office commandes |
| **EC5 — Inventaire / stock** | décrément **atomique** à la commande, **anti-survente** (rupture → non achetable) |

> 🚨 **Trois pièges DURS** (équivalent de l'idempotence 2-grains d'automation — non négociables aux portes 13/14, `../archetypes/ecommerce.md` §Pièges P1/P2/P3) : **P1** survente / course sur le stock (décrément conditionnel **atomique** en base, jamais `SELECT stock` puis `if stock>0`) · **P2** intégrité du prix (montant **toujours** recalculé serveur depuis le catalogue, jamais un total envoyé par le client) · **P3** idempotence du webhook Stripe (unique sur l'id de session/intent, signature vérifiée). Config requise : Supabase (catalogue/commandes/stock) · **Stripe one-shot** (+ webhook signing secret) · Resend (confirmations) · hébergement + DNS. Fiche archétype (modèle + pipeline + critères d'acceptation) : `../archetypes/ecommerce.md`.
