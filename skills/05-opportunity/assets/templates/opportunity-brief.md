# Opportunity Brief — <nom court de l'idée>

<!--
  LE SEUL livrable de décision de l'étape 5 (fusion poids mort §5 : opportunity-summary + confidence absorbés ici → research/ = 5 fichiers + raw/).
  DEUX fonctions dans UN fichier, ne les confonds jamais :
    1. §Décision — le POURQUOI : NON-TECHNIQUE, AUTO-SUFFISANT. C'est CE QUE L'HUMAIN LIT à la porte pour décider. On doit pouvoir trancher SANS lire le détail plus bas.
    2. Le détaillé (traçable) : pour que la Phase 2 démarre sans re-fouiller. On y garde chiffres, sources, nuances, risques.
  MÊME VÉRITÉ, deux registres — le POURQUOI n'est PAS une version adoucie du détail (test de cohérence obligatoire, cf. writing-deliverables.md).
  Synthèse des étapes 1→4, PAS de recherche neuve. Labelliser chaque affirmation forte : [Data] / [Estimate] / [Assumption] / [Opinion]. Citer la source. Ne rien fabriquer : une case vide vaut mieux qu'une supposition.
-->

## Décision — le POURQUOI  ·  ⟵ CE QUE L'HUMAIN LIT À LA PORTE
<!-- 1-2 « écrans » MAX. ZÉRO jargon (pas de SAM/TAM, CAC, moat…). Lisible par un non-technique qui n'a pas suivi la recherche. AUTO-SUFFISANT : si ce bloc oblige à descendre dans le détail pour décider, il a raté sa mission. -->

**Le problème en 1 phrase** — <qui souffre, quand, de quoi. Une seule phrase.>

**Ce qu'on a trouvé** — <marché / concurrents / demande EN CLAIR. La mauvaise nouvelle sans la maquiller. Ex. « Il existe déjà 5 outils solides, les gens se plaignent surtout du prix, mais personne ne domine. »>

**Le POURQUOI** — <LE CŒUR. Pourquoi continuer, OU pourquoi pas. Un raisonnement causal en 3-5 phrases qui tient tout seul (« parce que A, et que B malgré C, alors D »). Pas un score. Rappelle que le signal est inféré des avis, « à valider par toi ».>

**Recommandation : <Go | Ajuster | Go-test | No-Go>** — <une phrase de justification nette, jamais « intéressant » / « ça peut marcher ».>

> **À toi de décider.** <Ce que ça déclenche : Go → cadrage produit · Ajuster → on revoit <quoi> · Go-test → landing + waitlist en 1 jour, seuil pré-enregistré · No-Go → on s'arrête proprement.>

---

## Le détaillé (pour la Phase 2)
<!-- À partir d'ici : la matière traçable. L'humain n'a pas besoin d'y descendre pour décider ; la Phase 2, si. -->

## Problème
<!-- Repris de l'idea-brief, resserré par ce que la recherche a confirmé OU démenti (« tu supposais X, la donnée montre Y »). -->
<Problème confirmé/nuancé>

## Cible
<Persona précis + segment retenu>

## Marché
<!-- Hérité de market.md § « Taille servable & dynamique » (étape 2) — jamais recalculé ici. Taille AVEC hypothèse de calcul (jamais un chiffre nu), segment, dynamique. Un « $12M en déclin » se dit tel quel. Section amont absente = « marché non analysé » + flag, pas une invention. -->
- **Taille :** <valeur> — [Estimate] <hypothèse de calcul>
- **Segment :** <segment servi>
- **Dynamique :** <croissance | stagnation | déclin> — <source>

## Concurrents clés
<!-- Hérités de market.md §Dossiers concurrents détaillés + §Prix. CITE-les nommément avec leur prix et une preuve (verbatim). Menace HONNÊTE + ce qu'ils font BIEN, pas seulement leurs manques. -->
| Concurrent | Ce qu'ils font bien | Manque exploitable (preuve) | Prix | Menace |
|---|---|---|---|---|
| <nom> | <force réelle> | <faille + verbatim/§Carte de langage> | <palier> | <High / Medium / Low> |

## Demande
<!-- Signal PAR PROXY (avis, plaintes récurrentes, features réclamées, volume). Hérité du verdict de l'étape 4. Toujours « plausible », jamais « prouvée ». -->
<Signal de demande inféré + son assise> — [Data]/[Assumption]

## Edge
<!-- L'axe différenciant s'il existe ; SON ABSENCE ASSUMÉE sinon (« pas d'edge net → pari exécution + niche », ce qui reste viable). Hérité du verdict de l'étape 4. -->
<Edge identifié, ou absence assumée + pari>

## Risques
<!-- Les vrais tueurs D'ABORD, pas noyés dans les détails. Énumérés via les 5 familles (marché · concurrence · exécution/technique · distribution · réglementaire/dépendance — cf. synthesis-and-confrontation.md §Risques). -->
- <risque majeur 1>
- <risque majeur 2>

## Fiabilité du dossier
<!-- Absorbe l'ex-confidence : héritée de market.md §Fiabilité & confiance. C'est le PLAFOND de confiance du verdict — un verdict ne peut pas être plus sûr que sa recherche. Si une dimension est basse, dis-le et descends l'axe concerné d'un cran. -->
- **Confiance globale de la recherche :** <haute | moyenne | basse> — <d'où : Tier des sources porteuses>
- **Ce qui reste à vérifier :** <data gaps hérités + preuves [snippet — non vérifié] éventuelles>

## Pertinence
<!-- Lecture argumentée : ça vaut le coup / pas / à conditions. -->
<Analyse>

## Verdict
<!-- Croise marché × edge × demande × risques, plafonné par §Fiabilité. Honnête et humble. Dire ce qui changerait l'avis. -->
<Verdict + « ce qui le ferait basculer »>

## Kill-criteria (pré-enregistrés — la grille que 19-retro relèvera)
<!-- Dérivés de la Phase 8 « Validation » du moteur startup-design (kill-criteria + scorecard). 5-7 conditions d'arrêt/pivot SPÉCIFIQUES et MESURABLES, chacune liée à un seuil + une source de mesure (étape 18). « si < 3/10 interviewés disent qu'ils paieraient X », PAS « si pas de demande ». Fixés MAINTENANT, avant tout effort, pour que l'attachement ne déplace pas les poteaux le jour venu. 19-retro les relève tels quels (ne réinvente pas un seuil après coup). -->
| # | Condition d'arrêt / pivot (mesurable) | Seuil | Mesuré par (étape 18) |
|---|---|---|---|
| 1 | <ex. conversion vue→valeur sur 4 semaines> | < X % | `metrics/review.md` |
| 2 | <ex. rétention / ré-achat / runs utiles> | < Y | `metrics/review.md` |
| 3 | <ex. CAC vs LTV tenu> | CAC > LTV | `metrics/review.md` |

**Scorecard (Ph8 — 7 dimensions × 1-10 + verdict)** — <report le scorecard ou au moins son **Verdict** : 8-10 proceed · 6-7 conditional · 4-5 concerns · 1-3 stop/pivot. Rejoué sur les vraies métriques de l'étape 18, un verdict qui retombe en 1-3 = signal de kill/pivot.>

## Flags
<!-- Ne pas sauter la section. Si aucun : « No flags identified ». -->
- **Red :** <issue bloquante ou « — »>
- **Yellow :** <à surveiller ou « — »>

---

## Annexe — kit interviews : 5 questions à poser toi-même (Mom Test)
<!-- Hors pagination (ne compte pas dans le POURQUOI). Rend « à valider par toi » actionnable dès la sortie de la porte (et pendant la fenêtre d'un éventuel Go-test). Dérivées des pain themes de demand-signals.md : une question par douleur majeure (au passé), la dernière sur le comportement. Règles Mom Test : parler de LEUR passé (« la dernière fois que… »), jamais pitcher l'idée, chercher des faits et des comportements — pas des opinions ni des compliments.
     🚨 ROUTE `public` UNIQUEMENT. En route allégée (`perso`/`interne`) ou archétype `automation`, il n'y a pas de prospects marché à interviewer : REMPLACER cette annexe par la **checklist « hypothèses propriétaire »** (accès source/outils, format & cadence, seuils, canal+propriétaire de boucle, grain d'idempotence…) — cf. `references/lite-mode.md` §Variante d'annexe. -->
1. <question dérivée du pain theme n°1 — ex. « Raconte-moi la dernière fois que {douleur}. Qu'est-ce que ça t'a coûté ? »>
2. <question dérivée du pain theme n°2>
3. <question dérivée du pain theme n°3>
4. <question sur l'alternative actuelle — « comment tu gères ça aujourd'hui, concrètement ? »>
5. <question de comportement — « qu'as-tu déjà essayé ou payé pour résoudre ça ? »>
