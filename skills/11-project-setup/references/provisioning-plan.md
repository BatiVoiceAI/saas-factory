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
1. **Scaffold local** — séquentiel, en premier (tout en dépend).
2. **repo · db · email** — **parallélisables** → dispatche les 3 sous-agents **en un seul message**. `email` vérifie **une seule fois** le domaine d'envoi générique `mail.<domain>` (réutilisé ensuite par tous les projets, sans re-vérif).
   - **Supabase Auth (SMTP custom = Resend)** — **après les migrations BDD** (db `DONE`), config via l'**API Management** : SMTP Resend, confirmations, `site_url`/redirections (cf. § *Email & Auth*). Lève la limite d'email du SMTP intégré Supabase → **aucun upgrade payant**. Non-bloquant pour hosting.
3. **hosting** — après **repo+db** seulement (email non-bloquant ; relie le repo, câble l'env).
4. **secrets** — après hosting (injecte les creds de chaque ressource).
5. **billing** (si activé) + **vérif finale**.

## Email & Auth — un seul domaine générique, deux flux câblés ensemble
Toute la factory partage **un seul domaine d'envoi générique** (jamais un domaine par projet) : sous-domaine **`mail.<domain>`** (ex. `mail.fluentspeech.com`, sous-domaine et non l'apex, pour protéger la réputation) ; expéditeur par défaut **`EMAIL_FROM = noreply@<domain>`** (ex. `noreply@fluentspeech.com` ; le nom d'affichage peut être le nom du projet, le domaine reste générique). *(`<domain>` = `<domaine>` = `config.domain`.)* Les **deux flux** partent du **même** domaine, via le **même** compte Resend :
- **Confirmation de compte** (vérif email à l'inscription) = **Supabase Auth** avec **SMTP custom = Resend**.
- **Transactionnel** (welcome, rappels, confirmation de RDV) = bloc notifications / `lib/email`, **API Resend**.

Ordre exact (câblés « ensemble ») :
- **(a) Domaine d'envoi — vérifié UNE SEULE FOIS.** `provisioner-email` vérifie `mail.<domain>` dans Resend (records SPF/DKIM/DMARC + return-path posés via le MCP Cloudflare, que le provisioning DNS gère déjà). **Sonde d'idempotence** : si `mail.<domain>` est **déjà vérifié** → **réutilisé tel quel** par chaque nouveau projet, **pas de re-vérification**.
- **(b) Supabase Auth — après les migrations BDD.** Une fois la BDD `DONE`, configurer Auth via l'**API Management Supabase** (`PATCH https://api.supabase.com/v1/projects/{ref}/config/auth`, header `Authorization: Bearer $SUPABASE_ACCESS_TOKEN`) : `smtp_host=smtp.resend.com`, `smtp_port` (465 SSL / 587 STARTTLS), `smtp_user=resend`, `smtp_pass=$RESEND_API_KEY`, `smtp_sender_name` (nom du projet), `smtp_admin_email=noreply@<domain>`, `site_url` + `uri_allow_list` (ex. `https://<slug>.<domaine>/auth/callback`, **déterministe** depuis la config — pas besoin d'attendre hosting), et `mailer_autoconfirm` (**`false`** = confirmation email requise, projet public ; **`true`** = dev/perso, auto-confirmé sans email). **Self-host** (GoTrue) : mêmes réglages via variables d'env de l'instance (`GOTRUE_SMTP_HOST/PORT/USER/PASS/SENDER_NAME/ADMIN_EMAIL`, `GOTRUE_MAILER_AUTOCONFIRM`, `GOTRUE_SITE_URL`, `GOTRUE_URI_ALLOW_LIST`). **Idempotent** : lire la config Auth actuelle, ne patcher que si différente.
- **(c) Les deux flux sur le même domaine générique.** Confirmation (Auth SMTP) **et** transactionnel (API Resend) partent de `mail.<domain>` / `noreply@<domain>`, même compte Resend — câblés dans le même run, pas de domaine par projet.

**Secrets** : `RESEND_API_KEY` et `SUPABASE_ACCESS_TOKEN` restent en `.env` (chmod 600) — jamais en chat, log, ni fichier `status/`. `EMAIL_FROM` et le domaine d'envoi **ne sont pas** des secrets.

## Routage par provider (managed vs self-host)
Le plan **route par provider** pour chaque ressource **forkée** (repo, BDD, hébergement) : le provisioner lit `~/.saas-factory/config.json` (**profil** + **provider**) et choisit sa branche.
- **managed** → **MCP officiel** (GitHub · Supabase cloud · Vercel), connecté par `infra-setup`.
- **self-host** → **API HTTP de l'instance** via `Bash`/curl, URL + token lus dans `~/.saas-factory/.env` (Gitea/Forgejo · Supabase self-hosted · Coolify).

Les ressources **provider-only** (DNS=Cloudflare, email=Resend/Postmark, paiement=Stripe) n'ont **pas** de branche self-host — mêmes appels quel que soit le profil.

**Les séquences d'appels diffèrent, les INVARIANTS sont identiques** : sonde d'idempotence → créer/UPSERT → loguer, rollback, repli honnête. La machine à états, les dépendances et les statuts ci-dessous s'appliquent **à l'identique** aux deux branches — seul le sous-agent change d'API.

> **Exemple (BDD).** *managed cloud* = `confirm_cost` → `create_project` → migrations (tables + RLS). *self-host* (instance Supabase **déjà existante**) = **PAS** de `create_project` → **migrations seules** appliquées sur l'instance via API/`psql`, `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` en `.env`. Même sonde d'idempotence, même log, même rollback — seule la séquence d'appels change.

## Chaque sous-agent reçoit (dans son prompt de délégation)
- La **config globale** (providers connectés, domaine, hébergeur) **+ la branche à emprunter** (managed vs self-host, lue dans `config.json`).
- Le **contexte projet** (nom, slug, + modèle de données pour la BDD).
- Pour **`provisioner-db`** (étape Auth) : le **type de projet** (`public` / `interne` / `perso`, lu dans `research/idea-brief.md`) qui pilote `mailer_autoconfirm` (**public ⇒ confirmation exigée** = `false` ; `interne`/`perso`/`mode:"local"` ⇒ `true` ; défaut prudent = `false`) ; l'**URL publique** `https://<slug>.<domain>` (déterministe : slug + domaine) ; **`EMAIL_FROM`** (`config.email_from`, défaut `noreply@<domain>`) + `smtp_sender_name` = nom du projet. Ces valeurs sont **déterministes** (constantes Resend + `config.json` + `.env`) — `provisioner-db` **ne dépend pas** de la sortie runtime de `provisioner-email` (dont le rôle est de **vérifier** le domaine d'envoi : contrainte d'**ordre** pour la délivrabilité, pas un canal de données).
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

> **`DONE_WITH_CONCERNS` n'est PAS un état de ressource.** Les seuls états d'une ressource (dans `status/provision-<resource>.md`) sont `PENDING | DONE | FAILED | ROLLED_BACK`. Une ressource créée mais avec réserve (ex. email ajouté mais pas encore vérifié, DNS en propagation) reste **`DONE`** avec un champ **`concerns`** non vide. `DONE_WITH_CONCERNS` est **strictement le verdict de sortie de l'étape 11** (niveau run) : il est posé par la vérif finale (`verification-checklist.md`) quand toutes les ressources **cœur** sont `DONE` mais qu'au moins une ressource **périphérique** est `FAILED` ou porte des `concerns`. Ne jamais écrire `DONE_WITH_CONCERNS` dans un fichier `status/` de ressource.

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
