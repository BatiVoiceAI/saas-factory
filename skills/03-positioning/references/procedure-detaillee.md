# Procédure détaillée — Étape 3 Positionnement

Sous-procédures exhaustives pour chaque étape de la « Procédure normée » du SKILL.md. Chaque étape = objectif · entrées · sous-étapes ordonnées · **critère de passage** (rien ne franchit sans ça) · micro-exemple niche-agnostique · mode d'échec.

> Le SKILL.md reste le chef d'orchestre : il dit *quoi* et *dans quel ordre*. Ce fichier dit *comment*, *avec quels critères*, *et quoi faire quand ça casse*.

---

## Data-flow de l'étape (vue d'ensemble)

```
  research/idea-brief.md ──┐
                           │        ┌─ moteur startup-positioning (gelé) ─┐
  research/market.md ──────┼──map──▶│  frameworks · synthesis · honesty   │
   ├─ profils/matrice      │        │  waves 1&2 (exécutées SÉLECTIVEMENT) │
   ├─ prix/whitespace      │        └──────────────────────────────────────┘
   ├─ ouvertures observées │                        │
   └─ review-mining (raw/) │                        ▼
                           │          Synthèse Dunford 5+1 (dans l'ordre)
                           │          [1]Alternatives→[2]Attributs*→[3]Value
                           │          →[4]Best-fit→[5]Catégorie(+trend?)
                           │                        │
                           │              validation Onliness + Moore
                           │                        │
                           └──────────────────────▶ ANGLE CANDIDAT formalisé
                                                     │  (Onliness candidate incluse,
                                                     │   pas de verdict edge)
                                                     ▼
                                          research/positioning.md
                                                     │
                                                     ▼
                              étape 4 (04-demand-edge) : tranche le verdict edge

  * [2] Attributs = ⏸ point de pause founder (voir forcing-questions.md)
```

Règle de lecture : **flèche vers la droite = calibration maison** (brancher + trancher pour la Phase 1). Le moteur ne « sait » rien de nos artefacts ; c'est toi qui les branches.

---

## Étape 1 — Charge le moteur (avant tout le reste)

**Objectif.** Charger le cadre Dunford *séquentiel* en mémoire avant de toucher aux données. Exécuter la synthèse sans le cadre produit un positionnement générique — pire que rien.

**Sous-étapes (ordre imposé) :**
1. Lis `{PLUGIN_ROOT}/vendor/startup-skill/startup-positioning/SKILL.md` — la mécanique Intake → 2 waves → Synthèse 5+1.
2. Lis `references/frameworks.md` — définitions canoniques Dunford / Moore / Neumeier / JTBD / Ries.
3. Lis `references/research-synthesis.md` — le protocole de synthèse détaillé + les 3 tests de validation.
4. Lis `references/honesty-protocol.md` — les 4 règles positioning-spécifiques + la table d'anti-patterns.

**Critère de passage.** Tu sais réciter l'ordre des 5+1 **et** pourquoi l'alternative vient en premier (ancre) et la catégorie en dernier (cadre). Si tu ne peux pas, relis avant de continuer.

**Mode d'échec.** Sauter la lecture « parce que je connais Dunford » → tu réordonnes au feeling, tu attaques par la catégorie, le positionnement devient une brochure. **Contre-mesure :** l'ordre est non négociable (voir Étape 4).

---

## Étape 2 — Branche nos artefacts (ne ré-interroge pas)

**Objectif.** Alimenter le moteur avec ce que la Phase 1 a déjà produit, au lieu de relancer un intake. On respecte l'anti-pattern « validation tardive » à l'envers : la donnée existe, on la réutilise.

**Sous-étapes :**
1. Ouvre `research/idea-brief.md` et `research/market.md` (+ `research/raw/` pour le review-mining brut).
2. Mappe chaque champ moteur vers son artefact source — voir la **matrice de mapping** dans `matrices-decision.md` (§ Mapping artefacts → moteur). En résumé : brief/intake ← idea-brief ; profils & matrice & prix ← market ; voix client / review-mining ← market (bloc + `raw/`).
3. Annonce à l'utilisateur, une phrase : « Données d'une session précédente utilisées comme point de départ (idea-brief + market). »
4. **Saute l'intake du moteur.** Ne repose aucune question déjà répondue par les artefacts.

**Critère de passage.** Chaque case de l'intake moteur est soit remplie par un artefact, soit explicitement marquée « trou réel → recherche ciblée à l'étape 3 ». Aucune case « je demande au founder » qui doublonne market.md.

**Micro-exemple (agnostique).** Le moteur demande « qui sont tes meilleurs clients ? ». `market.md` n'a pas de clients (produit non lancé) mais a des *profils best-fit inférés des avis concurrents*. → tu branches ces profils comme **hypothèse à tester**, pas comme fait. Tu ne repose pas la question au founder.

**Mode d'échec.** Re-poser l'intake complet « pour être sûr » → tu fatigues l'utilisateur et tu contredis le chaînage par artefacts. **Contre-mesure :** l'intake ne se rouvre que sur un *trou réel* identifié à l'étape 3.

---

## Étape 3 — Recherche ciblée : uniquement les trous réels

**Objectif.** Le moteur a 2 waves (alternatives+voix client / catégorie+trends). La cartographie brute est **déjà faite à l'étape 2**. Tu n'exécutes que ce que `market.md` ne couvre **pas**.

**Sous-étapes :**
1. Passe chaque wave au **crible de la matrice « run ou skip »** (`matrices-decision.md` § Recherche : run ou skip). 
2. Typiquement : **skip** wave 1 (alternatives + voix client déjà dans market/raw) ; **run partiel** wave 2 sur la **catégorie de marché** (frame Dunford — rarement traité en étape 2) et l'**angle JTBD** (job fonctionnel/social/émotionnel).
3. Pour toute recherche lancée : applique `research-principles.md` (tiers de source, cross-référencement) et tague les sources.
4. Note dans un scratch mental (ou en tête du fichier de sortie) *ce que tu as recherché et pourquoi* — traçabilité.

**Critère de passage.** Zéro recherche redondante avec market.md. Chaque requête lancée comble un trou nommé (catégorie ? trend ? job émotionnel ?). Si WebSearch est indisponible → **Knowledge-Based Mode** : marque `[Knowledge-Based — à vérifier]` et baisse la confiance d'un cran.

**Micro-exemple.** market.md liste 4 concurrents + prix + plaintes, mais ne nomme jamais **la catégorie** dans laquelle un acheteur les rangerait. → tu lances 1-2 requêtes « comment les acheteurs appellent cette classe d'outils » pour peupler les 3-5 candidats catégorie. Tu ne re-scrapes **pas** les prix.

**Mode d'échec.** Relancer les 2 waves en entier → tu refais l'étape 2, tu brûles du budget, tu risques des chiffres divergents de market.md (dérive documentaire). **Contre-mesure :** la matrice run/skip tranche avant toute requête.

---

## Étape 4 — Synthèse Dunford 5+1 (ordre non négociable)

**Objectif.** Construire le positionnement composant par composant, dans l'ordre. Chaque composant s'appuie sur le précédent. **On ne saute jamais en avant** (pas de catégorie avant d'avoir les attributs).

C'est le cœur de l'étape. La procédure fine par composant — forcing-questions, exemples MOU-vs-FORT, critères de rejet — est dans **`dunford-synthese.md`**. Ci-dessous, la machine à états qui gouverne l'ordre :

```
        ┌─────────────────────────────────────────────────────┐
        ▼                                                     │ (échoue test
 [1] ALTERNATIVES ──ok──▶ [2] ATTRIBUTS UNIQUES               │  Onliness/Moore
  directs+adjacents         ⏸ PAUSE FOUNDER                   │  → itère)
  +statu quo/rien           (confirmer/ajouter/retirer)       │
        │                        │                            │
        │                   filtre : "2 concurrents           │
        │                    l'ont aussi" = PAS unique        │
        │                        ▼                            │
        │                  [3] VALUE THEMES                   │
        │                  attribut→"so what?"→bénéfice       │
        │                  (langage client de market.md)      │
        │                        ▼                            │
        │                  [4] BEST-FIT CLIENTS               │
        │                  par CARACTÉRISTIQUES, pas démo     │
        │                        ▼                            │
        │                  [5] CATÉGORIE (défaut=existante)   │
        │                   +[6] trend SEULEMENT si réel      │
        │                        ▼                            │
        └───────────── VALIDATION : Onliness + Moore + Ladder ┘
                                 │ (les 3 passent)
                                 ▼
                          angle candidat (étape 5 ci-dessous)
```

**Sous-étapes (résumé — détail dans `dunford-synthese.md`) :**
1. **[1] Alternatives** — directs + adjacents + statu quo/manuel/rien. L'ancre. Pour chacune : job « embauché », force, où elle casse.
2. **[2] Attributs uniques** — ce qu'on a que les alternatives n'ont pas. **⏸ Pause founder obligatoire** (recette dans `forcing-questions.md`). Anti-flagornerie : attribut partagé par ≥2 concurrents = table stakes, **pas** unique.
3. **[3] Value themes** — chaque attribut → « so what ? » → bénéfice client, dans **le langage de market.md**. Regroupe en 2-3 thèmes max.
4. **[4] Best-fit clients** — par caractéristiques (situation, comportement, contrainte), jamais démographie.
5. **[5] Catégorie** — 3-5 candidats, recommande-en 1. **Défaut = catégorie existante** (voir matrice type de catégorie). Création = seulement si rien d'autre ne cadre.
6. **[6] Trend** — overlay optionnel. « Aucun » est une réponse valide et souvent meilleure qu'un trend forcé.
7. **Validation** — les 3 tests (Onliness / Moore / Ladder). Si un test échoue → **reboucle sur [2]-[3]**, ne ship pas un positionnement faible.

**Critère de passage.** Les 6 composants remplis dans l'ordre, la pause founder tracée, l'Onliness **basique** convaincante (« only » vrai), le Moore rempli sans champ vague. Sinon : itère, ne passe pas.

**Mode d'échec principal.** Attaquer par la catégorie (« on est un CRM ») avant d'avoir l'ancre alternatives → tu te compares à toi-même. **Contre-mesure :** la machine à états ci-dessus interdit tout saut en avant.

---

## Étape 5 — Formalise l'angle différenciant (candidat, PAS de verdict)

**Objectif.** Traduire les ouvertures de market.md en langage Dunford, et s'**arrêter** au candidat. C'est le point de friction anti-doublon avec l'étape 4 (04-demand-edge).

**Sous-étapes :**
1. Reprends les **manques / plaintes récurrentes / ouvertures** de `market.md` (bloc « Ouvertures observées »).
2. Filtre : ne garde que les manques **partagés par plusieurs concurrents** (un manque isolé sur 1 concurrent ≠ angle structurel).
3. Exprime chaque manque partagé en chaîne Dunford : quel **attribut** y répond → quel **value theme** → quelle formulation **Onliness candidate**.
4. Note en une ligne dans le fichier : « **Angle candidat — verdict edge = étape 4.** »

**Critère de passage (HARD GATE).** La sortie contient un *angle candidat formalisé* (chaîne attribut → value theme → Onliness candidate) et **aucun verdict** : ni « edge réel/faible/absent », ni « c'est notre edge, défendable », ni Go. Si un verdict apparaît → tu as empiété sur l'étape 4, réécris.

**Micro-exemple.** market.md montre que 3 concurrents sur 4 ont des avis se plaignant de « configuration initiale interminable ». → angle candidat : attribut « onboarding sans configuration » → value theme « opérationnel en 10 min, pas 10 jours » → Onliness candidate « le seul {catégorie} qui démarre sans setup ». Tu **n'écris pas** « c'est notre edge, défendable » — trancher est le job de l'étape 4.

**Mode d'échec.** Conclure « edge réel, on fonce » → double traitement de la décision, l'étape 4 n'a plus rien à trancher et le principe « 1 seul traitement par décision » est cassé. **Contre-mesure :** la règle unique — le verdict edge appartient à l'étape 4.

---

## Étape 6 — Écris `research/positioning.md`

**Objectif.** Consolider **le résultat** dans un fichier unique (template `assets/templates/positioning.md`), pas les fichiers épars du moteur.

**Sous-étapes :**
1. Remplis le template section par section (Alternatives · Catégorie · 5+1 · Statements Moore/Onliness · Angle candidat · Flags/Sources).
2. **N'écris pas** les livrables hors-Phase-1 du moteur : `positioning-statement.md` complet (taglines, one-liners canal), `messaging-implications.md`, `market-category-analysis.md` séparé. Ceux-là = messaging/brand/copy = **Phase 2**. Ici, seule la tranche validation/positionnement.
3. Termine par **Red flags / Yellow flags / Sources** (protocole d'honnêteté). Tague les sources par tier ; les avis concurrents restent **Tier 3**.
4. Vérifie la **definition-of-done** (`checklists-modes-echec.md` § DoD) avant de clôturer.

**Critère de passage.** `research/positioning.md` existe, suit le template, se termine par flags+sources, contient l'angle candidat (verdict edge = étape 4), et **aucun secret/clé**.

**Mode d'échec.** Déverser les 5 fichiers du moteur (doc + statement + alternatives + category + messaging) dans research/ → tu importes la Phase 2 dans la Phase 1 (violation calibration). **Contre-mesure :** un seul fichier, la tranche Phase 1 uniquement.

---

## Clôture

Après écriture : mets à jour `.saas-factory/state.md` (étape 3 faite · catégorie retenue · angle candidat), résume en 2 lignes, annonce l'**étape 4 (`04-demand-edge`)**. Détail du hand-off dans `checklists-modes-echec.md` § Passation.
