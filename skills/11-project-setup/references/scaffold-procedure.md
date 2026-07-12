# Référence — Scaffold local (étape 1 : repo + blocs câblés + CLAUDE.md)

La **première** étape, séquentielle, dont tout dépend. Elle crée l'arbre local, câble les blocs au niveau code, et génère le `CLAUDE.md` projet — la source de vérité des agents de build (Phase 4). Aucun appel réseau ici : c'est du disque local. Le provisioning distant vient après (`provisioning-plan.md`).

## Sous-procédure (ordre exact)
1. **Lire les entrées** : `tech/architecture.md` (stack + modèle de données + split réutiliser/build), `tech/execution-plan.md` (ordre, points `[SÉCU]`), `_shared/archetypes/<archétype>.md`, `_shared/blocks/README.md`, `_shared/stack-defaults.md`, `~/.saas-factory/config.json`.
2. **Dériver le `slug`** : nom projet → slug déterministe (voir règle plus bas). Le slug est la **clé** de toutes les ressources distantes → il doit être stable.
3. **`git init`** + `.gitignore` (env, node_modules, .next, secrets). Commit vide initial `chore: scaffold`.
4. **Poser la structure** de l'archétype (arbre `web-saas` ci-dessous).
5. **Câbler les blocs** décidés « réutiliser » à l'étape 9 (matrice de câblage plus bas) : poser code + points d'accroche + `.env.example` (**noms** de variables, jamais de valeurs).
6. **Générer le `CLAUDE.md`** racine depuis `assets/templates/project-claude-md.md`, rempli avec les données réelles du projet.
7. **Poser `.saas-factory/`** (état pipeline) + `README.md` minimal.
8. **Commit** `chore: wire blocks + CLAUDE.md`. Prêt pour le push (étape 2, `provisioner-repo`).

## Arbre généré (archétype web-saas)
```
app/            # routes (App Router)
components/     # UI (design system issu de 08-design-system)
lib/            # accès données, clients (supabase, stripe)
supabase/
  migrations/   # SQL versionné (appliqué par provisioner-db)
tests/          # tests dès la 1re feature
.github/workflows/  # CI (lint/test/build/deploy) — poussée par provisioner-repo
.saas-factory/  # état du pipeline
.env.example    # NOMS de variables uniquement
DESIGN.md · CLAUDE.md · README.md · .gitignore
```

## Règle de dérivation du slug
- minuscules, `[a-z0-9-]`, pas d'accent, pas d'espace (→ `-`), pas de `_`.
- longueur 3–30 ; unique par org.
- **déterministe** : même nom projet → même slug (pas de suffixe aléatoire au 1er run).
- collision détectée à l'étape idempotence (repo/db existant au bon slug mais contenu inattendu → conflit, cf. `idempotence-rollback.md`), **pas** en inventant un slug-2 ici.

## Matrice de câblage des blocs (réutiliser → quoi poser)
Le split réutiliser/build vient de l'étape 9. Ici on **câble le code** des blocs « réutiliser ».

| Bloc (si « réutiliser ») | Code posé | Points d'accroche | `.env.example` (noms) |
|---|---|---|---|
| `auth` | middleware session, routes login/callback, helper rôles | `lib/supabase`, guard des routes | `SUPABASE_URL`, `SUPABASE_ANON_KEY` |
| `repo-ci` | `.github/workflows/*.yml` | — (poussé par repo) | — |
| `ui-shell` | layout, nav, tokens depuis `DESIGN.md`, shadcn | `components/`, `app/layout` | — |
| `crud` | scaffolds CRUD par entité du modèle de données | `lib/`, `app/(entité)` | — |
| `notifications` | client Resend + templates React Email | `lib/email` | `RESEND_API_KEY` |
| `observability` | init Sentry + PostHog | `app/layout`, `lib/analytics` | `SENTRY_DSN`, `POSTHOG_KEY` |
| `billing` *(si le projet vend)* | checkout + webhooks + portail | `app/api/stripe`, `lib/stripe` | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |

> Un bloc décidé « build » (custom) à l'étape 9 n'est **pas** câblé ici — juste un dossier + un TODO pour la Phase 4. On ne pré-implémente pas la verticale (HARD GATE : pas de feature).

## Recette forcing — câbler vs stub
Décision interne (aucune question utilisateur).
- **Ask exact** : « ce bloc est-il marqué "réutiliser" dans le split de l'étape 9 ? »
- **Décider jusqu'à** : présence explicite dans `tech/architecture.md`, pas une supposition.
- **Red-flags — refuser de câbler** :
  - un bloc non listé dans le split → ne pas l'inventer (pas de `billing` si le projet ne vend pas).
  - poser une **valeur** de secret dans `.env.example` (→ uniquement des noms).
  - implémenter une feature métier (→ HARD GATE, c'est la Phase 4).
- **Routage** : « réutiliser » → câble (code + accroche + env names). « build » → dossier + TODO. non listé → rien.

## Definition of Done — scaffold
- [ ] `git init` fait, ≥1 commit, `.gitignore` couvre env/secrets/build.
- [ ] Arbre de l'archétype présent.
- [ ] Tous les blocs « réutiliser » du split étape 9 câblés (code + accroche + noms d'env).
- [ ] Aucun bloc « build » pré-implémenté (juste dossier + TODO).
- [ ] `.env.example` = **noms uniquement**, zéro valeur.
- [ ] `CLAUDE.md` racine généré et rempli (aucun secret).
- [ ] `supabase/migrations/` contient le SQL du modèle de données (prêt pour `provisioner-db`).
- [ ] Points `[SÉCU]` de `tech/execution-plan.md` reportés dans le `CLAUDE.md` / log.
- [ ] Rien de commité qui soit un secret.

## Modes d'échec + traitement

| Mode | Symptôme | Traitement |
|---|---|---|
| Secret commité | valeur dans `.env` traqué / dans le code | `.gitignore` d'abord ; si déjà commité localement → réécrire avant tout push distant |
| Slug non déterministe | slug aléatoire → reprise casse l'idempotence | slug = fonction pure du nom |
| Bloc fantôme | câblage d'un bloc absent du split | ne câbler que ce que l'étape 9 liste |
| Feature pré-buildée | verticale implémentée ici | STOP — HARD GATE, laisser en TODO Phase 4 |
| `CLAUDE.md` vide/générique | template non rempli avec les vraies données | remplir depuis `tech/*` + `product/*`, jamais laisser les `{placeholders}` |
| Migrations absentes | `supabase/migrations/` vide | dériver le SQL du modèle de données étape 9 (tables + RLS) avant le scaffold DB |
