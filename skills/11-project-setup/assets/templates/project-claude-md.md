# CLAUDE.md — {nom du projet}
> Généré par l'étape 11. **Source de vérité des agents de build (Phase 4).** Ne mets aucun secret ici.

## Produit
{Workflow cœur · cible (persona précis) · edge — repris de `research/` + `product/`.}

## Stack
{Depuis `tech/architecture.md` + `_shared/stack-defaults.md`} — Next.js 15 · Supabase · Cloudflare · Vercel · Resend {· Stripe si billing}.

## Architecture
{Résumé du découpage technique + modèle de données + frontières — renvoi à `tech/architecture.md`.}

## Blocs réutilisés (châssis)
{Depuis le split réutiliser/build de l'étape 9 : `auth`, `billing`?, `ui-shell`, `crud`, `notifications`, `observability`.}

## Règles de code
- TypeScript strict ; **tests dès la 1re feature (TDD)**.
- Secrets en variables d'env (jamais en dur, jamais commités).
- **1 feature = 1 worktree = 1 agent** (zones disjointes).
- **RLS** sur toute table multi-tenant.

## Infra provisionnée
{Depuis `tech/provisioning-log.md` : repo · sous-domaine · BDD · host · email.}

## Testing
{Commande de test + framework — consommé par la QA / la cascade de validation de la Phase 4 (`_shared/validation-cascade.md`).}
