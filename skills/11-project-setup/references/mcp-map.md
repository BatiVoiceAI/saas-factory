# Référence — Carte des MCP (quel outil pour quelle ressource)

Le provisioning **dépend des MCP officiels** des éditeurs (déclarés dans `.mcp.json.example`, connectés une fois via `infra-setup`). On ne réinvente pas ces API — on les appelle.

## Sommaire

- Règle de routage (managed vs self-host) — À LIRE EN PREMIER
- Modèle d'outils & auth
- Compétence (anti-hallucination)
- Séquences d'appels par ressource (l'ordre exact)
- Carte MCP AUTOMATION (archétype `automation` — headless)
- Matrice de repli — MCP indisponible → quoi faire
- Modes d'échec MCP + traitement

## Règle de routage (managed vs self-host) — À LIRE EN PREMIER
Chaque ressource **forkée** a deux variantes. Le provisioner lit `~/.saas-factory/config.json` (**profil** + **provider** de la ressource) et route :
- **managed** → **MCP officiel** (GitHub / Supabase cloud / Vercel), connecté par `infra-setup`.
- **self-host** → **API HTTP de l'instance** via `Bash`/curl : **URL d'instance + token** lus dans `~/.saas-factory/.env` (jamais en chat, jamais commités).

Ressources **forkées** (deux branches) : Repo+CI · BDD+Auth · Hébergement.
Ressources **provider-only** (PAS de branche self-host, toujours identiques) : DNS+CDN = **Cloudflare** (sous-domaines `<slug>.<domaine>`, quel que soit le profil) · Email = **Resend/Postmark** · Paiement = **Stripe**.

Les **invariants sont les mêmes** dans les deux branches : sonde d'idempotence → créer/UPSERT → loguer, rollback, repli honnête. Seule la **séquence d'appels** diffère (MCP officiel vs API self-host).

| Ressource | Branche | MCP / API | Outils clés | Notes |
|---|---|---|---|---|
| Repo + CI | **managed** | **GitHub MCP** (MIT) | create repository · Actions · secrets | push du template scaffané |
| Repo + CI | **self-host** | **API Gitea/Forgejo** (`Bash`/curl) | `POST /api/v1/user/repos` · `PUT .../contents` · Actions/secrets | `GITEA_URL` + `GITEA_TOKEN` (`.env`) |
| BDD + Auth | **managed** | **Supabase MCP** (Apache) + **API Management** (`Bash`/curl) | `confirm_cost` · `create_project` · `apply_migration` (SQL → **tables + RLS**) · `deploy_edge_function` · **config Auth** (SMTP custom Resend — **bloc SMTP complet, `smtp_port` en chaîne, rate-limit desserré**, `mailer_autoconfirm`, `site_url`, `uri_allow_list`) | ⚠️ `confirm_cost` requis avant `create_project` → l'agent le **confirme auto** (autorisation durable d'`infra-setup`) · la **config Auth n'est PAS couverte par le MCP DB** → `PATCH /v1/projects/{ref}/config/auth`, `Bearer $SUPABASE_ACCESS_TOKEN` (`.env`) · **4 gotchas SMTP : `agents/provisioner-db.md`** |
| BDD + Auth | **self-host** | **API Supabase self-hosted** (`Bash`/curl ou `psql`) | applique **les migrations seules** (tables + RLS) sur l'instance existante · **config Auth via env GoTrue** | `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (`.env`) · **PAS** de `create_project` (instance déjà là) · Auth = variables `GOTRUE_SMTP_*` / `GOTRUE_MAILER_AUTOCONFIRM` / `GOTRUE_SITE_URL` / `GOTRUE_URI_ALLOW_LIST` |
| Hébergement | **managed** | **Vercel** (REST/MCP) | create-project · create-deployment · env vars · link repo | alt managée : Cloudflare Pages |
| Hébergement | **self-host** | **API Coolify** (`Bash`/curl) | create app · link repo · deploy · env vars | `COOLIFY_URL` + `COOLIFY_API_TOKEN` (`.env`) |
| DNS + sous-domaine | **provider-only** | **Cloudflare MCP** | search()/execute() sur l'API (DNS records, Pages) | `<slug>.<domaine>`, **toujours** (pas de fork) |
| Email | **provider-only** | **Resend/Postmark** (API) | vérifier domaine · config transactionnel | pas de MCP officiel → API + clé (`~/.saas-factory/.env`), **pas de fork** |
| Paiement (opt.) | **provider-only** | **Stripe Agent Toolkit** (MIT) | produits · prix · webhooks | seulement si `billing = stripe`, **pas de fork** |

## Modèle d'outils & auth
**Qui appelle quoi.** L'orchestrateur (SKILL) n'appelle **aucun MCP en direct** : son frontmatter `allowed-tools` (`Read, Write, Edit, Bash, Grep, Glob, Task`) est celui d'un **chef d'orchestre** — il lit/écrit les artefacts et **dispatche des sous-agents via `Task`**. Ce sont ces **sous-agents** qui portent les appels MCP (GitHub/Supabase/Cloudflare/Vercel/Stripe), en héritant des **serveurs MCP connectés une fois par `infra-setup`** (déclarés dans `.mcp.json.example`). L'étape 11 elle-même **ne manipule pas de clé brute** pour les providers MCP.

**Resend (pas de MCP).** `provisioner-email` appelle l'**API HTTP Resend via `Bash`/curl** (l'outil `Bash` est déjà dans `allowed-tools`), avec la clé lue dans `~/.saas-factory/.env` — jamais logée, jamais commitée. Pour publier ses records DNS, ce même sous-agent utilise le **MCP Cloudflare**.

**Auth.** Les connexions vivent **côté connecteur** (OAuth/MCP), établies par `infra-setup`. Pour les non-MCP (Resend) **et pour la branche self-host** (Gitea/Forgejo, Supabase self-hosted, Coolify), l'URL d'instance + le token viennent de `~/.saas-factory/.env` — appelés via `Bash`/curl, jamais logés, jamais commités.

**Config git du repo (`git_author` → `git config`, pas de MCP, pas une variable d'env).** Comme `email_from → EMAIL_FROM`, la config globale est mappée vers le projet — mais ici ce n'est **pas** une env var : au scaffold (avant tout commit, cf. `provisioning-plan.md §Ordre & parallélisme`), l'orchestrateur mappe `config.git_author.email → git config user.email` et `config.git_author.name → git config user.name` du **repo projet** via `Bash` (déjà dans `allowed-tools`). **NON-secret** → jamais `.env`, jamais commité : c'est une **identité d'auteur** de commit, comme `email_from`. 🚨 **Invariant scopé `hosting = vercel`** : `git_author.email` **DOIT** être membre de la team **Vercel** sinon le déploiement est refusé **`readyState = BLOCKED`** (blocage silencieux : build vert, deploy refusé). Hors Vercel (Coolify self-host, CF Pages) **et en archétype `automation`** (host = ordonnanceur GitHub Actions), la config git author reste une hygiène d'authorship mais **n'est pas une porte de déploiement**. Champ + invariant complet : `infra-setup/references/config-schema.md §git_author`.

## Compétence (anti-hallucination)
Avant d'écrire une migration RLS ou une config DNS, le sous-agent **consulte les skills de référence** (`reference-skills.md`) pour appliquer les bonnes pratiques de l'éditeur — pas d'approximation.

> **Configs exactes des serveurs MCP** : à confirmer au câblage réel (`.mcp.json.example` à la racine du plugin). Les serveurs hébergés (Cloudflare, Vercel, Stripe) s'auth via **OAuth** ; les locaux (Supabase, GitHub) via token/OAuth selon le provider. `infra-setup` établit ces connexions une fois.

---

## Séquences d'appels par ressource (l'ordre exact)
Ce que chaque sous-agent enchaîne. Chaque appel est précédé de sa **sonde d'idempotence** (`idempotence-rollback.md`). Pour les ressources **forkées**, le provisioner choisit la branche selon le provider lu dans `config.json` ; les deux branches partagent les mêmes invariants (sonde → créer/UPSERT → loguer).

**Repo + CI** — deux branches selon le provider
```
managed = GitHub MCP :
1. get repo org/<slug>            (sonde)
2. create repository (privé)      (si absent)
3. push arbre scaffané            (si arbre distant vide)
4. vérifier .github/workflows/*   (CI présente dans le scaffold → poussée avec l'arbre)
5. → secrets injectés à l'étape câblage (pas ici)

self-host = API Gitea/Forgejo (Bash/curl, GITEA_URL + GITEA_TOKEN en .env) :
1. GET  /api/v1/repos/<org>/<slug>          (sonde)
2. POST /api/v1/user/repos {private:true}   (si absent)
3. push arbre scaffané (git remote instance) (si arbre distant vide)
4. .gitea/workflows/* poussés avec l'arbre  (CI Actions Gitea)
5. → secrets injectés à l'étape câblage (pas ici)
```

**BDD + Auth** — deux branches selon le provider
```
managed = Supabase MCP cloud (migrations) + API Management (Auth) :
1. list projects → match <slug>   (sonde)
2. confirm_cost                   (auto — autorisation durable infra-setup)
3. create_project                 (si absent) → récupère ref + URL + anon + service_role
4. pour chaque migration (ordre du modèle de données étape 9) :
     apply_migration(nom, sql)    (saute si nom déjà présent) → tables + RLS
5. config Auth via API MANAGEMENT (PATCH /v1/projects/{ref}/config/auth, Bearer $SUPABASE_ACCESS_TOKEN
     — PAS le MCP DB) :
     smtp_host=smtp.resend.com, smtp_port='587' (CHAINE — un entier vide tout le bloc SMTP), smtp_user=resend,
     smtp_pass=$RESEND_API_KEY, smtp_sender_name=<projet>,
     smtp_admin_email=$EMAIL_FROM (config.email_from, sur le DOMAINE VERIFIE — invariant From = domaine verifie),
     bloc SMTP pose COMPLET en un coup (PATCH smtp partiel vide les autres champs → 500),
     rate_limit_email_sent~30 + smtp_max_frequency~15s desserres (defaut 2/h bloque l'utilisateur),
     mailer_otp_exp=600, mailer_otp_length=6 (defaut Supabase=8 → PIN a 6 = nb cases input chassis),
     password_min_length=8 + password_required_characters (au moins lettres+chiffres — flux OTP → mot de passe),
     templates OTP CODE SEUL : {{ .Token }} SANS {{ .ConfirmationURL }} (magic link supprime — decision produit Felix),
     site_url + uri_allow_list (https://<slug>.<domaine>/auth/callback — conserve pour futur OAuth, plus de magic link),
     mailer_autoconfirm=false (confirmation requise via OTP, public) | true (dev/perso)
     → idempotence : lire la config Auth, patcher si different — SAUF le bloc SMTP (indivisible : un champ diff ⇒ repose tout)
     → 4 gotchas SMTP detailles : agents/provisioner-db.md etape Auth (source unique)
6. loger ref + URL dans status/   (les clés + $RESEND_API_KEY → .env, jamais dans le status)

self-host = Supabase self-hosted DÉJÀ EXISTANT (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY en .env) :
1. sonde des tables/migrations existantes (Bash/curl API ou psql)   (sonde)
2. — PAS de confirm_cost / create_project (l'instance existe déjà) —
3. pour chaque migration (même ordre) :
     applique le SQL (tables + RLS) via API/psql   (saute si déjà présent)
4. config Auth via variables d'env GoTrue de l'instance (PAS l'API Management) :
     GOTRUE_SMTP_HOST/PORT/USER/PASS/SENDER_NAME/ADMIN_EMAIL (Resend, pass=$RESEND_API_KEY,
       ADMIN_EMAIL=$EMAIL_FROM sur le DOMAINE VERIFIE — invariant From = domaine verifie),
     GOTRUE_SMTP_MAX_FREQUENCY~15s + GOTRUE_RATE_LIMIT_EMAIL_SENT~30 (desserres, defaut bloque le re-envoi),
     GOTRUE_PASSWORD_MIN_LENGTH=8 + GOTRUE_PASSWORD_REQUIRED_CHARACTERS (lettres+chiffres),
     GOTRUE_MAILER_* templates CODE SEUL ({{ .Token }} sans {{ .ConfirmationURL }} — magic link supprime),
     GOTRUE_MAILER_AUTOCONFIRM, GOTRUE_SITE_URL, GOTRUE_URI_ALLOW_LIST
5. loger URL d'instance dans status/   (service_role + $RESEND_API_KEY → .env, jamais dans le status)
```
> **Routage config Auth** : **managed = API Management** (`PATCH /v1/projects/{ref}/config/auth`) · **self-host = variables d'env GoTrue**. Dans les deux cas : **SMTP custom = Resend** (lève la limite d'email de Supabase, aucun upgrade payant), même **adresse `email_from` / même domaine vérifié** (invariant : domaine From = domaine vérifié) que le transactionnel.

**Cloudflare (DNS)** — deux propriétaires distincts, mêmes MCP, records différents :
- **`provisioner-hosting`** possède le **record de routage** `<slug>.<domaine>` (séquence ci-dessous).
- **`provisioner-email`** possède **ses** records de vérification (DKIM/SPF/DMARC/MX), qu'il publie lui-même (cf. séquence Resend). Aucun des deux ne touche les records de l'autre.
```
(provisioner-hosting)
1. get DNS record <slug>.<domaine>   (sonde — record de routage uniquement)
2. UPSERT record → cible = host       (create si absent, update si présent)
3. (si CF Pages comme host) create Pages project
```

**Hébergement** — deux branches selon le provider
```
managed = Vercel (REST/MCP) :
1. list projects → match nom          (sonde)
2. create project                     (si absent)
3. sonde « app GitHub installée côté Vercel ? »   (l'intégration GitHub↔Vercel n'est PAS garantie —
     tester avant le link : GET de l'intégration, ou link qui renvoie une erreur explicite)
     → présente : link GitHub repo (auto-deploy sur push)
     → ABSENTE : REPLI deploy-hook/CI — créer un Deploy Hook Vercel + step CI (workflow du scaffold)
       qui l'appelle sur push : le deploy-sur-push est conservé ; loguer en `concerns`
       (« link GitHub↔Vercel indisponible, deploy via hook CI ») — PAS un FAILED
4. set env vars                        (à l'étape câblage secrets)
5. attach domaine <slug>.<domaine>     (selon type — perso : pas de DNS public, URL par défaut ;
                                        matrice : provisioning-plan.md §Routage par type de produit)

self-host = API Coolify (Bash/curl, COOLIFY_URL + COOLIFY_API_TOKEN en .env) :
1. GET  /api/v1/applications → match nom   (sonde)
2. POST create app                          (si absente)
3. link repo (URL du provider repo)         (deploy sur push)
4. set env vars                             (à l'étape câblage secrets)
5. POST deploy + attach domaine <slug>.<domaine>
```

**Resend (email)** — API HTTP (pas de MCP), via `Bash`/curl + clé `~/.saas-factory/.env`
```
1. get domains → domaine cible = domaine de config.email_from (partie apres @)   (sonde)
2. domaine cible absent → add domain = domaine de email_from (apex OU sous-domaine, selon l'adresse choisie a infra-setup)
     → Resend renvoie ses records de verification (SPF/DKIM/DMARC + return-path)
   ⚠️ Resend gratuit = 1 SEUL domaine : si un domaine DIFFERENT est deja present (adresse changee) →
     REMPLACER (delete l'ancien + add le cible + re-DNS), jamais empiler (sinon 403 « plan includes 1 domain »)
   invariant : domaine From = domaine verifie (sinon Resend refuse d'envoyer → 500)
3. publier ces records en appelant DIRECTEMENT le MCP Cloudflare
     → c'est provisioner-email qui possède ces appels DNS (records propres à l'email),
       distincts du record de routage <slug>.<domaine> de provisioner-hosting.
       Aucune dépendance envers hosting → pas de cycle, email reste parallèle & non-bloquant.
4. poll verified                       (BORNÉ — borne exacte : contrat provisioner-email,
                                        subagent-contracts.md ; non vérifié à la borne → solde
                                        honnête NON-bloquant, états : provisioning-plan.md
                                        §machine à états — jamais de poll infini, jamais de
                                        verified simulé)
```

**Stripe (billing, optionnel)**
```
seulement si providers.billing = stripe (mode test) :
1. list products (metadata slug)      (sonde)
2. create products + prices           (si absents)
3. create webhook endpoint            (vers l'URL du host)
```

## Carte MCP AUTOMATION (archétype `automation` — headless)
> **Actif UNIQUEMENT si `archetype = automation`.** En `web-saas`, la carte ci-dessus s'applique telle quelle. En automation, on **retire** DNS/hosting-web/email-domaine/billing et le **runtime devient GitHub Actions** (l'ordonnanceur = le host). Détail des retraits + règle « runner éphémère ⇒ Supabase obligatoire » : `provisioning-plan.md` §« Chemin de provisioning AUTOMATION ».

| Ressource automation | Branche | MCP / API | Outils clés | Notes |
|---|---|---|---|---|
| **Repo + scheduler** (= CI **et** host) | **managed** | **GitHub MCP** | create repository · **push `.github/workflows/<slug>.yml` (`on: schedule:` 2 crons + `workflow_dispatch`)** · Actions Secrets **+ Variables** | l'ordonnanceur EST le host — **pas de Vercel** · `RUN_MODE` dérivé du cron, jamais secret |
| **BDD (migrations seules)** | **managed** | **Supabase MCP** (Apache) | `confirm_cost` · `create_project` · `apply_migration` (tables + RPC idempotence, **lesson #15 / RETURNING-safe**) | **PAS de config Auth/SMTP** (`PATCH .../config/auth` non appelé) · accès **service-role only**, RLS **0 policy tenant** |
| **BDD (self-host)** | **self-host** | **API Supabase self-hosted** (`Bash`/curl / `psql`) | migrations seules sur l'instance | `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (`.env`) · pas de `create_project` |
| **Runtime / env** | — | **GitHub Actions** (Secrets + Variables) | `set secret` (sensible) · `set variable` (non-sensible) | **remplace l'env host** — il n'y a pas d'hébergeur web (`secrets-wiring.md` §automation) |
| **Systèmes intégrés source/cible** | provider-only | **MCP/API du système intégré** (ou `Bash`/curl + token) | lire la **source**, écrire la **cible** | tokens = **Secrets d'intégration** (jamais Variables) ; ≥ 1 toujours présent |
| DNS · hosting-web · email-domaine · billing | **RETIRÉS** | — | — | headless : aucune surface publique / auth / vente (retraits **tracés** au log) |

**Ordonnanceur — alternatives à GitHub Actions** (choix logué) : **cron système** (crontab/systemd sur VM à disque persistant → fallback fichier OK), **conteneur** long-running / sidecar cron, **Cloud Scheduler → Cloud Run job** (éphémère → base durable OBLIGATOIRE). La contrainte d'état durable suit la **cible**, pas le provider.

**Séquence `provisioner-repo-scheduler`** (managed, GitHub MCP)
```
1. get repo org/<slug>                       (sonde)
2. create repository (privé)                 (si absent)
3. push arbre (bloc automation) + .github/workflows/<slug>.yml
     → on: schedule: [cron sync, cron digest] + workflow_dispatch
     → concurrency mono-groupe (cancel-in-progress:false), permissions: contents:read
     → step `node dist/index.js`, RUN_MODE dérivé de github.event.schedule (jamais secret)
     → header du workflow documente les caveats : cron UTC only · best-effort · désactivation 60 j · granularité ~5 min
4. → secrets/variables injectés à l'étape câblage (pas ici)
```
**Séquence `provisioner-db-migrations`** = la branche BDD ci-dessus **sans l'étape 5 (config Auth)** : migrations seules → tables + RPC idempotence, service-role, **aucun** `PATCH .../config/auth`.

## Matrice de repli — MCP indisponible → quoi faire
Un provider peut ne pas être connecté (config partielle). Règle : **repli honnête** (`safety-rails.md` §6), jamais de simulation.

| MCP/API manquant | Bloquant pour... | Repli |
|---|---|---|
| GitHub | repo + CI (cœur) | STOP provisioning distant, scaffold local seul, guide dans `api-keys-guide.md` |
| Supabase | BDD (cœur) | idem — pas de BDD = pas de build utile, guide + invite `infra-setup` |
| Cloudflare | DNS/sous-domaine | host sur l'URL par défaut du provider, `[SÉCU]` domaine manquant, non-bloquant |
| Vercel | hébergement | tenter alt (CF Pages / Coolify selon `stack-defaults.md`) ; sinon guide |
| Resend | email transactionnel **+ confirmation de compte** (SMTP de Supabase Auth) | **non-bloquant** : transactionnel logué/désactivé, à câbler en Phase 4/5 ; la **confirmation de compte retombe sur le SMTP intégré Supabase** (rate-limité) → **dégradée, pas coupée**. Câbler Resend rétablit le SMTP custom (lève la limite). |
| Stripe | billing | non-applicable si `billing ≠ stripe` ; sinon non-bloquant (mode test plus tard) |
| Clé Google (Nano Banana, visuels) | génération d'images par projet | non-applicable si `visuals ≠ "nano-banana"` ; `"none"`/absent → génération d'images **désactivée** (repli honnête §6, pas de visuels fantômes) ; `"nano-banana"` sans clé Google (LLM non-Google, ex. GPT-4o → clé LLM ne couvre pas Nano Banana) → retomber sur `"none"` + guide. **Non-bloquant** |

**Cœur vs périphérie** : repo + BDD sont **cœur** (leur absence arrête le provisioning distant → fallback). DNS/email/billing/visuels sont **périphériques** (on continue, on loge ; le **run** sort `DONE_WITH_CONCERNS` — définition canonique : `provisioning-plan.md` §machine à états).

## Modes d'échec MCP + traitement

| Mode | Symptôme | Traitement |
|---|---|---|
| `confirm_cost` oublié | `create_project` refusé | toujours confirmer avant (auto, autorisation durable) |
| Token scope insuffisant | 403 sur create/env | repli honnête, loguer le scope manquant, ne pas bricoler un contournement |
| Rate limit provider | 429 | backoff borné (1 retry), puis `FAILED` non silencieux |
| DNS pas encore propagé | domaine ne résout pas à la vérif | attente bornée, sinon ressource `DONE` + `concerns` → run `DONE_WITH_CONCERNS` (propagation ≠ échec de création) |
| Intégration GitHub↔Vercel absente | link repo refusé/impossible (app GitHub non installée côté Vercel) | **sonde avant le link** ; repli **deploy-hook + step CI** (deploy sur push conservé), `concerns` logué — pas de `FAILED` |
| WAF devant le domaine | `403` / erreur `1010` / page challenge sur la sonde HTTP (Cloudflare) | **signal WAF, pas un échec** : vérifier l'état réel via l'**API du host** (statut du dernier deploy) ; deploy vert → loguer le WAF en `concerns` — **jamais de faux `FAILED`** |
| MCP hallucine une API | appel inexistant | consulter les skills de compétence (`reference-skills.md`) avant tout SQL/DNS |
