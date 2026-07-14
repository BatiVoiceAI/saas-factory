# BLOCKS.md — manifeste bloc → fichiers réels

Registre de propriété des fichiers pour l'archétype `web-saas` (V1 implémentée).
La **fondation** (`skeleton`) plus 9 blocs sont posés (dont `billing` optionnel,
`waitlist` optionnel — sélectionné pour l'archétype **landing** — et `access-gate`
conditionnel — sélectionné si `type ≠ public`) ; chaque bloc n'ajoute que des
fichiers **disjoints** (règle anti-collision, cf. `CONVENTIONS.md`). Ce tableau
reflète l'arbre **réel** sur disque après la Phase Cohérence.

## Légende
- **Statut** : ✅ implémenté (V1) · ⏳ fourni au déploiement (pas de fichier versionné)
- **Optionnel** : le bloc n'est câblé que si le projet en a besoin.

## Fondation (partagée — ce bloc)

| Bloc | Statut | Optionnel | Fichiers réels |
|---|---|---|---|
| `skeleton` (fondation) | ✅ | non | `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `.eslintrc.json`, `.prettierrc`, `.gitignore`, `.nvmrc`, `.env.example`, `app/layout.tsx`, `app/providers.tsx`, `app/globals.css`, `app/page.tsx`, `components/landing/*` (10 sections : `navbar`, `hero`, `social-proof`, `problem`, `how-it-works`, `features`, `pricing`, `faq`, `cta-final`, `footer` — consommées par `app/page.tsx`), **complétude (backstop) : `app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx`, `app/loading.tsx`**, **légal (gabarits, sélection par juridiction ♦) : `app/legal/layout.tsx`, `app/legal/_components/placeholder.tsx`, `app/legal/mentions-legales/page.tsx`♦, `app/legal/confidentialite/page.tsx`♦, `app/legal/terms/page.tsx`♦, `app/legal/privacy/page.tsx`♦**, `lib/brand.ts` (+ `PRODUCT_LOCALE`), `lib/env.ts`, `lib/i18n.ts`, `lib/utils.ts`, `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`, `middleware.ts`, `supabase/config.toml`, `supabase/migrations/.gitkeep`, `CONVENTIONS.md`, `BLOCKS.md`, `README.md`, `MOAT-STATUS.md` |

## Blocs

| Bloc | Statut | Optionnel | Fichiers réels |
|---|---|---|---|
| `ui-shell` | ✅ | non | `components/ui/button.tsx`, `components/ui/input.tsx`, `components/ui/label.tsx`, `components/ui/card.tsx`, `components/ui/avatar.tsx`, `components/ui/dropdown-menu.tsx`, `components/ui/skeleton.tsx`, `components/ui/sonner.tsx`, `components/theme-provider.tsx`, `components/theme-toggle.tsx`, `components/nav/top-nav.tsx`, `components/nav/app-sidebar.tsx`‡, `app/(app)/layout.tsx`‡, `app/(app)/dashboard/page.tsx`‡, `app/(auth)/layout.tsx` ; tokens dans `app/globals.css` |
| `motion` (couche animation) | ✅ | non | **Réutilisable :** `lib/motion.ts` (helpers reduced-motion + tokens `motionDuration`), `components/motion/use-reduced-motion.ts` (hook `"use client"`), `components/motion/use-token-colors.ts` (`useTokenColors` `"use client"` — design tokens → couleurs, réactif au thème), `components/motion/motion-asset.tsx` (`<MotionAsset>` `"use client"` — **point d'entrée unique**, router runtime theming-aware, 3 niveaux reduced-motion), `components/motion/lottie-animation.tsx` (`<LottieAnimation>` `"use client"`, dynamic `ssr:false`, repli statique), `components/motion/rive-animation.tsx` (`<RiveAnimation>` `"use client"`, dynamic `ssr:false`, booléen reduced dans la state machine), `components/motion/reveal.tsx` (`<Reveal>` `"use client"`, IntersectionObserver), `components/motion/skeleton-shimmer.tsx` (`<SkeletonShimmer>`, pur CSS), `components/motion/index.ts` (barrel), `components/motion/README.md` (guide + branchement `.lottie`/`.riv` + API `<MotionAsset>`). **Exemple neutre :** `components/motion/empty-state.tsx` (`<EmptyState>` — état vide animé, non métier). **Étend** `app/globals.css` (backstop `prefers-reduced-motion` global + `.skeleton-shimmer`, additif) + `package.json` (dépendances socle `@lottiefiles/dotlottie-react` + `@rive-app/react-canvas`). Contrat : `CONVENTIONS.md §14`. |
| `auth` | ✅ | non | `supabase/migrations/0001_auth.sql`, `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`, `app/(auth)/reset/page.tsx`, `app/auth/callback/route.ts` (OAuth/PKCE — futur provider, plus aucun magic link), `app/auth/signout/route.ts`, `components/auth/signup-form.tsx` (inscription 3 étapes : e-mail → code OTP → créer mot de passe), `components/auth/login-form.tsx` (connexion e-mail + mot de passe), `components/auth/reset-form.tsx` (mot de passe oublié : e-mail → code OTP → nouveau mot de passe), `components/auth/otp-input.tsx` (saisie OTP 6 cases), `components/auth/fields.tsx` (primitives partagées : EmailField, PasswordField afficher/masquer, boutons), `lib/auth/actions.ts` (6 Server Actions OTP → mot de passe), `lib/auth/form-state.ts` (types d'état + constantes `*_INIT`), `lib/auth/get-user.ts`, `lib/auth/enrollment.ts` (politique d'enrollment par type) |
| `access-gate` | ✅ | **oui** *(sélectionné si `type ≠ public`)* | `lib/access-gate/gate.ts` ; **étend** `middleware.ts` (composé avec `updateSession`). Rend le déploiement privé réel : `X-Robots-Tag: noindex` + redirection de bord des visiteurs non authentifiés. Inerte en mode `public`. |
| `crud` | ✅ | non | **Réutilisable (reste) :** `lib/crud/factory.ts`. **Exemple « clone-me », RETIRÉ au build (‡, cf. note ⬇) :** `supabase/migrations/0002_items.sql`‡, `app/(app)/items/page.tsx`‡, `app/(app)/items/actions.ts`‡, `components/items/item-form.tsx`‡, `lib/schemas/item.ts`‡ |
| `notifications` | ✅ | non | **Email :** `lib/email/client.ts`, `lib/email/send.ts`, `lib/email/welcome.ts`, `lib/email/templates/welcome.tsx`. **Boucles fermées (infra générique) :** `supabase/migrations/0004_notifications.sql` (table `notification_jobs` service-role only), `lib/notifications/service.ts` (client service role + types), `lib/notifications/enqueue.ts` (`enqueueJob`, idempotent (entity_id,type)), `lib/notifications/dispatch.ts` (`dispatchEntityJobs`=envoi immédiat au call-site + `dispatchDueJobs`=cron), `app/api/cron/notifications/route.ts` (GET protégé `CRON_SECRET`), `vercel.json` (cron quotidien `"0 8 * * *"`). **Étend** `lib/env.ts` (`CRON_SECRET` optionnel) + `.env.example`. |
| `waitlist` | ✅ | **oui** *(sélectionné pour l'archétype **landing**)* | `supabase/migrations/0005_waitlist.sql` (table `leads` GÉNÉRIQUE — service-role only, RLS sans policy, unique `lower(email)`), `lib/schemas/waitlist.ts` (zod payload `{ email, source? }`, e-mail normalisé trim+minuscule), `lib/waitlist/confirmation-email.ts` (HTML « email-safe » de la confirmation → `{ subject, html }` du payload du job), `components/waitlist/waitlist-form.tsx` (`"use client"` : POST `/api/waitlist`, états idle/loading/success/error, toast Sonner, label accessible), `app/api/waitlist/route.ts` (POST `runtime=nodejs` : insert lead service-role, idempotent sur 23505, `enqueueJob('waitlist_confirmation')` + `dispatchEntityJobs` = boucle fermée e-mail). **Réutilise** le bloc `notifications` (`enqueueJob`/`dispatchEntityJobs`, `getServiceClient`) + **étend** `lib/i18n.ts` (domaine `ui.waitlist.*`, `fr`+`en`). |
| `observability` | ✅ | non | `components/observability/posthog-provider.tsx` (wrappe `<Providers>`), `lib/analytics/posthog.ts`, `lib/analytics/events.ts`, `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts` |
| `billing` | ✅ | **oui** | `supabase/migrations/0003_billing.sql`, `app/api/stripe/checkout/route.ts`, `app/api/stripe/portal/route.ts`, `app/api/stripe/webhook/route.ts`, `lib/billing/stripe.ts`, `lib/billing/subscription.ts` |
| `org-tenancy` | ✅ | **oui** *(sélectionné si `tenancy = multi-org`)* | `supabase/migrations/0006_org_tenancy.sql` (tables `orgs` / `org_members` / `org_invitations` + helpers `security definer` `current_org_ids`/`is_org_member`/`is_org_admin` + trigger owner-membership ; RLS PAR ORG), `lib/org/context.ts` (`getUserOrgs`, `getActiveOrgId`, `ACTIVE_ORG_COOKIE`, types `Org`/`OrgMember`/`OrgMembership`/`OrgRole`), `lib/org/invitations.ts` (`createInvitation` = insert RLS-gardé + `enqueueJob`/`dispatchEntityJobs` e-mail ; `acceptInvitation` = service role, idempotent), `components/org/org-switcher.tsx` (`"use client"` — dropdown, cookie `active_org` + `router.refresh()`), `lib/org/billing.ts` (extension par-org du bloc `billing` : `stripeCustomerRefForOrg` + `orgIdFromCustomerMetadata` + stub typé + plan d'intégration ; **ne réécrit pas** `billing`). **RÉUTILISE** l'infra `notifications` (C1) pour l'e-mail d'invitation. **N'ajoute AUCUNE env** (le token est généré via `crypto`). Substrat du contrat `CONVENTIONS.md §13` (Thème C livré). |
| `repo-ci` | ✅ | non | `.github/workflows/ci.yml`, `.github/workflows/lighthouse.yml`, `.github/README.md`, `e2e/smoke.spec.ts`, `playwright.config.ts`, `vitest.config.ts`, `unlighthouse.config.ts`, **backstop copy (job `copy-quality`) :** `scripts/lint-utils.mjs`, `scripts/lint-slop.mjs`, `scripts/lint-sentinelle.mjs` |
| `hosting` | ⏳ | non | Fourni au déploiement (Vercel / CF Pages / Coolify) — pas de config versionnée en V1. `NEXT_PUBLIC_SITE_URL` porte l'origine publique. |

> **`‡` — artefact d'EXEMPLE « clone-me » du châssis, RETIRÉ au build (étape
> 12).** L'entité `items` (`app/(app)/items/*`, `components/items/*`,
> `lib/schemas/item.ts`, `0002_items.sql`) **et** le shell de démo (`app/(app)/`
> layout + `dashboard/page.tsx`, `components/nav/app-sidebar.tsx` à liens
> hardcodés « Éléments »/« Facturation ») sont un **patron de référence destiné
> au DÉVELOPPEUR**, pas au produit. Le walking skeleton (étape 12) crée le **vrai
> espace produit** (son propre route group, ex. `app/(manager)/`) dérivé des
> features, avec sa **nav feature-driven**, puis **supprime** ces artefacts
> d'exemple : un non-tech ne doit **JAMAIS** voir « Items — entité exemple du
> bloc CRUD » ni un lien de nav mort vers `/billing` (404). `lib/crud/factory.ts`
> (non marqué) est le helper **réutilisable** qui reste. Contrat complet + règle
> de nav feature-driven : `CONVENTIONS.md` §10 & §11.

> **Complétude & légal — backstop du châssis (fondation).** L'audit exigeait ces
> surfaces « gatées » mais jamais scaffoldées ; elles sont désormais **fournies
> une fois** et héritées par CHAQUE produit :
> - **Pages de complétude** (root `app/`, spéciales Next) : `not-found.tsx` (404
>   brandée via `lib/brand.ts`), `error.tsx` + `global-error.tsx` (error
>   boundaries `"use client"` avec `reset()`, remontée Sentry NO-OP-safe ;
>   `global-error` rend ses propres `<html>`/`<body>` + styles inline car il
>   remplace le layout racine), `loading.tsx` (skeleton générique via la
>   primitive `Skeleton` du bloc `ui-shell`). Server Components par défaut ;
>   `"use client"` **uniquement** sur `error`/`global-error`.
> - **`♦` — gabarits légaux, sélection par `jurisdiction` AU BUILD.** Les **4**
>   gabarits sont livrés (`app/legal/*`) ; le walking skeleton (étape 12) ne
>   **garde que ceux de la juridiction** : **FR → `mentions-legales` +
>   `confidentialite`** ; **US/EN → `terms` + `privacy`** (DE → Impressum +
>   Datenschutz à décliner). Il **supprime** les autres et met à jour les
>   `legalLinks` du footer (jamais de lien mort). Chrome partagé : `layout.tsx`
>   (conteneur + typo, aucune duplication) ; champs éditeur = composant
>   `_components/placeholder.tsx` qui rend des tokens **`{{ … }}` visibles** (attr
>   `data-placeholder`, greppables) que le build substitue par les vraies
>   valeurs — aucune page ne doit être publiée avec un `{{ … }}` résiduel.
>   Métadonnées par page ; littéraux = **sentinelles i18n** rendues dans `locale`
>   (`CONVENTIONS.md` §12). Renvoi juridiction : `_shared/state-schema.md` §locale.

> **Auth — OTP → mot de passe (0 magic link).** Décision produit (Felix) : le
> magic link est **supprimé**. Trois écrans DISTINCTS, une seule mécanique :
> - **Inscription** (`/signup`, `components/auth/signup-form.tsx`) — 3 étapes :
>   e-mail → **code OTP à 6 chiffres** (`otp-input`, 6 cases) qui **vérifie
>   l'e-mail** et ouvre la session → écran **« créer un mot de passe »**. Supabase :
>   `signInWithOtp` → `verifyOtp({type:'email'})` → `updateUser({password})`.
> - **Connexion** (`/login`, `login-form.tsx`) — **e-mail + mot de passe**
>   (`signInWithPassword`).
> - **Mot de passe oublié** (`/reset`, `reset-form.tsx`) — 2 étapes : e-mail →
>   **code OTP** + nouveau mot de passe (réponse anti-énumération).
>
> **Aucun bouton ni chemin « magic link »** ; l'e-mail d'OTP ne porte QUE le code.
> Validation zod (e-mail ; mot de passe 8–72, ≥1 lettre + ≥1 chiffre) doublée
> côté serveur par la policy GoTrue (`minimum_password_length` /
> `password_requirements`). Mot de passe **jamais loggé ni renvoyé au client**.
> Config locale : `supabase/config.toml` `[auth]` (politique de mot de passe) +
> `[auth.email]` (`otp_length`, `otp_expiry`, `max_frequency`,
> `enable_confirmations`) ; en prod `provisioner-db` pose en autonomie l'expiry
> (`mailer_otp_exp`) et le **template d'OTP CODE SEUL** (`{{ .Token }}`, **sans**
> `{{ .ConfirmationURL }}`) via l'API Management.

> **Enrollment & déploiement privé — piloté par `APP_ACCESS_MODE`.** Le flux
> **OTP → mot de passe** reste le **mécanisme** d'auth pour les trois types ;
> l'enrollment restreint seulement **QUI** peut obtenir un code d'inscription. La
> matrice signup par type (public / interne / perso) est **unique** et vit dans
> `skills/11-project-setup/references/provisioning-plan.md` §« Routage par type de
> produit » — ici, seulement le **câblage châssis** :
> - **`public`** — signup ouvert : `shouldCreateUser: true`, `/signup` = écran
>   d'inscription plein, surface indexable. `access-gate` inerte.
> - **`interne`** — `lib/auth/enrollment.ts` : soit **invitations** (défaut :
>   `auth.admin.inviteUserByEmail` au provisioning + `disable_signup` Supabase,
>   l'app ne crée jamais), soit **allowlist de domaine** (`AUTH_ALLOWED_EMAIL_DOMAINS`,
>   une adresse d'un domaine listé s'enrôle seule). `/signup` sert l'**activation**
>   (l'invité/l'allowlisté pose son mot de passe via la MÊME mécanique OTP→mdp) ;
>   une adresse non enrôlée reçoit un refus honnête, jamais de code. `access-gate`
>   actif (noindex + redirection de bord).
> - **`perso`** — **compte unique seedé** au provisioning ; aucune création à la
>   volée. `/signup` sert l'**activation** du compte seedé (poser son mot de passe).
>   `access-gate` actif.
>
> **L'autorité est côté Supabase** (`disable_signup`, posé par 11-project-setup) :
> `lib/auth/enrollment.ts` et `access-gate` sont la **cohérence + la défense en
> profondeur** (messages honnêtes, redirection de bord), jamais la seule porte.
> Le pré-vol 17 exige la **preuve** qu'un signup anonyme est refusé (pas une
> déclaration) — cf. `skills/17-deploy/references/preflight-checklist.md`.

> **Emails — deux flux, un seul domaine générique.** Le projet envoie deux
> types d'email, **distincts** mais partant du **même domaine d'envoi générique**
> (l'adresse `EMAIL_FROM` choisie à `infra-setup` ; **⚠️ son domaine EST le
> domaine vérifié dans Resend** — apex `<domain>` **ou** sous-domaine
> `mail.<domain>`, selon le choix, jamais From apex + vérif `mail.<domain>`),
> via le **même compte Resend** — domaine vérifié **une seule fois** puis
> réutilisé par **tous** les projets :
> - **E-mail de vérification** (**code OTP à 6 chiffres, CODE SEUL — pas de magic
>   link** ; cet e-mail vérifie l'adresse à l'inscription et à la réinitialisation)
>   = job de **Supabase Auth** avec **SMTP custom = Resend**. Réglé côté
>   `supabase/config.toml` (`[auth.email]` : `otp_length` / `otp_expiry`,
>   `[auth.email.smtp]`) pour le local ; en prod c'est `provisioner-db` qui pose
>   SMTP + template OTP **code-seul** **en autonomie** via l'API Management
>   Supabase (le SMTP custom retire la limite de débit du SMTP intégré ⇒ **pas
>   d'upgrade payant**).
> - **Transactionnel** (welcome, rappels, confirmation de RDV) = bloc
>   `notifications` / `lib/email`, via l'**API Resend** (`RESEND_API_KEY`,
>   `EMAIL_FROM`). **Deux mécanismes, deux rôles stricts** (`_shared/boucles-fermees.md`) :
>   **(1) confirmations/notifications = envoi IMMÉDIAT au site de l'action.**
>   Dans le handler qui crée/confirme/annule/déplace l'entité, après la mutation,
>   on **appelle** l'envoi ciblé des jobs en attente de CE dossier
>   (`dispatch<Entité>Jobs(id)`, best-effort, non bloquant) — c'est ce qui livre
>   la confirmation en quelques secondes. **Enfiler en `notification_jobs` ne
>   suffit pas : sans ce call-site, le job dort jusqu'au cron.** **(2) Les
>   rappels planifiés** (« J-1 ») se câblent en **cron quotidien** (`vercel.json`
>   `"0 8 * * *"`, compatible **Vercel Hobby**) + worker qui **balaie les
>   échéances des 24-48 h**, idempotent via `notification_jobs` ; une cadence
>   sub-quotidienne (`*/10`, H-2) **exige Vercel Pro** — jamais le défaut. Le cron
>   ne porte QUE les rappels + le **retry** des `pending` en échec — **jamais** la
>   1ʳᵉ livraison d'une confirmation.
>
> Le plugin câble le tout au provisioning — **rien à configurer à la main** une
> fois `infra-setup` fait.

> **`waitlist` — archétype landing (bloc ADDITIF optionnel).** L'archétype
> **landing-only** = `skeleton` (sections `components/landing/*` déjà présentes) +
> **`waitlist`** + `notifications` + légal, **SANS** `auth`/`crud`/`ui-shell`
> applicatif/`billing` (pas d'espace connecté). Le bloc `waitlist` ajoute UNE
> boucle fermée de capture d'e-mail :
> - **Table `leads`** (`0005_waitlist.sql`) : GÉNÉRIQUE (e-mail + `source` +
>   `referrer` + `metadata` + `status` `pending|confirmed`), **RLS activée sans
>   AUCUNE policy** — un visiteur anonyme n'insère JAMAIS directement ; seule la
>   route serveur en **service-role** (qui bypasse la RLS) écrit. Index UNIQUE
>   `lower(email)` ⇒ idempotence insensible à la casse.
> - **Route `app/api/waitlist/route.ts`** (`runtime=nodejs`) : valide (zod), insère
>   le lead (`getServiceClient`, pattern `lib/notifications/service.ts`), attrape
>   la violation d'unicité **23505** (déjà inscrit → `{ ok:true }` sans doublon),
>   puis **ENFILE** un job `waitlist_confirmation` (`enqueueJob`, entity_type
>   `lead`) **ET APPELLE** `dispatchEntityJobs(lead.id)` — la confirmation part en
>   quelques secondes (enfiler ≠ envoyer, cf. `_shared/boucles-fermees.md`). Le
>   corps de l'e-mail (`{ subject, html }` du payload) vient de
>   `lib/waitlist/confirmation-email.ts` — placé dans `lib/` (comme
>   `lib/email/templates/welcome.tsx`) car un template mail a des HEX inline
>   légitimes que le gate `lint:slop` (scan `app/`+`components/`) ne doit pas juger.
> - **Formulaire `components/waitlist/waitlist-form.tsx`** (`"use client"`) :
>   `<Input>`+`<Button>` (`ui-shell`), états idle/loading/success/error, toast
>   Sonner, label accessible. Copy 100 % `lib/i18n` (`ui.waitlist.*`, `fr`+`en`).
> - **Réutilise** l'infra du bloc `notifications` (aucun nouveau châssis, aucune
>   nouvelle clé env) : `RESEND_API_KEY`/`EMAIL_FROM` non configurés ⇒ la capture
>   marche quand même, l'envoi est simplement no-op best-effort (le cron rejouera).

> **i18n — tout le rendu produit suit la langue `locale`** (source du champ :
> `_shared/state-schema.md` §locale ; règle châssis : `CONVENTIONS.md` §12). Le
> châssis est livré FR mais **i18n-ready au niveau CODE** : le build (walking
> skeleton, étape 12) le rend dans `locale`, **distincte de la langue de travail
> interne** (FR). **Socle code = `lib/i18n.ts`** (SOURCE UNIQUE : expose `locale`,
> `dir`, `ogLocale` + le dictionnaire de copy `ui`), alimenté par la constante
> `PRODUCT_LOCALE` (`lib/brand.ts`, finalisée à l'étape 12 comme `brand`) ou l'env
> `NEXT_PUBLIC_LOCALE` (surcharge, `lib/env.ts`), défaut `fr-FR`.
> - `app/layout.tsx` pose `<html lang={locale} dir={dir}>` **depuis `lib/i18n`**
>   (le `<html lang="fr">` d'origine = **sentinelle** paramétrée ; `dir="rtl"`
>   pour **ar/he/fa/ur** ⇒ **RTL réel**, miroir de layout — cf. `ui-shell`).
> - Les **littéraux FR livrés** — sections `components/landing/*` sentinelles
>   (`skeleton`), labels du shell de démo + nav (`ui-shell`), messages
>   `components/auth/*` (`auth`), template `lib/email/templates/welcome.tsx`
>   (`notifications`) — sont des **placeholders « à traduire dans `locale` au
>   build »**, jamais la copy finale. Textes **centralisés**, aucun littéral FR
>   épars. Un produit `en-US` ne garde **aucun** label FR résiduel.
> - **Emails — les DEUX flux dans `locale`** : l'e-mail de vérification **OTP
>   (code seul, pas de magic link)** (templates Supabase Auth) ET le
>   **transactionnel** (bloc `notifications`) — **jamais** un email FR/EN par
>   défaut incohérent avec l'app. Le châssis câble déjà
>   `lib/email/templates/welcome.tsx` (`<html
>   lang={locale}>` + copy `ui.email.*`) et son objet (`lib/email/welcome.ts`)
>   sur `lib/i18n` — plus de `lang="en"`/corps EN en dur.
> - **`og:locale`** = `locale` (via `lib/i18n`, posé dans `app/layout.tsx`
>   `metadata.openGraph.locale`) ; `hreflang`/`lang` côté SEO (étape 16). Pages
>   **légales** selon `jurisdiction`, pas « FR » en dur.

> **Backstop copy — la doctrine, en MACHINE (bloc `repo-ci`).** La doctrine
> (`design-doctrine.md`, `landing-playbook.md`) interdit l'AI slop et la copy de
> dev/exemple en PROSE ; le job CI `copy-quality` l'interdit en CODE. Deux
> gates Node sans dépendance (`fs`/`path`/regex), motifs ajustables en tête :
> - **`npm run lint:slop`** (`scripts/lint-slop.mjs`) — scanne `app/` +
>   `components/` et échoue sur : classes Tailwind `indigo/violet/purple/fuchsia`
>   (le dégradé violet des maquettes IA, détecté quel que soit le préfixe :
>   `from-purple-500` comme `bg-indigo-600`), **hex en dur** dans le JSX/TSX
>   (couleur = tokens `globals.css` uniquement) et **buzzwords** (« seamless »,
>   « supercharge »…). Seule exception hex : `app/global-error.tsx` (allowlist —
>   le global error boundary remplace le layout racine ⇒ Tailwind non garanti,
>   style inline légitime).
> - **`npm run lint:sentinelle`** (`scripts/lint-sentinelle.mjs`) — pendant du
>   garde-fou `lib/brand.ts` (qui, lui, vérifie le NOM au build). Échoue si la
>   copy rendue livre encore des sentinelles de dev/exemple (« à cloner »,
>   « entité exemple », « bloc CRUD », « lorem », « placeholder » en prose,
>   « TODO »…). La détection **booking** est **opt-in** : le châssis est livré
>   avec l'exemple canonique « réservation salon » (`app/page.tsx`,
>   sentinelle du playbook), donc ce vocabulaire est légitime par DÉFAUT ;
>   `SENTINELLE_FORBID_BOOKING=1` (armé par le build pour un produit **non**-booking)
>   le rend bloquant.
>
> **Calibrage — 0 faux positif sur le châssis propre.** Les deux gates
> **neutralisent les commentaires** avant de matcher (les JSDoc FR denses
> mentionnent « placeholder »/« sentinelle »/« TODO ») et **excluent les
> artefacts d'exemple `‡`** retirés au build (`app/(app)/`, `components/items/`,
> `components/nav/app-sidebar.tsx`, `lib/schemas/item.ts` — cf. `‡` ci-dessus et
> CONVENTIONS.md §10), où « entité exemple »/« bloc CRUD » sont légitimes. Le
> composant légal `<Placeholder>` (`app/legal/_components/placeholder.tsx`) n'est
> **pas** confondu avec de la prose (règle casse-sensible minuscule). Liste des
> exclusions : `scripts/lint-utils.mjs` (`EXAMPLE_EXCLUDES`).

> **Couche `motion` — animation réutilisable, a11y-first, build-safe.** Le
> châssis sort du design générique via une **couche d'animation** partagée
> (`components/motion/*` + `lib/motion.ts`), COMPILANT (`tsc` + `next build`
> vérifiés). Trois briques réutilisables — `<LottieAnimation>` (wrapper lazy du
> runtime dotLottie, `ssr:false`), `<Reveal>` (fondu/glissement au scroll,
> IntersectionObserver, zéro dépendance), `<SkeletonShimmer>` (skeleton animé
> pur CSS) — plus un **exemple NEUTRE** (non métier) `<EmptyState>` (état vide
> animé via prop `src` d'URL). 🚨 **`prefers-reduced-motion` non négociable, à
> deux niveaux** : backstop CSS global dans `app/globals.css` (annule
> animations/transitions/scroll fluide, couvre même `animate-pulse`) **et** hook
> `useReducedMotion()` qui coupe l'autoplay → repli statique. **Zéro asset
> binaire lourd committé** : l'animation se branche au build **par URL**
> (`components/motion/README.md`), recolorée/retimée aux tokens de marque.
> Runtimes livrés = **dotLottie ET Rive**, derrière le point d'entrée unique
> **`<MotionAsset>`** (theming-aware) qui route le runtime (M7 : `motion`/`lottie`/
> `rive`), lit les design tokens (`useTokenColors`) et applique les **3 niveaux**
> de fallback reduced-motion. Les deux MIT, lazy (`ssr:false`, WASM hors bundle
> critique). Contrat : `CONVENTIONS.md §14`.

> Règle anti-collision : deux blocs ne partagent JAMAIS un fichier. Les seuls
> fichiers partagés « additifs » sont `.env.example`, `lib/env.ts`,
> `app/globals.css` (ajouts uniquement — dont le backstop reduced-motion + le
> shimmer de la couche `motion`), `app/providers.tsx` (corps, cf.
> CONVENTIONS.md §7) et `middleware.ts` (composition de passes : le bloc
> `access-gate` y ajoute son appel après `updateSession`, cf. CONVENTIONS.md §9).
> Seule la **couche motion** (fondation, pas un bloc en fan-out) pose en plus une
> dépendance socle dans `package.json` (§9). Tout le reste est disjoint.
