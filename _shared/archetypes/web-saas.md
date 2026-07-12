# Archétype : web-saas (V1 — bloc partagé, lu à la demande)

L'archétype de build par défaut. Cadre la couche technique pour garantir un résultat fiable et reproductible.

## Stack
Next.js 15 (App Router, TS strict) + Supabase (Postgres + Auth + RLS) + Stripe + Cloudflare (deploy/DNS). Voir `../stack-defaults.md`.

## Structure de repo générée
```
app/            # routes (App Router)
components/     # UI (design system issu de 08-design-system)
lib/            # accès données, clients (supabase, stripe)
supabase/       # migrations SQL versionnées
tests/          # tests dès la 1re feature
.saas-factory/  # état du pipeline
DESIGN.md · CLAUDE.md · README.md
```

## Socle inclus par défaut
- Auth passwordless (OTP + magic link, pas de mot de passe — cf. `../blocks/web-saas/BLOCKS.md`), multi-tenant via RLS.
- Facturation Stripe (checkout + webhooks + portail client).
- 1-2 features cœur (définies en 07-product-spec).
- i18n si public ; SEO de base (16-seo).
- Tracking activation (PostHog) + erreurs (Sentry).

## Critères d'acceptation
Build vert (dev + prod), tests verts, auth fonctionnelle, paiement en mode test OK, déployé sur un sous-domaine sandbox, aucune clé en dur.

## Clés API requises (guidées par 11-project-setup)
Supabase (URL + anon + service role), Stripe (clé test + webhook secret), provider LLM, Cloudflare (token scoppé deploy/DNS). Chaque clé = un guide pas-à-pas ; jamais stockée par le plugin.
