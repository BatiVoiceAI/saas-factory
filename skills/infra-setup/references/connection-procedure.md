# Référence — Procédure de connexion, outil par outil

La **profondeur** de la procédure du SKILL.md. Un seul principe transverse, décliné pour chaque outil : **connecter, jamais provisionner**. `infra-setup` établit les *accès* ; le provisioning réel (repo, BDD, sous-domaine, emails) est fait plus tard, **par projet**, par l'étape `11-project-setup`. Ici on ne crée aucune ressource facturable.

> # 🚨🔒 RÈGLE ABSOLUE — AUCUNE CLÉ / AUCUN TOKEN DANS LE CHAT 🔒🚨
> **Chaque fois que ce fichier dit « dépose le token / la clé »**, cela veut dire : l'utilisateur l'écrit **lui-même** dans `~/.saas-factory/.env` (chmod 600). **Jamais** dans la conversation.
> Une valeur collée dans le chat est **compromise** (historique + logs) → **à révoquer immédiatement**. L'assistant ne manipule que le **nom** de la variable, jamais la valeur.
> Si l'utilisateur colle quand même une valeur secret-shaped → appliquer le **protocole `_shared/safety-rails.md` §4** (stop · ne pas l'utiliser ni l'écrire · prévenir de la compromission + rotation · rappeler `.env`), sans jamais la recopier.

## Les deux méthodes de connexion (choisir dans cet ordre)

| Méthode | Quand | Auth réelle | Ce que le plugin voit | Où ça vit |
|---|---|---|---|---|
| **A. MCP officiel de l'éditeur** (préféré) | un serveur MCP existe (GitHub, Supabase, Cloudflare, Vercel, Stripe) | **hébergé → OAuth** (Cloudflare, Vercel, Stripe) ; **local npx → token en env** (GitHub `@modelcontextprotocol/server-github` = `GITHUB_PERSONAL_ACCESS_TOKEN`, Supabase `@supabase/mcp-server-supabase` = `SUPABASE_ACCESS_TOKEN`) | OAuth : session déléguée, aucun secret. Token local : le **nom** de la variable, jamais la valeur en chat | OAuth côté connecteur (`.mcp.json`) ; token dans `~/.saas-factory/.env` (chmod 600) |
| **B. Clé/URL déposée par l'utilisateur** | pas de MCP officiel (Resend, LLM/visuels, obs) **ou variante self-host** (Supabase self-host, Gitea/Forgejo, Coolify, PostHog/GlitchTip, Ollama) | clé d'API (ou token d'instance) appelée en direct sur l'**URL de l'instance** ; Ollama local = URL sans clé | le **nom** de la variable + l'**URL** d'instance, jamais la valeur de clé en conversation | `~/.saas-factory/.env` (chmod 600) ou keychain OS |

**Règle d'or (transverse à tout ce fichier)** : une clé brute ne transite **jamais** par la conversation. Méthode A hébergée → OAuth, rien à coller ; Méthode A locale (GitHub/Supabase) → l'utilisateur dépose lui-même un **token scoppé** dans `.env`, le plugin ne manipule que le **nom** de la variable. Méthode B → l'utilisateur écrit lui-même dans `.env` (`safety-rails.md` §4). **Si l'utilisateur colle une valeur secret-shaped dans le chat → applique le protocole `safety-rails.md` §4 : stop · ne l'utilise ni ne l'écris nulle part · préviens que le token est désormais compromis et recommande une rotation immédiate · rappelle le dépôt en `.env` — sans jamais recopier la valeur dans ta réponse.**

> **Précision factuelle** (aligné sur `.mcp.json.example` + `skills/11-project-setup/references/mcp-map.md`) : la dichotomie n'est pas « OAuth vs clé collée » mais « un secret transite-t-il par le chat ? » — **non**, jamais, quelle que soit la méthode. GitHub et Supabase passent bien par un **token** (déposé hors chat), pas par OAuth ; Cloudflare/Vercel/Stripe passent par OAuth.

## 🔑 Scopes requis par outil — À DONNER AU TOKEN au moment de le créer

> **🚨 Leçon d'un run réel (à ne jamais oublier)** : une sonde en **lecture** (`GET /user`, lister les zones) **réussit même avec un token sans droit d'écriture**. Résultat observé : `infra-setup` a affiché « connecté ✓ » avec un faux sentiment de sécurité, puis le provisioning (étape 11) a **échoué au premier `create repo` / `create DNS`** — GitHub : *« Resource not accessible by personal access token »* (PAT fine-grained sans droit de création) ; Cloudflare : *« Authentication error »* (token DNS en lecture seule).
>
> **Le scope se vérifie ICI, une seule fois — pas au milieu d'un projet.** Chaque token doit porter le **droit d'ÉCRITURE** que l'étape 11 utilisera réellement, et la sonde doit **le prouver** (pas seulement prouver l'accès en lecture). Une sonde lecture-seule qui passe n'autorise **pas** un `connected`.

| Outil | Ce que l'étape 11 ÉCRIT réellement | Scope minimal à donner au token | Piège de scope à éviter |
|---|---|---|---|
| **GitHub** | `create repository` (privé) · push de l'arbre · push `.github/workflows/*` · secrets Actions | **PAT _classic_** avec **`repo`** + **`workflow`** | le **fine-grained** `github_pat_…` **ne crée pas un repo simplement** → *« Resource not accessible by personal access token »*. **Déconseillé ici.** Si fine-grained imposé : cocher explicitement **Administration : Read & Write** (créer le repo) + **Contents : R&W** (push) + **Workflows : R&W** + **Secrets : R&W** sur le compte/l'org |
| **Cloudflare** | UPSERT de records DNS : routage `<slug>.<domaine>` **+** vérif email (DKIM/SPF/DMARC/return-path MX) | token / grant OAuth avec **Zone → DNS → Edit** *(et **Zone → Zone → Read** pour lister)* **sur la zone** | un token **Read-only** liste les zones mais **échoue à créer un record** → *« Authentication error »* (code `10000`/`9109`). **`DNS → Read` ne suffit pas — il faut `Edit`.** |
| **Supabase** | `create_project` (facturable) · `apply_migration` (tables + RLS) · `PATCH .../config/auth` | **access token** personnel (`sbp_…`) — **non scopable** : il porte les droits du **compte** (écriture incluse) | pas de piège de *scope* (tout-ou-rien), mais : **une org est requise** + **quota free-tier = 2 projets gratuits max** → au-delà, `create_project` échoue. Vérifier org accessible, prévenir du quota |
| **Vercel** | create project · link repo · env vars · deployments | **access token** au **bon scope d'équipe** (ton perso, ou la **team** cible) — accès complet CRUD (pas de token « lecture seule » chez Vercel) | token scopé sur la **mauvaise team** → projet créé au mauvais endroit / **403**. Choisir le scope = **là où vivront les projets** |
| **Resend** | **créer + vérifier le domaine d'envoi** (`POST /domains` + records DNS) puis envoyer | clé API **Full access** | une clé **Sending access** **envoie** mais **ne gère PAS les domaines** → la vérif domaine (étape 11) renvoie **401 `restricted_api_key`**. Il faut **Full access** |
| **Stripe** *(opt.)* | produits · prix · webhooks | clé secrète **standard** en **mode test** (`sk_test_…`), ou clé restreinte avec **Products / Prices / Webhooks : Write** | une clé restreinte **lecture seule** échoue à créer produits/prix |

**Comment le formuler à l'utilisateur au moment de créer le token** (`safety-rails.md` §3 — une phrase par accès) : *« Crée un token avec **\<scope d'écriture ci-dessus\>** — c'est ce qui permettra de créer un repo / un record DNS / un domaine d'envoi pour chaque projet. Un token en lecture seule passerait la connexion mais planterait au premier provisioning. »*

## Flux global (machine à états de l'onboarding)

```
        DÉMARRAGE
           │
   config.json existe & setup_complete ?
           │
     ┌─────┴─────┐
    oui          non
     │            │
 "déjà fait,   BRIEFING CONSENTEMENT  (→ consent-briefing.md)
  reconfig ?"        │
                     │  OK durable obtenu ?
                     ├── non → SKIP → config.json {setup_complete:false, mode:"local"} → fin
                     │
                    oui
                     │
        ┌────────────┼── un outil à la fois ────────────┐
        ▼            ▼                                    ▼
   1 GitHub → 2 Supabase → 3 Cloudflare(+domaine) →
   4 Hébergement → 5 Email → 6 Stripe(opt) →
   7 Observabilité(opt) → 8 LLM
        │
   chaque outil : CONNECT → SONDE → écrire config.json
        │            (échec → skip cet outil, loguer, continuer — voir failure-modes.md)
        ▼
   RÉCAP (connecté / manquant) → setup_complete:true → SORTIE
```

- **Profil manage vs open-source (posé une fois, avant le socle)** : une seule question fixe la posture par défaut (managé = zéro-ops *(défaut)* / open-source = self-host). Elle décide, pour chaque outil **forké**, quelle **variante** on connecte (voir `decision-matrices.md §Profil`). Chaque outil forké peut être basculé individuellement (**override**). Les outils **provider-only** (Cloudflare DNS, Resend, Stripe) ne sont pas concernés par le profil.
- **Un outil à la fois** (interaction minimale). Ne demande pas 8 choses d'un coup.
- **Cœur vs optionnel** : GitHub + Supabase + Cloudflare + Hébergement sont le **socle** (sans eux, un projet ne se provisionne pas vraiment). Email/Stripe/Obs/LLM sont enrichissants → leur absence ne bloque pas `setup_complete`.
- **Échec d'un outil ≠ échec du setup** : on saute, on marque `"none"` / `"skipped"` dans `config.json`, l'étape 11 basculera en fallback pour cet outil seulement.

## Sous-procédure par outil

Format identique partout : **But → Méthode → Ordre → Critère de passage (sonde) → Écriture config → Micro-exemple.**

### 1. Repo + CI — *socle* (forké : GitHub managé ↔ Gitea/Forgejo self-host)
- **But** : autoriser la création + le push d'un repo par projet et l'exécution de la CI.
- **Variante selon profil** (voir `decision-matrices.md §Repo`) : **managé → GitHub** *(défaut)* ; **open-source → Gitea/Forgejo self-host** (ou GitLab self-host).
- **Méthode (managé — GitHub)** : A — MCP officiel `github`. Le serveur déclaré (`@modelcontextprotocol/server-github`, local npx) s'authentifie par **PAT** (`GITHUB_PERSONAL_ACCESS_TOKEN`) **déposé en env**, jamais collé en chat. *(Pas d'OAuth ici — une variante MCP hébergée en OAuth existe côté GitHub, mais le socle du plugin utilise le serveur local à token.)*
  - **Ordre** : l'utilisateur crée un **PAT _classic_ scoppé** (`repo` + `workflow`) → le dépose dans `~/.saas-factory/.env` (`GITHUB_PERSONAL_ACCESS_TOKEN`) → retour. Rien à coller dans le chat. **Déconseille le fine-grained `github_pat_…`** : il ne crée pas un repo simplement (→ *« Resource not accessible by personal access token »* au provisioning). Si l'utilisateur y tient : Administration/Contents/Workflows/Secrets en **Read & Write** (voir tableau §Scopes).
    > 🚨 **NE COLLE JAMAIS le PAT dans le chat.** Il va **uniquement** dans `~/.saas-factory/.env`. Collé ici = compromis → à révoquer.
  - **Sonde (lecture + capacité d'écriture — le point clé)** :
    1. **Lecture** : `get authenticated user` (MCP) ou `GET /user` réussit → token valide, compte identifié. *Directement ou via sous-agent de sonde (`Task`).*
    2. **Capacité d'écriture** : vérifier que le token porte bien `repo` (+`workflow`), sinon la lecture seule donne un faux « connecté ». Via `Bash`/curl en lisant l'en-tête **`X-OAuth-Scopes`** (le token reste une **référence `$VAR`** lue depuis `.env`, jamais affichée ni développée dans la sortie) :
       `source ~/.saas-factory/.env && curl -sSI -H "Authorization: token $GITHUB_PERSONAL_ACCESS_TOKEN" https://api.github.com/user | grep -i '^x-oauth-scopes:'`
       - l'en-tête **doit contenir `repo`** (et `workflow`) → capacité d'écriture confirmée.
       - `repo` **absent** de l'en-tête → **`"none"`** : le provisioning créera un repo, `repo` est obligatoire. Expliquer le scope manquant (`safety-rails.md` §3) + inviter à recréer un PAT classic.
       - en-tête **vide ou absent** = PAT **fine-grained** (ses permissions n'y figurent pas) → **avertir explicitement** : « la capacité de création de repo n'est **pas** confirmée par la sonde ; un **PAT classic `repo`+`workflow`** est fortement recommandé, sinon vérifie à la main que le fine-grained porte Administration/Contents/Workflows en écriture. » Ne marquer `connected` qu'avec cet avertissement assumé.
  - **Écriture** : `providers.repo = "github"`.
- **Méthode (open-source — Gitea/Forgejo self-host)** : B — l'utilisateur donne l'**URL de son instance** (`GITEA_URL`) + dépose un **token d'accès** de l'instance (`GITEA_TOKEN`, mêmes noms pour Forgejo) dans `~/.saas-factory/.env`. On **connecte, on ne provisionne pas** l'instance : elle est déjà debout côté utilisateur.
  - **Ordre** : `GITEA_URL` + `GITEA_TOKEN` (scope repo, créé dans les réglages de l'instance) → déposés en `.env` → retour. Rien à coller en chat.
  - **Sonde** : un appel API en lecture sur l'instance (`GET /api/v1/user`) répond avec le token → OK.
  - **Écriture** : `providers.repo = "gitea" | "forgejo" | "gitlab-selfhost"` — l'URL/token vivent en `.env` (`GITEA_URL`/`GITEA_TOKEN`), **jamais** en config.
  - **Caveat honnête** : la CI y est du **Gitea Actions / Woodpecker** (pas GitHub Actions) → à câbler côté projet, moins clé-en-main que le chemin GitHub.
- **Forcing-question — l'identité git-author (email des commits)** *(mirroir exact du forcing `email_from` §5)* :
  - **But** : capturer **une fois**, à l'onboarding, le nom + l'email qui **authoreront** les commits de chaque repo projet — identité **NON-secrète CHOISIE** ici (comme `email_from`), pas un défaut deviné en cours de run. Écrite en `config.git_author = {name, email}` (non-secret → `config.json`, **jamais `.env`**, jamais commitée). Injectée au scaffold comme config git du repo projet (auteur des commits → déploiement non bloqué).
  - **Ask exact** : « Quelle adresse e-mail authore tes commits git ? (celle de ton compte GitHub) — elle **DOIT être membre de ta team Vercel**, sinon Vercel **bloque** le déploiement (`readyState = BLOCKED`). »
  - **Défaut proposé (overridable)** : l'email du **compte connecté** — GitHub, ou l'email du compte **Vercel** une fois §4 connecté (lisible via l'API Vercel `GET /v2/user`, souvent le même email pour GitHub et Vercel). Proposé, jamais imposé : l'utilisateur tranche.
  - **Push-until** : un nom + un email **valides** ; l'email **doit** viser un compte **membre de la team Vercel** (cross-check réel au §4 une fois Vercel connecté).
  - **Écriture** : `config.git_author = { "name": "<nom d'auteur>", "email": "<email membre de la team Vercel>" }`.
  - **🚨 INVARIANT (renvoi)** : `git_author.email` **DOIT être un membre de la team de l'hébergeur (Vercel)** du compte de déploiement — sinon `readyState = BLOCKED` (blocage silencieux, build vert). Invariant complet + champ canonique : **`config-schema.md §git_author`**. Cross-check team exécuté au **§4** ci-dessous.
- **Override** : profil managé mais l'utilisateur pointe une instance Gitea → basculer ce seul service, garder le reste au profil.
- **Micro-exemple (managé)** : *« GitHub connecté (compte `octocat`, PAT `repo`+`workflow` en `.env`). Sonde `get authenticated user` OK. Git-author : `Speech to Flow <no_reply@speechflow.fr>` → `config.git_author` (à cross-checker membre team Vercel au §4). »*
- **Micro-exemple (self-host)** : *« Forgejo self-host : donne-moi l'URL de ton instance (`GITEA_URL`) et dépose `GITEA_TOKEN` dans `~/.saas-factory/.env`. Sonde `GET /api/v1/user` → OK, je ne crée un repo qu'au besoin projet. »*

### 2. BDD + Auth — *socle* (forké : Supabase cloud ↔ Supabase self-host)
- **But** : autoriser la création d'un projet Postgres + l'application de migrations (tables + RLS) par projet.
- **Variante selon profil** (voir `decision-matrices.md §BDD`) : **managé → Supabase cloud** *(défaut)* ; **open-source → Supabase self-hosted** (Docker/VPS). **Même produit**, hébergement différent.
- **Méthode (managé — Supabase cloud)** : A — MCP officiel `supabase`. Le serveur déclaré (`@supabase/mcp-server-supabase`, local npx) s'authentifie par **access token personnel** (`SUPABASE_ACCESS_TOKEN`) **déposé en env**, jamais collé en chat. *(Pas d'OAuth ici — c'est un token, comme GitHub.)*
  - **Ordre** : l'utilisateur génère un **access token** Supabase → le dépose dans `~/.saas-factory/.env` → retour.
    > 🚨 **NE COLLE JAMAIS l'access token dans le chat.** Il va **uniquement** dans `~/.saas-factory/.env`. Collé ici = compromis → à révoquer.
  - **Sonde** : un **appel MCP en lecture** (« lister mes projets / organisations ») réussit — directement ou via **sous-agent de sonde** (`Task`). ⚠️ Ne **crée aucun projet ici** (`create_project` est facturable → réservé à l'étape 11, avec `confirm_cost`). Vérifier que l'org est accessible. **Cas particulier scope** : l'access token Supabase n'est **pas granulaire** (il porte les droits du compte, écriture incluse) → ici la sonde lecture **est** un proxy valide de la capacité d'écriture. Le risque n'est donc pas un scope trop étroit, mais **l'absence d'org** ou le **quota free-tier**.
  - **Écriture** : `providers.db = "supabase"`.
  - **Red-flags** :
    - aucune **organisation** Supabase → inviter à en créer une (gratuite) avant de continuer, ne pas simuler.
    - **quota free-tier atteint** (2 projets gratuits max par org) → **prévenir dès l'infra-setup** : `create_project` échouera à l'étape 11 au-delà. Proposer d'upgrader l'org ou de libérer un projet.
- **Méthode (open-source — Supabase self-host)** : B — l'instance est déjà debout côté utilisateur (Docker/VPS). Il donne l'**URL de l'instance** (`SUPABASE_URL`) + dépose les clés `SUPABASE_SERVICE_ROLE_KEY` (usage serveur/migrations) et `SUPABASE_ANON_KEY` (client) dans `~/.saas-factory/.env`. On **connecte, on ne provisionne pas** l'instance.
  - **Ordre** : URL de l'instance → `service_role` + `anon` key (dans les réglages de l'instance) → déposées en `.env` → retour. Rien en chat.
  - **Sonde** : un appel en lecture sur `SUPABASE_URL` avec la `service_role` (ex. `GET /rest/v1/` ou `/auth/v1/health`) répond → OK. Pas de MCP ici → API directe.
  - **Écriture** : `providers.db = "supabase-self-host"` — l'URL/keys vivent en `.env` (`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` + `SUPABASE_ANON_KEY`), **jamais** en config.
  - **Caveat honnête** : self-host = **tu gères** Postgres, backups, upgrades. Zéro-ops perdu, contrôle/coût fixe gagnés.
- **Override** : profil managé mais BDD self-host (data-residency) → basculer la seule BDD, garder le reste au profil.

### 3. Cloudflare (DNS + CDN) — *socle* + **capture le domaine** — **provider-only (honnête)**
- **But** : autoriser la gestion DNS pour les sous-domaines `projet.tondomaine.com`, + CDN.
- **Pas de fork open-source** : le DNS d'un domaine public = un provider ; auto-héberger l'autoritatif = hors sujet. Le profil open-source **ne bascule pas** ce service. Autres providers DNS possibles, mais pas « open-source » (voir `decision-matrices.md §Provider-only`).
- **Méthode** : A (OAuth/MCP `cloudflare`). *Variante possible : token API scopé au lieu de l'OAuth.*
- **Scope requis** (voir tableau §Scopes) : **Zone → DNS → Edit** (+ **Zone → Zone → Read** pour lister) **sur la zone**. Un token/grant **DNS Read-only** listera les zones mais **plantera** à la création de record (étape 11 : sous-domaines + records de vérif email) → *« Authentication error »*. **L'écrire noir sur blanc à l'utilisateur au moment d'autoriser : c'est `Edit`, pas `Read`.**
- **Ordre** : (a) OAuth (ou dépôt du token API scopé DNS:Edit) → autoriser la zone. (b) **Demander le nom de domaine principal** (unique champ « donnée » de tout le setup) → `config.domain`.
- **Critère de passage (lecture + capacité d'écriture)** :
  1. **Lecture** : la zone du domaine est **listée** par le connecteur (le domaine appartient bien au compte connecté). Absente → red-flag domaine (forcing ci-dessous). *Token API : `GET /user/tokens/verify` renvoie `active` d'abord.*
  2. **Capacité d'écriture DNS** (sinon faux « connecté ») — au choix :
     - **Sonde réversible (recommandée, la plus proche d'un dry-run que Cloudflare autorise)** : créer un record **TXT jetable et clairement nommé** (ex. `_saasfactory-writecheck.<domaine>`, valeur `probe`) via le MCP/l'API, puis **le supprimer immédiatement**. Succès de la création = **DNS:Edit confirmé**. Ne touche **jamais** l'apex ni un record existant, ne laisse **rien** (create → delete dans la même sonde). Nécessite un OK bref de l'utilisateur (« je vérifie le droit d'écriture par un record TXT jetable créé puis supprimé aussitôt ? »).
     - **Sinon (aucune écriture voulue pendant l'infra-setup)** : **avertissement explicite** — « la sonde n'a vérifié que l'**accès en lecture** à la zone, **pas le droit d'écriture DNS** ; assure-toi que le token porte **Zone → DNS → Edit**, sinon le provisioning échouera au premier record. » Ne marquer `connected` qu'avec cet avertissement assumé.
- **Écriture** : `providers.cloudflare = "connected"`, `domain = "<saisi>"`.
- **Forcing-question — le domaine** :
  - **Ask exact** : « Quel domaine racine veux-tu pour tes SaaS ? (ex. `tondomaine.com`) Les projets vivront en sous-domaine : `projet.tondomaine.com`. »
  - **Push-until** : domaine **valide** (format), **présent dans les zones Cloudflare connectées**, et l'utilisateur confirme qu'il accepte des sous-domaines dessus.
  - **Red-flags — à ne pas accepter** :
    - un domaine que l'utilisateur **ne possède pas** / absent des zones connectées → il ne pourra pas créer de DNS dessus.
    - un domaine tapé « pour voir » sans le posséder → refuser, proposer d'en acheter/transférer un d'abord, ou de sauter Cloudflare (fallback URL par défaut du host).
    - une **prod existante** dont la racine sert déjà un site en prod → OK pour des sous-domaines neufs, mais **avertir** qu'on ne touchera jamais l'apex ni les records existants (`safety-rails.md` §2 sandbox).
  - **MOU (à re-challenger)** : « euh, `google.com` je crois » → non possédé, refuser. **FORT (à accepter)** : « `bativoice.io`, il est déjà sur mon compte Cloudflare » → présent dans les zones, valide, accepté.

### 4. Hébergement — *socle* (forké : Vercel/Cloudflare managé ↔ Coolify open-source)
- **But** : autoriser le déploiement du SaaS (sous-domaines + preview auto + env vars).
- **Variante selon profil** (voir `decision-matrices.md §Hébergement`) : **managé → Vercel** *(défaut)* (ou **Cloudflare Pages/Workers**, edge) ; **open-source → Coolify** (self-host, 1 VPS pour tout, coût fixe).
- **Méthode (managé — Vercel/Cloudflare)** : A (OAuth/MCP). « lister mes projets » réussit → connecté.
  - **Scope (Vercel)** : les tokens Vercel sont **full-CRUD** (pas de token « lecture seule ») → le piège n'est pas le droit d'écriture mais le **scope d'équipe**. Un token scopé sur la **mauvaise team** crée le projet au mauvais endroit / renvoie **403**. Confirmer que le scope OAuth/token = **là où vivront les projets** (perso ou la team cible) ; « lister mes projets » doit renvoyer le **bon compte/team**.
  - **🚨 Cross-check git-author ↔ team Vercel (le second point clé de cet outil)** : une fois Vercel connecté, vérifie que **`config.git_author.email` (capturé au §1) est un membre de la team Vercel** ciblée — lisible via l'API Vercel (liste des membres de la team). **Si l'email est absent de la team → AVERTIR : le déploiement (étape 17) sera `readyState = BLOCKED`**, avec la raison exacte renvoyée par Vercel : *« Git author <email> must have access to the team <team> on Vercel to create deployments. »* C'est un **blocage silencieux** — pas une erreur de build : `tsc`/`next build` sont **verts**, le déploiement est juste **refusé** (d'où l'intérêt de capturer l'identité en amont, §1). Deux issues : **re-demander** l'email (mettre à jour `config.git_author.email` par un email membre de la team), **ou** inviter l'utilisateur à **ajouter cet email comme membre** de la team Vercel. Invariant complet + champ canonique : **`config-schema.md §git_author`**.
- **Méthode (open-source — Coolify)** : B — l'instance Coolify est déjà debout côté utilisateur. Il dépose `COOLIFY_API_TOKEN` dans `~/.saas-factory/.env` + donne l'**URL de l'instance** (`COOLIFY_URL`). On connecte, on ne provisionne pas. **Token Coolify avec droit d'écriture** (créer app / deploy / env), pas un token en lecture seule.
  - **Sonde (Coolify)** : l'URL de l'instance répond + un appel API en lecture (ex. « lister mes applications/serveurs ») avec le token → OK. *Capacité d'écriture non prouvée par cette lecture → au minimum vérifier que le token n'est pas restreint en lecture (réglage Coolify), sinon avertir comme pour Cloudflare.*
  - **Écriture (Coolify)** : `hosting = "coolify"` — l'URL/token vivent en `.env` (`COOLIFY_URL` + `COOLIFY_API_TOKEN`), **jamais** en config.
- **Ordre** : trancher le provider (profil + matrice) → connecter **celui-là seul** (pas les trois).
- **Écriture** : `hosting = "vercel" | "cloudflare" | "coolify"`.
- **Override** : profil managé mais l'utilisateur veut Coolify (coût fixe) → basculer ce seul service.
- **Micro-exemple (Coolify)** : *« Coolify choisi (self-host, coût fixe VPS, open-source). Dépose `COOLIFY_API_TOKEN` dans `~/.saas-factory/.env` et donne-moi l'URL de ton instance. Sonde lecture OK, rien provisionné. »*

### 5. Email — Resend (défaut, alt Postmark) — **provider-only (honnête)** + **capture l'adresse d'expédition**
- **But** : autoriser l'envoi d'emails transactionnels/confirmation par projet.
- **Pas de fork open-source recommandé** : la **délivrabilité** = un provider (réputation IP, DKIM/SPF gérés). Self-host SMTP techniquement possible mais **délivrabilité fragile** (spam, IP froide) → **à flaguer honnêtement**, non recommandé par défaut. Le profil open-source **ne bascule pas** ce service ; on reste sur Resend/Postmark (swappable entre providers).
- **Méthode** : B (pas de MCP officiel Resend). Clé `RESEND_API_KEY` déposée dans `~/.saas-factory/.env`.
- **Scope requis** : clé **Full access** (pas **Sending access**). L'étape 11 doit **créer + vérifier le domaine d'envoi** (`POST /domains` + records DNS) — une clé Sending-only sait **envoyer** mais **pas gérer les domaines**. Le dire au moment de créer la clé.
- **Ordre** : (a) indiquer où créer la clé (resend.com/api-keys, **permission Full access**) → l'utilisateur la dépose lui-même → ne **rien coller** dans le chat. (b) **Demander l'adresse d'expédition (From)** → `config.email_from` (forcing ci-dessous).
  > 🚨 **NE COLLE JAMAIS la `RESEND_API_KEY` dans le chat.** Elle va **uniquement** dans `~/.saas-factory/.env`. Collée ici = compromise → à révoquer.
- **🚨 INVARIANT — le domaine de l'adresse From EST le domaine vérifié dans Resend.** Resend **refuse d'envoyer depuis un domaine non vérifié** (HTTP 500 « Error sending confirmation email » observé en run réel). Le domaine de `email_from` (l'apex `<domain>`, **ou** le sous-domaine `mail.<domain>`, selon l'adresse choisie) est donc **exactement** celui que l'étape 11 crée + vérifie dans Resend (`POST /domains`). **Resend gratuit = 1 SEUL domaine** (erreur 403 « plan includes 1 domain » au-delà) → le domaine d'envoi est un **choix unique** : on ne peut pas vérifier `mail.<domain>` **et** l'apex ; changer d'adresse plus tard = **remplacer** le domaine (delete + add + re-DNS), jamais empiler. C'est pour ça qu'on **demande** l'adresse ici plutôt que d'imposer un défaut sur un sous-domaine que l'apex ne vérifiera pas.
- **Forcing-question — l'adresse d'expédition (From)** :
  - **Ask exact** : « Quelle adresse d'expéditeur pour tes emails (confirmation de compte, transactionnels) ? Ex. `no_reply@<domain>` (sur l'apex) **ou** `contact@mail.<domain>` (sur un sous-domaine `mail.`). **Le domaine de cette adresse sera celui vérifié dans Resend** — et Resend gratuit n'en autorise **qu'un seul**. »
  - **Défaut proposé (overridable)** : `no_reply@<domain>` sur l'**apex** ; **mais** si l'apex sert déjà de l'email (MX/records existants qu'on ne veut pas toucher — cf. sandbox `safety-rails.md` §2), proposer plutôt un **sous-domaine** `no_reply@mail.<domain>` (isole la délivrabilité de l'apex prod). Défaut **proposé, jamais imposé** : l'utilisateur tranche.
  - **Push-until** : une adresse email **valide** (format `local@domaine`), dont le **domaine est `<domain>` ou un sous-domaine de `<domain>`** (l'étape 11 doit pouvoir créer les records DNS de vérif sur la zone Cloudflare connectée en §3). Un domaine **hors** de la zone → refuser (on ne pourra pas le vérifier).
  - **Red-flags — à ne pas accepter** :
    - une adresse sur un **domaine tiers** non connecté (ex. `@gmail.com`, ou un domaine absent des zones Cloudflare) → invérifiable dans Resend → refuser, revenir sur `<domain>`/sous-domaine.
    - vouloir **deux** adresses sur **deux** domaines distincts (apex **et** `mail.`) « pour être sûr » → non : Resend gratuit = 1 domaine, **un seul** choix. Trancher.
  - **MOU (à re-challenger)** : « mets ce que tu veux » → proposer le défaut (`no_reply@<domain>` ou `no_reply@mail.<domain>` si apex déjà email) et confirmer. **FORT (à accepter)** : « `no_reply@speechflow.fr` » / « `contact@mail.speechflow.fr` » → format valide + domaine dans la zone, accepté ; ce domaine devient le domaine d'envoi vérifié.
- **Critère de passage (présence + capacité d'écriture)** :
  1. la variable `RESEND_API_KEY` **existe** dans `.env` et est **non-vide/non-placeholder** (vérifier la présence par nom, pas la valeur).
  2. **capacité de gestion de domaine** : appeler `GET /domains` (`Bash`/curl, clé lue en `$VAR` depuis `.env`, jamais affichée) — `curl -sS -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $RESEND_API_KEY" https://api.resend.com/domains`. **200 = Full access confirmé.** **401 `restricted_api_key` = clé Sending-only** → insuffisante pour la vérif domaine (étape 11) → **`"none"`** + inviter à recréer une clé **Full access**. *C'est une lecture qu'une clé Sending-only ne peut pas faire → bon proxy non destructif du droit d'écriture. Ne pas envoyer d'email de test ici.*
  3. `config.email_from` **capturée** (forcing ci-dessus), domaine ⊆ zone Cloudflare connectée.
- **Écriture** : `providers.email = "resend"` (ou `"postmark"`, ou `"none"` si sauté) **+** `email_from = "<adresse choisie>"` (non-secret, `config.json` — jamais `.env` ; schéma : `config-schema.md §email_from`). Le **domaine** de cette adresse est le domaine d'envoi que l'étape 11 vérifiera dans Resend.
- **Red-flags** :
  - `.env` contient `RESEND_API_KEY=changeme` → traiter comme **absent**, ne pas marquer `connected`.
  - `GET /domains` renvoie **401** (clé Sending-only) → traiter comme **scope insuffisant**, `"none"`, ne pas marquer `connected`.
  - `email_from` sur un **domaine non couvert** par la zone Cloudflare (apex/sous-domaine de `<domain>`) → invérifiable dans Resend → re-poser l'adresse, ne pas la figer.

### 6. Paiement — Stripe (**OPTIONNEL**) — **provider-only (honnête)**
- **But** : autoriser produits/prix/webhooks — **seulement si l'utilisateur veut vendre**.
- **Pas de fork open-source** : pas d'auto-hébergement du paiement carte (PCI, réseaux bancaires). Le profil open-source **ne bascule pas** ce service.
- **Gate d'entrée** : forcing-question « vends-tu ? » (voir `decision-matrices.md §Billing`). **Non** → **saute entièrement**, `providers.billing = "none"`, ne câble aucun bloc billing. Ne pas insister.
- **Méthode** : A (OAuth/MCP `stripe`).
- **Ordre** : uniquement si « oui » → OAuth (compte en **mode test** de préférence).
- **Critère de passage** : « lister mes produits » réussit ; compte identifiable ; **mode test** privilégié (le live viendra plus tard, avec KYC — `safety-rails.md` §6, jamais simulé).
- **Écriture** : `providers.billing = "stripe"`.

### 7. Observabilité (optionnel) — (forké : cloud ↔ self-host)
- **But** : autoriser erreurs (Sentry) + analytics produit (PostHog).
- **Variante selon profil** (voir `decision-matrices.md §Observabilité`) : **managé → Sentry + PostHog cloud** *(défaut)* ; **open-source → PostHog self-host + GlitchTip** (ou Sentry self-host).
- **Méthode (managé — cloud)** : B (clés `SENTRY_DSN`, `POSTHOG_KEY` dans `.env`) ou A si connecteur dispo.
  - **Sonde** : variables présentes/non-placeholder (méthode B) ou session OAuth OK (méthode A).
  - **Écriture** : `providers.observability = "sentry+posthog"` (ou `"sentry"`, `"posthog"`).
- **Méthode (open-source — self-host)** : B — instances déjà debout côté utilisateur. Il donne les **URL d'instance** (`POSTHOG_HOST`, `GLITCHTIP_DSN` host) + dépose les clés/DSN correspondants dans `~/.saas-factory/.env`. GlitchTip est compatible SDK Sentry → le DSN pointe simplement sur l'instance GlitchTip. On connecte, on ne provisionne pas.
  - **Sonde** : URL d'instance répond + clé/DSN présents non-placeholder.
  - **Écriture** : `providers.observability = "posthog-self-host+glitchtip"` (ou `"sentry-self-host"`) — les URL d'instance (`POSTHOG_HOST`) + DSN GlitchTip/Sentry vivent en `.env`, **jamais** en config.
- **Override** : profil managé mais analytics self-host (RGPD) → basculer PostHog seul en self-host.
- **Note** : purement enrichissant → sauter sans culpabilité (`"none"`) si l'utilisateur veut aller vite.

### 8. Provider LLM (+ moteur de visuels, découplé) — (LLM texte forké : provider ↔ Ollama local)
- **But** : (a) features IA **texte** (structuration/vision) via la clé LLM ; (b) **génération de visuels** via **Nano Banana = modèle image Google (Gemini)** — un moteur **distinct** de la clé LLM texte.
- **Variante LLM texte selon profil** (voir `decision-matrices.md §LLM`) : **managé → Gemini 2.5 Flash** *(défaut)* (ou GPT-4o) ; **open-source → Ollama + modèles ouverts** (local/self-host).
- **Méthode (managé — provider)** : B (clé dans `.env`). Défaut LLM aligné sur `_shared/stack-defaults.md` (Gemini 2.5 Flash) ; alt GPT-4o.
- **Méthode (open-source — Ollama local)** : B sans clé — Ollama tourne en local/self-host. L'utilisateur donne l'**URL locale** (`OLLAMA_URL`, ex. `http://localhost:11434`) dans `~/.saas-factory/.env` ; **pas de clé d'API** (accès local). On connecte, on ne provisionne pas.
  - **Sonde** : l'URL Ollama répond (`GET /api/tags` liste les modèles tirés) → OK. Écriture : `providers.llm = "ollama"` — l'URL locale vit en `.env` (`OLLAMA_URL`, **pas de clé**), **jamais** en config.
  - **CAVEAT HONNÊTE (à dire franchement)** : modèles locaux **moins puissants** que Gemini/GPT (structuration/vision moins fiables) → choix souveraineté/coût **à assumer**, on ne le maquille pas.
  - **Visuels** : Nano Banana reste **provider Google** — Ollama sur le texte **ne** rend **pas** les visuels open-source. Sans clé Google → `visuals = "none"` (voir couplage ci-dessous).
- **Couplage clé ↔ visuels (le point à ne pas rater)** :
  - `llm = "gemini"` → **la même clé Google** couvre le texte **et** Nano Banana → `providers.visuals = "nano-banana"`.
  - `llm = "gpt-4o"` (ou tout non-Google) → la clé LLM **ne** donne **pas** accès à Nano Banana. Deux options :
    1. déposer **en plus** une **clé Google** dédiée (`GOOGLE_API_KEY` / `GEMINI_API_KEY`) pour les visuels → `providers.visuals = "nano-banana"` ;
    2. **sauter** les visuels → `providers.visuals = "none"` (fallback honnête, `safety-rails.md` §6 ; l'étape 11 désactivera la génération d'images).
- **Ordre** : indiquer où créer la/les clé(s) → dépôt dans `.env` par l'utilisateur.
  > 🚨 **NE COLLE JAMAIS la clé LLM/Google dans le chat.** Elle va **uniquement** dans `~/.saas-factory/.env`. Collée ici = compromise → à révoquer.
- **Critère de passage** : variable de clé LLM présente/non-placeholder ; **si `visuals = "nano-banana"` avec un LLM non-Google**, vérifier aussi la présence de la clé Google.
- **Écriture** : `providers.llm = "gemini"` (ou autre) **+** `providers.visuals = "nano-banana" | "none"`.
- **Micro-exemple** : *« LLM = GPT-4o (clé OpenAI en `.env`). Pour les visuels Nano Banana il faut une clé Google : tu en déposes une → `visuals = "nano-banana"`, sinon je marque `visuals = "none"` et l'étape 11 coupera la génération d'images. »*

## Data-flow — d'où viennent les valeurs, où elles atterrissent

```
Utilisateur ──OAuth──▶ MCP hébergé ──▶ session déléguée (cloudflare/vercel/stripe)
                                              └─ aucun secret côté plugin
Utilisateur ──dépose token──▶ ~/.saas-factory/.env (chmod 600) ──▶ MCP local (github PAT, supabase access token)
Utilisateur ──dépose clé/URL──▶ ~/.saas-factory/.env (chmod 600) ──▶ API directe managée (resend, llm/visuels, obs)
Utilisateur ──dépose URL+token/clé d'instance──▶ ~/.saas-factory/.env ──▶ API directe self-host (supabase self-host, gitea/forgejo, coolify, posthog/glitchtip) ; ollama = URL locale, pas de clé
                                              └─ le plugin écrit/lit des NOMS + URL d'instance, jamais des valeurs de clé en chat
infra-setup ──écrit──▶ ~/.saas-factory/config.json (non-secret : domaine, hosting, providers, setup_complete)
                                              │
                          (plus tard, par projet)
11-project-setup ──lit──▶ config.json + .env + sessions MCP ──▶ provisionne le réel
```

## Checklist de connexion (par outil)
Les invariants **propres à la connexion** d'un outil. La **DoD de sortie complète** (prérequis consentement, `setup_complete`, interdits durs, SKIP, récap) vit **une seule fois** dans `failure-modes.md` — ne pas la redupliquer ici.
- [ ] Outil traité **un par un** ; aucune clé/token brut passé en conversation.
- [ ] Sonde réussie avant tout `connected` : **appel MCP/API en lecture OK** (méthode A) ou **variable présente/non-placeholder** (méthode B) — jamais de `connected` sans preuve.
- [ ] **Capacité d'ÉCRITURE prouvée (pas seulement l'accès lecture)**, sinon `"none"` : GitHub `X-OAuth-Scopes` ⊇ `repo`(+`workflow`) · Cloudflare DNS:Edit (record TXT jetable ou avertissement assumé) · Resend `GET /domains` = 200 (Full access) · Vercel bon scope d'équipe · Supabase org OK + quota free-tier. Voir tableau **§Scopes**. Un token lecture-seule ≠ `connected`.
- [ ] Scope **minimal** vérifié (`safety-rails.md` §3 — pas plus large que le tableau) ; token méthode A locale (GitHub/Supabase) en `.env` chmod 600.
- [ ] Valeur écrite dans `config.json` (`connected` / nom de provider / `"none"`), **aucune ressource facturable créée** (pas de `create_project`, repo, DNS).

→ **DoD globale de sortie + interdits durs : `failure-modes.md`.**
