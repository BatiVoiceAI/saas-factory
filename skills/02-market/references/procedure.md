# Procédure exhaustive — exécuter le moteur `startup-competitors`, tranche marché/concurrents

Ce fichier détaille **chaque phase du moteur vendoré**, exécutée : quoi faire, dans quel ordre, avec quel critère de passage. Le SKILL.md en donne l'aperçu ; ici on descend au geste. On **exécute** le moteur, on ne le refait pas.

Rappel du **HARD GATE** (non négociable) : ici tu produis la **photo marché/concurrents** — rien d'autre. Pas de positionnement (étape 3), pas de verdict de demande (étape 4), pas de décision Go/No-Go (étape 5). Chaque fois qu'une phase du moteur déborde sur ces terrains, tu **conserves le brut** (l'aval s'en sert) mais tu ne **conclus** pas.

## Flux d'ensemble (machine à états)

```
        research/idea-brief.md (type=public)
                     │
                     ▼
   ┌─────────────────────────────────────────┐
   │ P0  PRÉ-VOL — garde d'entrée             │  brief absent / type≠public → STOP (voir routage)
   └─────────────────────────────────────────┘
                     │  ok
                     ▼
   ┌─────────────────────────────────────────┐
   │ P1  INTAKE (court-circuité)              │  aliment. par idea-brief, PAS de ré-interview
   └─────────────────────────────────────────┘   → intake résumé prêt
                     │
                     ▼
   ┌─────────────────────────────────────────┐
   │ P1.5 PROFONDEUR — tier Light/Std/Deep    │  score 3-9 → tier ; défaut = reco moteur
   └─────────────────────────────────────────┘
                     │
                     ▼
   ┌───────────── 3 VAGUES (P2) ─────────────┐
   │ W1 profils + prix                        │  → raw/competitor-profiles, raw/pricing-intelligence
   │ W2 review-mining + forum-mining          │  → raw/review-mining, raw/forum-mining  (BRUT CONSERVÉ)
   │ W3 signaux GTM (tranche marché only)     │  → raw/gtm (ce qui éclaire marché/concurrents)
   └─────────────────────────────────────────┘
                     │
                     ▼
   ┌─────────────────────────────────────────┐
   │ CHECKPOINT — set concurrents validé ?    │  1 question à l'utilisateur (ajouter/retirer)
   └─────────────────────────────────────────┘
                     │  ok / corrigé
                     ▼
   ┌─────────────────────────────────────────┐
   │ P3  SYNTHÈSE — relier manque↔plainte↔prix│  → research/market.md
   └─────────────────────────────────────────┘
                     │
                     ▼
   ┌─────────────────────────────────────────┐
   │ P3.5 VÉRIFICATION adversariale           │  → research/confidence.md
   └─────────────────────────────────────────┘
                     │
                     ▼
   ┌─────────────────────────────────────────┐
   │ SORTIE — état + résumé 2 lignes → 03     │
   └─────────────────────────────────────────┘
```

---

## P0 — Pré-vol (garde d'entrée)

Avant de lancer quoi que ce soit :

1. `research/idea-brief.md` **existe** ? Sinon → STOP, renvoie vers l'étape 1 (`01-discover`). Tu ne fabriques pas un brief à la volée.
2. Lis le brief. Relève le `type` et la `route`.
3. Applique le **routage par type** (voir `decision-matrices.md` §Routage). `public` → on continue. `interne` / `perso` → cette étape est **sautée**, dis-le et passe la main.
4. Vérifie que WebSearch/WebFetch sont disponibles. Sinon → **Knowledge-Based Mode** du moteur : marque tout finding `[Knowledge-Based — à vérifier]` et baisse chaque score de confiance d'un cran. Déclare-le à l'utilisateur d'entrée.

**Critère de passage P0 :** brief lu, type=public confirmé, mode de recherche (Live / Knowledge-Based) décidé et annoncé.

---

## P1 — Intake (court-circuité par l'idea-brief)

Le moteur démarre normalement par une interview. **On la court-circuite** : l'utilisateur a déjà été interrogé à l'étape 1. Le mapping champ-par-champ est dans `intake-mapping.md`. En résumé :

| Champ moteur | Source dans idea-brief |
|---|---|
| produit / idée | Idée reformulée |
| problème + cible | Problème & douleur, Cible |
| catégorie/marché | déduit de Problème + Écosystème |
| concurrents connus | Alternative actuelle + Signal préliminaire |
| géo / langue | Écosystème (secteur, géo/langue) |
| langue de sortie | celle de l'utilisateur (français par défaut) |

**Ne repose une question que si un point manque *vraiment*** (voir `forcing-questions.md` §Champ manquant : recette Ask / Push-until / Red-flags). Un champ « catégorie » (« les PME ») n'est pas assez précis pour cadrer une recherche — resserre-le avant de lancer les vagues.

Écris un **intake résumé** (produit, marché, concurrents connus, géo/langue, mode de recherche) sous `research/raw/intake.md`. C'est la note d'amorçage des vagues.

**Critère de passage P1 :** produit + problème + cible + ≥1 concurrent connu OU une catégorie assez précise pour chercher + géo/langue = tous renseignés.

---

## P1.5 — Profondeur (calibrer le tier)

Score de complexité du marché sur trois axes (matrice complète dans `decision-matrices.md` §Profondeur) :

1. **Largeur de marché** (1 = niche étroite → 3 = marché large/transverse)
2. **Concurrents connus** (1 = 0-2 connus → 3 = beaucoup)
3. **Portée géo** (1 = 1 pays/langue → 3 = multi-régions)

Somme 3-9 → **Light (3-4)** · **Standard (5-7)** · **Deep (8-9)**. Le tier fixe le nombre d'agents/rounds par vague (cf. `vendor/.../research-scaling.md`).

**Défaut : accepte la reco du moteur.** Ne propose un override que si un signal du brief le justifie (ex. marché manifestement énorme mais brief classé Light). Présente le tier retenu en une ligne, laisse l'utilisateur dire *light / deep / ok*.

**Critère de passage P1.5 :** tier retenu + inscrit dans `state.md`.

---

## P2 — Les 3 vagues (procédure par vague)

Exécute les vagues **dans l'ordre** (chaque vague finie avant la suivante). Si l'outil `Task`/`Agent` est dispo, parallélise les agents *à l'intérieur* d'une vague ; sinon, séquentiel, même profondeur. Avant de lancer : lis `vendor/.../research-principles.md` (tiers de sources, cross-référencement, gestion des trous).

### Wave 1 — Profils + prix

- **A1 profils** : identifie et profile 5-8 concurrents **directs** + 2-3 **adjacents** (plateformes plus larges, alternatives manuelles, outils d'une catégorie voisine qui prennent le même budget — dont le **statu quo** : Excel, papier, rien). Va **au-delà de la page marketing** : avis, offres d'emploi, données de financement. Pour chacun : produit, features, taille équipe, funding, signaux de traction, forces, faiblesses.
- **A2 prix** : reverse-engineer le modèle de prix de chaque concurrent — pas « 49 $/mois » mais la **métrique de valeur** (par siège ? à l'usage ? forfait ?), la différenciation des paliers, la psychologie tarifaire (ancrage, decoy, charm), le coût de changement (technique, contractuel, émotionnel). Table palier-par-palier.

Sorties → `research/raw/competitor-profiles.md`, `research/raw/pricing-intelligence.md`.
**Critère de passage W1 :** ≥5 acteurs profilés (directs+adjacents+statu quo), prix relevé ou trou déclaré pour chacun.

### Wave 2 — Review-mining (le cœur réutilisé à l'étape 4)

- **B1 review-mining** : mine G2, Capterra, TrustRadius, Product Hunt, App Store pour chaque concurrent. Extrais les **patterns** : ce qu'on loue, ce dont on se plaint, les features réclamées. Range **par concurrent** et **par thème de douleur**. **Cite en verbatim.**
- **B2 forum-mining** : Reddit, Indie Hackers, Hacker News, Quora, communautés de niche. Cherche plaintes sur l'existant, threads « what do you use for X? », histoires de migration, contournements. Construis une **carte de langage** (les mots exacts des clients) et repère les **signaux de churn** (pourquoi on quitte chaque concurrent).

Sorties → `research/raw/review-mining.md`, `research/raw/forum-mining.md`.

> ⚠️ **CONSERVE LE BRUT.** Ces deux fichiers sont **réutilisés tels quels par l'étape 4** (demande & edge). Ne les résume pas destructivement, ne les jette pas après synthèse. Verbatims + volumes d'avis + notes = matière première de l'inférence de demande en aval.

**Critère de passage W2 :** pour chaque concurrent majeur, ≥1 thème de louange + ≥1 thème de plainte, avec verbatims ; carte de langage amorcée ; volume d'avis noté (ou trou déclaré).

### Wave 3 — Signaux GTM (tranche marché uniquement)

Le moteur produit ici GTM + signaux stratégiques complets. **Nous n'en gardons que ce qui éclaire marché/concurrents** :
- **À garder** : canal d'acquisition dominant par concurrent (self-serve vs sales-led), saturation par canal (utile pour lire l'intensité concurrentielle), signaux de santé (hiring : eng-heavy = build, sales-heavy = scale, support-heavy = galère), funding/traction.
- **À ignorer ici** : battle-cards détaillées, plan de contenu SEO fin, cartes GTM opérationnelles → ce ne sont pas nos livrables (cf. `decision-matrices.md` §Découpage inter-étapes).

Sortie → `research/raw/gtm.md` (tranche marché).
**Critère de passage W3 :** pour chaque concurrent majeur, canal dominant + un signal de santé (ou trou déclaré).

---

## CHECKPOINT — valider le set de concurrents (1 question)

Avant la synthèse, **présente en un seul message** : combien de concurrents profilés, les top thèmes de plainte, les signaux stratégiques notables. Puis **une** question : « Un concurrent à ajouter ou retirer avant que je synthétise ? » (recette complète dans `forcing-questions.md` §Checkpoint).

C'est un point d'alignement rapide, **pas** un rapport complet. Si l'utilisateur ajoute un acteur, boucle une mini-passe W1/W2 sur lui avant de continuer.

**Critère de passage :** set de concurrents confirmé par l'utilisateur.

---

## P3 — Synthèse (relier, ne pas empiler)

La synthèse crée la valeur : ce n'est pas du formatage, c'est du **pattern-matching**. Procédure :

1. **Lis TOUS les fichiers `raw/`** avant d'écrire une ligne.
2. **Relie à travers les vagues** : un manque n'a de valeur qu'une fois connecté à une **plainte récurrente** (W2) **et** à un **prix** (W1). Manque + plainte + signal = ouverture.
3. **Repère les contradictions** entre sources et dis **laquelle croire** (tiers, cf. verification).
4. **Faiblesse concurrent = ouverture OBSERVÉE, jamais souhaitée.** Applique la recette `forcing-questions.md` §Ouverture (MOU vs FORT) : une ouverture ne se retient que si elle est *récurrente* (partagée par plusieurs concurrents ou plusieurs avis) et *ancrée dans les données*. Sinon → data gap, pas ouverture.
5. **N'invente pas de différenciation.** Pas trouvé d'axe net → on le dit ; l'edge est le boulot de l'étape 4, le positionnement celui de l'étape 3.

Écris `research/market.md` selon `assets/templates/market.md`. Mapping des champs dans `output-mapping.md`.
**Critère de passage P3 :** chaque ouverture retenue est reliée à ≥1 plainte + un prix ; contradictions tranchées ; aucune faiblesse « souhaitée ».

---

## P3.5 — Vérification adversariale

Exécute `vendor/.../verification-agent.md` sur `market.md`. Il classe les sources en **tiers 1/2/3**, note la **confiance** par affirmation, sépare **haute vs basse confiance**, traque : affirmations non labellisées, contradictions internes, incohérences de score, **data gaps manquants**, fausse corroboration (même source citée deux fois).

Écris `research/confidence.md` selon `assets/templates/confidence.md`.
**Si issue critique** (une affirmation structurante repose sur du seul Tier 3, ou contradiction non résolue) → **pause**, présente à l'utilisateur : corriger d'abord ou continuer ?
**Critère de passage P3.5 :** chaque affirmation structurante a un tier + un score + ce qui la confirmerait/l'infirmerait ; data gaps déclarés.

---

## SORTIE — état & passage de relais

1. `research/market.md` + `research/confidence.md` écrits. `research/raw/*` conservés (surtout review/forum-mining).
2. Mets à jour `.saas-factory/state.md` : étape 2 faite, **tier de recherche retenu**, mode (Live/KB).
3. **Résume en 2 lignes** : concentration du marché (fragmenté / en consolidation / dominé) + les 1-2 ouvertures les plus nettes.
4. Annonce l'étape 3 (`03-positioning`).

Definition-of-Done complète et catalogue de cas limites : `checklists.md`.
