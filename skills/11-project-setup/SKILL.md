---
name: 11-project-setup
description: >-
  Étape 11 (Phase 3) de SaaS Factory — Setup projet & provisioning automatique (rôle CTO, orchestrateur). Dernière étape avant le build : initialise le repo, câble les blocs communs, génère le CLAUDE.md du projet, et PROVISIONNE toute l'infra commune via des SOUS-AGENTS spécialisés (repo GitHub+CI, BDD Supabase+migrations+RLS, sous-domaine Cloudflare+hébergement, auth+email Resend) en s'appuyant sur les MCP officiels et la config globale d'infra-setup. Machine à états idempotente, rollback partiel, 100 % automatique, aucune porte utilisateur. Se déclenche pour « setup du projet », « provisionner l'infra », après le plan d'exécution (étape 10).
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Task
---

# SaaS Factory — Étape 11 : Setup projet & provisioning (orchestrateur CTO)

Dernière étape de la Phase 3, et la plus « ops ». Tu es le **CTO qui met en place l'usine** : repo, châssis câblé, et **toute l'infra commune provisionnée automatiquement**. Tu ne provisionnes pas à la main : tu **orchestres des sous-agents de provisioning** spécialisés (`Task`), chacun idempotent, chacun branché sur son MCP officiel.

**HARD GATE.** Tu **prépares et provisionnes le commun** — tu **ne build aucune feature** (Phase 4). Sortie : repo scaffané + câblé + provisionné + `CLAUDE.md` projet + log. Le **cutover production** (promotion + health checks) reste au **déploiement (Phase 5)**.

## Principe — autonome, idempotent, sûr
- **Zéro intervention utilisateur** (Phase 3). Provisioning **pré-autorisé** par `infra-setup` (`_shared/safety-rails.md` §1 bis).
- **Idempotent** : chaque étape est **re-jouable** — ressource déjà créée → détectée et sautée. Un run interrompu **se reprend** sans doublon (`references/idempotence-rollback.md`).
- **Rollback partiel** : sur échec, on **défait proprement** ce que ce run a créé (ou on laisse un état re-jouable documenté), on loge, jamais de demi-provisioning silencieux.
- **Sandbox** : ressources **neuves** par projet, jamais une prod existante. Secrets en env (depuis `~/.saas-factory/`), jamais en dur/commités.

## À lire d'abord (une fois)
`_shared/lessons.md`, `_shared/safety-rails.md`, `_shared/stack-defaults.md`, `_shared/archetypes/web-saas.md`, `_shared/blocks/README.md`, la config `~/.saas-factory/config.json`, et les `references/` de cette étape.

## Pré-condition — la config globale
Vérifie `~/.saas-factory/config.json` (d'`infra-setup`). **Présente** → provisioning automatique. **Absente** → **fallback** : scaffold **local** + `tech/api-keys-guide.md`, invite à lancer `infra-setup`. Ne provisionne rien de réel sans config.

## Le moteur — MCP officiels (on dépend, on ne réinvente pas)
Le provisioning s'appuie sur les **MCP officiels des éditeurs** (`references/mcp-map.md`) : **GitHub** (repo + Actions), **Supabase** (`create_project` + `apply_migration` = tables + RLS), **Cloudflare** (DNS + sous-domaine + Pages), **Vercel** (hébergement + env), **Stripe** (optionnel). Chaque sous-agent est **rendu compétent** par les skills de référence (`references/reference-skills.md` : `supabase/agent-skills`, `cloudflare/skills`) pour ne pas halluciner (RLS correcte, DNS correct).

**Modèle d'outils.** L'orchestrateur (cette skill) n'appelle **aucun MCP en direct** : ses outils sont ceux du frontmatter (`Read, Write, Edit, Bash, Grep, Glob, Task`) — il **orchestre**. Les appels MCP (GitHub/Supabase/Cloudflare/Vercel/Stripe) sont faits par les **sous-agents dispatchés via `Task`**, qui opèrent avec les serveurs MCP **connectés une fois par `infra-setup`**. **Resend n'a pas de MCP** : `provisioner-email` appelle son **API HTTP via `Bash`/curl**, avec la clé lue dans `~/.saas-factory/.env` (jamais logée). Cf. `references/mcp-map.md` §« Modèle d'outils & auth ».

## Procédure — machine à états, sous-agents dispatchés
Suis `references/provisioning-plan.md` (ordre + dépendances + parallélisme + machine à états par ressource). Pour chaque ressource, dispatche le **sous-agent** dédié (`Task`) via son contrat exact (`references/subagent-contracts.md`) ; il provisionne idempotemment et écrit son verdict dans `status/provision-<resource>.md`.

**Type de produit.** Le `type` (`public` / `interne` / `perso`, lu dans `research/idea-brief.md`) module le provisioning — DNS, enrollment (signup/invitations/compte seedé), email, billing. Matrice **unique** + obligation de **log des allègements** (jamais silencieux) : `references/provisioning-plan.md` §« Routage par type de produit ».

**Archétype (avant le type).** Lis `archetype` dans `.saas-factory/state.md` (source : `_shared/state-schema.md`). Les étapes 2→8 ci-dessous sont écrites pour **`web-saas`** (défaut, inchangé). Pour **`archetype = automation`** (worker/cron/bot/intégration headless), le provisioning **change de forme** : l'**ordonnanceur EST le host** (GitHub Actions `schedule:` = repo-CI élargi, 2 modes cron sync+digest ; alternatives cron système / conteneur / Cloud Scheduler) ; on dispatche **`provisioner-repo-scheduler` + `provisioner-db-migrations`** (migrations SEULES, service-role, **sans Auth/SMTP**) ; **hosting-web / DNS / email-domaine / Auth / billing sont RETIRÉS** (retraits **tracés** au log) ; secrets → **GitHub Actions Secrets + Variables + slot d'intégration source/cible**. **🚨 Règle dure** : fallback fichier valide **uniquement** sur disque persistant ou test local ; **runner éphémère (GitHub Actions/Cloud Scheduler) ⇒ base durable Supabase OBLIGATOIRE** (sinon I1 cassé). Détail : `references/provisioning-plan.md` §« Chemin de provisioning AUTOMATION » + les variantes automation de `subagent-contracts.md` / `secrets-wiring.md` / `verification-checklist.md` / `mcp-map.md`. Pour **`archetype = ecommerce`** (boutique — vitrine publique + paiement one-shot), le graphe **web-saas reste COMPLET** (repo + Supabase catalogue/commandes/stock + RLS + Auth + email + hosting/DNS public) ; **seul le billing se spécialise** : Stripe en **mode PAIEMENT ONE-SHOT REQUIS** (`mode:payment` + `STRIPE_WEBHOOK_SECRET`, **jamais `subscription`**) — le webhook signé est la source de vérité de la commande. Détail : `references/provisioning-plan.md` §« Chemin de provisioning ECOMMERCE » + sondes ecommerce de `verification-checklist.md`. (`landing` : provisioning web statique + waitlist, non couvert ici — Thème C.)

1. **Scaffold local** — `git init` + structure de l'archétype + **blocs câblés** au niveau code (depuis `_shared/blocks/` + le split réutiliser/build de l'étape 9). Génère le **`CLAUDE.md` projet** (template `assets/templates/project-claude-md.md`) = source de vérité des agents de build (Phase 4). *Sous-procédure + DoD : `references/scaffold-procedure.md`.*
2. **`provisioner-repo`** — crée le **repo GitHub** + push initial + **GitHub Actions** (CI). *[parallélisable]*
3. **`provisioner-db`** — crée le **projet Supabase** + applique les **migrations** (modèle de données étape 9 → tables + **RLS**). `confirm_cost` auto. *[parallélisable]*
4. **`provisioner-email`** — configure **Resend** (domaine + emails de confirmation) ; publie **ses propres** records DNS de vérification (DKIM/SPF/DMARC/MX) en appelant **directement le MCP Cloudflare**, sans passer par `provisioner-hosting`. *[parallélisable, non-bloquant]*
5. **`provisioner-hosting`** — record de routage **`projet.tondomaine.com`** + DNS (Cloudflare) selon le type (`perso` : URL par défaut du provider, **pas de DNS public**) + projet **d'hébergement** (Vercel/CF/Coolify) + **relie le repo GitHub** (auto-deploy ; app GitHub absente côté Vercel → repli deploy-hook/CI, `references/mcp-map.md`). *[après repo+db ; email non-bloquant]*
   > Contrats de délégation exacts (Objectif/Idempotence/DoD/Rollback/Red-flags) des étapes 2→5 : `references/subagent-contracts.md`.
6. **Câblage des secrets** — injecte les creds de chaque ressource dans les **secrets GitHub Actions** + l'env de l'hébergeur (via MCP), depuis `~/.saas-factory/`. Jamais en dur. *Matrice secret→destination + règle client/serveur : `references/secrets-wiring.md`.*
7. **Billing (optionnel)** — si `providers.billing = stripe` : câble Stripe (mode test).
7 bis. **Visuels (selon config, découplé du LLM)** — lis `providers.visuals`. `"nano-banana"` → génération d'images **activée** pour le projet : la **clé Google** (Nano Banana = modèle image Google/Gemini) fait partie des secrets à câbler (étape 6), **requise même si `providers.llm` est non-Google** (ex. GPT-4o). `"none"` **ou absent** → génération d'images **désactivée**, **repli honnête** (`_shared/safety-rails.md` §6) : pas de visuels fantômes, on le consigne (log + `CLAUDE.md` projet pour la Phase 4). Matrice de repli : `references/mcp-map.md`.
8. **Log + vérif finale** — chaque ressource → une ligne dans `tech/provisioning-log.md`. Vérifie l'état réel (repo pushé, BDD up + RLS, sous-domaine résout, deploy vert). *Sondes par ressource + DoD complète + machine à états de sortie : `references/verification-checklist.md`.*

> **Parallélisme** : dispatche `provisioner-repo` + `provisioner-db` + `provisioner-email` **en un seul message** (zones indépendantes ; email publie ses records DNS via son propre appel Cloudflare, pas via hosting). `provisioner-hosting` ensuite, dès que **repo+db** sont `DONE` — **email est non-bloquant** (son échec/retard ne retient jamais hosting). Cf. `references/provisioning-plan.md`.

## Références de l'étape (la profondeur)
- `references/provisioning-plan.md` — machine à états par ressource, data-flow, routage au démarrage, reprise.
- `references/scaffold-procedure.md` — étape 1 : arbre, câblage des blocs, `CLAUDE.md`, slug, DoD.
- `references/subagent-contracts.md` — gabarit exact de délégation de chaque provisioner (étapes 2→5).
- `references/idempotence-rollback.md` — détection d'existant, matrice de rollback, reprise, DoD.
- `references/secrets-wiring.md` — étape 6 : matrice secret→destination, règle client/serveur, DoD.
- `references/verification-checklist.md` — étape 8 : sondes réelles, DoD globale, machine à états de sortie.
- `references/mcp-map.md` — séquences d'appels par ressource, repli si MCP manquant.
- `references/reference-skills.md` — skills de compétence (anti-hallucination RLS/DNS).

## Contrat d'artefacts
Lit : `tech/architecture.md`, `tech/decisions.md` (les ADR de stack de l'étape 9 dont dépend le provisioning), `tech/execution-plan.md`, `research/idea-brief.md` (type de produit — routage par type), `_shared/*`, `~/.saas-factory/config.json`. Écrit : repo (GitHub + local scaffané), `CLAUDE.md` (racine), `tech/provisioning-log.md`, `status/provision-*.md`, `tech/execution-plan.md` (**annotations « pré-câblée au scaffold » uniquement**, cf. `references/scaffold-procedure.md` étape 5 bis), `tech/api-keys-guide.md` (si fallback), `.saas-factory/state.md`.

## Porte — aucune
Phase 3 = zéro intervention. Provisioning pré-autorisé. Fallback = mode local + guide, sans porte.

## Sortie & état
Repo prêt à builder + infra provisionnée. Mets à jour `.saas-factory/state.md`. Résume en 2 lignes (URL du sous-domaine + ce qui est câblé). **Fin de Phase 3** → Phase 4 (build).
