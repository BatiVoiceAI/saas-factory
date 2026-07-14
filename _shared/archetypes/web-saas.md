# Archétype : web-saas (V1 — bloc partagé, lu à la demande)

Un archétype parmi 3 — le modèle **3 axes orthogonaux** (`archetype` / `type` / `tenancy`) vit dans `../state-schema.md` §modèle 3 axes ; voir aussi `landing.md`, `automation.md`.

L'archétype de build par défaut. Cadre la couche technique pour garantir un résultat fiable et reproductible. Deux variables conditionnent ce qui est **réellement** câblé : le `type` (public / interne / perso, capté en 01-discover — routage : `skills/saas-factory/references/routing.md`) et la config `infra-setup` (`~/.saas-factory/`).

## Stack
Next.js 15 (App Router, TS strict) + Supabase (Postgres + Auth + RLS) + Vercel (hébergement) + Cloudflare (DNS/CDN) + Resend (email) · Stripe **seulement si le projet vend**. Source unique des défauts (et des alternatives self-host) : `../stack-defaults.md`.

## Structure de repo générée
```
app/            # routes (App Router)
components/     # UI (design system issu de 08-design-system)
lib/            # accès données, clients (supabase ; stripe si billing)
supabase/       # migrations SQL versionnées
tests/          # tests dès la 1re feature
.saas-factory/  # état du pipeline
.env.example    # NOMS de variables uniquement
DESIGN.md · CLAUDE.md · README.md
```
Arbre exact et matrice de câblage des blocs : `skills/11-project-setup/references/scaffold-procedure.md` (source unique).

## Socle inclus par défaut
- Auth **OTP → mot de passe** (l'OTP vérifie l'e-mail à l'inscription, puis l'utilisateur pose un mot de passe ; connexion e-mail + mot de passe ; **PLUS DE magic link** — cf. `../blocks/web-saas/BLOCKS.md`), multi-tenant via RLS.
- **Facturation Stripe — CONDITIONNELLE** : câblée seulement si le projet **vend** (`type = public` avec offre payante) **et** `providers.billing = stripe` (config posée une fois à `infra-setup`). Sinon le bloc `billing` n'est **pas** câblé — pas de code mort, pas de pricing sans objet.
- 1-2 features cœur (définies en 07-product-spec).
- i18n + SEO de base (16-seo) : **si `type = public` seulement** (interne / perso : pas de SEO, noindex).
- Tracking activation (PostHog) + erreurs (Sentry).
- **Multi-org (B2B) — CONDITIONNEL** : si `tenancy = multi-org` (axe 3, **web-saas seulement**), le socle **ajoute le bloc `org-tenancy`** (`../blocks/README.md` §org-tenancy) — entité **Org** + membres + invitations + switch d'org + rôles org (`admin`/`member`), **`org_id` comme tenant** + **RLS par org** (deny-by-default, `org_id` dérivé de la session) ; options `org-sso` et `org-billing` (abonnement rattaché à l'**org**). En `single` (défaut), ce bloc n'est **pas** câblé. Modèle : `../state-schema.md` §tenancy ; composition : `../../skills/11-project-setup/references/scaffold-procedure.md` §Sélection des blocs par archétype.

## Critères d'acceptation
Build vert (dev + prod), tests verts, auth fonctionnelle, déployé sur un sous-domaine sandbox, aucune clé en dur. **Si billing câblé** : paiement en mode test OK.

## Clés API requises
Connectées **une fois, en amont, via `infra-setup`** (config globale `~/.saas-factory/`) — jamais demandées ad hoc en cours de route ; 11-project-setup les consomme. Socle : Supabase (URL + anon + service role), Vercel (deploy), Cloudflare (token scoppé DNS), Resend, provider LLM. **Si billing** : Stripe (clé test + webhook secret). Chaque clé = un guide pas-à-pas ; jamais stockée par le plugin.
