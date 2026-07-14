# Référence — Câblage des secrets (étape 6)

L'étape **la plus sécurité-sensible**. On injecte les identifiants produits par chaque provisioner dans les deux endroits qui en ont besoin — **secrets GitHub Actions** (pour la CI) et **env de l'hébergeur** (pour le runtime) — sans jamais qu'un secret touche le disque du repo, un artefact de projet, ou un fichier de statut.

Source des secrets : `~/.saas-factory/` (config + `.env`) et les **sorties des provisioners** (clés Supabase, etc., transmises en mémoire, jamais logées). Contraintes : `_shared/safety-rails.md` §3 (scope minimal) et §4 (secrets jamais en dur/logués/commités).

## Sous-procédure (ordre exact)
1. **Collecter** les secrets nécessaires (matrice ci-dessous), depuis `~/.saas-factory/.env` + sorties provisioners.
2. **Vérifier** que rien n'est vide/placeholder avant injection (un secret manquant ≠ chaîne vide injectée).
3. **Injecter dans GitHub Actions** : `set secret` par **nom** (idempotent, overwrite).
4. **Injecter dans l'env host** (Vercel/CF/Coolify) : `set env var` par nom, par environnement (preview/prod).
5. **Ne rien écrire** dans le repo, les artefacts, les `status/`. Seuls les **noms** de variables apparaissent (déjà dans `.env.example` du scaffold).
6. **Loger** dans `tech/provisioning-log.md` : « secrets injectés (liste des **noms**) », jamais les valeurs.

## Matrice — quel secret va où
| Secret (nom) | Source | GitHub Actions | Env host | Scope |
|---|---|---|---|---|
| `SUPABASE_URL` | sortie provisioner-db | oui | oui | public-ish (URL) |
| `SUPABASE_ANON_KEY` | sortie provisioner-db | oui | oui | client-safe |
| `SUPABASE_SERVICE_ROLE_KEY` | sortie provisioner-db | oui (si tests) | **prod/serveur uniquement** | **jamais côté client** |
| `RESEND_API_KEY` | `~/.saas-factory/.env` | si tests email | oui | serveur |
| `SENTRY_DSN`, `POSTHOG_KEY` | `~/.saas-factory/.env` | non | oui | client/serveur |
| `STRIPE_SECRET_KEY` *(si billing)* | connecteur / `.env` | non | prod/serveur | **jamais côté client** |
| `STRIPE_WEBHOOK_SECRET` *(si billing)* | sortie étape billing (Stripe) | non | serveur | serveur |

**Règle client/serveur** : `service_role` et `stripe_secret` ne vont **jamais** dans une variable exposée au navigateur (pas de préfixe public type `NEXT_PUBLIC_`). Une erreur ici = fuite totale de la BDD → `[SÉCU]` bloquant.

## Câblage AUTOMATION — split Secrets / Variables + slot d'intégration
> **Actif UNIQUEMENT si `archetype = automation`.** En `web-saas` (défaut), la matrice ci-dessus s'applique telle quelle (secrets GitHub Actions + env host Vercel/CF/Coolify). En automation, **il n'y a pas d'env host** : le **runtime EST GitHub Actions** (l'ordonnanceur = le host, `provisioning-plan.md` §« Chemin de provisioning AUTOMATION »). Les deux destinations deviennent **GitHub Actions Secrets** et **GitHub Actions Variables** du **même repo**.

**« GitHub Actions = env runtime » → split en deux natures** (le workflow lit `${{ secrets.X }}` pour le sensible, `${{ vars.X }}` pour le reste) :

| Nature | Destination | Contenu (exemples) | Exposé dans les logs ? |
|---|---|---|---|
| **Sensible** | **GitHub Actions *Secrets*** (`set secret`, masqué) | `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` (notif boucle fermée), `WEBHOOK_URL` / `CRON_SECRET`, **secrets d'INTÉGRATION source/cible** | **non** (masqué) |
| **Config non-sensible** | **GitHub Actions *Variables*** (`set variable`, lisible) | `SUPABASE_URL`, `OWNER_EMAIL`, `EMAIL_FROM`, `SYNC_INTERVAL_HOURS`, `DIGEST_HOUR`, seuils métier, `IDEMPOTENCY_WINDOW_SEC` | oui (assumé lisible — **jamais** y mettre un token) |

- **Slot « secrets d'INTÉGRATION source/cible » (obligatoire en automation)** : les tokens des systèmes que l'automation **lit** (source) et **écrit** (cible) — ex. `SHOP_API_TOKEN` d'une boutique, clé d'un CRM, token d'un feed. **Toujours en *Secrets*** (jamais en *Variables*). Une automation intègre ≥ 1 système externe → **au moins un** de ces secrets existe toujours ; l'oublier = worker qui ne peut ni lire ni écrire. À collecter comme les secrets châssis (matrice + non-vide + scope), source = `~/.saas-factory/.env` ou connecteur du système intégré.
- **`RUN_MODE` n'est ni Secret ni Variable** : il est **dérivé du cron déclencheur** dans le workflow (`github.event.schedule` → `sync`/`digest`) ou de l'input `workflow_dispatch`. Ne jamais le câbler comme secret/variable.
- **`SUPABASE_SERVICE_ROLE_KEY` reste serveur-only** (ici « serveur » = le runner GitHub Actions) : aucun préfixe public, jamais côté client (il n'y a pas de client en automation, mais la règle de scope tient : `[SÉCU]` bloquant si exposé).
- **État durable requis** : `SUPABASE_URL` en *Variables* n'est pas cosmétique — sur runner éphémère c'est la **condition de l'idempotence** (règle dure `provisioning-plan.md`). Un `SUPABASE_URL` vide/absent en automation-GitHub-Actions = **bloquant**, pas un simple manque.

## Recette forcing — injecter ou refuser
- **Ask exact** : « cette valeur est-elle présente, non-vide, non-placeholder, et à scope correct (client vs serveur) ? »
- **Push-until** : valeur réelle confirmée + destination correcte (env host vs GitHub, preview vs prod).
- **Red-flags — refuser l'injection** :
  - valeur vide/`{placeholder}`/`changeme` → ne pas injecter une chaîne vide, loguer manquant.
  - clé serveur (`service_role`, `stripe_secret`) dirigée vers une var **exposée client** → refuser.
  - écrire un secret dans le repo, un artefact, un `status/`, ou le log → interdit.
  - un secret demandé mais absent de `~/.saas-factory/` → repli honnête (loguer, ne pas fabriquer).
- **Routage** : valeur OK + scope OK → injecte (overwrite idempotent). Manquante → loger `[SÉCU]` ; le **run** de l'étape sortira `DONE_WITH_CONCERNS` (verdict niveau run — définition canonique : `provisioning-plan.md` §machine à états). Mauvais scope → **STOP** cette var, ne jamais downgrade en public.

## Idempotence
Les secrets s'injectent **par nom** → overwrite. Un 2ᵉ run réinjecte les mêmes valeurs sans effet de bord. Un secret déjà présent avec une valeur correcte n'a pas besoin d'être touché, mais l'overwrite reste sûr (idempotent).

## Definition of Done — câblage secrets
- [ ] Tous les secrets requis (matrice) présents et non-placeholder avant injection.
- [ ] Injectés dans GitHub Actions (ceux utiles à la CI) **par nom**.
- [ ] Injectés dans l'env host, par environnement (preview/prod).
- [ ] `service_role` / `stripe_secret` **absents** de toute var exposée client.
- [ ] **Zéro** secret dans le repo / les artefacts / les `status/` / le log (seuls les **noms** apparaissent).
- [ ] Manques éventuels logués `[SÉCU]` pour la revue Phase 4.

## Modes d'échec + traitement

| Mode | Symptôme | Traitement |
|---|---|---|
| Secret en dur | valeur committée / dans un artefact | interdit — bloquer, purger avant tout push |
| Fuite client | `service_role` en var publique | `[SÉCU]` bloquant, corriger avant deploy |
| Chaîne vide injectée | secret absent → var = "" | vérifier non-vide avant injection ; loguer manquant |
| Secret logué | valeur dans `provisioning-log.md` | ne loger que les **noms** ; purger si arrivé |
| Scope trop large | token full-access injecté | scope minimal (`safety-rails.md` §3) ; loguer l'écart |
| Env oublié | prod OK, preview vide | injecter les deux environnements host |
