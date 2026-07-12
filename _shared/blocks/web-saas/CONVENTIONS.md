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
  layout.tsx            # PARTAGÉ — racine html/body, monte <Providers>
  providers.tsx         # PARTAGÉ — signature figée (voir §7)
  globals.css           # PARTAGÉ — design tokens (cible de DESIGN.md)
  page.tsx              # PARTAGÉ — landing
components/
  ui/                   # primitives shadcn/ui (button, input, card…) — bloc ui-shell
  landing/              # sections de la landing (fondation) — consommées par app/page.tsx ; contenu sentinelle remplacé en Phase 4 (_shared/landing-playbook.md)
  <domaine>/            # composants métier par domaine (ex. components/items/)
lib/
  brand.ts              # PARTAGÉ — identité de marque (nom/tagline/description), renseigné au walking skeleton (étape 12)
  env.ts                # PARTAGÉ — validation zod des env
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
- `app/(app)/` : surface authentifiée (dashboard, CRUD). Blocs `ui-shell`, `crud`, `billing`.
- `app/api/` : route handlers serveur (webhooks). Ex. `app/api/stripe/webhook/route.ts`.
- Les parenthèses ne créent pas de segment d'URL : `(app)/dashboard` → `/dashboard`.

## 5. Numérotation des migrations (figée, zéro collision)

| Fichier | Bloc | Contenu |
|---|---|---|
| `supabase/migrations/0001_auth.sql` | `auth` | profils, rôles, multi-tenant |
| `supabase/migrations/0002_items.sql` | `crud` | entité exemple `items` |
| `supabase/migrations/0003_billing.sql` | `billing` *(optionnel)* | abonnements, clients Stripe |

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
| Auth / CRUD | fondation (Supabase) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | requis |
| Enrollment / accès | blocs `auth` + `access-gate` | `APP_ACCESS_MODE` (public\|interne\|perso), `AUTH_ALLOWED_EMAIL_DOMAINS` | `APP_ACCESS_MODE` défaut `public` ; domaines optionnel |
| Notifications | bloc `notifications` | `RESEND_API_KEY`, `EMAIL_FROM` | optionnel |
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
`lib/utils.ts`, `lib/supabase/*`, `middleware.ts`***, `supabase/config.toml`.

- `*` : un bloc **ajoute** ses clés au `.env.example` / son schéma à `lib/env.ts` /
  ses tokens à `globals.css` — ajouts additifs uniquement, jamais de suppression.
- `**` : voir §7.
- `***` : les blocs `auth` / `access-gate` peuvent **composer** des passes après
  `updateSession` dans `middleware.ts` (protection de route, `noindex`), sans
  jamais retirer l'appel `updateSession` ni changer sa position en tête. Chaque
  passe ajoutée est un fichier disjoint (`lib/access-gate/gate.ts`) appelé depuis
  la composition ; `middleware.ts` reste une orchestration mince.
- `†` : `lib/brand.ts` est renseigné **une seule fois au walking skeleton**
  (étape 12, écrivain unique, comme la charte) depuis `research/positioning.md` —
  puis figé : les blocs en fan-out le **consomment** (`import { brand }`), ne le
  modifient pas. Ne pas re-coder le nom du produit en dur ailleurs.
