---
name: 02-market
description: >-
  Étape 2 (Phase 1 · validation) de SaaS Factory — Marché & concurrents (rôle CEO/Analyste). Exécute un teardown concurrentiel systématique + review-mining (avis clients) avec vérification adversariale, en pilotant le moteur vendoré startup-competitors, et produit market.md + confidence.md. Se déclenche pour « analyser le marché », « teardown concurrents », « qui sont les concurrents », après qu'un idea-brief existe.
allowed-tools: Read, Write, Edit, Bash, WebSearch, WebFetch, Task, AskUserQuestion
---

# SaaS Factory — Étape 2 : Marché & concurrents (rôle CEO / Analyste)

Cette étape ne réinvente aucune méthode de recherche : elle **exécute le moteur vendoré `startup-competitors`** et **redirige ses sorties vers nos chemins**. On ne garde que la **tranche marché/concurrents**.

## À lire d'abord (une fois)
`_shared/lessons.md`, `_shared/safety-rails.md` ; si présent, `skills/phase-1-validation/references/conventions.md`.

## Profondeur — `references/` (charge à la demande)
Le SKILL.md reste l'aperçu chef-d'orchestre. Le **détail actionnable** est dans les sous-références, à ouvrir au moment voulu :

| Fichier | Quand l'ouvrir | Contenu |
|---|---|---|
| `references/procedure.md` | avant de lancer | sous-procédure exhaustive par phase du moteur + critères de passage + machine à états |
| `references/intake-mapping.md` | au branchement de l'idea-brief | correspondance champ-par-champ + quoi faire si un champ manque |
| `references/decision-matrices.md` | à chaque choix | routage par type, calibration du tier, inclusion concurrent, whitespace, contradictions, découpage inter-étapes |
| `references/forcing-questions.md` | quand tu interroges/tranches | recettes Ask/Push-until/Red-flags/MOU-vs-FORT (champ manquant, checkpoint, ouverture, confiance basse) |
| `references/output-mapping.md` | à la synthèse/écriture | quel bloc du moteur alimente `market.md` vs `confidence.md` vs `raw/` + data-flow |
| `references/checklists.md` | avant de clôturer | definition-of-done, catalogue de cas limites, modes d'échec |

> **Prérequis** : `research/idea-brief.md` existe (étape 1) et le `type` est **public**. Pour `interne` / `perso`, cette étape est **sautée** (cf. routage). **HARD GATE** : ici tu ne fais que la photo marché/concurrents — pas de positionnement (étape 3), pas de verdict de demande (étape 4), pas de décision (étape 5).

## Principe — exécuter, pas refaire
`startup-competitors` est un pipeline éprouvé (3 vagues → synthèse → vérification adversariale). Le refaire à la main serait plus lent, moins répétable, et réintroduirait de l'impro. **Ta valeur = l'exécuter fidèlement, le calibrer, brancher ses sorties sur nos artefacts.**

## À lire (le moteur et ses references) — `vendor/startup-skill/startup-competitors/`
- `SKILL.md` — le pipeline complet (Intake → 3 waves → Synthèse → Vérification).
- `references/research-wave-1-profiles-pricing.md` — profils + intelligence prix.
- `references/research-wave-2-sentiment-mining.md` — **review-mining** (avis clients). **Réutilisé à l'étape 4** — on ne jette pas ses sorties brutes.
- `references/research-wave-3-gtm-signals.md` — signaux go-to-market.
- `references/verification-agent.md` — vérif adversariale → `confidence.md`.
- `references/honesty-protocol.md` + `references/research-principles.md` (tiers de sources).

> **Comment un sous-agent (`Task`) exécute ce moteur** (passer le CHEMIN vs distiller la procédure + quand choisir) : `_shared/vendored-engine-protocol.md`.

## Entrée — brancher l'idea-brief sur l'Intake du moteur (ne ré-interroge pas)
Le moteur démarre par un Intake (interview). **On le court-circuite** : l'utilisateur a déjà été interviewé à l'étape 1. Extrais de `research/idea-brief.md` : produit ← Idée reformulée · problème/cible ← Problème & Cible · concurrents connus ← Alternative actuelle + Signal · géo/langue ← Écosystème · langue de sortie = celle de l'utilisateur (français par défaut). Le moteur ne repose ses questions que si un point manque vraiment.
> Mapping champ-par-champ, matrice « champ manquant → action » et recette forcing-question : `references/intake-mapping.md`.

## Procédure (les phases du moteur, exécutées)
1. **Intake** — alimenté par l'idea-brief, pas de ré-interview.
2. **Profondeur** — calibre le tier (Light / Standard / Deep) selon la complexité du marché ; par défaut, accepte la reco du moteur.
3. **3 vagues** : Wave 1 (profils + prix) · Wave 2 (**review-mining** G2/Capterra/Reddit — **conserve le brut**, l'étape 4 s'en resservira ; **par verbatim : URL de la source + marqueur « ouvert via WebFetch oui/non »**) · Wave 3 (signaux GTM, dont on ne garde que ce qui éclaire marché/concurrents).
4. **Synthèse** — un manque n'a de valeur qu'une fois relié à une plainte récurrente et à un prix.
5. **Vérification adversariale** (`verification-agent`) — classe les sources en tiers, note la confiance, sépare haute vs basse confiance.

> Sous-procédure exhaustive de chaque phase (gestes + critères de passage + machine à états) : `references/procedure.md`. Avant la synthèse, un **checkpoint** valide le set de concurrents en une question (recette : `references/forcing-questions.md`). Toutes les décisions tranchées (tier, inclusion, whitespace, contradictions) : `references/decision-matrices.md`.

## Sorties — rediriger vers NOS chemins
Le moteur écrit nativement dans `{projet}/`. **On consolide dans deux fichiers** (templates `assets/templates/`) :
- `research/market.md` (template `market.md`) — concurrents nommés (directs + adjacents « good enough »), forces + faiblesses cadrées comme **nos ouvertures** (à confirmer étape 4, **jamais inventées**), prix + whitespace, **taille servable & dynamique** ([Estimate] bottom-up : nb d'acteurs × prix observés, avec hypothèse — l'étape 5 en **hérite** pour l'axe Marché du verdict), matrice comparative.
- `research/confidence.md` (template `confidence.md`) — sources en tiers, score de confiance par affirmation + ce qui la confirmerait/infirmerait, findings haute vs basse confiance, **data gaps déclarés**.
- `research/raw/` — les fichiers de vagues, **surtout le review-mining** : sortie **load-bearing** dont l'étape 4 puise directement plutôt que de re-scraper. Ne les jette pas.
- `.saas-factory/state.md` — mets à jour (étape 2 faite, tier de recherche retenu).

> Le review-mining sous `research/raw/` est réutilisé tel quel à l'étape 4.
> Quel bloc du moteur alimente quel fichier (data-flow + micro-exemple d'ouverture correctement branchée) : `references/output-mapping.md`.

## Calibration (ta surcouche)
On exécute le moteur **tel quel**, on redirige les chemins, on ne garde que marché/concurrents : le **positionnement** (framework alternatives/catégorie) n'est **pas** produit ici (étape 3) ; battle-cards et cartes GTM détaillées ne sont pas nos livrables ; produit/brand/financials ignorés en Phase 1.

## Honnêteté (persona CEO)
Applique `honesty-protocol` : **pas de cheerleading** (si un concurrent est meilleur sur un point, dis-le) ; **labellise** `[Data] / [Estimate] / [Assumption] / [Opinion]` ; **faiblesses = ouvertures observées, pas souhaitées** (on ne transforme pas un espoir en « manque du marché »).
> Le filtre anti-invention (MOU vs FORT : une ouverture ne se retient que si observée + récurrente + reliée plainte/prix) est détaillé dans `references/forcing-questions.md` §Ouverture.

## Sortie & état
`research/market.md` + `research/confidence.md` écrits. Mets à jour `.saas-factory/state.md` (étape 2 faite, tier de recherche retenu). Résume en 2 lignes (concentration du marché + les 1-2 ouvertures les plus nettes), puis annonce l'étape 3 (`03-positioning`).
> Avant de clôturer, passe la **definition-of-done** + le catalogue de cas limites et modes d'échec : `references/checklists.md`.
