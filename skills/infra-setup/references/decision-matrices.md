# Référence — Matrices de décision (condition → action)

Les choix que `infra-setup` tranche pendant la connexion. Objectif : **décider vite et de façon déterministe**, sans transformer l'onboarding en interrogatoire. La plupart des défauts viennent de `_shared/stack-defaults.md` — on ne les redemande pas, on les **applique** ; on n'interroge que là où le choix dépend vraiment de l'utilisateur (domaine, hébergement, vendre ou non, **posture manage vs open-source**).

## Sommaire

- Matrice — Profil manage vs open-source (posée UNE fois, en tête de setup)
- Principe — ne demander que ce qui n'a pas de bon défaut
- Matrice — Hébergement (managé ↔ open-source)
- Matrice — Repo + CI (GitHub managé ↔ Gitea/Forgejo self-host)
- Matrice — BDD + Auth (Supabase cloud ↔ Supabase self-host)
- Matrice — Observabilité (cloud ↔ self-host)
- Matrice — LLM texte (provider ↔ Ollama local)
- Matrice — Services provider-only (honnêteté : pas de fork open-source pertinent)
- Matrice — Billing (Stripe optionnel)
- Matrice — Observabilité
- Matrice — Provider LLM & moteur de visuels (découplés)
- Matrice — Périmètre de connexion selon la réponse au consentement
- Matrice — Config partielle → conséquence par projet (ce que lira l'étape 11)
- Modes d'échec de décision + traitement

## Matrice — Profil manage vs open-source (posée UNE fois, en tête de setup)
Le plugin **laisse le choix** entre managé et self-host, pour chaque service où les deux existent vraiment. Une **seule question** au démarrage fixe la **posture par défaut** ; chaque service forké peut ensuite être basculé individuellement (override). Interaction minimale : **1 question profil + override optionnel par service**.

- **Forcing — la question profil (une phrase, défaut assumé)** : « Posture par défaut : **(a) Managé** — le plus simple, zéro-ops, déjà validé *(défaut)* — ou **(b) Open-source / self-host** — tu maîtrises tout, coût fixe ? »
- **Défaut = (a) Managé.** Si l'utilisateur ne tranche pas → managé, on n'insiste pas.

| Service (fork réel) | Profil **Managé** *(défaut)* | Profil **Open-source / self-host** |
|---|---|---|
| Repo + CI | **GitHub** | **Gitea / Forgejo** self-host (ou GitLab self-host) |
| BDD + Auth | **Supabase cloud** | **Supabase self-hosted** (Docker/VPS) |
| Hébergement | **Vercel / Cloudflare** | **Coolify** (self-host, 1 VPS) |
| Observabilité | **Sentry + PostHog cloud** | **PostHog self-host + GlitchTip** (ou Sentry self-host) |
| LLM texte | **Gemini / GPT** (provider) | **Ollama + modèles ouverts** (local/self-host) |

- **Override par service** : le profil pose le défaut ; l'utilisateur peut basculer **un** service à contre-courant (ex. profil managé mais BDD self-host) sans changer les autres. On applique, on ne redemande pas le reste.
- **Provider-only (pas de fork open-source honnête)** : **DNS/CDN** (Cloudflare), **email transactionnel** (Resend/Postmark), **paiement** (Stripe) → voir matrice dédiée plus bas. Le profil open-source **ne** les bascule **pas** : self-héberger n'y répond pas au besoin cœur.

## Principe — ne demander que ce qui n'a pas de bon défaut
Les services **forkés** (repo, BDD, hébergement, obs, LLM) **offrent le choix OSS/managé** : le défaut suit le **profil** (matrice ci-dessus), un **override par service** reste possible — le tout en **interaction minimale** (on applique le profil, on ne réinterroge pas service par service sauf override explicite). Les services **provider-only** (DNS, email, paiement) n'ont pas de fork : on applique le provider, swappable entre providers mais pas « open-source ».

| Réglage | A-t-on un bon défaut ? | On demande ? |
|---|---|---|
| Domaine racine | non (propre à l'utilisateur) | **oui** (forcing, `connection-procedure.md §3`) |
| **Profil manage vs open-source** | oui (managé) | **oui, une fois** (forcing profil ci-dessus) — pose la posture, override par service |
| Hébergement | oui (selon profil : Vercel / Coolify) | **oui, léger** (matrice ci-dessous) |
| Vendre / billing | non (dépend du modèle) | **oui** (forcing court) |
| BDD, CI, obs, LLM | oui (défaut = selon profil) | non — appliquer le défaut du profil, **override possible par service** |
| DNS, provider email | oui (`stack-defaults.md`, provider-only) | non — appliquer le défaut, mentionner qu'il est swappable entre providers |
| **Adresse d'expéditeur (From, `email_from`)** | défaut **proposé** (`no_reply@<domain>`, ou `mail.` si apex déjà email) mais dépend de l'utilisateur | **oui, léger** (forcing court, `connection-procedure.md §5`) — son **domaine = celui vérifié dans Resend** (gratuit = 1 seul) |
| **Identité git-author (`git_author.email` / `.name`)** | défaut **proposé** (l'email du compte Vercel connecté, lisible via `GET /v2/user`) mais dépend de l'utilisateur | **oui, léger** (capturé à l'onboarding comme `email_from`, `config-schema.md §git_author`) — **doit** être l'email de ton compte **GitHub qui est AUSSI membre de ta team Vercel** (souvent le même email GitHub+Vercel) ; sinon Vercel renvoie **BLOCKED** au déploiement (`failure-modes.md`, invariant complet `config-schema.md §git_author`) |

## Matrice — Hébergement (managé ↔ open-source)
Trancher **un** provider et ne connecter que celui-là. Défaut = selon **profil** (managé → Vercel/Cloudflare ; open-source → Coolify).

| Condition (signal utilisateur / projet) | Choix | Pourquoi |
|---|---|---|
| Profil managé, rien de particulier | **Vercel** (défaut managé) | Next.js zéro-ops, sous-domaines + preview auto |
| Profil open-source / « self-host / maîtriser les coûts / un seul VPS » | **Coolify** (open-source) | 1 VPS pour tous les projets, coût fixe, tu maîtrises tout |
| « Edge / latence mondiale / je suis déjà chez Cloudflare » | **Cloudflare Pages/Workers** (managé) | edge natif, cohérent avec le DNS déjà là |
| Contrainte data-residency stricte / pas de SaaS US | **Coolify** (VPS choisi) ou CF (régions) | contrôle de l'emplacement |
| Indécis | **Vercel** | défaut managé, réversible — on ne bloque pas là-dessus |

- **Forcing court** : « Hébergement : Vercel par défaut (le plus simple). Tu veux plutôt self-host (Coolify, coût fixe, open-source) ou edge (Cloudflare) ? » — une phrase, défaut assumé.
- **Red-flag** : connecter **plusieurs** hébergeurs « au cas où » → non, un seul, les autres restent disponibles via `stack-defaults.md` plus tard.

## Matrice — Repo + CI (GitHub managé ↔ Gitea/Forgejo self-host)
Défaut = selon **profil**. Fork réel : GitHub (managé) ou Gitea/Forgejo self-host (open-source, GitLab self-host aussi valable).

| Condition | Choix | Connexion (voir `connection-procedure.md §1`) |
|---|---|---|
| Profil managé (défaut) | **GitHub** | PAT `repo`+`workflow` en `.env` (MCP `github`) |
| Profil open-source / « je veux héberger mon Git » | **Gitea / Forgejo** self-host | URL de l'instance + **token** en `.env` |
| Déjà une instance GitLab self-host | **GitLab** self-host | URL + token en `.env` |

- **Override** : profil managé mais l'utilisateur pointe une instance Gitea → basculer ce seul service, garder le reste au profil.
- **Caveat** : le socle du plugin est le plus rodé sur GitHub (Actions) ; sur Gitea/Forgejo, la CI est du **Gitea Actions / Woodpecker** → à câbler côté projet, dire franchement que c'est moins clé-en-main.

## Matrice — BDD + Auth (Supabase cloud ↔ Supabase self-host)
Défaut = selon **profil**. Fork réel : même produit, hébergement différent.

| Condition | Choix | Connexion (voir `connection-procedure.md §2`) |
|---|---|---|
| Profil managé (défaut) | **Supabase cloud** | access token perso en `.env` (MCP `supabase`) |
| Profil open-source / « données chez moi / coût fixe » | **Supabase self-hosted** (Docker/VPS) | URL de l'instance + `service_role` / `anon` key en `.env` |

- **Override** : profil managé mais BDD self-host (data-residency) → basculer la seule BDD.
- **Caveat honnête** : le self-host Supabase = **tu gères** Postgres, backups, upgrades. Zéro-ops perdu, contrôle gagné.

## Matrice — Observabilité (cloud ↔ self-host)
Défaut = selon **profil**. Reste **optionnel** (sauter sans culpabilité).

| Condition | Choix | Connexion (voir `connection-procedure.md §7`) |
|---|---|---|
| Profil managé + veut erreurs + usage | **Sentry + PostHog cloud** (`"sentry+posthog"`) | DSN/clés en `.env` ou OAuth |
| Profil managé, « juste les erreurs » | **Sentry** cloud seul (`"sentry"`) | `SENTRY_DSN` en `.env` |
| Profil open-source / « tout chez moi » | **PostHog self-host + GlitchTip** (ou Sentry self-host) | URL(s) d'instance + clés en `.env` |
| « pas maintenant » | **saute** (`"none"`) | — |

- **Override** : profil managé mais analytics self-host (RGPD) → basculer PostHog seul en self-host.
- GlitchTip = alternative open-source compatible Sentry (SDK Sentry pointé sur l'instance GlitchTip).

## Matrice — LLM texte (provider ↔ Ollama local)
Défaut = selon **profil**. Fork réel mais **caveat de puissance** à assumer.

| Condition | Choix | Connexion (voir `connection-procedure.md §8`) |
|---|---|---|
| Profil managé (défaut) | **Gemini 2.5 Flash** (ou GPT-4o) | clé LLM en `.env` |
| Profil open-source / « rien ne sort de ma machine / coût fixe » | **Ollama + modèles ouverts** (local/self-host) | URL locale d'Ollama en `.env`, **pas de clé** |

- **CAVEAT HONNÊTE (à dire franchement)** : les modèles locaux (Ollama) sont **moins puissants** que Gemini/GPT — structuration/vision moins fiables. Choix légitime pour la souveraineté/coût, mais **à assumer**, on ne le maquille pas.
- **Visuels (Nano Banana)** : reste **provider Google** (pas d'équivalent open-source local pertinent ici) — voir matrice LLM/visuels ci-dessous. Un profil open-source sur le LLM **ne** rend **pas** les visuels open-source.

## Matrice — Services provider-only (honnêteté : pas de fork open-source pertinent)
Pour ces services, l'auto-hébergement **ne répond pas au besoin cœur** → le profil open-source **ne les bascule pas**. Swappables entre **providers**, pas vers « open-source ».

| Service | Provider (défaut) | Pourquoi pas d'open-source ici |
|---|---|---|
| **DNS + CDN** | **Cloudflare** | le DNS d'un domaine public = un provider ; auto-héberger l'autoritatif = hors sujet. Autres providers DNS possibles, mais pas « open-source ». |
| **Email transactionnel** | **Resend / Postmark** | la **délivrabilité** = un provider (réputation IP, DKIM/SPF gérés). Self-host SMTP possible mais **délivrabilité fragile** → **à flaguer honnêtement**, non recommandé par défaut. |
| **Paiement** | **Stripe** | pas d'auto-hébergement du paiement carte (PCI, réseaux). |

## Matrice — Billing (Stripe optionnel)
| Condition | Action |
|---|---|
| « Je veux facturer / vendre un abonnement » | connecter **Stripe** (mode test), `billing = "stripe"` |
| « Gratuit / je verrai plus tard / pas sûr » | **saute**, `billing = "none"` — recâblable plus tard sans tout refaire |
| « Oui mais en prod tout de suite » | connecter en **mode test** d'abord ; le live exige KYC → guidé, jamais simulé (`safety-rails.md` §6) |
| Mobile plutôt que web | noter RevenueCat (`stack-defaults.md`) ; hors périmètre web de ce setup |

- **Forcing court** : « Tu comptes faire payer tes utilisateurs ? Si non, je saute le paiement (recâblable plus tard). »
- **Ne pas insister** si « non » — un `billing = "none"` est un état parfaitement sain ; l'étape 11 ne câblera aucun bloc billing.

## Matrice — Observabilité
| Condition | Action |
|---|---|
| Veut suivre erreurs + usage dès le début | Sentry + PostHog (`observability = "sentry+posthog"`) |
| « Juste les erreurs » | Sentry seul (`"sentry"`) |
| « Je veux aller vite, pas maintenant » | **saute** (`"none"`) — enrichissant, non bloquant |

## Matrice — Provider LLM & moteur de visuels (découplés)
**Nano Banana = modèle image Google (Gemini)** — c'est un moteur **distinct** du LLM texte. Le LLM texte et les visuels ne partagent une clé **que** si le LLM est Google. Deux réglages séparés : `providers.llm` (texte) et `providers.visuals` (images).

| Condition | LLM texte | Visuels (Nano Banana) |
|---|---|---|
| Défaut | Gemini 2.5 Flash (`stack-defaults.md`) → `llm = "gemini"` | **Nano Banana Pro** (`gemini-3-pro-image`) **couvert par la même clé `GEMINI_API_KEY`** → `visuals = "nano-banana"` |
| Déjà une clé OpenAI / préférence GPT | `llm = "gpt-4o"` (ou autre), clé dans `.env` | **non couvert** : soit **clé Google dédiée** (`GOOGLE_API_KEY`/`GEMINI_API_KEY`) → `visuals = "nano-banana"`, soit `visuals = "none"` (fallback, l'étape 11 coupe la génération d'images) |
| Pas de features IA texte prévues | `llm` sautable | mais **les visuels exigent quand même une clé Google** → clé déposée → `"nano-banana"`, sinon `"none"` |

- **Piège à éviter** : croire que « choisir un LLM » suffit pour les visuels. Avec un LLM non-Google, **aucune clé Google n'est capturée** → sans clé dédiée, `visuals = "none"`, on le dit franchement (pas de visuels fantômes).
- **Défaut adossé** : le moteur image par défaut (`stack-defaults.md`) est **Nano Banana Pro** (`gemini-3-pro-image`, Google) via `scripts/generate-visual.mjs` — visuels dérivés de `DESIGN.md`, jamais du stock ; swappable comme les autres.

## Matrice — Périmètre de connexion selon la réponse au consentement
(complète `consent-briefing.md`)

| Réponse consentement | Socle (GH+Supabase+CF+Host) | Email | Billing | Obs | LLM | `setup_complete` |
|---|---|---|---|---|---|---|
| OUI informé, complet | connecter | connecter | selon vente | selon envie | connecter | `true` |
| OUI mais « pas de paiement » | connecter | connecter | `"none"` | selon envie | connecter | `true` |
| OUI mais « juste le minimum » | connecter | selon envie | `"none"` | `"none"` | recommander | `true` |
| NON / hésitation | — | — | — | — | — | `false`, `mode:"local"` |
| Partiel (« pas de domaine encore ») | connecter ce qui est dispo | selon | selon | selon | selon | `true` avec trous marqués `"none"` |

## Matrice — Config partielle → conséquence par projet (ce que lira l'étape 11)
Aligne l'utilisateur sur l'effet réel de chaque trou (repris de `config-schema.md` « règle de lecture »).

| Trou dans `config.json` | Effet à l'étape 11 (`11-project-setup`) |
|---|---|
| `repo` absent | **socle cassé** → scaffold **local seul** + `tech/api-keys-guide.md`, pas de repo distant |
| `db` absent | **socle cassé** → pas de BDD réelle → fallback + invite à finir `infra-setup` |
| `cloudflare`/`domain` absent | host sur l'URL par défaut du provider, pas de sous-domaine custom (non bloquant) |
| `hosting` absent | tenter une alt (`stack-defaults.md`), sinon guide |
| `email = "none"` | features email désactivées, à câbler en Phase 4/5 (non bloquant) |
| `billing = "none"` | **aucun bloc billing câblé** (comportement voulu si l'utilisateur ne vend pas) |
| `observability = "none"` | pas d'instrumentation auto (non bloquant) |
| `llm` absent | features IA **texte** indisponibles jusqu'à dépôt de la clé (non bloquant) |
| `visuals = "none"` | **génération d'images (Nano Banana) désactivée** — requiert une clé Google même si le LLM texte est présent (non bloquant) |

**Règle transverse** : un trou dans le **socle** (github/supabase) → prévenir clairement que l'automatisation sera **partielle** et **recommander** de compléter `infra-setup`. Un trou en **périphérie** → simple mention, on n'insiste pas.

## Modes d'échec de décision + traitement
| Mode | Symptôme | Traitement |
|---|---|---|
| Sur-interrogation | on demande BDD/DNS/CI alors qu'ils ont un défaut | appliquer profil + `stack-defaults.md`, ne demander que domaine/host/vente + **1 question profil** |
| Choix OSS escamoté | ne jamais proposer l'alternative open-source d'un service forké | poser la **question profil** une fois ; le choix existe, défaut = managé |
| Profil sur-appliqué | poser la question profil à **chaque** service | poser **une seule fois** ; override par service **seulement si l'utilisateur le demande** |
| Faux open-source | vendre self-host DNS/email/paiement comme « open-source » | provider-only : honnête, pas de fork ; email SMTP self-host → flaguer délivrabilité |
| Ollama survendu | présenter les modèles locaux comme équivalents à Gemini/GPT | dire franchement : **moins puissants**, choix souveraineté/coût à assumer |
| Multi-hébergeur | connecter Vercel **et** Coolify **et** CF | un seul retenu ; les autres restent swappables |
| Billing imposé | pousser Stripe alors que l'utilisateur ne vend pas | respecter `"none"`, ne pas insister |
| Défaut masqué | choisir un provider exotique sans raison | rester sur `stack-defaults.md` sauf contrainte explicite |
| Trou socle minimisé | laisser croire « auto complet » avec supabase absent | dire franchement : automatisation **partielle**, compléter `infra-setup` |
