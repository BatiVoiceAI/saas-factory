# Référence — Plan de provisioning (machine à états)

L'ordre, les dépendances et le parallélisme des ressources. Chaque nœud est **idempotent** (`idempotence-rollback.md`) et exécuté par un **sous-agent** dédié (contrats exacts dans `subagent-contracts.md`).

> **Config provider 100 % autonome (après `infra-setup`).** L'utilisateur a fourni comptes + clés **une seule fois** (`infra-setup`) ; ensuite le plugin fait **TOUTE** la config provider **sans intervention par projet** — y compris **Supabase Auth** : SMTP custom = Resend, confirmations d'inscription, `site_url` + URLs de redirection. Effet clé : le **SMTP custom lève la limite de débit** du SMTP intégré de Supabase → **aucun upgrade payant** requis. Zéro config manuelle demandée à l'utilisateur après `infra-setup`.

## Graphe de dépendances
```
scaffold local (git init + blocs + CLAUDE.md)
      │
      ├──> provisioner-repo    (GitHub + CI)               ┐ bloquants
      ├──> provisioner-db      (Supabase + migrations+RLS) ┘ pour hosting
      │                                     (les 3 en parallèle)
      └──> provisioner-email   (Resend ; publie ses propres records DNS
                                SPF/DKIM/DMARC + return-path via Cloudflare)  ── NON-bloquant
                        │
                        ▼
      provisioner-hosting (record de routage <slug>.<domaine> + host + lie le repo)
                        │  (dépend de repo + db SEULEMENT ; email non-bloquant)
                        ▼
      câblage secrets (GitHub Actions + env host)
                        ▼
      billing optionnel (Stripe) + vérif finale
```
> **Pas de dépendance circulaire.** `provisioner-email` publie **ses propres** records de vérification (DKIM/SPF/DMARC/MX) en appelant **directement le MCP Cloudflare** — records **distincts** du record de routage `<slug>.<domaine>` que possède `provisioner-hosting`. L'email n'attend donc **pas** hosting, et hosting n'attend **pas** l'email.

## Ordre & parallélisme
1. **Scaffold local** — séquentiel, en premier (tout en dépend). **🚨 Config git du repo AVANT tout commit** : dès le `git init` (et avant le commit #1), poser la config git **locale** du repo projet depuis `config.git_author` — `git config user.email = git_author.email` et `git config user.name = git_author.name` (identité **non-secrète choisie à `infra-setup`**, comme `email_from`, jamais devinée en cours de run). **Invariant `git_author` scopé à `hosting = vercel`** : c'est **uniquement** quand l'hébergeur est **Vercel** que le git author DOIT être **membre de la team Vercel**, sinon le déploiement (étape 17, `provisioner-hosting` puis push prod) est refusé **`readyState = BLOCKED`** (« Git author `<email>` must have access to the team `<team>` on Vercel to create deployments ») — **blocage silencieux**, pas une erreur de build (`tsc`/`next build` verts, deploy juste refusé). Pour **tout autre host** (Coolify self-host, Cloudflare Pages) **et pour l'archétype `automation`** (host = ordonnanceur GitHub Actions, pas Vercel — cf. §« Chemin de provisioning AUTOMATION »), la config git author reste une **hygiène d'authorship** (commits attribués à une identité stable) mais **n'est PAS une porte de déploiement** : aucun `readyState = BLOCKED` possible hors Vercel. Champ + invariant complet : `infra-setup/references/config-schema.md §git_author`.
2. **repo · db · email** — **parallélisables** → dispatche les 3 sous-agents **en un seul message**. `email` vérifie **une seule fois** le domaine d'envoi générique (= **le domaine de `email_from`**, réutilisé ensuite par tous les projets, sans re-vérif).
   - **Supabase Auth (SMTP custom = Resend)** — **après les migrations BDD** (db `DONE`), config via l'**API Management** : SMTP Resend, confirmations, `site_url`/redirections (cf. § *Email & Auth*). Lève la limite d'email du SMTP intégré Supabase → **aucun upgrade payant**. Non-bloquant pour hosting.
3. **hosting** — après **repo+db** seulement (email non-bloquant ; relie le repo, câble l'env).
4. **secrets** — après hosting (injecte les creds de chaque ressource).
5. **billing** (si activé) + **vérif finale**.

## Email & Auth — un seul domaine générique, deux flux câblés ensemble
Toute la factory partage **un seul domaine d'envoi générique** (jamais un domaine par projet) : l'**adresse d'expédition est choisie à `infra-setup`** (`config.email_from`, ex. `noreply@fluentspeech.com` ; le nom d'affichage peut être le nom du projet, le domaine reste générique). **⚠️ Invariant : le domaine vérifié dans Resend = le domaine de `email_from`** (partie après `@`) — From sur l'apex ⇒ vérifie l'apex ; From sur `mail.<domain>` ⇒ vérifie `mail.<domain>`. **Jamais** From apex + vérif sous-domaine : Resend **refuse d'envoyer depuis un domaine non vérifié** → **HTTP 500 « Error sending confirmation email »** (un From sur sous-domaine, s'il est choisi, protège la réputation de l'apex). **Resend gratuit = 1 SEUL domaine** : changer l'adresse d'envoi = **remplacer** le domaine (delete + add + re-DNS), **jamais empiler** (sinon 403 « plan includes 1 domain »). *(`<domain>` = `<domaine>` = `config.domain`.)* Les **deux flux** partent du **même** domaine, via le **même** compte Resend :
- **Confirmation de compte** (vérif email à l'inscription) = **Supabase Auth** avec **SMTP custom = Resend**.
- **Transactionnel** (welcome, rappels, confirmation de RDV) = bloc notifications / `lib/email`, **API Resend**.

Ordre exact (câblés « ensemble ») :
- **(a) Domaine d'envoi — vérifié UNE SEULE FOIS.** `provisioner-email` vérifie **le domaine de `email_from`** dans Resend (records SPF/DKIM/DMARC + return-path posés via le MCP Cloudflare, que le provisioning DNS gère déjà). **Sonde d'idempotence** : ce domaine **déjà vérifié** → **réutilisé tel quel** par chaque nouveau projet, **pas de re-vérification**. **Resend gratuit = 1 domaine** : si un domaine **différent** est déjà présent (adresse changée à `infra-setup`), **REMPLACER** (delete l'ancien + add le domaine cible + re-poser ses DNS via Cloudflare) au lieu d'échouer sur le 403 « plan includes 1 domain » — **jamais empiler**.
- **(b) Supabase Auth — après les migrations BDD.** Une fois la BDD `DONE`, configurer Auth via l'**API Management Supabase** (`PATCH https://api.supabase.com/v1/projects/{ref}/config/auth`, header `Authorization: Bearer $SUPABASE_ACCESS_TOKEN`) : `smtp_host=smtp.resend.com`, **`smtp_port='587'`** (CHAÎNE — un entier vide tout le bloc SMTP), `smtp_user=resend`, `smtp_pass=$RESEND_API_KEY`, `smtp_sender_name` (nom du projet), **`smtp_admin_email=$EMAIL_FROM`** (`config.email_from`, **sur le domaine vérifié** — invariant From = domaine vérifié), **bloc SMTP posé COMPLET en un coup** (un PATCH smtp partiel vide les autres champs → 500), **`rate_limit_email_sent`~30 + `smtp_max_frequency`~15s desserrés** (défaut 2/h bloque l'utilisateur), `mailer_otp_exp=600`, **`mailer_otp_length=6`** (⚠️ défaut Supabase = 8 ; DOIT = le nb de cases de l'input OTP du châssis, sinon la vérif échoue pour tous), **politique de mot de passe** `password_min_length=8` + `password_required_characters` (au moins lettres + chiffres — flux **OTP → mot de passe**, cf. `agents/provisioner-db.md`), **templates d'OTP CODE SEUL** (`{{ .Token }}` **sans** `{{ .ConfirmationURL }}` — **magic link supprimé**, décision produit Felix), `site_url` + `uri_allow_list` (ex. `https://<slug>.<domaine>/auth/callback`, **déterministe** depuis la config — pas besoin d'attendre hosting ; conservé pour un futur OAuth, plus aucun magic link n'y aboutit), et `mailer_autoconfirm` (**`false`** = confirmation email requise via OTP, projet public ; **`true`** = dev/perso, auto-confirmé sans email). *(Détail des 4 gotchas SMTP + templates code-seul : `agents/provisioner-db.md` étape Auth — source unique.)* **Self-host** (GoTrue) : mêmes réglages via variables d'env de l'instance (`GOTRUE_SMTP_HOST/PORT/USER/PASS/SENDER_NAME/ADMIN_EMAIL`, `GOTRUE_SMTP_MAX_FREQUENCY`~15s + `GOTRUE_RATE_LIMIT_EMAIL_SENT`~30, `GOTRUE_PASSWORD_MIN_LENGTH`/`GOTRUE_PASSWORD_REQUIRED_CHARACTERS`, `GOTRUE_MAILER_AUTOCONFIRM`, `GOTRUE_SITE_URL`, `GOTRUE_URI_ALLOW_LIST`). **Idempotent** : lire la config Auth actuelle, ne patcher que si différente (**sauf le bloc SMTP, indivisible** : un champ diffère ⇒ repose le bloc entier).
- **(c) Les deux flux sur le même domaine générique.** Confirmation (Auth SMTP) **et** transactionnel (API Resend) partent de la **même adresse `email_from`** / du **même domaine vérifié**, même compte Resend — câblés dans le même run, pas de domaine par projet.

### Enrollment par type — l'autorité du « déploiement privé », posée ICI
Le refus des comptes anonymes est **authoritative côté Supabase** (pas seulement côté app : le châssis, bloc `auth` + `access-gate`, n'est que la **cohérence + défense en profondeur**). `provisioner-db` applique, selon le `type` (matrice §« Routage par type de produit » — **source unique** du QUOI ; ici le COMMENT opératoire) :

- **`public`** : `disable_signup = false` (signup ouvert). Rien à restreindre.
- **`interne`** : `disable_signup = true` (`PATCH .../config/auth`, API Management) — c'est LE refus qui fait foi. Puis, selon la stratégie retenue (idea-brief) :
  - **invitations** (défaut) : `auth.admin.inviteUserByEmail` (`POST .../auth/v1/admin/invite`) pour le **sponsor + chaque utilisateur listé** ; les invitations partent via le SMTP Auth (Resend) déjà câblé en (b) ;
  - **allowlist de domaine** : garder `disable_signup = false` **mais** poser `AUTH_ALLOWED_EMAIL_DOMAINS` en **env host** (l'app filtre à l'enrollment) ; durcissement optionnel = auth hook « before user created » refusant les domaines hors liste.
- **`perso`** : `disable_signup = true` + **compte unique seedé** — `auth.admin.createUser` (`POST .../auth/v1/admin/users`, e-mail du fondateur, `email_confirm: true`) ; aucune page ni flux de signup (le châssis 404 `/signup`).

Le châssis lit **`APP_ACCESS_MODE`** (`public|interne|perso`) et, en mode domaine, **`AUTH_ALLOWED_EMAIL_DOMAINS`** depuis l'**env host** — posés au câblage env depuis le `type`, pour aligner l'app sur le réglage Supabase. **Self-host** (GoTrue) : `GOTRUE_DISABLE_SIGNUP=true`, invitations/seed via l'API admin de l'instance. **Idempotent** : lire la config Auth + `list users` avant de poser (ne pas ré-inviter, ne pas re-seeder). **Chaque réglage d'enrollment = une ligne loguée** dans `tech/provisioning-log.md` (« enrollment type=`<type>` : `disable_signup=true` + N invitations » / « compte seedé `<founder>` ») — jamais silencieux.

**Secrets** : `RESEND_API_KEY` et `SUPABASE_ACCESS_TOKEN` restent en `.env` (chmod 600) — jamais en chat, log, ni fichier `status/`. `EMAIL_FROM`, le domaine d'envoi, `APP_ACCESS_MODE` et `AUTH_ALLOWED_EMAIL_DOMAINS` **ne sont pas** des secrets.

## Routage par provider (managed vs self-host)
Le plan **route par provider** pour chaque ressource **forkée** (repo, BDD, hébergement) : le provisioner lit `~/.saas-factory/config.json` (**profil** + **provider**) et choisit sa branche.
- **managed** → **MCP officiel** (GitHub · Supabase cloud · Vercel), connecté par `infra-setup`.
- **self-host** → **API HTTP de l'instance** via `Bash`/curl, URL + token lus dans `~/.saas-factory/.env` (Gitea/Forgejo · Supabase self-hosted · Coolify).

Les ressources **provider-only** (DNS=Cloudflare, email=Resend/Postmark, paiement=Stripe) n'ont **pas** de branche self-host — mêmes appels quel que soit le profil.

**Les séquences d'appels diffèrent, les INVARIANTS sont identiques** : sonde d'idempotence → créer/UPSERT → loguer, rollback, repli honnête. La machine à états, les dépendances et les statuts ci-dessous s'appliquent **à l'identique** aux deux branches — seul le sous-agent change d'API.

> **Exemple (BDD).** *managed cloud* = `confirm_cost` → `create_project` → migrations (tables + RLS). *self-host* (instance Supabase **déjà existante**) = **PAS** de `create_project` → **migrations seules** appliquées sur l'instance via API/`psql`, `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` en `.env`. Même sonde d'idempotence, même log, même rollback — seule la séquence d'appels change.

## Routage par type de produit (public / interne / perso)
Le **`type`** du projet (lu dans `research/idea-brief.md` ; défaut prudent = `public`) module le provisioning. Le skip-set étape × type (quelles étapes s'exécutent) vit dans la table canonique `skills/saas-factory/references/routing.md` — ici, uniquement le **détail provisioning**. Cette matrice est la **seule source** de l'étape 11 : les contrats (`subagent-contracts.md`) et la carte MCP (`mcp-map.md`) y **renvoient** sans la dupliquer.

| Réglage | `public` | `interne` | `perso` |
|---|---|---|---|
| DNS / URL | sous-domaine public `<slug>.<domaine>` (Cloudflare) | sous-domaine **optionnel selon config** : `config.domain` présent → `<slug>.<domaine>` ; sinon URL par défaut du provider | **URL par défaut du provider** (ex. `<slug>.vercel.app`) — **PAS de record DNS public** : `provisioner-hosting` saute l'appel Cloudflare |
| Signup / comptes | signup ouvert + confirmation email (`mailer_autoconfirm=false`) | **signup désactivé** (`disable_signup=true`) + **invitations** (`auth.admin.inviteUserByEmail` : sponsor + utilisateurs listés) | **compte unique seedé au provisioning** (`provisioner-db` crée le compte du fondateur via l'API admin) ; page signup absente |
| Indexation | indexable (SEO = étape 16) | **noindex** (`X-Robots-Tag: noindex` — bloc access-gate sélectionné par l'étape 9 quand type ≠ public) | **noindex** (idem) |
| Email | complet : confirmation + transactionnel | câblé (les invitations partent via le SMTP Auth) ; transactionnel selon le PRD | allégé : `mailer_autoconfirm=true` ; transactionnel seulement si le produit en a besoin |
| Billing | si le projet vend (`providers.billing = stripe`) | sauté (rien n'est vendu) | sauté |

> **Allègements LOGUÉS, jamais silencieux.** Chaque réglage allégé ou appel sauté par cette matrice = **une ligne dans `tech/provisioning-log.md`** (« allègement type=`<type>` : `<réglage>` — `<raison>` »). « Déploiement interne ≠ déploiement bâclé » : l'allègement est un choix **tracé**, pas une omission — la vérif finale (`verification-checklist.md`) refuse un allègement non logué.

## Chemin de provisioning AUTOMATION (archétype headless — worker / cron / bot / intégration)
> **Conditionné par `archetype = automation`** (`.saas-factory/state.md`, source : `_shared/state-schema.md`). Pour `web-saas` (défaut), rien de cette section ne s'applique — le graphe ci-dessus reste tel quel. Ne s'active **que** sur automation.

Pour une automation headless, la matrice web-saas (repo + db+Auth + email-domaine + hosting Vercel + DNS Cloudflare + billing) est **inadaptée** : il n'y a **ni surface publique, ni auth utilisateur, ni domaine d'envoi produit, ni app hébergée**. Le graphe se **restreint** et **change de host**.

### L'ordonnanceur EST le host
Le « host » d'une automation cron **n'est pas** un hébergeur web : c'est son **ordonnanceur**. La cible par défaut de la factory est **GitHub Actions `schedule:`** — le **même repo-CI, élargi** : un seul `.github/workflows/<slug>.yml` qui est **à la fois la CI (build) et le scheduler**. Il porte :
- **2 modes cron** (au minimum) : un cron **`sync`** (cadence courte, ex. `0 */6 * * *`) + un cron **`digest`** (rapport périodique, ex. `0 6 * * *`), le mode étant dérivé du `schedule` déclencheur ; **`workflow_dispatch`** pour le rejeu manuel / smoke-test (remplace la recette live authentifiée 17b en automation) ;
- `concurrency` mono-groupe (`cancel-in-progress: false`) → renforce l'idempotence mono-instance ;
- `permissions: contents: read` (le workflow ne pousse rien).

> **Alternatives d'ordonnanceur** (si GitHub Actions ne convient pas — quota, latence, cron < 5 min) : **cron système** (crontab/systemd-timer sur une VM), **conteneur** long-running (`node dist/index.js` en boucle / sidecar cron), **Cloud Scheduler** (GCP) → Cloud Run job. Le choix se **loge** dans `tech/provisioning-log.md`. La contrainte d'**état durable** ci-dessous s'applique à **toute cible à runner éphémère**, pas seulement GitHub Actions.

### 🚨 RÈGLE DURE — état durable sur runner éphémère
> **Le fallback fichier (`.automation/*.json`) est valide UNIQUEMENT sur disque persistant OU en test local one-shot. Toute cible à RUNNER ÉPHÉMÈRE (GitHub Actions / Cloud Scheduler / Cloud Run job / CI) efface le disque à chaque tick ⇒ l'état repart de zéro ⇒ l'idempotence (run ET entité) est CASSÉE. Sur runner éphémère, une base durable (Supabase) est OBLIGATOIRE — pas optionnelle.**

Cette contrainte **conditionne la reco de déploiement** : si l'ordonnanceur retenu est éphémère (le cas de GitHub Actions), le provisioning **exige** une BDD durable et **refuse** un solde « Supabase optionnel / fallback fichier suffit ». Le fallback fichier n'est un défaut acceptable que pour le **test local** (un run one-shot sur la machine de dev) ou une **VM à disque persistant**. Le châssis présente ailleurs le fallback fichier comme universel ; **ici, pour l'archétype automation à runner éphémère, il ne l'est pas** (leçon transférable §D-3 de la rétro StockSentinel).

### Graphe de dépendances (automation)
```
scaffold local (git init + bloc automation + CLAUDE.md)
      │
      ├──> provisioner-repo-scheduler   (GitHub repo + workflow schedule: = CI *et* host)  ┐ cœur
      └──> provisioner-db-migrations    (Supabase : migrations SEULES, PAS d'Auth/SMTP)    ┘ cœur
                        │
                        ▼
      câblage secrets (GitHub Actions Secrets + Variables ; + secrets d'INTÉGRATION source/cible)
                        ▼
                 vérif finale (scheduler présent · run one-shot journalisé/notifié · RLS 0 policy tenant)
```

### Ce qui est RETIRÉ (tracé, jamais silencieux)
Chaque retrait = **une ligne dans `tech/provisioning-log.md`** (« retrait automation : `<ressource>` — `<raison>` »), comme un allègement de type :

| Ressource web-saas | Statut en automation | Raison |
|---|---|---|
| **hosting-web** (Vercel / CF Pages / Coolify) | **RETIRÉ** — remplacé par l'**ordonnanceur** (GitHub Actions `schedule:`) | pas d'app web hébergée ; le host = le scheduler |
| **DNS public** (Cloudflare `<slug>.<domaine>`) | **RETIRÉ** (sauf si endpoint webhook entrant requis) | headless, aucune surface publique à router |
| **email-domaine** (vérif domaine Resend + SPF/DKIM/DMARC) | **RETIRÉ** | pas d'email produit/transactionnel utilisateur ni de confirmation de compte ; la **boucle fermée** notifie le *propriétaire* via l'API Resend directe (clé en secret), **sans domaine vérifié à provisionner** |
| **Supabase Auth / SMTP custom** (confirmations, OTP, `site_url`, `mailer_*`) | **RETIRÉ** | pas d'auth utilisateur ; accès BDD **service-role only** |
| **billing** (Stripe) | **RETIRÉ** | rien n'est vendu (automation le plus souvent interne) |
| **`git_author` = porte de déploiement** | **RETIRÉ comme porte** (hygiène d'authorship conservée) | host ≠ Vercel → aucun `readyState = BLOCKED` (cf. §Ordre step 1) |

### db = migrations SEULES (service-role, sans Auth)
`provisioner-db-migrations` applique **les migrations du modèle de données (étape 9)** — tables du **store de runs** + **entités métier** + fonctions/RPC d'idempotence (unique partielle sur clé d'identité + upsert RPC **lesson #15 42702-safe**, RLS **RETURNING-safe**). Il **ne configure PAS** Auth/SMTP (pas de `PATCH .../config/auth`, pas d'enrollment, pas de `mailer_*`). L'accès est **service-role only** : le worker lit/écrit via `SUPABASE_SERVICE_ROLE_KEY`, qui **bypass RLS**. Donc **0 policy tenant** attendue (pas de `anon`, pas de JWT utilisateur) : RLS peut rester **activée sans policy** (deny-all par défaut, service_role bypass) — c'est la **sonde de vérif** « RLS 0 policy » (l'inverse du web-saas qui *exige* des policies). Détail data-model automation : `skills/09-architecture/references/data-model.md` §automation (hors périmètre de cette étape — on le lit, on ne le redéfinit pas).

### secrets automation → 3 slots (détail : `secrets-wiring.md`)
- **GitHub Actions Secrets** (masqués) : valeurs **sensibles** — `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` (notif boucle fermée), `WEBHOOK_URL`/`CRON_SECRET` éventuels, **+ secrets d'INTÉGRATION source/cible**.
- **GitHub Actions Variables** (lisibles) : config **non-sensible** — `SUPABASE_URL`, `OWNER_EMAIL`, `EMAIL_FROM`, `SYNC_INTERVAL_HOURS`, `DIGEST_HOUR`, seuils métier, `IDEMPOTENCY_WINDOW_SEC`. `RUN_MODE` est **dérivé du cron** dans le workflow, **jamais** un secret.
- **Slot « secrets d'INTÉGRATION source/cible »** (spécifique automation) : les tokens des **systèmes que l'automation lit/écrit** (ex. `SHOP_API_TOKEN` d'une boutique, clé d'API d'un CRM, token d'un feed fournisseur). Web-saas n'a pas ce slot ; une automation en a **toujours au moins un** (elle *intègre* deux systèmes). Oublier ce slot = worker qui ne peut ni lire la source ni écrire la cible.

### Matrice de routage au démarrage — surcharge automation
En plus de la matrice web-saas ci-dessus, `archetype = automation` **remplace** les branches hosting/email/billing par :

| Condition | Action |
|---|---|
| `archetype = automation` | dispatch **repo-scheduler + db-migrations** seulement ; **ne dispatche ni** `provisioner-hosting`, `provisioner-email`, ni billing (retraits tracés) |
| ordonnanceur = GitHub Actions (défaut) ET `SUPABASE_URL` absent | **BLOQUANT** : runner éphémère sans base durable → I1 cassé. Refuser le solde ; exiger la BDD (règle dure ci-dessus), guide `infra-setup`. **Jamais** de « fallback fichier suffit » sur runner éphémère. |
| cible = disque persistant (VM cron système) OU test local one-shot | fallback fichier `.automation/*.json` accepté comme défaut ; Supabase recommandé mais non bloquant |
| endpoint webhook entrant requis (bot/intégration push) | ré-activer un chemin DNS/host **minimal** pour ce seul endpoint, logué `[SÉCU]` ; le cron reste le host principal |

## Chaque sous-agent reçoit (dans son prompt de délégation)
- La **config globale** (providers connectés, domaine, hébergeur) **+ la branche à emprunter** (managed vs self-host, lue dans `config.json`).
- Le **contexte projet** (nom, slug, + modèle de données pour la BDD).
- Pour **`provisioner-db`** (étape Auth) : le **type de projet** (`public` / `interne` / `perso`, lu dans `research/idea-brief.md`) qui pilote `mailer_autoconfirm` (**public ⇒ confirmation exigée** = `false` ; `interne`/`perso`/`mode:"local"` ⇒ `true` ; défaut prudent = `false`) **et l'enrollment** (`interne` : signup désactivé + invitations ; `perso` : compte unique seedé — matrice §« Routage par type de produit », allègements logués) ; l'**URL publique** `https://<slug>.<domain>` (déterministe : slug + domaine) ; **`EMAIL_FROM`** (`config.email_from`, **adresse choisie à `infra-setup`**, sur le domaine vérifié) + `smtp_sender_name` = nom du projet. Ces valeurs sont **déterministes** (constantes Resend + `config.json` + `.env`) — `provisioner-db` **ne dépend pas** de la sortie runtime de `provisioner-email` (dont le rôle est de **vérifier** le domaine d'envoi : contrainte d'**ordre** pour la délivrabilité, pas un canal de données).
- Sa **consigne d'idempotence** (détecter l'existant, ne pas doubler).
- Son **fichier de statut** `status/provision-<resource>.md`.
- Pour la branche self-host : **l'URL d'instance + le token** (`.env`) à appeler via `Bash`/curl (jamais en chat, jamais dans le status/).

> Le gabarit exact de chaque prompt de délégation (Objectif / Idempotence / DoD / Rollback / Red-flags / format du statut) vit dans `subagent-contracts.md`. Ne dispatche jamais un provisioner sans le contrat correspondant.

## Reprise
Au démarrage, lis les `status/provision-*.md` existants : une ressource `DONE` n'est pas re-provisionnée ; un run interrompu reprend à la première ressource non-`DONE`. Zéro re-demande à l'utilisateur.

---

## Machine à états par ressource
Chaque ressource traverse la même machine. L'orchestrateur ne « croit » jamais un sous-agent sur parole : il relit le fichier de statut et vérifie l'artefact réel.

```
        ┌─────────┐  dispatch   ┌──────────┐  provision OK   ┌──────┐
        │ ABSENT  │────────────>│ PENDING  │────────────────>│ DONE │
        └─────────┘             └──────────┘                 └──────┘
             ▲                    │     │                        │
   reprise   │            existant│     │échec                   │vérif finale
  (status    │            détecté │     ▼                        ▼
   DONE lu)  │                 ┌──┘  ┌────────┐  rollback   ┌──────────┐
             └─────────────────┘     │ FAILED │───────────> │ROLLED_BK │
                                     └────────┘  irréparable └──────────┘
                                          │  réparable (re-jouable)
                                          └──> retour PENDING (1 seule retry auto)
```

États écrits dans `status/provision-<resource>.md` :

| État | Signification | Action orchestrateur |
|---|---|---|
| `ABSENT` | pas encore de fichier de statut | dispatcher le sous-agent |
| `PENDING` | sous-agent en cours ou interrompu | attendre / reprendre |
| `DONE` | ressource créée + vérifiée + identifiants logués (peut porter un champ `concerns` non vide) | sauter à la reprise |
| `FAILED` | échec, réparable en re-jouant | 1 retry auto, puis escalade |
| `ROLLED_BACK` | échec irréparable, ce que ce run a créé est défait | loguer, marquer **le run** (pas la ressource) `DONE_WITH_CONCERNS` |

**Budget de retry** : 1 seule reprise automatique par ressource (`_shared/safety-rails.md` §7). Au 2ᵉ échec → on ne boucle pas : `FAILED` + log + on continue les ressources indépendantes.

> **Définition canonique — `DONE_WITH_CONCERNS` n'est PAS un état de ressource.** Les seuls états d'une ressource (dans `status/provision-<resource>.md`) sont `PENDING | DONE | FAILED | ROLLED_BACK`. Une ressource créée mais avec réserve (ex. email ajouté mais pas encore vérifié, DNS en propagation) reste **`DONE`** avec un champ **`concerns`** non vide. `DONE_WITH_CONCERNS` est **strictement le verdict de sortie de l'étape 11** (niveau run) : il est posé par la vérif finale (`verification-checklist.md`) quand toutes les ressources **cœur** sont `DONE` mais qu'au moins une ressource **périphérique** est `FAILED` ou porte des `concerns`. Ne jamais écrire `DONE_WITH_CONCERNS` dans un fichier `status/` de ressource. **Cette définition vit ICI et nulle part ailleurs** — les autres fichiers de l'étape (contrats, vérif, secrets, mcp-map, idempotence) y font **renvoi** sans la redéfinir.

## Data-flow — qui produit quoi pour qui
```
tech/architecture.md ─┐
tech/execution-plan.md┤─> scaffold ─> repo local + CLAUDE.md
~/.saas-factory/*     ─┘                    │
                                            ▼
   modèle de données (arch) ──────> provisioner-db ──> ref Supabase + URL + clés
   slug + domaine (config)  ──────> provisioner-hosting ──> sous-domaine + host id
   org GitHub (config)      ──────> provisioner-repo ──> org/slug + repo URL
   clé Resend (~/.env)      ──────> provisioner-email ──> domaine vérifié
                                            │
   (toutes les sorties) ─────> câblage secrets ─────> GitHub Actions + env host
                                            │
                                            ▼
                          tech/provisioning-log.md + vérif finale
```

Le **produit de sortie** de chaque provisioner (ref, URL, id) est consommé par le câblage des secrets. Un provisioner qui ne loge pas ses identifiants dans son `status/` **bloque** le câblage → traité comme `FAILED`.

## Matrice de routage au démarrage
Condition lue au lancement de l'étape 11 → action.

| Condition | Action |
|---|---|
| `~/.saas-factory/config.json` absent | **fallback** : scaffold local seul + `tech/api-keys-guide.md` + invite `infra-setup`. Aucun provisioning réel. STOP après scaffold. |
| config présente, aucun `status/*` | run neuf : scaffold → dispatch complet |
| `status/*` présents, tous `DONE` | tout est fait → passer direct à la vérif finale |
| certains `DONE`, d'autres `ABSENT/PENDING` | reprendre aux non-`DONE`, respecter les dépendances (ne pas lancer hosting si repo **ou** db pas `DONE` ; email n'est jamais requis pour hosting) |
| un `FAILED` déjà présent d'un run précédent | 1 retry auto ; si re-échoue → la ressource **reste `FAILED`**, le **run** sortira `DONE_WITH_CONCERNS`, ne bloque pas les autres |
| `providers.billing ≠ stripe` | sauter l'étape billing (pas d'échec, non-applicable) |
| ressource forkée en **self-host** (provider = Gitea/Forgejo, Supabase self-hosted, Coolify) | router sur la **branche API self-host** (URL + token `.env`), **pas** le MCP officiel ; même machine à états |
| self-host : URL d'instance ou token absent de `.env` | **repli honnête** : ressource `FAILED`, raison précise (creds self-host manquants), guide `infra-setup` ; jamais de faux succès |
| domaine absent de la config | sauter le sous-domaine, host sur URL par défaut du provider, `[SÉCU]` dans le log |
| `type` = `interne` ou `perso` (idea-brief) | appliquer la matrice §« Routage par type de produit » (DNS, enrollment, email, billing) — **chaque allègement logué** dans `tech/provisioning-log.md` |

## Modes d'échec de l'orchestration (≠ échec d'une ressource)

| Mode | Symptôme | Traitement |
|---|---|---|
| Dépendance violée | hosting dispatché alors que db pas `DONE` | ne jamais dispatcher hors ordre ; hosting attend **repo+db** `DONE` (email non-bloquant, jamais attendu) |
| Sous-agent muet | pas de `status/` écrit après retour | traiter comme `FAILED`, ne pas supposer `DONE` |
| Faux `DONE` | statut `DONE` mais artefact absent (repo introuvable) | la vérif finale re-teste chaque ressource ; incohérence → `FAILED` |
| Parallélisme partiel | 2/3 provisioners OK, 1 `FAILED` | continuer hosting dès que **repo+db** sont `DONE` (email `FAILED` n'empêche rien) ; loguer le manquant ; **run** `DONE_WITH_CONCERNS` |
| Interruption en plein run | process coupé | reprise via `status/*` ; aucune re-demande utilisateur |

## Micro-exemple (niche-agnostique)
Projet `slug = quietinbox`, config présente, run interrompu après db.
```
status/provision-repo.md   → DONE   (org/quietinbox)
status/provision-db.md     → DONE   (ref: abcd1234)
status/provision-email.md  → FAILED (domaine non vérifié DNS)
status/provision-hosting.md→ ABSENT
```
Reprise : repo+db sautés. On retry `email` une fois. hosting ne dépend que de repo+db, qui sont `DONE` → **hosting démarre immédiatement**, sans attendre l'email (non-bloquant). Si `email` re-échoue, sa ressource **reste `FAILED`** et le manque est consigné dans son champ `concerns` ; le **run de l'étape 11** sortira alors `DONE_WITH_CONCERNS` (verdict niveau run, jamais écrit dans le `status/` de la ressource), à traiter en Phase 4/5.
