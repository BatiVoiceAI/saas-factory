---
name: 03-positioning
description: >-
  Étape 3 (Phase 1 · validation) de SaaS Factory — Positionnement & niche (rôle CEO). Formalise l'angle différenciant face au marché réel via le framework April Dunford (alternatives → catégorie → composants), en pilotant le moteur vendoré startup-positioning, et produit positioning.md. Se déclenche pour « positionner le produit », « trouver l'angle / la niche », après que market.md existe.
allowed-tools: Read, Write, Edit, AskUserQuestion, Bash, WebSearch, WebFetch
---

# SaaS Factory — Étape 3 : Positionnement (rôle CEO)

Tu **formalises** le positionnement du produit face au marché réel : contre quoi il se compare (alternatives), dans quelle **catégorie** il joue, et **quel angle différenciant** se dessine à partir des faiblesses/ouvertures remontées à l'étape 2.

## À lire d'abord (une fois)
`_shared/lessons.md`, `_shared/safety-rails.md` ; si présent, `skills/phase-1-validation/references/conventions.md`.

**Profondeur (progressive disclosure — lis au moment voulu, pas tout d'un coup) :**
- `references/procedure-detaillee.md` — sous-procédure exhaustive de chaque étape (data-flow ASCII, critères de passage, modes d'échec).
- `references/dunford-synthese.md` — le 5+1 composant par composant (forcing par composant, exemples MOU-vs-FORT, tests de validation + routage).
- `references/matrices-decision.md` — toutes les décisions condition → action (mapping artefacts, run/skip recherche, type de catégorie, table stakes, frontière anti-doublon).
- `references/forcing-questions.md` — recettes Ask/Push-until/Red-flags/MOU-vs-FORT aux points d'interrogation (pause attributs, best-fit, catégorie, garde de sortie).
- `references/checklists-modes-echec.md` — definition-of-done, catalogue de cas limites, modes d'échec + parade, passation.

## Ce que fait cette étape (et pourquoi)
Sans cadre, le positionnement se bricole au feeling et finit générique. Le framework **April Dunford** impose un ordre de raisonnement (l'alternative d'abord, la catégorie en dernier) qui évite le piège n°1 — se comparer à soi-même au lieu de se comparer à **ce que le client ferait sans toi**.

**HARD GATE / frontière (anti-doublon).** Le brut vient des manques concurrents de l'étape 2 ; tu formalises ici l'angle candidat — chaîne Dunford **jusqu'à l'Onliness candidate incluse**. LA seule frontière : **le verdict edge (réel / faible / absent) appartient à l'étape 4** — elle reprendra ta phrase, précisera la niche et tranchera. Pas de verdict, pas de Go ici. Un seul traitement par décision.

## Entrées / sortie (contrat)
- **Lit :** `research/idea-brief.md` (étape 1) + `research/market.md` (étape 2 : profils, prix, matrice, review-mining, manques).
- **Écrit :** `research/positioning.md` (template `assets/templates/positioning.md`) + `.saas-factory/state.md` (étape 3 faite, catégorie retenue, angle candidat).
- Rien d'autre (aucun livrable Phase 2 du moteur). Jamais de secret ni de clé dans le fichier.

## Principe : tu EXÉCUTES le moteur, tu ne refais pas la recherche
Le moteur vendoré `startup-positioning` (Dunford + Moore + Neumeier/Onliness + JTBD + Ries & Trout) est **gelé en local**. Tu suis **sa** procédure. Ta valeur : **brancher nos artefacts** dessus, puis **calibrer** la sortie pour la Phase 1.

## Procédure normée
> Vue d'ensemble ci-dessous ; sous-procédures exhaustives (ordre, critères de passage, micro-exemples, modes d'échec) dans `references/procedure-detaillee.md`.

### 1. Charge le moteur (lis, dans l'ordre) — `vendor/startup-skill/startup-positioning/`
- `SKILL.md` (Intake → 2 waves → Synthèse Dunford 5+1) · `references/frameworks.md` (Dunford, Moore, Neumeier, JTBD, Ries & Trout) · `references/research-synthesis.md` (synthèse + tests) · `references/honesty-protocol.md`.

Pourquoi lire d'abord : la synthèse Dunford est **séquentielle**. L'exécuter sans le cadre produit un positionnement générique — pire que rien.

### 2. Branche nos artefacts (ne ré-interroge pas)
Mappe : brief/intake ← `idea-brief.md` · profils & matrice ← `market.md` · prix ← `market.md` · voix client/review-mining ← `market.md` (bloc review-mining). Annonce « données d'une session précédente utilisées comme point de départ ». **Saute l'intake redondant.**
> Matrice de mapping champ-par-champ : `matrices-decision.md` § Mapping artefacts → moteur.

### 3. Ne lance sa recherche que pour combler les trous réels
Des 2 waves, **n'exécute que ce que `market.md` ne couvre pas** — typiquement la **catégorie de marché** (frame Dunford) et l'angle **JTBD**. La cartographie brute est déjà faite à l'étape 2.
> Table run/skip par wave : `matrices-decision.md` § Recherche : run ou skip.

### 4. Exécute la synthèse Dunford 5+1 dans l'ordre (non négociable)
1. **Alternatives concurrentes** (ce que le client ferait sans le produit — directs + adjacents + statu quo). L'ancre de tout.
2. **Attributs uniques** — ce qu'on a que les alternatives n'ont pas. **⏸ Fais valider au founder** (il connaît des capacités que la recherche ne voit pas), mais anti-flagornerie : un attribut que 2 concurrents ont aussi n'est **pas** unique.
3. **Value themes** — attribut → « so what ? » → bénéfice client.
4. **Clients best-fit** — définis par **caractéristiques**, jamais par démographie.
5. **Catégorie de marché** — le cadre qui rend la valeur évidente. Défaut = catégorie **existante**.
+ **Validation — les 3 tests : Onliness (Neumeier)** · **statement Moore** · **Ladder (Ries & Trout, ≤10 mots)**. Si le « only » sonne faux ou qu'un test échoue → reboucle sur [2]-[3], ne ship pas un positionnement faible.
> Procédure fine par composant (forcing, MOU-vs-FORT, critères de rejet, machine à états de l'ordre, routage des 3 tests) : `dunford-synthese.md`. La ⏸ pause attributs a sa recette dédiée dans `forcing-questions.md` § Pause attributs.

### 5. Formalise l'angle différenciant (candidat)
Prends les **faiblesses / plaintes récurrentes / ouvertures** de `market.md` et **exprime-les en langage Dunford** : quel attribut répond à un manque **partagé par plusieurs** concurrents → quel value theme → quelle formulation Onliness *candidate*.

**Stop ici.** Tu livres un **angle candidat formalisé** (jusqu'à l'Onliness candidate incluse), pas un **verdict** : aucune conclusion « edge réel / faible / absent » ni « c'est notre edge ». Note-le en une ligne dans le fichier : « Angle candidat — verdict edge = étape 4. »

### 6. Écris `research/positioning.md`
Le **résultat consolidé** dans ce fichier (template `assets/templates/positioning.md`) — **pas** les fichiers épars du moteur (messaging/brand/copy = hors Phase 1). Termine par flags + sources (protocole d'honnêteté).

## Garde-fous (rappel)
Anti-flagornerie (attribut partagé par ≥2 concurrents = table stakes, pas différenciateur) · défaut catégorie **existante** · positionner sur ce qu'on EST, jamais le roadmap · avis concurrents = **Tier 3** (jamais seule source d'un claim « Haute ») · un seul fichier écrit (pas les livrables Phase 2 du moteur). Détail : `checklists-modes-echec.md` § Modes d'échec.

## Sortie & clôture
Avant de clôturer, passe la **definition-of-done** (`checklists-modes-echec.md` § DoD).

Mets à jour `.saas-factory/state.md` (étape 3 faite, catégorie retenue, angle candidat). Résume en 2 lignes, puis annonce l'**étape 4 (`04-demand-edge`)**, qui consommera ce fichier + le review-mining de `market.md`.
> Gabarit de résumé + contrat de passation : `checklists-modes-echec.md` § Passation vers l'étape 4.
