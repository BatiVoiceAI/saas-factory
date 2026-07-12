# BLOCKS.md — manifeste bloc → fichiers réels

Registre de propriété des fichiers pour l'archétype `web-saas` (V1 implémentée).
La **fondation** (`skeleton`) plus 7 blocs sont posés ; chaque bloc n'ajoute que
des fichiers **disjoints** (règle anti-collision, cf. `CONVENTIONS.md`). Ce
tableau reflète l'arbre **réel** sur disque après la Phase Cohérence.

## Légende
- **Statut** : ✅ implémenté (V1) · ⏳ fourni au déploiement (pas de fichier versionné)
- **Optionnel** : le bloc n'est câblé que si le projet en a besoin.

## Fondation (partagée — ce bloc)

| Bloc | Statut | Optionnel | Fichiers réels |
|---|---|---|---|
| `skeleton` (fondation) | ✅ | non | `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `.eslintrc.json`, `.prettierrc`, `.gitignore`, `.nvmrc`, `.env.example`, `app/layout.tsx`, `app/providers.tsx`, `app/globals.css`, `app/page.tsx`, `components/landing/*` (10 sections : `navbar`, `hero`, `social-proof`, `problem`, `how-it-works`, `features`, `pricing`, `faq`, `cta-final`, `footer` — consommées par `app/page.tsx`), `lib/brand.ts`, `lib/env.ts`, `lib/utils.ts`, `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`, `middleware.ts`, `supabase/config.toml`, `supabase/migrations/.gitkeep`, `CONVENTIONS.md`, `BLOCKS.md`, `README.md`, `MOAT-STATUS.md` |

## Blocs

| Bloc | Statut | Optionnel | Fichiers réels |
|---|---|---|---|
| `ui-shell` | ✅ | non | `components/ui/button.tsx`, `components/ui/input.tsx`, `components/ui/label.tsx`, `components/ui/card.tsx`, `components/ui/avatar.tsx`, `components/ui/dropdown-menu.tsx`, `components/ui/skeleton.tsx`, `components/ui/sonner.tsx`, `components/theme-provider.tsx`, `components/theme-toggle.tsx`, `components/nav/top-nav.tsx`, `components/nav/app-sidebar.tsx`, `app/(app)/layout.tsx`, `app/(app)/dashboard/page.tsx`, `app/(auth)/layout.tsx` ; tokens dans `app/globals.css` |
| `auth` | ✅ | non | `supabase/migrations/0001_auth.sql`, `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`, `app/auth/callback/route.ts`, `app/auth/signout/route.ts`, `components/auth/auth-form.tsx`, `lib/auth/actions.ts`, `lib/auth/get-user.ts` ; protection de route dans `middleware.ts` |
| `crud` | ✅ | non | `supabase/migrations/0002_items.sql`, `app/(app)/items/page.tsx`, `app/(app)/items/actions.ts`, `components/items/item-form.tsx`, `lib/crud/factory.ts`, `lib/schemas/item.ts` |
| `notifications` | ✅ | non | `lib/email/client.ts`, `lib/email/send.ts`, `lib/email/welcome.ts`, `lib/email/templates/welcome.tsx` |
| `observability` | ✅ | non | `components/observability/posthog-provider.tsx` (wrappe `<Providers>`), `lib/analytics/posthog.ts`, `lib/analytics/events.ts`, `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts` |
| `billing` | ✅ | **oui** | `supabase/migrations/0003_billing.sql`, `app/api/stripe/checkout/route.ts`, `app/api/stripe/portal/route.ts`, `app/api/stripe/webhook/route.ts`, `lib/billing/stripe.ts`, `lib/billing/subscription.ts` |
| `repo-ci` | ✅ | non | `.github/workflows/ci.yml`, `.github/workflows/lighthouse.yml`, `.github/README.md`, `e2e/smoke.spec.ts`, `playwright.config.ts`, `vitest.config.ts`, `unlighthouse.config.ts` |
| `hosting` | ⏳ | non | Fourni au déploiement (Vercel / CF Pages / Coolify) — pas de config versionnée en V1. `NEXT_PUBLIC_SITE_URL` porte l'origine publique. |

> **Auth — passwordless par défaut (OTP + magic link).** Le bloc `auth` n'a
> **pas de mot de passe** : UN seul écran « Continuer avec votre e-mail »
> (connexion = création de compte, `shouldCreateUser`) → code à 6 chiffres à
> saisir OU magic link à cliquer, envoyés dans le même e-mail. Pourquoi :
> moins de friction à l'inscription (un champ, zéro règle de mot de passe),
> aucun flux « mot de passe oublié » à maintenir, et l'**e-mail est vérifié
> par construction** (saisir le code / cliquer le lien prouve la possession de
> la boîte). `/signup` reste en alias → `/login`. Config locale :
> `supabase/config.toml` `[auth.email]` (`otp_length`, `otp_expiry`,
> `max_frequency`) ; en prod `provisioner-db` pose en autonomie l'expiry
> (`mailer_otp_exp`) et les templates brandés (`{{ .Token }}` +
> `{{ .ConfirmationURL }}`) via l'API Management.

> **Emails — deux flux, un seul domaine générique.** Le projet envoie deux
> types d'email, **distincts** mais partant du **même domaine d'envoi générique**
> (`mail.<domain>`, From `noreply@<domain>`), via le **même compte Resend** —
> domaine vérifié **une seule fois** puis réutilisé par **tous** les projets :
> - **E-mail de connexion** (code OTP + magic link — il n'y a pas de mot de
>   passe ; cet e-mail EST la vérification d'adresse) = job de **Supabase Auth**
>   avec **SMTP custom = Resend**. Réglé côté `supabase/config.toml`
>   (`[auth.email]` : `otp_length` / `otp_expiry`, `[auth.email.smtp]`) pour le
>   local ; en prod c'est `provisioner-db` qui pose SMTP + templates OTP **en
>   autonomie** via l'API Management Supabase (le SMTP custom retire la limite
>   de débit du SMTP intégré ⇒ **pas d'upgrade payant**).
> - **Transactionnel** (welcome, rappels, confirmation de RDV) = bloc
>   `notifications` / `lib/email`, via l'**API Resend** (`RESEND_API_KEY`,
>   `EMAIL_FROM`).
>
> Le plugin câble le tout au provisioning — **rien à configurer à la main** une
> fois `infra-setup` fait.

> Règle anti-collision : deux blocs ne partagent JAMAIS un fichier. Les seuls
> fichiers partagés « additifs » sont `.env.example`, `lib/env.ts`,
> `app/globals.css` (ajouts uniquement) et `app/providers.tsx` (corps, cf.
> CONVENTIONS.md §7). Tout le reste est disjoint.
