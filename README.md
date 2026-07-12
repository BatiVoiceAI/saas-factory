# SaaS Factory — plugin Claude Code

Transforme une **idée** en **SaaS déployé**, de bout en bout, avec une méthode spec-driven multi-agents éprouvée (bativoice, speechtoflow, evalprof, cartedespintes). Gratuit, auto-suffisant, pensé pour tous les utilisateurs de Claude Code.

## Ce que ça fait

Un skill orchestrateur déroule un pipeline en phases — idéation → recherche marché honnête → positionnement → spec produit → design → architecture → setup → build parallèle → vérification → revue client → SEO → déploiement borné — en déléguant à des sous-skills (les « personas » : CEO, PM, CTO, Tech Lead, Designer, QA) et à des subagents pour le build en parallèle.

**Ce n'est pas un générateur d'app de plus.** Sa valeur est la couche méthode que les builders génériques zappent : validation marché avec vérification adversariale, spec-driven, QA éval-driven, portes de décision, et autonomie **bornée** sur l'infra.

## Installation

```bash
/plugin marketplace add https://github.com/felix/saas-factory
/plugin install saas-factory@felix/felix-saas-factory
```

Pour un test local avant publication : `/plugin marketplace add /chemin/vers/saas-factory` (le repo est à la fois le plugin et le marketplace).

## Lancement

```
/saas-factory
```
…ou simplement : « je veux créer un SaaS qui … ».

## Prérequis (comptes de l'utilisateur, jamais stockés par le plugin)

Selon l'archétype : un compte **Cloudflare** (deploy/DNS), **Supabase** (BDD/auth), **Stripe** (paiement), et une **clé LLM** (provider au choix). Le plugin détecte ce qui manque et fournit un **guide pas-à-pas** pour chaque clé. Les secrets restent dans **tes** variables d'environnement.

## Garde-fous (important)

Le plugin agit avec une **autonomie bornée** (`_shared/safety-rails.md`) : tout ce qui **dépense de l'argent, publie, ou touche DNS/BDD/clés** passe par un *plan → validation → exécution*. Il opère dans un espace **sandbox** et ne touche jamais une prod existante. S'il ne peut pas faire quelque chose (KYC paiement, review store…), il s'arrête et t'explique — il ne simule pas.

## État de ce squelette

Ceci est un **scaffold**. Sont fournis en exemplaires complets : l'orchestrateur (`skills/saas-factory`), `00-discover-idea`, `01-market-research`, les agents `feature-dev` / `verifier`, et la couche `_shared` (safety-rails, lessons). Les sous-skills `02`→`12` sont **entièrement spécifiés** dans `SKILL-BLUEPRINT-SAAS-FACTORY.md` et se construisent palier par palier (voir §13 du blueprint). Construis le chemin critique d'idéation d'abord, ship, itère.

## Licence

MIT.
