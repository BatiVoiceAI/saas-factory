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

## Recette forcing — injecter ou refuser
- **Ask exact** : « cette valeur est-elle présente, non-vide, non-placeholder, et à scope correct (client vs serveur) ? »
- **Push-until** : valeur réelle confirmée + destination correcte (env host vs GitHub, preview vs prod).
- **Red-flags — refuser l'injection** :
  - valeur vide/`{placeholder}`/`changeme` → ne pas injecter une chaîne vide, loguer manquant.
  - clé serveur (`service_role`, `stripe_secret`) dirigée vers une var **exposée client** → refuser.
  - écrire un secret dans le repo, un artefact, un `status/`, ou le log → interdit.
  - un secret demandé mais absent de `~/.saas-factory/` → repli honnête (loguer, ne pas fabriquer).
- **Routage** : valeur OK + scope OK → injecte (overwrite idempotent). Manquante → loger `[SÉCU]` + `DONE_WITH_CONCERNS`. Mauvais scope → **STOP** cette var, ne jamais downgrade en public.

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
