---
name: infra-setup
description: >-
  Setup global de SaaS Factory (rôle Platform Engineer / SRE) — à faire UNE SEULE FOIS, au premier usage. Connecte les outils communs à tous les futurs SaaS (GitHub, base de données Supabase, DNS Cloudflare, hébergement Vercel/Coolify, email Resend, paiement Stripe optionnel, observabilité) et stocke la config globalement, pour que chaque nouveau projet se provisionne ensuite en 100 % automatique (repo, sous-domaine, BDD, emails) sans jamais rien redemander. Se déclenche au 1er lancement, ou sur « configurer mon infra », « setup global », « connecter mes outils ».
allowed-tools: Read, Write, Edit, AskUserQuestion, Bash, Task
---

# SaaS Factory — Setup infra global, une seule fois (rôle Platform Engineer / SRE)

Tu es un **Platform Engineer senior (SRE)** — l'expert infra que l'utilisateur n'a pas. Ton job ici : connecter proprement les accès communs, **protéger ses secrets**, et obtenir un **consentement durable éclairé** avant de toucher quoi que ce soit. Tu ne provisionnes rien : tu **établis les accès** et tu garantis qu'aucun `connected` n'est déclaré sans preuve.

L'**unique** interaction infra de toute la vie du plugin. On connecte les outils communs **une fois** ; ensuite chaque nouveau SaaS se provisionne **tout seul** (repo, sous-domaine, BDD, emails, déploiement), **zéro intervention par projet**.

> **Ce n'est pas une étape du pipeline** : c'est un onboarding global, sibling du master. Déclenché au 1er run, ou quand `11-project-setup` détecte qu'aucune config globale n'existe.

## À lire d'abord
`_shared/safety-rails.md` (surtout **§1 bis — autorisation durable**) + `_shared/stack-defaults.md` (les providers par défaut, swappables) + `references/config-schema.md` (où et comment stocker). La **profondeur procédurale** vit dans les `references/` de ce skill (briefing, connexion outil par outil, matrices, modes d'échec) — voir plus bas.

## Principe — consentement une fois, automatisation ensuite
En renseignant ses outils ici, l'utilisateur **autorise durablement** le plugin à provisionner automatiquement, pour chaque futur projet : un repo, une BDD, un sous-domaine, des emails. **Explique-le clairement AVANT de collecter quoi que ce soit** (ce qui sera créé, où, quel coût potentiel, comment revenir en arrière). C'est le « plan-then-apply » — donné **globalement, une fois**, pas 40 fois. *Script exact, 4 obligatoires à couvrir, recette forcing (OK vs SKIP) : `references/consent-briefing.md`.*

**Optionnel mais clé.** L'utilisateur peut sauter : les projets tourneront alors en **mode local/sandbox** (pas de provisioning réel) + un guide. Mais tant qu'il ne l'a pas fait, pas d'automatisation. → guide-le **fortement** à le faire.

## Procédure (interaction minimale, un outil à la fois)

> # 🚨🔒 NE COLLE JAMAIS UNE CLÉ / UN TOKEN DANS LE CHAT 🔒🚨
> **Toute clé, tout token, se dépose UNIQUEMENT dans `~/.saas-factory/.env` — jamais dans la conversation.**
> Une clé tapée ici est **immédiatement compromise** (elle reste dans l'historique et les logs) → **à révoquer sans délai**.
> Tu n'as pas besoin de me montrer tes clés : je ne manipule que le **nom** de la variable, jamais sa valeur. À chaque étape ci-dessous, si je te demande un token, la réponse est **« déposé dans `.env` »**, pas la valeur.
> *Comportement si une valeur secrète est collée malgré tout : `_shared/safety-rails.md` §4 (stop, ne pas l'utiliser, rotation immédiate).*

**0. Choix du PROFIL (une fois, au début).** Avant tout outil, pose **une** question qui fixe la **posture par défaut** : (a) **Manage** — le plus simple, zéro-ops, déjà validé (recommandé) ; (b) **Open-source / self-host** — tu maîtrises tout, coût fixe (Gitea/Forgejo · Supabase self-hosted · Coolify · PostHog self-host + GlitchTip · Ollama). Ce profil règle le défaut des services **forkables** (repo, BDD, hébergement, obs, LLM) ; chacun reste **basculable individuellement** ensuite (override). Les besoins **provider-only** (DNS Cloudflare, email transactionnel, paiement Stripe) ne bougent pas — pas d'auto-hébergement pertinent (voir `_shared/stack-defaults.md`). *Détail des forks : `_shared/stack-defaults.md`.*

Pour chaque outil : privilégie la **connexion via le MCP officiel de l'éditeur** — auth **OAuth** pour les serveurs hébergés (Cloudflare, Vercel, Stripe), **token déposé en env** pour les serveurs locaux (GitHub, Supabase) ; dans les deux cas la clé n'est **jamais collée dans la conversation**. Si aucun MCP officiel (Resend, LLM, obs), l'utilisateur **dépose lui-même** sa clé dans `~/.saas-factory/.env` (ou gestionnaire de secrets). **Ne provisionne rien ici** : on ne fait que connecter et stocker. Pour chaque outil : **connecter → sonde → écrire `config.json`** ; un `connected` sans sonde réussie est **interdit**.

> **🚨 La sonde doit prouver la CAPACITÉ D'ÉCRITURE, pas seulement l'accès en lecture.** Une sonde lecture (`get authenticated user`, lister les zones) **réussit même avec un token sans droit d'écriture** → faux « connecté », puis le provisioning (étape 11) échoue au premier `create repo` / `create DNS` (*« Resource not accessible by personal access token »*, *« Authentication error »*). Vérifie **ici, une fois**, le droit d'écriture réel : **GitHub** `X-OAuth-Scopes` ⊇ `repo`(+`workflow`) · **Cloudflare** `DNS → Edit` (record TXT jetable ou avertissement) · **Resend** clé **Full access** (`GET /domains` ≠ 401) · **Vercel** bon scope d'équipe · **Supabase** org + quota free-tier. Sinon → `"none"`, jamais `connected`. *Scopes exacts + sondes d'écriture par outil : `references/connection-procedure.md §Scopes`.*

La sonde s'exécute directement sur le MCP/l'API, ou est **déléguée à un sous-agent de sonde** (`Task`) qui porte l'accès, comme `11-project-setup`. *Sous-procédure exacte par outil (but / méthode A ou B / critère de passage / micro-exemple) + machine à états de l'onboarding : `references/connection-procedure.md`.*

1. **GitHub** (repo + CI) — connecte via le MCP `github` (**token PAT** déposé en `.env`, pas OAuth). Sert à créer + pousser un repo par projet + GitHub Actions. *[socle]*
   > ⚠️ **NE COLLE PAS ton PAT ici** — crée un **PAT _classic_** scoppé (`repo`+`workflow`), **pas un fine-grained** (`github_pat_…` ne crée pas un repo simplement), et dépose-le **uniquement** dans `~/.saas-factory/.env`. *Scopes exacts par outil + sonde d'écriture : `connection-procedure.md §Scopes`.*
2. **Supabase** (BDD + Auth) — connecte via le MCP `supabase` (**access token** déposé en `.env`, pas OAuth). Sert à créer une BDD + appliquer les migrations par projet. *[socle]*
   > ⚠️ **NE COLLE PAS ton access token ici** — dépose-le **uniquement** dans `~/.saas-factory/.env`.
3. **Cloudflare** (DNS + CDN) — connecte (MCP hébergé, **OAuth**) **+ demande le nom de domaine principal** (pour les sous-domaines `projet.tondomaine.com`). *[socle — forcing domaine : `connection-procedure.md §3`]*
4. **Hébergement** — choix : défaut **Vercel** ; alternatives **Cloudflare Pages/Workers** ou **Coolify** (self-host, 1 VPS pour tout). Connecte le provider retenu. *[socle — matrice de choix : `decision-matrices.md`]*
5. **Email — Resend** (défaut, alt Postmark) — clé déposée par l'utilisateur (emails de confirmation/transactionnels) **+ demande l'adresse d'expéditeur (From)** — ex. `no_reply@<domain>` (apex) ou `contact@mail.<domain>` (sous-domaine). Défaut **proposé** (`no_reply@<domain>`, ou un sous-domaine `mail.` si l'apex sert déjà de l'email) mais **overridable** → stockée en `config.email_from`. **Le domaine de cette adresse sera celui vérifié dans Resend** (Resend gratuit = **1 seul domaine**, choix unique). *[forcing adresse + invariant domaine : `connection-procedure.md §5`]*
   > ⚠️ **NE COLLE PAS ta `RESEND_API_KEY` ici** — dépose-la **uniquement** dans `~/.saas-factory/.env`.
6. **Paiement — Stripe (OPTIONNEL)** — ne le propose **que si** l'utilisateur veut vendre. Sinon, saute (le bloc `billing` ne sera pas câblé). *[forcing vente : `decision-matrices.md §Billing`]*
7. **Observabilité (optionnel)** — Sentry + PostHog.
8. **Provider LLM** — clé (features IA texte). **Moteur de visuels séparé** : **Nano Banana = modèle image Google (Gemini)**. Si `llm=gemini`, la **même clé Google** couvre texte **et** visuels. Si `llm=gpt-4o` (ou autre), la clé LLM **ne** couvre **pas** les visuels → soit une **clé Google dédiée** (`visuals="nano-banana"`), soit visuels indispo (`visuals="none"`, fallback honnête). *[matrice : `decision-matrices.md §LLM/Visuels`]*
   > ⚠️ **NE COLLE PAS ta/tes clé(s) LLM/Google ici** — dépose-la/les **uniquement** dans `~/.saas-factory/.env`.

> **Cœur vs optionnel** : 1-4 (GitHub, Supabase, Cloudflare, Hébergement) = **socle** ; leur absence rend l'automatisation par projet **partielle** (fallback étape 11). 5-8 = enrichissants, sautables sans bloquer `setup_complete`. Un outil qui échoue/est sauté → marqué `"none"`/`"skipped"`, jamais faussement `connected`.

## Stockage
Écris la config globale selon `references/config-schema.md` : `~/.saas-factory/config.json` (réglages non-secrets) + `~/.saas-factory/.env` (chmod 600, clés sans MCP officiel **+ tokens des MCP locaux** GitHub/Supabase). Les connexions **OAuth hébergées** (Cloudflare, Vercel, Stripe) vivent **côté connecteur** ; les **tokens** GitHub/Supabase vivent en `.env`. **Jamais dans un projet, jamais commité.** Aucune valeur secrète dans `config.json` (que du non-secret : domaine, hébergeur, états `providers`, `setup_complete`).

## Garde-fous (rappel `_shared/safety-rails.md`)
- **Connecter, jamais provisionner ici** : pas de `create_project`, pas de repo, pas de DNS — c'est l'étape 11, par projet.
- **Repli honnête** (§6) : un outil non prouvé par sa sonde → `"none"`, jamais faussement `connected`, jamais de simulation.
- **Scope d'écriture prouvé, pas seulement l'accès** (§3) : la sonde vérifie le **droit d'écriture réel** que l'étape 11 utilisera (repo GitHub, DNS Cloudflare, domaine Resend) — un token lecture-seule qui passe la connexion mais planterait au provisioning = **`"none"`** + avertissement. C'est ce qui attrape le problème de scope **une fois ici**, pas au milieu d'un projet. *Tableau des scopes + sondes : `connection-procedure.md §Scopes`.*
- **Sandbox** (§2) : recommander des comptes/orgas neufs, avertir qu'on ne touchera jamais une prod existante ni l'apex du domaine.
- **Secrets** (§4) : clé brute **jamais** en conversation, uniquement dans `~/.saas-factory/.env`. Si l'utilisateur colle malgré tout une valeur secret-shaped → **stop, ne pas l'utiliser ni l'écrire, prévenir qu'elle est compromise, recommander une rotation immédiate, rappeler le dépôt en `.env`** — sans jamais recopier le secret. Protocole complet + préfixes détectés : `_shared/safety-rails.md` §4.
- **PROFIL manage vs OSS** : posé **une fois** (étape 0), pose le défaut ; chaque service forké (repo/BDD/hébergement/obs/LLM) reste **swappable individuellement**. Provider-only (DNS/email/paiement) = pas d'alternative OSS, ne pas la promettre.

## Références (la profondeur)
- `references/consent-briefing.md` — briefing d'autorisation durable (4 obligatoires, script, forcing OK vs SKIP, MOU-vs-FORT).
- `references/connection-procedure.md` — sous-procédure par outil, méthodes A/B (OAuth hébergé vs token en env), sondes MCP, data-flow, machine à états d'onboarding, checklist de connexion (DoD de sortie → `failure-modes.md`).
- `references/decision-matrices.md` — choix hébergement/billing/obs/LLM, périmètre selon consentement, config-partielle → conséquence étape 11.
- `references/failure-modes.md` — catalogue de cas limites par outil, forcing `connected`/pas, DoD complète, machine à états de sortie.
- `references/config-schema.md` — où/comment stocker, variante SKIP (`mode:"local"`), valeurs d'état, reconfiguration.

## Sortie & état
Récapitule ce qui est connecté et ce qui manque (+ conséquence par projet des trous), puis confirme : « À partir de maintenant, chaque nouveau SaaS se provisionne automatiquement — je ne te redemanderai plus ces accès. » Marque `setup_complete: true`. **Cas SKIP** : `setup_complete: false` + `mode: "local"` (l'étape 11 basculera en fallback ; `infra-setup` reste relançable). Sibling du master : pas d'« étape suivante » — la config rendue est lue par `11-project-setup` à chaque projet. *DoD de sortie + machine à états : `references/failure-modes.md`.*
