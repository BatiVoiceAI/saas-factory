# Marché & concurrents : {produit}
*SaaS Factory — Phase 1, étape 2 · basé sur idea-brief · moteur vendoré `startup-competitors` (3 vagues) · {date}*

<!--
  Ceci est le DOSSIER MARCHÉ — la vraie analyse concurrentielle sur laquelle l'IA bâtit toute la Phase 1.
  Objectif de PROFONDEUR (directive fondateur) : pas une brochure, un vrai teardown de PM/CEO.
  On veut de vraies descriptions produit/fonctionnel/technique, du funding, de la traction, des VERBATIMS sourcés —
  au-delà de la page marketing. La rapidité n'est pas le but ; la qualité actionnable l'est.
  QUOTAS DE PREUVE (source unique) : `references/checklists.md` §Quotas de preuve — combien de concurrents,
  combien de verbatims sourcés avec URL. On ne clôt pas l'étape sous quota.
  HONNÊTETÉ (honesty-protocol vendoré) : jamais inventer un concurrent ni un chiffre. Labelliser
  [Data] / [Estimate] / [Assumption] / [Opinion]. Une faiblesse concurrent = une OUVERTURE OBSERVÉE (à confirmer
  étape 4), jamais souhaitée. Si un concurrent est meilleur sur un point, le dire (anti-cheerleading).
-->

## Sommaire

- Synthèse marché (5 phrases max)
- Dossiers concurrents détaillés
- Prix — table palier-par-palier
- Carte de langage (verbatims sourcés)
- Taille servable & dynamique
- Matrice comparative
- Ouvertures observées
- Fiabilité & confiance
- Red flags / Yellow flags

## Synthèse marché (5 phrases max)
<!-- Écrit EN DERNIER, lu en premier. Concentration (fragmenté / en consolidation / dominé) + dynamique + les 1-2 ouvertures les plus nettes. C'est ce que l'étape 5 relira en priorité. Pas de jargon inutile. -->
{Concentration + dynamique + ouvertures dominantes, en clair.}

## Dossiers concurrents détaillés
<!--
  Un dossier RICHE par acteur. Wave 1 du moteur (A1 profils + A2 prix). Viser le quota (checklists §Quotas) :
  5-8 DIRECTS + 2-3 ADJACENTS + le STATU QUO (Excel / papier / rien / stagiaire) TOUJOURS présent comme colonne/dossier.
  Aller AU-DELÀ de la page marketing : avis, offres d'emploi (signal de trajectoire), funding, changelog.
  Répète ce bloc pour chaque acteur. Direct / Adjacent / Statu quo à marquer.
-->

### {Concurrent A} — {Direct | Adjacent | Statu quo}
- **Identité & traction** — [Data] site : {url} · fondé {année} · siège {lieu} · équipe ~{N} (LinkedIn/Crunchbase) · funding {total levé, dernier tour, lead} · stade {bootstrap / seed / série A / B+ / public} · revenu estimé {si dispo ou proxy [Estimate] avec hypothèse}.
- **Produit (description fonctionnelle réelle)** — [Data] ce qu'il fait concrètement, le workflow cœur qu'il couvre, en 2-4 phrases (pas le slogan — le job réel). Plateforme {web/mobile/desktop/API}.
- **Features clés** — [Data] top 5-8 features observées.
- **Signaux techniques / intégrations** — [Data]/[Assumption] stack ou intégrations publiques (WhatsApp, Stripe, ERP…), API ouverte ou non.
- **Position & cible** — [Data] qui il sert précisément, comment il se décrit, différenciateur revendiqué, preuve sociale (logos, cas clients).
- **Traction observée** — [Data] avis G2/Capterra (nombre + note), Product Hunt, réseaux (abonnés), offres d'emploi (nombre + type → eng-heavy = build, sales-heavy = scale, support-heavy = galère).
- **Prix** — [Data] modèle + métrique de valeur (par siège / à l'usage / forfait) + paliers (renvoi à la table §Prix). Coût de changement pressenti (technique/contractuel/émotionnel).
- **Forces (honnêtes)** — [Data] ce qu'il fait réellement bien (louanges d'avis + capacités). Anti-cheerleading : ne les minimise pas.
- **Faiblesses = nos ouvertures potentielles** — [Data] plaintes récurrentes / manques observés dans les avis. **Cadrées comme ouvertures à confirmer étape 4, jamais inventées** (filtre MOU-vs-FORT : `references/forcing-questions.md` §Ouverture). Chaque faiblesse porte une preuve (verbatim + renvoi §Carte de langage).
- **Menace : {High | Medium | Low}** — [Opinion] pourquoi, avec l'indice.
- **Fraîcheur** — {données <12 mois ? sinon flag « daté »}.

### {Concurrent B} — {…}
{Répéter le bloc.}

### Statu quo — {Excel / papier / rien / un stagiaire}
<!-- Le concurrent n°1 d'un SaaS est souvent « rien ». TOUJOURS un dossier ici, même bref : comment la cible fait aujourd'hui, ce que ça lui coûte, pourquoi elle ne change pas. Sans lui, la matrice ment. -->
{Description de l'alternative « faite maison », son coût réel, sa force (gratuit/familier) et sa faiblesse (manuel/erreurs).}

## Prix — table palier-par-palier
<!-- Wave 1 A2. Reverse-engineer le prix, pas juste « 49 €/mois ». Une colonne par concurrent. Prix « nous contacter » = data gap (§Fiabilité), PAS un blanc silencieux. -->

| | {Conc. A} | {Conc. B} | {Conc. C} | Statu quo |
|---|---|---|---|---|
| **Métrique de valeur** | par siège / usage / forfait | … | … | temps humain |
| **Palier entrée** (mensuel) | | | | — |
| **Palier pro** (mensuel) | | | | — |
| **Palier entreprise** | | | | — |
| **Remise annuelle** | | | | — |
| **Free / trial** | | | | — |
| **Coût de changement** | technique/contractuel/émotionnel | … | … | ~nul |

- **Psychologie tarifaire observée** — [Data]/[Opinion] ancrage, decoy, charm pricing, palier « le plus populaire », lock-in annuel.
- **Whitespace tarifaire** — [Opinion] là où personne ne se place (dessous / dessus / autre métrique / segment non servi). Rappel : whitespace ≠ ouverture prouvée tant qu'il n'est pas relié à une plainte (`references/decision-matrices.md` §Whitespace).

## Carte de langage (verbatims sourcés)
<!--
  Wave 2 (review + forum mining). LES MOTS EXACTS des clients. Section LOAD-BEARING : l'étape 4 (demande & edge)
  en HÉRITE telle quelle — elle ne re-mine pas. Chaque verbatim porte : URL de la source + marqueur
  « ouvert via WebFetch : oui/non » (un « non » = snippet, plafonné à l'étape 4). Quota : checklists §Quotas.
  Le brut complet reste sous `research/raw/review-mining.md` + `raw/forum-mining.md` (non résumé destructivement).
-->

**Pour décrire le problème :**
- « {verbatim exact} » — {source, URL} · WebFetch : {oui/non} · {date} · {concurrent visé}

**Pour décrire la solution désirée :**
- « {verbatim} » — {source, URL} · WebFetch : {oui/non} · {date}

**Pour décrire les frustrations avec l'existant :**
- « {verbatim} » — {source, URL} · WebFetch : {oui/non} · {date} · à propos de {concurrent}

**Déclencheurs de changement / churn :**
- « {verbatim} » — {source, URL} · WebFetch : {oui/non} · {date}

> Volume d'avis par concurrent + note moyenne + fenêtre de dates : consignés dans `research/raw/review-mining.md` (l'étape 4 lit ce volume pour ses bandes).

## Taille servable & dynamique
<!-- Produite ICI (étape 2) — l'étape 5 en HÉRITE pour l'axe Marché du verdict : elle ne recalcule ni n'improvise jamais. -->
- **Taille servable** — [Estimate] bottom-up : {nb d'acteurs cibles} × {prix observés en Wave 1} = {fourchette €/an}. **Hypothèse de calcul écrite** (d'où vient le nb d'acteurs, quel prix retenu) — jamais un chiffre nu.
- **Dynamique** — {fragmenté / en consolidation / dominé} + {croissance / stagnation / déclin}, avec l'indice observé (funding, entrants récents, volume d'avis dans le temps, hiring…).

> Pas de donnée pour estimer ? **Data gap déclaré** dans §Fiabilité — n'invente pas : l'étape 5 traitera l'axe Marché en conséquence.

## Matrice comparative
<!-- Une colonne par concurrent + colonne Statu quo obligatoire. Surligne les lignes où PERSONNE ne sert bien : ouvertures candidates. -->
| Feature / critère | {Conc. A} | {Conc. B} | {Conc. C} | Statu quo |
|---|---|---|---|---|
| … | fort / correct / faible / absent | … | … | … |

## Ouvertures observées
<!-- Synthèse : manque RÉCURRENT (≥2 concurrents ou plusieurs avis) ↔ plainte (verbatim) ↔ prix. FORT uniquement (filtre forcing-questions §Ouverture). Les MOU descendent en §Fiabilité (data gap). Chaque ouverture : « à confirmer étape 4, jamais inventée ». -->
- **{Ouverture}** — [Data] {preuve : N avis chez A + M chez B, verbatims joints §Carte de langage} + {prix/segment associé}. *Ouverture observée, à confirmer étape 4.*

## Fiabilité & confiance
<!--
  Ancien `confidence.md`, désormais FUSIONNÉ ici (poids mort §5 : research/ = 5 fichiers + raw/).
  Sortie de la vérification adversariale (vendor `verification-agent.md`) sur les findings ci-dessus.
  L'étape 5 lit CETTE section comme plafond de confiance du verdict (elle ne relit plus un fichier séparé).
-->

**Sources classées en tiers**
- **Tier 1** (primaire / officiel — sites éditeurs, docs prix, dépôts) : {…}
- **Tier 2** (secondaire fiable — analystes, presse spé, comparateurs sérieux) : {…}
- **Tier 3** (sentiment / anecdotique — avis, forums, Reddit) : {…}

**Score de confiance par affirmation structurante**
| Affirmation | Confiance (haute/moyenne/basse) | Ce qui la confirmerait | Ce qui l'infirmerait |
|---|---|---|---|
| … | … | … | … |

**Findings haute confiance vs à vérifier**
- **Haute confiance** : {affirmations appuyées sur ≥1 source Tier 1/2}
- **Basse confiance / à vérifier** : {affirmations reposant seulement sur du Tier 3}

**Data gaps (déclarés)**
<!-- Les inconnus honnêtes : « peu d'avis trouvés », « prix entreprise non public », ouvertures MOU rétrogradées ici. Un blanc assumé vaut mieux qu'un chiffre inventé. -->
{…}

## Red flags / Yellow flags
<!-- honesty-protocol : ne jamais sauter. Si aucun : « Aucun flag identifié ». -->
- **Red :** {ce qui pourrait fausser toute la lecture marché, ou « — »}
- **Yellow :** {à surveiller / recouper, ou « — »}

> Review-mining brut conservé sous `research/raw/` — réutilisé tel quel par l'étape 4 (demande & edge). §Carte de langage + volumes d'avis en sont l'entrée directe.
