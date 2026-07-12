# Référence — Schéma de la config globale (`~/.saas-factory/`)

Écrite une fois par `infra-setup`, lue par `11-project-setup` à chaque projet. **Jamais dans un projet, jamais commitée.**

## Emplacement
- `~/.saas-factory/config.json` — réglages **non-secrets** : **profil** (managé/open-source), providers **et leur variante**, domaine, hébergeur, options.
- `~/.saas-factory/.env` (**chmod 600**) — déposé par l'utilisateur : les clés/tokens **secrets** + les **URLs d'instance self-host** (voir plus bas). Alternative : gestionnaire de secrets / keychain OS.
- Les connexions **MCP hébergées en OAuth** (Cloudflare, Vercel, Stripe) vivent **côté connecteur** — aucun secret stocké par le plugin. GitHub/Supabase (MCP local) et les variantes **self-host** lisent un **token** en `.env` (jamais collé en chat). Voir `connection-procedure.md` + `skills/11-project-setup/references/mcp-map.md`.

## Structure `config.json`
```json
{
  "profile": "managed",              // managed | open-source  — POSTURE PAR DÉFAUT, overridable par service ci-dessous
  "domain": "tondomaine.com",
  "email_from": "noreply@tondomaine.com", // OPTIONNEL — défaut dérivé: noreply@<domain> ; domaine d'envoi générique = mail.<domain> (vérifié 1×, réutilisé). NON-secret.
  "hosting": "vercel",               // vercel | cloudflare | coolify (self-host)
  "providers": {
    "repo": "github",                // github | gitea | forgejo (self-host)
    "db": "supabase",                // supabase (cloud) | supabase-self-host
    "cloudflare": "connected",       // DNS + CDN — PROVIDER-ONLY (pas de fork)
    "email": "resend",               // resend | postmark — PROVIDER-ONLY
    "billing": "none",               // stripe | none  (none si l'utilisateur ne vend pas)
    "observability": "sentry+posthog", // | posthog-self-host+glitchtip | none
    "llm": "gemini",                 // gemini | gpt-4o | ollama (self-host)
    "visuals": "nano-banana"         // nano-banana (Google/Gemini) | none
  },
  "setup_complete": true
}
```

> **`profile` = posture, pas verrou** : `"managed"` pose les défauts managés (repo=github, db=supabase cloud, hosting=vercel, obs cloud), `"open-source"` pose les défauts self-host (repo=gitea/forgejo, db=supabase-self-host, hosting=coolify, obs posthog-self-host+glitchtip, llm=ollama). Chaque clé de `providers`/`hosting` **override** le profil au cas par cas (`decision-matrices.md §Profil`).
> **`llm` ≠ `visuals`** : Nano Banana est un modèle image **Google**. `llm="gemini"` → même clé Google pour les deux. `llm="gpt-4o"`/`"ollama"` → `visuals="nano-banana"` **seulement** si une clé Google dédiée est déposée, sinon `"none"`.
> **Provider-only** (pas de branche self-host) : `cloudflare` (DNS), `email` (délivrabilité), `billing` (Stripe). Le profil `open-source` ne les bascule pas.
> **`email_from` (optionnel, NON-secret).** Adresse d'expédition par défaut ; défaut **dérivé** = `noreply@<domain>`. Injectée telle quelle comme `EMAIL_FROM` dans l'env du projet (non-secret aussi). Le **domaine d'envoi générique** de toute la factory est **`mail.<domain>`** (sous-domaine, **vérifié une seule fois** dans Resend puis réutilisé par tous les projets — pas de domaine par projet). `email_from`/`EMAIL_FROM` et le domaine d'envoi **restent dans `config.json` / env projet, jamais dans `.env` secrets** ; le seul secret email est `RESEND_API_KEY` (`.env`, tableau ci-dessous). Sert les **deux flux** : confirmation de compte (Supabase Auth, **SMTP = `smtp.resend.com`**) **et** transactionnel (API Resend).

## Secrets & URLs self-host — dans `.env` (jamais `config.json`)
| Variante | Variables `.env` |
|---|---|
| GitHub (managé) | `GITHUB_PERSONAL_ACCESS_TOKEN` |
| **Gitea/Forgejo** (self-host) | `GITEA_URL` + `GITEA_TOKEN` |
| Supabase (managé) | `SUPABASE_ACCESS_TOKEN` |
| **Supabase self-host** | `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (+ `SUPABASE_ANON_KEY`) |
| Vercel (managé) | OAuth côté connecteur |
| **Coolify** (self-host) | `COOLIFY_URL` + `COOLIFY_API_TOKEN` |
| Email | `RESEND_API_KEY` (ou Postmark) |
| Obs self-host | `POSTHOG_HOST` + DSN GlitchTip/Sentry |
| LLM `ollama` (self-host) | `OLLAMA_URL` (**pas de clé**) |

L'**URL d'une instance self-host n'est pas un secret** mais vit avec son token en `.env` (un seul endroit) ; `config.json` ne dit **que** *quelle variante* (`repo:"gitea"`), pas *où*.

### Variante SKIP (setup sauté → mode local)
Si l'utilisateur **saute** (`consent-briefing.md`) : `{ "setup_complete": false, "mode": "local" }`. L'étape 11 lit `mode:"local"` → **scaffold local + `tech/api-keys-guide.md`**, aucun provisioning réel. `infra-setup` reste **relançable**.

### Valeurs d'état
Chaque clé prend : une **variante** validée (`"github"`, `"gitea"`, `"supabase-self-host"`, `"coolify"`, `"ollama"`…), `"connected"` (sonde OK, cas provider-only sans variante comme cloudflare), ou `"none"` / `"skipped"`. **Jamais** de variante déclarée sans **sonde réussie** (`failure-modes.md`).

## Règle de lecture (par `11-project-setup`)
Lit `profile` + `providers.*` + `hosting` → **route** chaque provisioner sur la bonne branche (managé = MCP officiel / self-host = API + URL/token `.env`, `mcp-map.md §Routage`). Un provider absent / `"none"` → **fallback** (guide) pour ce provider sans bloquer le reste. `billing:"none"` → aucun bloc billing. Trou dans le **socle** (`repo`/`db`) → automatisation **partielle** (matrice config-partielle). Variante self-host **sans son `*_URL`/token en `.env`** → repli honnête (on ne provisionne pas à l'aveugle).

## Reconfiguration (relance sur config existante)
`infra-setup` relancé sur un `config.json` présent → **ne pas écraser en aveugle** : proposer « changer de profil / ajouter un outil / basculer un service managé↔self-host / corriger / annuler ». Mise à jour ciblée, pas régénération complète.

## Ce qui ne va JAMAIS dans `config.json`
Aucune valeur secrète (clés, tokens, `service_role`, DSN). `config.json` = **non-secret** : profil, variantes `providers`, domaine, `email_from`, hébergeur, `setup_complete`. Secrets + URLs self-host → `.env` (chmod 600) ; sessions OAuth → côté connecteur.
