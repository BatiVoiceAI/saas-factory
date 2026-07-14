# Référence — Modes d'échec, sortie & Definition of Done du setup

Ce que fait `infra-setup` quand ça coince, et la passe finale qui décide de `setup_complete`. Principe cardinal : **repli honnête, jamais de bluff** (`_shared/safety-rails.md` §6). Un outil non connecté n'est **jamais** marqué `connected` — on loge le trou, on continue, l'étape 11 basculera en fallback pour lui.

## Catalogue de cas limites (par outil)

| Cas | Symptôme | Traitement |
|---|---|---|
| **OAuth annulé** | l'utilisateur ferme la fenêtre d'autorisation | ne pas marquer `connected` ; proposer de réessayer ou de sauter cet outil |
| **Scope refusé** | OAuth OK mais permission `repo`/`workflow` non accordée | sonde échoue → `"none"`, expliquer le scope manquant (`safety-rails.md` §3), inviter à re-consentir |
| **GitHub — PAT sans droit de création de repo** *(vu en run réel)* | la sonde **lecture** (`GET /user`) passe, mais la création de repo (étape 11) renvoie **`Resource not accessible by personal access token`**. Cause : PAT **fine-grained** `github_pat_…` sans Administration/Contents write, **ou** classic sans `repo`. **Faux « connecté »** que la sonde lecture-seule n'attrape pas | **Attraper à l'infra-setup** : sonde d'écriture = en-tête **`X-OAuth-Scopes`** doit contenir `repo` (`connection-procedure.md §1`). En-tête vide = fine-grained → **avertir**, ne pas marquer `connected` à l'aveugle. Exiger un **PAT _classic_ `repo`+`workflow`**. `repo` absent → `"none"` |
| **Cloudflare — token DNS en lecture seule** *(vu en run réel)* | les zones se **listent** (sonde lecture OK), mais la création d'un record DNS (étape 11) renvoie **`Authentication error`** (code `10000` / `9109`). Cause : grant/token **`DNS → Read`** au lieu de **`Edit`**. **Faux « connecté »** | **Attraper à l'infra-setup** : exiger **Zone → DNS → Edit** sur la zone (`connection-procedure.md §3`) ; sonde d'écriture = record TXT **jetable** créé/supprimé, **ou** avertissement assumé « lecture seule vérifiée, pas l'écriture ». `DNS → Read` ne suffit pas |
| **Resend — clé Sending-only** | l'envoi marcherait, mais la gestion de domaine (`GET /domains`, vérif domaine étape 11) renvoie **401 `restricted_api_key`** | exiger une clé **Full access** (`connection-procedure.md §5`) ; sonde = `GET /domains` **ne doit pas** renvoyer 401. 401 → **`"none"`** |
| **Vercel — `git_author.email` absent / non membre de la team** *(vu en run réel)* | build **vert** (`tsc`/`next build` OK) mais au **déploiement (étape 17)** Vercel renvoie **`readyState = BLOCKED`**, raison « Git author `<email>` must have access to the team `<team>` on Vercel to create deployments ». **Blocage SILENCIEUX** : pas une erreur de build, le déploiement est simplement **refusé**. Cause : l'**auteur du commit git** (email) — souvent le défaut deviné de la config git locale — n'est **pas membre de la team Vercel** du compte de déploiement | **Attraper à l'onboarding**, jamais deviner : capturer `config.git_author {name,email}` (identité NON-secrète CHOISIE, comme `email_from` — invariant complet : `config-schema.md §git_author`), **email = celui du compte GitHub qui est AUSSI membre de la team Vercel**, et **cross-check team au step 4** (Hébergement, `connection-procedure.md §4`) : l'email d'auteur ⊆ membres de la team Vercel connectée (proposer par défaut l'email du compte Vercel lisible via `GET /v2/user`, rester overridable). Injecté au **scaffold (étape 11)** comme config git du repo → commits déjà du bon auteur → déploiement non bloqué. **Parade de dernier recours** (correctif vécu) : ré-authorer le dernier commit `git commit --amend --reset-author` avec l'email membre, puis re-deploy |
| **Domaine non possédé** | domaine saisi absent des zones Cloudflare | → traitement complet (forcing, MOU/FORT) : `connection-procedure.md §3`. Ne pas recopier ici |
| **Aucune org Supabase** | l'utilisateur n'a pas d'organisation | → `connection-procedure.md §2` (inviter à créer une org gratuite, ne pas simuler) |
| **Clé/token collé en chat** | l'utilisateur poste un secret brut (préfixe `ghp_`, `github_pat_`, `sbp_`, `re_`, `sk-`, `xoxb-`… ou chaîne longue à haute entropie) dans la conversation | → **protocole `safety-rails.md` §4** : (a) stop, (b) ne PAS l'utiliser ni l'écrire, (c) prévenir qu'il est **compromis** + **rotation immédiate**, (d) rappeler le dépôt en `.env` — **sans jamais recopier la valeur**. Filet secondaire : le hook attrape aussi un secret glissé dans une commande Bash |
| **Placeholder dans `.env`** | `RESEND_API_KEY=changeme` / vide | traiter comme **absent** → `"none"`, ne pas marquer `connected` |
| **`.env` non protégé** | fichier créé sans chmod 600 | corriger les permissions (chmod 600) avant d'écrire quoi que ce soit |
| **Provisioning tenté ici** | on s'apprête à `create_project` / créer un repo | **interdit** — `infra-setup` connecte, ne provisionne pas (c'est l'étape 11) |
| **Config existante** | `config.json` déjà présent, `setup_complete:true` | ne pas écraser en aveugle : « déjà configuré. Reconfigurer / ajouter un outil / annuler ? » |
| **Connexion partielle** | socle incomplet (ex. pas de host) | marquer les trous `"none"`, prévenir de l'effet à l'étape 11 (`decision-matrices.md`) |
| **Coolify injoignable** | URL de l'instance ne répond pas | ne pas marquer `connected` ; vérifier l'URL/token, sinon repli sur Vercel/CF ou `"none"` |
| **Provider LLM sans clé** | l'utilisateur saute le LLM | `llm` absent → prévenir : features IA **texte** indispo jusqu'au dépôt de clé (non bloquant) |
| **Visuels sans clé Google** | `llm = "gpt-4o"` (non-Google) et **aucune clé Google déposée** | Nano Banana = modèle image **Google** → non couvert par la clé LLM. Déposer une clé Google → `visuals = "nano-banana"`, sinon `visuals = "none"` (fallback honnête, `safety-rails.md` §6). Ne **jamais** promettre des visuels sans clé Google |

## Forcing — marquer `connected` ou pas
- **Ask exact** : « la sonde a-t-elle prouvé l'accès en lecture **ET** la capacité d'écriture (ou, pour la méthode B, la variable est-elle présente/non-placeholder + le scope écriture confirmé) ? »
- **Push-until** : preuve obtenue (appel lecture OK **ou** variable réelle) **+ droit d'écriture prouvé** (scope GitHub `repo`, Cloudflare DNS:Edit, Resend Full access).
- **Red-flags — ne pas marquer `connected`** :
  - OAuth affiché mais aucune sonde lecture réussie.
  - variable présente mais vide/placeholder.
  - **accès lecture OK mais écriture NON prouvée** : `X-OAuth-Scopes` sans `repo` (ou vide = fine-grained non vérifié), token Cloudflare sans DNS:Edit, clé Resend Sending-only (401 sur `/domains`) → **`"none"`**, jamais `connected` (`connection-procedure.md §Scopes`). C'est le faux positif exact qui a fait échouer un run réel au provisioning.
  - scope insuffisant pour l'usage prévu (repo/workflow pour GitHub, DNS:Edit pour Cloudflare, etc.).
  - domaine non présent dans les zones du compte.
- **Routage** : preuve OK → `connected`/valeur écrite dans `config.json`. Pas de preuve → `"none"` + loguer le trou + expliquer l'effet.

## Definition of Done — `infra-setup` complet
**DoD canonique unique** du skill (la checklist par-outil de `connection-procedure.md` y renvoie — ne pas dupliquer).

### Prérequis (sinon l'étape ne va pas plus loin)
- [ ] Briefing consentement présenté **avant** toute collecte (`consent-briefing.md`).
- [ ] OK durable **informé** obtenu, **ou** SKIP explicitement acté.

### Sortie normale (`setup_complete: true`)
- [ ] Au moins le **socle** tenté (GitHub, Supabase, Cloudflare + domaine, Hébergement), un par un.
- [ ] Chaque `connected` **prouvé** par sa sonde (appel MCP/API en lecture OK, ou variable présente/non-placeholder) ; aucun `connected` fantôme.
- [ ] Pour le **socle**, la sonde a aussi prouvé la **capacité d'écriture** que l'étape 11 utilisera (GitHub scopes `repo`+`workflow` · Cloudflare DNS:Edit · Resend Full access · Vercel bon scope team · Supabase org + quota) — **pas seulement l'accès en lecture** (`connection-procedure.md §Scopes`). Sinon `"none"` + avertissement.
- [ ] `~/.saas-factory/config.json` écrit : `domain`, `hosting`, `providers.*` (dont `llm` **et** `visuals`), `email_from`, `git_author {name,email}` (identité d'auteur des commits, capturée à l'onboarding comme `email_from` — `config-schema.md §git_author`), `setup_complete:true`.
- [ ] `~/.saas-factory/.env` en **chmod 600** pour toute clé/token en env (méthode B **+ tokens MCP locaux** GitHub/Supabase) ; **aucun** secret en dur dans un projet, commité, ou en conversation.
- [ ] Trous marqués `"none"`/`"skipped"` (pas faussement `connected`) — dont `visuals = "none"` si aucune clé Google et LLM non-Google.
- [ ] **Aucune ressource facturable créée** (pas de repo/BDD/DNS ici).
- [ ] Récap final : connecté / manquant / conséquence par projet + phrase d'autorisation durable.

### Sortie SKIP (`setup_complete: false`)
- [ ] `config.json {setup_complete:false, mode:"local"}` écrit (l'étape 11 saura basculer en fallback).
- [ ] L'utilisateur sait qu'`infra-setup` est **relançable** à tout moment.
- [ ] Aucun reproche : le mode local est un état valide.

### Interdits (échec dur si présents)
- [ ] Une clé brute en conversation / commitée / en dur → **stop + ne pas l'utiliser/l'écrire + prévenir compromission + rotation immédiate + rappel `.env`**, sans recopier la valeur (`safety-rails.md` §4).
- [ ] Un outil marqué `connected` sans sonde réussie → faux positif, corriger.
- [ ] Une ressource réelle provisionnée ici → viole le rôle du skill.
- [ ] Consentement collecté sans briefing → autorisation non informée, refaire.
- [ ] `.env` lisible par d'autres (pas de chmod 600) → corriger avant d'écrire.

## Machine à états de **sortie** (volet DoD)
Prolonge la machine d'**onboarding** de `connection-procedure.md` (briefing → SKIP ou connexion outil-par-outil) — ici, seul le **volet sortie** : décider `setup_complete` une fois les outils traités.
```
   [entrée : voir la machine d'onboarding — connection-procedure.md]
                                  │
              SKIP acté ?  ──oui──▶ config {setup_complete:false, mode:"local"} ▶ FIN (relançable)
                                  │
                                 non (OK durable → outils traités)
                                  │
                    socle (GH+Supabase+CF+Host) tenté ?
                                  │
                         ┌────────┴────────┐
                        oui              non (socle troué)
                         │                 │
                  périphérie selon   marquer "none" + prévenir
                  choix (email/       "automatisation partielle"
                  billing/obs/         + recommander de compléter
                  llm/visuels)               │
                         └────────┬──────────┘
                                  ▼
                    config.json {setup_complete:true}
                                  ▼
                    RÉCAP + "je ne te redemanderai plus ces accès"
                                  ▼
                sibling: retour master / étape 11 provisionne le réel
```

- **Socle troué ≠ blocage** : on sort quand même `setup_complete:true` si l'utilisateur assume, mais avec un avertissement clair que l'étape 11 sera **partiellement** en fallback.
- **Reconfig** : relancer `infra-setup` sur un `config.json` existant → mode « ajouter / corriger un outil », pas d'écrasement aveugle.

## Handoff
- **Écrit** : `~/.saas-factory/config.json` (+ `.env` chmod 600) selon `config-schema.md`.
- **Sibling, pas une étape** : `infra-setup` ne passe pas la main à une « étape suivante » du pipeline — il rend la config globale que **`11-project-setup` lira à chaque projet** pour provisionner le réel, et que le **master** / `phase-3-tech` consultent pour savoir si l'automatisation est dispo.
- **Message de clôture** : récap connecté/manquant + « À partir de maintenant, chaque nouveau SaaS se provisionne automatiquement — je ne te redemanderai plus ces accès. »
