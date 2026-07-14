# Référence — Skills de compétence à consulter / vendorer

Ces skills officiels **ne provisionnent pas** (pas de « create project ») mais rendent les sous-agents **compétents** (RLS correcte, Wrangler correct) — ils évitent l'hallucination. À **vendorer** dans `vendor/` (MIT/Apache — batch réseau : `{PLUGIN_ROOT}/vendor/VENDORING-TODO.md`) et à consulter avant d'écrire migrations / DNS.

| Skill | Source | Licence | Ce qu'il apporte |
|---|---|---|---|
| `supabase` + `supabase-postgres-best-practices` | `supabase/agent-skills` | MIT | Auth, **RLS**, client libs, perf Postgres corrects |
| `cloudflare` + `wrangler` | `cloudflare/skills` | Apache-2.0 | Workers / Pages / DNS / Wrangler corrects |
| `skill-creator`, `mcp-builder` | `anthropics/skills` | Anthropic | Pour construire / étendre le plugin lui-même |

## Template micro-SaaS (le code poussé = le moat)
Le contenu de `_shared/blocks/` (le châssis) se base sur un **template forké** (MIT) :
- Base : **`vercel/nextjs-subscription-payments`** (Next.js + Supabase + Stripe).
- Greffe email : **`mickasmt/next-saas-stripe-starter`** (Resend + React Email).
- À étudier : **`wasp-lang/open-saas`** (packaging IA + deploy).

## Quand consulter quoi (avant d'écrire, pas après)
Le sous-agent consulte le skill de compétence **avant** de produire l'artefact risqué, jamais en réparation après coup.

| Le sous-agent s'apprête à... | Consulte d'abord | Pour éviter |
|---|---|---|
| écrire une migration SQL | `supabase-postgres-best-practices` | schéma non normalisé, index manquants |
| écrire une **policy RLS** | `supabase` (section RLS) | table multi-tenant sans isolation → fuite de données |
| choisir le client Supabase (server/browser) | `supabase` (client libs) | service_role exposé côté client |
| écrire une config DNS / Pages | `cloudflare` | record mal typé, sous-domaine qui ne résout pas |
| scripter un déploiement Wrangler | `wrangler` | commande obsolète / hallucinée |

## Recette anti-hallucination
- **Ask exact** : « quelle est la bonne forme d'une policy RLS pour une table `tenant_id`-scopée selon Supabase ? »
- **Push-until** : jusqu'à une forme **citée du skill**, pas une forme « plausible » inventée.
- **Red-flag — refuser** : toute policy RLS écrite de mémoire sans passer par le skill ; toute table multi-tenant **sans** RLS (→ `[SÉCU]` bloquant).
- **Routage** : compétence trouvée dans le skill → applique ; absente → repli honnête (loguer « bonne pratique non confirmée », ne pas deviner sur du sécurité-sensible).

## Statut & discipline
> **Vendoring** : à ajouter au `vendor/` dans un batch dédié (procédure exacte : `{PLUGIN_ROOT}/vendor/VENDORING-TODO.md`). En attendant, les sous-agents appliquent les bonnes pratiques décrites ici. **Discipline licence** : ne vendorer que **MIT/Apache**, conserver les notices (LICENSE + PROVENANCE), comme pour les vendors existants.
