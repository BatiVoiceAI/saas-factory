# MOAT-STATUS.md — état du châssis `web-saas` (V1)

État réel du template. Le châssis = ~80 % d'un micro-SaaS réutilisé projet après
projet. Ce document dit honnêtement ce qui est **livré**, ce qui a été
**vérifié**, ce qui **reste** à câbler à la 1re instanciation, et les **limites**.

> ✅ **Vérifié** : `npm install` (deps réelles résolues) **puis** `tsc --noEmit`
> **passent — 0 erreur** (y compris les blocs `waitlist` + `org-tenancy`, re-vérifiés {2026-07-15}) + `verify:machine` (5 lints). Revue adversariale de correction menée (RLS, signature
> webhook Stripe, API `@supabase/ssr` sur Next 15, flux auth, frontières
> client/serveur) et findings corrigés. `npm run build` complet + tests E2E
> restent à lancer sur un environnement avec Supabase/env réels (voir « Reste »).

## Livré par bloc

| Bloc | Livré | Sécurité |
|---|---|---|
| `skeleton` | Next 15 (App Router) + TS + Tailwind + config env typée (`lib/env.ts`, Zod), Supabase clients (browser/server/middleware), `middleware.ts` | `.env.example` = clés vides + commentaires ; secrets jamais en dur |
| `ui-shell` | Primitives shadcn (button, input, label, card, avatar, dropdown-menu, skeleton, sonner), thème (next-themes) + toggle, nav (`top-nav`, `app-sidebar`), layouts `(app)` et `(auth)` | — |
| `auth` | Flux **OTP → mot de passe** (Server Actions `lib/auth/actions.ts` : inscription e-mail→code→mot de passe, connexion e-mail+mot de passe, reset e-mail→code→nouveau mot de passe), écrans multi-étapes `components/auth/*` (`signup-form`, `login-form`, `reset-form`, `otp-input` 6 cases), routes `(auth)` login/signup/reset + callback OAuth/signout, `get-user`, **enrollment par type** (`lib/auth/enrollment.ts` : invitations / allowlist domaine / compte seedé), page `(app)/dashboard`, migration `0001_auth.sql` (profiles + rôles + trigger profil) | **0 magic link** ; mot de passe jamais loggé ; RLS activée ; anti-escalade `role` ; enrollment restreint (autorité = `disable_signup` Supabase) ; redirections via `NEXT_PUBLIC_SITE_URL` (safe derrière proxy) |
| `access-gate` *(interne/perso)* | Middleware de déploiement privé (`lib/access-gate/gate.ts`, composé dans `middleware.ts`) : `X-Robots-Tag: noindex` + redirection de bord des visiteurs non authentifiés. Inerte en `public` | Défense en profondeur (autorité serveur = `requireUser()` + RLS + `disable_signup`) ; origine de redirection via `NEXT_PUBLIC_SITE_URL` |
| `crud` | Entité exemple `items` (Server Actions `actions.ts`, `factory.ts` à cloner, schéma Zod `item.ts`, `item-form`), migration `0002_items.sql` | RLS owner-scoped (select/insert/update/delete par `auth.uid()=owner`) |
| `notifications` | Email transactionnel Resend (`client`, `send`, `welcome`, template React `welcome.tsx`) ; no-op propre si `RESEND_API_KEY`/`EMAIL_FROM` absents | Expéditeur toujours via `env.EMAIL_FROM` ; `server-only` |
| `observability` | Sentry (client/server/edge configs + `instrumentation.ts`) + PostHog (`posthog-provider` + `ThemeProvider` montés dans `<Providers>`, `analytics/events`) ; no-op propre si clés absentes | — |
| `billing` *(optionnel)* | Stripe checkout / portal / webhook routes, `stripe.ts` (singleton), `subscription.ts` (miroir via service role), migration `0003_billing.sql` | RLS : user lit sa ligne ; écriture réservée au service role ; webhook **anti-stale/dedup** ; `stripe.ts`+`subscription.ts` en `server-only` |
| `repo-ci` | GitHub Actions (`ci.yml`, `lighthouse.yml`), e2e Playwright (`smoke.spec.ts`), Vitest + Unlighthouse configs | — |
| `hosting` | Fourni au déploiement (Vercel / CF Pages / Coolify) — pas de config versionnée | — |
| `waitlist` *(archétype **landing**)* | Table `leads` générique (`0005_waitlist.sql`, service-role, unique `lower(email)`), route `app/api/waitlist` (idempotent sur 23505 + **boucle fermée** e-mail via `notifications`), `lib/waitlist/confirmation-email.ts`, `components/waitlist/waitlist-form.tsx`, `lib/schemas/waitlist.ts` (zod). Réutilisé par l'assemblage **landing** (skeleton + waitlist + notifications + légal, **sans** auth/crud/dashboard) | RLS sans policy (service-role only) ; e-mail normalisé trim+minuscule |
| `org-tenancy` *(si `tenancy = multi-org`)* | `0006_org_tenancy.sql` (`orgs` / `org_members` / `org_invitations` + helpers `security definer` `current_org_ids`/`is_org_member`/`is_org_admin` + trigger owner-membership ; **RLS PAR ORG** deny-by-default), `lib/org/{context,invitations,billing}.ts`, `components/org/org-switcher.tsx` | RLS par org (`org_id` dérivé de la session) ; helpers anti-récursion + **lesson #15** (`#variable_conflict use_column` + colonnes qualifiées) ; `org-billing` = extension **typée** de `billing` (stub documenté, ne réécrit pas le bloc) |

## Corrections appliquées (build + revue)
**Cohérence (deps/env/imports/RLS)** — deps manquantes ajoutées (`@radix-ui/*`,
`next-themes`, `sonner`) ; env 14/14 validées ; alias `@/…` résolus ; RLS +
policies sur chaque table.

**Revue adversariale (correction sémantique)** — corrigés :
- **[high]** route `/dashboard` (cible de tout le flux auth) **créée** — plus de 404 post-login.
- **[med]** callback : redirections via `NEXT_PUBLIC_SITE_URL` au lieu de l'origine de `request.url` (casse derrière proxy).
- **[med]** `lib/billing/stripe.ts` + `subscription.ts` : `import "server-only"` (tripwire build contre une fuite du secret / service-role côté client).
- **[med]** webhook Stripe : garde **anti-out-of-order / dedup** (sinon accès payant conservé après annulation).
- **[med]** `ThemeProvider` monté dans `app/providers.tsx` (le toggle clair/sombre était mort).

**Typecheck (compilation)** — `tsc` réel a révélé et on a corrigé :
- factory CRUD : `inputSchema: ZodType<TInput, ZodTypeDef, unknown>` (accepte un schéma `.default()` — entrée ≠ sortie) + cast permissif du `.update()` (DB non typée).
- Stripe : `apiVersion` alignée sur le SDK v17 (`2025-02-24.acacia`).
- Supabase : paramètre `setAll(cookiesToSet)` typé (`CookieOptions`) — plus d'`any` implicite.
- Unlighthouse : import `unlighthouse/config` inexistant → config plain-object.

## Ce qui reste (à la 1re instanciation)
- **Build complet + E2E** : `npm run build` et `npm run test:e2e` sur un env avec
  Supabase/clés réels (le typecheck est vert ; le build SSR et Playwright ont
  besoin d'un backend).
- **Welcome email** : `sendWelcomeEmail` (`lib/email/welcome.ts`) existe mais
  n'est **volontairement pas** appelé depuis `auth` — le brancher après signup si
  onboarding email voulu (no-op si Resend non configuré).
- **Billing** : n'inclure le bloc que si le projet **vend** (sinon retirer
  `app/api/stripe/*`, `lib/billing/*`, `0003_billing.sql`, clés Stripe).
- **Hosting** : choisir l'hébergeur + poser sa config ; renseigner `NEXT_PUBLIC_SITE_URL`.
- **Tokens design** : mapper `DESIGN.md` → variables de `app/globals.css`.
- **Migrations Supabase** : appliquer les migrations des blocs sélectionnés sur le projet cible — `0001_auth` + `0002_items` + `0004_notifications` par défaut, `0003_billing` **si** le projet vend, `0005_waitlist` **si** `landing`, `0006_org_tenancy` **si** `tenancy=multi-org`.

## Limites honnêtes
- Vérifié = `npm install` + **typecheck** (0 erreur) + revue adversariale. Le
  **build SSR complet**, le **runtime** et les **tests E2E** ne sont pas prouvés
  ici (besoin d'un Supabase/env réels). Le no-op « propre » des blocs optionnels
  (Sentry/PostHog/Resend/Stripe) est vérifié par lecture, pas par exécution.
- `@stripe/stripe-js` déclaré pour l'usage checkout côté navigateur — à retirer
  si le projet ne fait pas de redirection Stripe côté client.
