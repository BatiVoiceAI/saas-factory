# CONVENTIONS.md — le contrat que chaque bloc lit avant d'écrire

Ce fichier est **le contrat**. Tout bloc (auth, crud, notifications, observability,
billing, ui-shell, repo-ci, hosting) le lit AVANT d'ajouter le moindre fichier.
Règle d'or : **un bloc n'ajoute que des fichiers DISJOINTS** et ne modifie jamais
un fichier partagé de la fondation (ceux listés en § « Fichiers partagés »).

---

## 1. Arborescence

```
app/                    # App Router (routes, layouts)
  (auth)/               # route group — pages d'auth (bloc auth) : /login, /signup…
  (app)/                # route group — surface authentifiée (dashboard, entités)
  api/                  # route handlers (webhooks stripe, resend…)
  layout.tsx            # PARTAGÉ — racine html/body (`<html lang={locale} dir={dir}>` posés au build, §12), monte <Providers>
  providers.tsx         # PARTAGÉ — signature figée (voir §7)
  globals.css           # PARTAGÉ — design tokens (cible de DESIGN.md)
  page.tsx              # PARTAGÉ — landing
components/
  ui/                   # primitives shadcn/ui (button, input, card…) — bloc ui-shell
  motion/               # couche ANIMATION réutilisable (Lottie, Reveal, shimmer, EmptyState) — a11y reduced-motion (§14)
  landing/              # sections de la landing (fondation) — consommées par app/page.tsx ; contenu sentinelle remplacé en Phase 4 (_shared/landing-playbook.md)
  <domaine>/            # composants métier par domaine (ex. components/items/)
lib/
  brand.ts              # PARTAGÉ — identité de marque (nom/tagline/description) + PRODUCT_LOCALE, renseignés au walking skeleton (étape 12)
  env.ts                # PARTAGÉ — validation zod des env
  i18n.ts               # PARTAGÉ (lecture seule) — locale/dir/ogLocale + dictionnaire copy `ui`, dérivés de PRODUCT_LOCALE (§12)
  motion.ts             # PARTAGÉ (lecture seule) — helpers reduced-motion + tokens de durée (couche motion, §14)
  utils.ts              # PARTAGÉ — cn()
  supabase/             # PARTAGÉ — client.ts, server.ts, middleware.ts
  <domaine>/            # helpers d'accès données par bloc (ex. lib/billing/)
supabase/
  config.toml           # PARTAGÉ
  migrations/           # 1 migration par bloc, numérotation figée (voir §5)
tests/                  # tests (vitest) + e2e (playwright)
middleware.ts           # PARTAGÉ — refresh session
```

## 2. Alias d'import

Alias unique : **`@/*` → racine du projet** (défini dans `tsconfig.json`).
Toujours importer via l'alias : `@/lib/utils`, `@/lib/supabase/server`,
`@/components/ui/button`. Jamais de chemins relatifs profonds (`../../../lib`).

## 3. Où vont les composants

- **Primitives UI génériques** (shadcn/ui) → `components/ui/`. Posées par `ui-shell`.
- **Composants métier** → `components/<domaine>/` (ex. `components/items/item-form.tsx`).
- **Server Components par défaut** ; `"use client"` uniquement si interactivité.

## 4. Route groups

- `app/(auth)/` : pages non authentifiées d'auth (login, signup, reset). Bloc `auth`.
- `app/(app)/` : surface authentifiée **d'EXEMPLE** du châssis (dashboard + CRUD
  de démo). Patron « clone-me » côté dev — **RETIRÉ au build**, remplacé par le
  vrai espace produit (son propre route group, ex. `app/(manager)/`), cf. §10.
  Blocs `ui-shell`, `crud`. (Le bloc `billing` n'a **pas** de page sous `(app)/` :
  il vit dans `app/api/stripe/*` + `lib/billing/*` — c'est pourquoi un lien de nav
  hardcodé vers `/billing` mène au 404 ; cf. §11.)
- `app/api/` : route handlers serveur (webhooks). Ex. `app/api/stripe/webhook/route.ts`.
- Les parenthèses ne créent pas de segment d'URL : `(app)/dashboard` → `/dashboard`.

## 5. Numérotation des migrations (figée, zéro collision)

| Fichier | Bloc | Contenu |
|---|---|---|
| `supabase/migrations/0001_auth.sql` | `auth` | profils, rôles, multi-tenant |
| `supabase/migrations/0002_items.sql` | `crud` | entité exemple `items` — **retirée au build** (cf. §10) |
| `supabase/migrations/0003_billing.sql` | `billing` *(optionnel)* | abonnements, clients Stripe |
| `supabase/migrations/0004_notifications.sql` | `notifications` | file `notification_jobs` (boucles fermées, service-role only) |
| `supabase/migrations/0006_org_tenancy.sql` | `org-tenancy` *(optionnel, si `tenancy = multi-org`)* | `orgs` / `org_members` / `org_invitations` + helpers `security definer` (résolution du tenant, anti-récursion RLS) + RLS PAR ORG |

Chaque bloc écrit **uniquement** sa migration. Un nouveau bloc prend le numéro
suivant disponible. On ne renumérote jamais une migration déjà attribuée.

## 6. Registre env — qui possède quoi

Chaque clé est déclarée dans `lib/env.ts`. Un bloc qui a besoin d'une nouvelle
clé l'ajoute au schéma (server ou client) **et** au `.env.example` avec un
commentaire. Les clés du châssis sont **requises** ; celles des blocs optionnels
sont `.optional()`.

| Domaine | Propriétaire | Clés | Statut |
|---|---|---|---|
| Shell / SEO | fondation | `NEXT_PUBLIC_SITE_URL` | requis |
| i18n | fondation | `NEXT_PUBLIC_LOCALE` (surcharge de `PRODUCT_LOCALE`, cf. §12) | optionnel |
| Auth / CRUD | fondation (Supabase) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | requis |
| Enrollment / accès | blocs `auth` + `access-gate` | `APP_ACCESS_MODE` (public\|interne\|perso), `AUTH_ALLOWED_EMAIL_DOMAINS` | `APP_ACCESS_MODE` défaut `public` ; domaines optionnel |
| Notifications | bloc `notifications` | `RESEND_API_KEY`, `EMAIL_FROM`, `CRON_SECRET` | optionnel (`CRON_SECRET` protège la route de cron des boucles fermées) |
| Observability | bloc `observability` | `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | optionnel |
| Billing | bloc `billing` | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_ID` | optionnel |

**Secrets (safety-rails §4)** : jamais en dur, jamais commités. `.env.example`
ne contient que des clés VIDES + commentaire. `.env` est gitignore.

## 7. Enrichir `<Providers>` sans casser sa signature

`app/providers.tsx` exporte `Providers({ children })` — **signature figée**.
Pour ajouter un provider (ex. PostHog dans le bloc `observability`) :

1. Créer le provider dans un fichier **disjoint** (ex. `components/observability/posthog-provider.tsx`).
2. L'importer dans `providers.tsx` et **wrapper** `children` :
   ```tsx
   export function Providers({ children }: { children: ReactNode }) {
     return <PostHogProvider>{children}</PostHogProvider>;
   }
   ```
   > `providers.tsx` est la seule exception à « ne pas toucher un fichier
   > partagé » : les blocs peuvent en éditer le CORPS, jamais sa signature ni
   > son chemin d'import `@/app/providers`. `app/layout.tsx` reste intact.

## 8. RLS obligatoire

**Toute table créée dans une migration active la RLS** (`enable row level
security`) et définit des policies explicites. Une table sans RLS est un bug de
sécurité (safety-rails §4). L'accès serveur privilégié passe par la clé service
role, jamais exposée au client.

## 9. Fichiers partagés (fondation) — NE PAS MODIFIER

`package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`,
`postcss.config.mjs`, `.eslintrc.json`, `.prettierrc`, `.gitignore`, `.nvmrc`,
`.env.example`*, `app/layout.tsx`, `app/globals.css`*, `app/page.tsx`,
`app/providers.tsx`** (corps enrichissable, §7), `lib/brand.ts`†, `lib/env.ts`*,
`lib/i18n.ts`†, `lib/utils.ts`, `lib/supabase/*`, `middleware.ts`***,
`supabase/config.toml`.

- `*` : un bloc **ajoute** ses clés au `.env.example` / son schéma à `lib/env.ts` /
  ses tokens à `globals.css` — ajouts additifs uniquement, jamais de suppression.
  La **couche motion** (§14, fondation) fait exception assumée à « ne pas toucher
  `package.json` » : elle y pose la dépendance socle `@lottiefiles/dotlottie-react`
  (une fois, au niveau châssis — pas un bloc en fan-out) et **ajoute** son backstop
  a11y + le shimmer à `globals.css` (additif). Un bloc en fan-out, lui, ne touche
  jamais `package.json`.
- `**` : voir §7.
- `***` : les blocs `auth` / `access-gate` peuvent **composer** des passes après
  `updateSession` dans `middleware.ts` (protection de route, `noindex`), sans
  jamais retirer l'appel `updateSession` ni changer sa position en tête. Chaque
  passe ajoutée est un fichier disjoint (`lib/access-gate/gate.ts`) appelé depuis
  la composition ; `middleware.ts` reste une orchestration mince.
- `†` : `lib/brand.ts` (nom/tagline/description **+ `PRODUCT_LOCALE`**) et le
  socle dérivé `lib/i18n.ts` sont finalisés **une seule fois au walking skeleton**
  (étape 12, écrivain unique, comme la charte) depuis `research/positioning.md` +
  le champ `locale` (§12) — puis figés : les blocs en fan-out les **consomment**
  (`import { brand }`, `import { locale, dir, ui } from "@/lib/i18n"`), ne les
  modifient pas. Ne pas re-coder le nom du produit ni la langue en dur ailleurs.

## 10. Artefacts d'EXEMPLE du châssis — RETIRÉS au build

Le châssis livre une **surface authentifiée de DÉMO** : un patron « clone-me »
destiné au **développeur** pour montrer comment câbler une entité et un shell —
**jamais un produit livré à l'utilisateur final**. Ces artefacts d'exemple :

| Artefact d'exemple | Fichiers | Rôle |
|---|---|---|
| Entité `items` | `app/(app)/items/*`, `components/items/*`, `lib/schemas/item.ts`, `supabase/migrations/0002_items.sql` | Patron CRUD de référence (cf. `lib/crud/factory.ts`) |
| Dashboard de démo | `app/(app)/dashboard/page.tsx` | Écran d'accueil authentifié factice |
| Sidebar de démo | `components/nav/app-sidebar.tsx` | Nav à liens **hardcodés** (« Éléments », « Facturation ») |
| Shell d'exemple | `app/(app)/layout.tsx` + le groupe `app/(app)/` | Surface authentifiée de démo entière |

**Le contrat : le build (walking skeleton, étape 12) RETIRE tout artefact
d'exemple du produit livré.** L'étape 12 crée le **vrai espace produit** — son
propre route group (ex. `app/(manager)/`), sa vraie nav dérivée des features
(§11) — puis **supprime** le shell de démo (`app/(app)/`), l'entité `items` et
les textes « à cloner ». Un fondateur non-tech ne doit **JAMAIS** voir dans son
produit « Items — entité exemple du bloc CRUD » ni un lien de nav mort vers
`/billing` (404). Livrer la tuyauterie d'exemple du châssis = **bug de build**.

> Le helper **réutilisable** `lib/crud/factory.ts` (le patron générique), lui,
> RESTE : seul l'exemple **câblé** (`items` + shell de démo) est retiré. La vraie
> entité est régénérée dans le vrai espace produit à partir de ce même factory.

## 11. Nav feature-driven — dérivée des features livrées, jamais hardcodée

La navigation du vrai espace produit se **génère à partir des features
réellement livrées** (Phase 4), pas des liens de démo figés dans
`components/nav/app-sidebar.tsx` (« Éléments » / « Facturation »). Chaque feature
construite déclare son entrée de nav ; la sidebar du vrai espace produit itère
sur ces entrées. Corollaire : aucun lien de nav ne pointe vers une route absente.

Un lien **optionnel** n'apparaît **que si sa capacité est configurée** :
- **Facturation** (`/billing`) ne se rend **que si le bloc `billing` est câblé**
  (projet qui vend). Sinon la route n'existe pas → le lien n'est **jamais**
  rendu. Le lien mort vers `/billing` du châssis de démo (404) est proscrit.

Règle : un lien conditionnel suit la présence de son bloc / de sa feature,
jamais une constante figée du châssis.

## 12. i18n — le produit se génère dans la langue `locale`

**Source du champ : `_shared/state-schema.md` §locale** (champ de 1er rang
`locale` BCP-47 + `dir` `ltr|rtl` + `jurisdiction`, capté à l'intake, propagé,
invariant — miroir de `brand`/`email_from`). 🚨 **Le produit livré est dans la
langue `locale`** (`fr-FR`, `en-US`, `es-ES`, `ar`…), **distincte de la langue
de travail interne des skills** (FR — les instructions à Claude restent en FR ;
ce que VOIT l'utilisateur final suit `locale`). Le châssis est **i18n-ready au
niveau CODE** ; le **build** (walking skeleton, étape 12) le rend dans `locale`.

**Socle code = `lib/i18n.ts`** (SOURCE UNIQUE côté code) : expose `locale`,
`dir`, `ogLocale` et le dictionnaire de copy `ui` (au moins `fr` + `en`),
dérivés de la constante `PRODUCT_LOCALE` (`lib/brand.ts`, sœur de `brand`,
finalisée à l'étape 12) ou surchargés par l'env `NEXT_PUBLIC_LOCALE` (§6),
défaut `fr-FR`. Les blocs **importent** `@/lib/i18n` (ils ne relisent jamais
`PRODUCT_LOCALE`/l'env eux-mêmes) : `app/layout.tsx` (`<html lang/dir>` +
`og:locale`) et `lib/email/templates/welcome.tsx` (copy `ui.email.*`) sont déjà
câblés. Invariants :

- 🚨 **`<html lang={locale}>` + `dir={dir}` posés au build depuis `lib/i18n`**,
  écrivain unique — **comme `lib/brand.ts`** (§9 †, finalisation à l'étape 12 via
  `PRODUCT_LOCALE`, **pas** une modification par un bloc en fan-out : cohérent
  avec §9 « ne pas toucher `app/layout.tsx` »). Le châssis livre `PRODUCT_LOCALE
  = "fr-FR"` **= sentinelle de langue de travail** à paramétrer depuis `locale`.
  Le `dir` **doit** vivre sur `<html>` — `"rtl"` pour **ar/he/fa/ur** — pour un
  **support RTL** réel (miroir de layout, pas juste la direction du texte).
  Défaut `ltr`.
- 🚨 **Copy UI centralisée, aucun littéral FR épars** : tous les textes visibles
  (landing, shell, auth, CRUD, erreurs, emails) sont **centralisés** (i18n-ready)
  et rendus dans `locale`. Un composant ne code jamais une chaîne FR en dur.
- 🚨 **Littéraux FR d'exemple du châssis = « à traduire dans `locale` au
  build »** : les chaînes FR livrées (sections `components/landing/*`
  sentinelles, labels du shell de démo, messages `components/auth/*`, template
  `lib/email/templates/*`…) sont des **placeholders de langue de travail**, pas
  la copy finale. Le build les régénère dans `locale` — comme il régénère le
  contenu sentinelle de la landing (`_shared/landing-playbook.md`). Un produit
  `en-US` ne doit **JAMAIS** afficher un label FR résiduel.
- 🚨 **Emails dans `locale` — les DEUX flux** (détail : `BLOCKS.md`) : l'e-mail
  de **vérification par code OTP (Supabase Auth ; CODE seul, pas de magic link)**
  ET le **transactionnel welcome/notifications (Resend / `lib/email`)** partent
  dans la langue `locale` — **jamais** un email FR (ou EN) par défaut
  **incohérent avec l'app**. Templates OTP Supabase et `lib/email/templates/*`
  rendus dans `locale`.
- **`og:locale` + SEO** : les métadonnées portent `og:locale` = `locale` (et
  `<html lang>` déjà posé §ci-dessus) ; `hreflang`/`lang` sont câblés côté SEO
  (étape 16). Renvoi : `_shared/state-schema.md` §locale.
- **Légal selon `jurisdiction`** (renvoi `_shared/state-schema.md` §locale) : les
  pages légales rendues par le produit suivent la **juridiction**, **jamais
  « FR » en dur** (FR → Mentions légales + Confidentialité ; US/EN → Terms +
  Privacy ; DE → Impressum + Datenschutz…). Un produit anglais avec Terms +
  Privacy est **conforme**.

## 13. `tenancy=multi-org` — `org_id` comme tenant *(bloc `org-tenancy` livré)*

**Source du champ : `_shared/state-schema.md` §tenancy** (champ de 1er rang
`tenancy` `single|multi-org`, défaut `single`, **web-saas seulement** ; modèle,
dérivation et **règle de conditionnement** y vivent — **y renvoyer, ne pas
recopier**). Cette section pose **ce que le châssis bascule** quand
`tenancy=multi-org`. ✅ **Substrat + CODE = bloc `org-tenancy` SCAFFOLDÉ** (Thème
C livré) : `0006_org_tenancy.sql` + `lib/org/{context,invitations,billing}.ts` +
`components/org/org-switcher.tsx` (cf. `BLOCKS.md`). `multi-org` est désormais
**buildable** — sélectionner le bloc si `tenancy = multi-org`.

- **`single` (défaut)** : le tenant est l'**utilisateur** — modèle actuel du
  châssis. **Billing et enrollment sont PAR UTILISATEUR** (abonnement Stripe
  rattaché à l'user ; enrollment par type — cf. bloc `auth`, §6).
- 🚨 **`multi-org`** : `org_id` devient le **tenant sur TOUTES les entités
  tenantées** + **RLS PAR ORG** (deny-by-default, `org_id` **dérivé de la
  session**, jamais d'un paramètre client — miroir exact de §8 et des règles
  RLS de `skills/09-architecture/references/data-model.md`, où l'entité **Org**
  est **déjà le pattern par défaut** : `ORG ‖—o{ MEMBER ‖—o{ RESOURCE`,
  `org_id` tenant). Le substrat (création d'org self-serve, invitations, switch
  d'org, rôles org `owner`/`admin`/`member`) est fourni par le bloc
  `org-tenancy` : `org_id` **dérivé de la session** via les helpers
  `security definer` `is_org_member` / `is_org_admin` / `current_org_ids`
  (`0006`) — ce sont eux qui **cassent la récursion RLS** (une policy de
  `org_members` interrogeant `org_members` en direct bouclerait). Les entités
  métier tenantées portent `org_id` et une RLS `using (public.is_org_member(org_id))`.
- 🚨 **Billing / enrollment passent de l'UTILISATEUR à l'ORG** : ce qui est
  **par utilisateur** en `single` devient **par org** en `multi-org` — le client
  facturé est l'**Org** (un abonnement = une org). Le bloc `org-tenancy` **ne
  réécrit pas** `billing` (par user) : `lib/org/billing.ts` fournit le helper
  léger `stripeCustomerRefForOrg` + `orgIdFromCustomerMetadata` + un **stub
  typé** et **documente le plan d'intégration** par-org (option `org-billing`).
  L'enrollment se fait par **membre d'org** (invitations + rôles org), non plus
  par compte isolé.
- **SSO SAML/OIDC par org = option de CONFIG, pas de code dans ce bloc.** Le SSO
  d'org (option `org-sso`) se pose côté **Supabase Auth** (SAML/OIDC provider par
  org, mapping domaine → org) au provisioning — **aucun fichier applicatif ici** ;
  le bloc `org-tenancy` fournit le substrat d'appartenance/rôles, pas le protocole
  d'identité fédérée.
- **Migration** : le bloc `org-tenancy` écrit **sa** migration au **numéro
  suivant disponible** (§5, jamais de renumérotation) ; **RLS obligatoire** sur
  chaque table portant `org_id` (§8). Fichiers **disjoints** (règle d'or, §
  en-tête), aucun fichier partagé de la fondation (§9) modifié.

> ✅ **Bloc livré (Thème C).** Le bloc `org-tenancy` est scaffoldé : `multi-org`
> est **buildable**. Détail des fichiers : `BLOCKS.md` (ligne `org-tenancy`).
> Renvoi : `_shared/state-schema.md` §tenancy et catalogue
> `_shared/blocks/README.md` (bloc `org-tenancy`).

## 14. Couche motion / animation — `prefers-reduced-motion` OBLIGATOIRE

Couche d'**animation réutilisable** du châssis (`components/motion/*` +
`lib/motion.ts`), pensée pour **sortir du design générique** (motion signature,
empty-states animés, reveals) SANS sacrifier la performance ni l'accessibilité.
Fichiers : `BLOCKS.md` (ligne `motion`) ; guide d'usage :
`components/motion/README.md`. **Compile-safe** (`tsc` + `next build` : vérifié).

- 🚨 **`prefers-reduced-motion` non négociable — DEUX niveaux.** (1) **Backstop
  CSS global** (`app/globals.css`, ajout additif) : `@media (prefers-reduced-motion:
  reduce)` quasi-annule animations/transitions/scroll fluide sur tout l'arbre
  (couvre `animate-pulse`, le shimmer, toute anim future). (2) **JS piloté par
  l'état** : hook `useReducedMotion()` (`lib/motion.ts` + `components/motion/`)
  coupe l'autoplay et rend un repli statique. Principe : garder l'opacité finale,
  supprimer le mouvement (pas de parallax/transform sur gros éléments). Une porte
  design échoue si une anim ignore cette préférence.
- 🚨 **SSR-safe par construction.** Le runtime dotLottie (canvas + WASM) est
  chargé en **import dynamique `ssr: false`** dans un composant `"use client"`
  (`<LottieAnimation>`), lazy (hors bundle critique). `lib/motion.ts` est
  framework-agnostic et ne touche `window`/`matchMedia` que sous garde SSR.
- 🚨 **Zéro asset binaire lourd committé.** Aucun `.lottie`/`.riv` dans le
  châssis : l'animation se **branche au build par URL** (`src`) — asset de la
  direction de marque, **recoloré/retimé aux tokens** (`--primary`,
  `motionDuration`), jamais un Lottie générique brut (= slop). Détail :
  `components/motion/README.md`.
- **Runtimes livrés = dotLottie ET Rive**, derrière le point d'entrée unique
  **`<MotionAsset>`** (theming-aware, `components/motion/motion-asset.tsx`) :
  `@lottiefiles/dotlottie-react` pour le décoratif/one-shot (hero, empty-state,
  loading), `@rive-app/react-canvas` pour l'interactif piloté par l'état (icônes
  réactives, toggles, mascotte — state machines). Les deux MIT, **lazy**
  (`dynamic ssr:false`, WASM hors bundle critique). `<MotionAsset>` choisit le
  runtime (M7), lit les **design tokens** (`useTokenColors` → variables
  `--motion-*` + `currentColor`), et applique les **3 niveaux** de fallback
  reduced-motion : (a) gate statique — pour Rive, le WASM n'est même pas chargé —,
  (b) marqueur Lottie `reduced motion`, (c) booléen poussé dans la state machine
  Rive. Un seul icône animé ne justifie PAS les ~200 KB de Rive ; beaucoup, oui.
- **Copy des exemples** : `<EmptyState>` et consorts prennent leur texte en
  **props**, rendus dans la langue `locale` (§12) au build — aucun littéral figé.

## 15. Visuels générés (Nano Banana Pro) — `public/generated/`, jamais de placeholder

Le **moteur de visuels** du plugin est **Nano Banana Pro** (`gemini-3-pro-image`,
image Google/Gemini). Quand le design a besoin d'imagerie (hero éditorial/
atmosphérique, **OG image**, illustrations d'empty-states, spot art, favicon/
wordmark), on **GÉNÈRE** un visuel **on-brand dérivé de `DESIGN.md`** — jamais du
stock générique ni un placeholder. C'est le levier d'**anti-convergence côté
image** : deux métiers → deux prompts → deux visuels.

- **Helper** : `scripts/generate-visual.mjs`. Usage :
  `node scripts/generate-visual.mjs "<prompt>" public/generated/<nom>.png [model] [aspect]`.
  Modèle par défaut = `gemini-3-pro-image`. Clé **`GEMINI_API_KEY`** lue depuis
  `~/.saas-factory/.env` — **jamais en dur, jamais commitée** (§6 registre env).
- **Prompt = dérivé de `DESIGN.md`** (section « Visuels générés » : sujet +
  palette de marque + cadrage/aspect + « NO lorem text / NO fake UI » au besoin).
  Un prompt générique = slop ; on part de la direction du projet.
- **Sortie + câblage** : `public/generated/` (ex. `hero.png`, `og.png`,
  `empty-<liste>.png`, `favicon.png`), **référencée via `next/image`** dans les
  composants — pas des `<img>` cassés ni des placeholders gris. L'**OG image** est
  branchée dans les `metadata` (`openGraph.images` = le raster généré, **ou** une
  route `next/og` codée aux tokens) — jamais une OG statique bricolée.
- 🚨 **Jamais une image IA maquillée en screenshot produit** (la preuve « voici
  l'app » reste un **vrai screenshot** — marqueur slop n°17) ni en **fausse preuve
  sociale** (avatars/logos inventés — n°18).
- **Repli honnête** (`safety-rails` §6) : `GEMINI_API_KEY` absente ou
  `providers.visuals="none"` → **ne pas simuler** d'images ; consigner « ajoute ta
  clé pour générer les visuels » et livrer le reste. Le build ne bloque pas dessus.
- **Génération au build** : c'est un **geste de fondation** du walking skeleton
  (après la charte), pas une tâche de feature — cf. doctrine
  `_shared/design-doctrine.md` §Génération de visuels + `skills/12-build/references/walking-skeleton.md`.
