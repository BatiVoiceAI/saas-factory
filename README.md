# SaaS Factory — plugin Claude Code

Transforme une **idée** en **produit déployé et vérifié**, de bout en bout : recherche marché honnête → PRD PM-grade → design anti-slop → architecture → build multi-agents → QA faux-client → déploiement borné → mesure. Une méthode **spec-driven** avec cascade de validation adversariale — **pas un générateur d'app de plus**.

**Gratuit · MIT · auto-suffisant · qualité avant vitesse.**

## Ce que ça fabrique — 4 archétypes

| Archétype | Livrable |
|---|---|
| **web-saas** | app complète : auth (OTP → mot de passe), dashboard, BDD, boucles fermées, billing optionnel |
| **automation** | worker / cron / bot **headless** : idempotent, boucle fermée propriétaire, dependency-light |
| **landing** | page marketing + waitlist, prête pour un go-test de marché |
| **ecommerce** | boutique : catalogue, panier, checkout Stripe **one-shot**, commandes, stock (anti-survente) |

\+ substrat **multi-org** (B2B vendu à N entreprises : Org, membres, invitations, RLS par org).

## Comment ça marche

Un **orchestrateur maître** déroule **6 phases · 20 étapes** (idéation → marché → positionnement → PRD → design → architecture → setup → build parallèle → revue en cascade → QA → SEO → déploiement + recette live authentifiée → mesure → retro). Il délègue à des **personas** (CEO, PM, CTO, Tech Lead, Designer, QA) et à des **subagents** pour le build parallèle (1 feature = 1 worktree = 1 agent). Tout tourne sur **Opus 4.8** (ultracode sur les phases de code).

La valeur = la **couche méthode** que les builders génériques zappent : validation marché **adversariale**, spec-driven, QA **éval-driven**, **portes de décision** humaines, plancher **mécanique** (hooks + `verify:machine`), et autonomie **bornée** sur l'infra.

## Installation

Dans un **terminal** (commandes `claude plugin …`) :

```bash
claude plugin marketplace add BatiVoiceAI/saas-factory
claude plugin install saas-factory@saas-factory
```

> Ce sont des **commandes terminal**, pas des slash-commandes. Dans l'app Claude Code, la slash-commande `/plugin` ouvre un **gestionnaire interactif** (ajoute le marketplace puis installe depuis là) — elle ne prend pas les arguments en ligne. Il n'y a pas de « `/install github` » : c'est `marketplace add <owner>/<repo>` qui gère GitHub, puis `install <plugin>@<marketplace>`.

Test local : `claude plugin marketplace add /chemin/vers/saas-factory` (le repo est à la fois le plugin et son marketplace).

## Démarrage

1. **Une seule fois** — connecte tes outils : `/saas-factory:infra-setup` (GitHub, Supabase, Cloudflare/DNS, hébergement, Resend, Stripe optionnel, clé LLM). Ensuite chaque projet se provisionne **tout seul**.
2. **Lance** : `/saas-factory` — ou décris simplement ton idée dans ta langue (« je veux créer un SaaS qui… »). L'orchestrateur détecte ta langue et conduit **tout** le dialogue dedans.

Tes points de contact humains : `0-7 questions` d'intake → valider la **note d'opportunité** → valider/modifier les **fonctionnalités** → portes design / revue / publication. Le reste est automatique.

## Prérequis (tes comptes — jamais stockés par le plugin)

Selon l'archétype : **Supabase** (BDD/auth), **Cloudflare** (DNS/deploy), **Stripe** (paiement, optionnel), **Resend** (emails), une **clé LLM**. Le plugin détecte ce qui manque et te guide pas à pas. **Tes secrets restent dans TES variables d'environnement** (`~/.saas-factory/`), hors du plugin.

## Garde-fous

Autonomie **bornée** (`_shared/safety-rails.md`) : tout ce qui **dépense, publie, ou touche DNS/BDD/clés** passe par *plan → validation → exécution*. Sandbox, jamais une prod existante. S'il ne peut pas (KYC paiement, review store…), il **s'arrête et l'explique** — il ne simule jamais. Auth **toujours** OTP/mot de passe (zéro magic link), boucles fermées universelles, design **anti-AI-slop** (porte distinctiveness), honnêteté radicale (il ne bluffe pas sur ce qu'il n'a pas fait).

## Sous le capot

- **3 châssis de code livrés + testés** : `web-saas` (Next.js 15 + Supabase + Stripe), `automation` (worker dependency-light), `ecommerce` (logique commerce + SQL + pièges survente/prix/idempotence — `verify:machine` + 23 tests `node:test` verts). `landing` s'assemble du sous-ensemble web-saas.
- **Moteurs vendorés** (MIT/Apache, attribution préservée dans `vendor/*/PROVENANCE.md`) : recherche stratégique startup, revue de sécurité, revue d'accessibilité, superpowers (TDD/subagents/worktrees).
- **Évals mécaniques** : `bash evals/run.sh` (hooks + lints + planchers des châssis).

## Statut

**v0.15.0** — les **4 archétypes + le substrat org** sont couverts au châssis ; méthode complète (**6 phases · 20 étapes · 14 agents**). Éprouvé sur des projets réels. Résidu honnête, signalé au run : l'**épreuve bout-en-bout** (build SSR + E2E + déploiement sur backend réel) se fait à la **1re instanciation** de chaque projet. *Qualité avant vitesse ; on ne bâcle pas, on ne bluffe pas.*

## Licence

MIT — voir [`LICENSE`](LICENSE). Inclut des moteurs tiers vendorés sous MIT / Apache-2.0 (chacun avec son `LICENSE` + `PROVENANCE.md` sous `vendor/`).
