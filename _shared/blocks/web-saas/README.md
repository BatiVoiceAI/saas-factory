# Template micro-SaaS — archétype `web-saas`

Le **châssis commun** de la SaaS Factory : ≈ 80 % d'un micro-SaaS, réutilisé
d'un projet à l'autre. On instancie ce template, on câble les blocs dont le
projet a besoin, puis on construit la verticale métier (le custom).

## Stack

- **Next.js 15** (App Router, React 19) + **TypeScript strict**
- **Tailwind CSS 3** + **shadcn/ui** (design tokens via CSS variables)
- **Supabase** (Postgres + Auth + **RLS**) — clients browser/server/middleware
- **Zod** pour la validation typée des variables d'environnement
- Intégrations optionnelles préconfigurées : **Resend** (email), **Stripe**
  (billing), **Sentry** + **PostHog** (observability)

## Instancier

```bash
# 1. Dépendances
npm install

# 2. Environnement — copier le modèle et renseigner les clés
cp .env.example .env
#    (aucune clé n'est fournie : chaque valeur est collectée au déploiement,
#     jamais commitée — cf. safety-rails §4)

# 3. Base de données — appliquer les migrations Supabase
supabase db push

# 4. Lancer en dev
npm run dev
```

> **Code template** : à l'instanciation, lancer `npm run typecheck` pour
> vérifier que le châssis compile avant d'ajouter des blocs.

## Scripts

| Script | Rôle |
|---|---|
| `npm run dev` | serveur de dev Next |
| `npm run build` | build de production |
| `npm run start` | serveur de production |
| `npm run lint` | ESLint (eslint-config-next) |
| `npm run typecheck` | `tsc --noEmit` (types stricts) |
| `npm run test` | tests unitaires (Vitest) |
| `npm run test:e2e` | tests end-to-end (Playwright) |
| `npm run format` | Prettier |

## Blocs disponibles

| Bloc | Fournit | Optionnel |
|---|---|---|
| `ui-shell` | layout, nav, tokens, primitives shadcn | non |
| `auth` | email + OAuth, sessions, rôles, multi-tenant (RLS) | non |
| `crud` | scaffolds CRUD + RLS par entité | non |
| `notifications` | email transactionnel (Resend) | non |
| `observability` | erreurs (Sentry) + activation (PostHog) | non |
| `billing` | Stripe checkout + webhooks + portail client | **oui** |
| `repo-ci` | repo GitHub + GitHub Actions | non |
| `hosting` | déploiement + sous-domaine + SSL | non |

Manifeste fichier-par-bloc : **`BLOCKS.md`**. Contrat d'écriture des blocs
(arborescence, alias, migrations, RLS, env) : **`CONVENTIONS.md`**.

## Sécurité

- Secrets **jamais en dur** : tout passe par des variables d'environnement.
  `.env.example` ne contient que des clés vides ; `.env` est gitignore.
- **RLS activée** sur toute table (chaque migration de bloc en est responsable).
- La clé `SUPABASE_SERVICE_ROLE_KEY` reste **côté serveur uniquement**.
