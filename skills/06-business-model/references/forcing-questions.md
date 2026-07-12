# Référence — Forcing questions (points de décision de l'étape 6)

Cette étape **ne ré-interroge pas** l'utilisateur sur ce que la Phase 1 a déjà tranché (cible, problème, edge, catégorie). Les forcing questions ici sont donc d'abord des **auto-interrogations** : tu les poses **aux artefacts et à ton propre brouillon** pour t'empêcher de bâcler. Tu n'ouvres une question **à l'utilisateur** que dans les rares cas de routage explicitement listés (R1).

> Q3-Q5 portent sur le pricing marché : elles ne s'appliquent que si le pricing s'exécute (**`type = public`**). Pour `interne`, l'auto-interrogation équivalente porte sur le **ROI interne** : coût évité chiffré avec hypothèse écrite, seuil de rentabilité **falsifiable** (SKILL.md §« Mode interne »).

Format de chaque recette :
- **Ask exact** — la question, mot pour mot.
- **Push-until** — le critère qui autorise à passer à la suite.
- **Red-flags** — les réponses à **refuser** (elles trahissent un raccourci).
- **MOU vs FORT** — un exemplaire faible et un exemplaire solide.
- **Routage** — quoi faire selon la réponse.

---

## Q1 — L'UVP tient-elle debout ? (bloc 3 du canvas)
- **Ask exact :** « En une phrase, on aide **qui** à **résoudre quoi** grâce à **quel mécanisme** — et en quoi cette phrase est-elle **fausse** pour un concurrent ? »
- **Push-until :** la phrase suit la formule canonique **et** un concurrent nommé ne pourrait pas la revendiquer telle quelle.
- **Red-flags :** « solution tout-en-un », « simple et puissant », « la meilleure plateforme » ; une UVP vraie pour n'importe qui.
- **MOU :** « La plateforme intelligente qui simplifie votre quotidien. »
- **FORT :** « On aide [cible précise] à [éliminer douleur nommée] grâce à [mécanisme différenciant]. »
- **Routage :** MOU → relire `positioning` (Onliness), reprendre l'edge réel, ne pas passer au bloc 4 tant que l'UVP est interchangeable.

## Q2 — La Solution reste-t-elle dans son couloir ? (bloc 4)
- **Ask exact :** « Chacune de ces 3 features adresse **quel** problème du bloc 1 — et laquelle est en fait de la **spec** (étape 7) ? »
- **Push-until :** exactement 3 features, chacune mappée à un problème listé ; zéro critère d'acceptation écrit.
- **Red-flags :** une 4e/5e feature « tant qu'on y est » ; une feature sans problème parent ; des détails d'implémentation.
- **MOU :** liste de 6 features, certaines sans lien avec les problèmes.
- **FORT :** 3 features, table problème→feature complète, spec renvoyée à l'étape 7.
- **Routage :** feature orpheline → couper ou marquer « could » pour l'étape 7 ; débordement spec → retirer.

## Q3 — Le prix est-il ancré valeur ou cost-plus ? (mouvement 5.2)
- **Ask exact :** « Ce prix se justifie par **quelle valeur du job résolu** face à **quelle alternative actuelle** — et si je retirais le coût d'infra de mon raisonnement, tiendrait-il encore ? »
- **Push-until :** la justification cite l'alternative actuelle et une estimation de valeur (heures/€ économisés, outil remplacé) **sans** dépendre du coût de hosting.
- **Red-flags :** « mon API coûte X donc… », « une marge de N % sur le coût », toute phrase où le **coût** est le point de départ du prix.
- **MOU :** « L'action me coûte 0,02 €, je facture 0,05 €. »
- **FORT :** « L'alternative (1 h manuelle ≈ 40 €) ; à 15 €/mois pour 50 actions, le client garde l'essentiel du surplus. »
- **Routage :** cost-plus détecté → repartir du VPC (job/pains/gains) et de l'alternative ; le coût redevient un simple **plancher**.

## Q4 — L'axe de scaling est-il unique et corrélé à la valeur ? (mouvement 5.3)
- **Ask exact :** « Quelle **seule** métrique fait payer plus quand le client obtient plus de valeur — et est-ce la même qui fait grimper mon coût marginal ? »
- **Push-until :** **un** axe nommé (siège / usage / volume / features), corrélé à la valeur perçue ; si le coût marginal scale, l'axe le couvre aussi.
- **Red-flags :** deux ou trois axes mélangés ; un axe décorrélé de la valeur (« par nombre de boutons ») ; un forfait plat alors que le coût scale avec l'usage.
- **MOU :** « On facture par siège **et** par requête **et** par Go. »
- **FORT :** « Par usage (générations/mois) : suit la valeur perçue **et** protège la marge LLM. »
- **Routage :** plusieurs axes → en choisir un (matrice 5.3 de `pricing-procedure.md`) ; coût qui scale non couvert → basculer vers usage/volume.

## Q5 — Les paliers sont-ils distincts et ancrés ? (mouvement 5.4)
- **Ask exact :** « Pourquoi un early adopter **upgraderait** d'un palier au suivant — quel **saut de valeur**, quelle **limite** l'y pousse ? Et lequel est le palier **cible** ? »
- **Push-until :** 2-3 paliers payants (jamais >3) ; chaque montée justifiée par un saut de valeur et une limite sur l'axe de scaling ; le palier cible est **nommé**.
- **Red-flags :** 4+ paliers ; deux paliers qui se ressemblent ; un écart « +5 € » sans contrepartie ; aucun palier cible identifié.
- **MOU :** 4 paliers, différences cosmétiques, cible non nommée.
- **FORT :** Free / Starter (entrée) / **Pro (cible ●)** / Team (ancre haute), chaque saut = limite ×N + capacités.
- **Routage :** >3 paliers → fusionner ; paliers indistincts → poser une limite nette par palier ; cible absente → la nommer.

## Q6 — L'avantage déloyal est-il réel ? (bloc 9)
- **Ask exact :** « Qu'est-ce qui, ici, ne se **copie ni ne s'achète** en un trimestre — ou dois-je **assumer** qu'il n'y en a pas encore ? »
- **Push-until :** soit un moat concret (donnée propriétaire, réseau, autorité, communauté), soit l'**absence explicitement assumée** + la vraie source de défense (niche, vitesse, relation early adopters).
- **Red-flags :** « notre technologie supérieure », « notre UX », « on exécute mieux » présentés comme moats ; tout moat flatteur invérifiable.
- **MOU :** « Notre avantage déloyal : une meilleure expérience utilisateur. »
- **FORT :** « Aucun moat durable à ce stade ; défense = niche trop petite pour les gros + vitesse d'itération + accès direct aux early adopters. »
- **Routage :** moat fabriqué → le remplacer par l'absence assumée (honnêteté anti-flagornerie prime sur le confort du récit).

---

## R1 — Les seuls cas où l'on interroge VRAIMENT l'utilisateur
Par défaut : **zéro question**. On branche la Phase 1 et on esquisse le reste. On **ouvre une question à l'utilisateur uniquement** dans ces cas de routage :

| Cas | Condition déclenchante | Question minimale à poser |
|---|---|---|
| **Donnée Phase 1 manquante** | Un bloc « déjà tranché » (cible/problème/edge) est **absent ou vide** dans les artefacts | Poser **la seule** question qui débloque ce bloc, en citant l'artefact manquant — puis reprendre en autonomie |
| **Contradiction inter-artefacts** | `opportunity-brief` et `positioning` se contredisent sur la cible ou l'edge | Exposer les deux versions, demander de trancher (choix binaire), documenter |
| **Modèle économique ambigu** | Le produit peut raisonnablement être B2C solo **ou** B2B équipe, ce qui change tout le pricing | Poser **une** question de cadrage (« usage solo ou en équipe ? ») car l'axe de scaling en dépend |
| **Contrainte prix explicite** | L'utilisateur a une contrainte connue (positionnement premium imposé, gratuité militante) | Confirmer la contrainte avant d'ancrer, pour ne pas la violer |

**Règle d'or du routage :** une question ouverte à l'utilisateur est un **coût** (friction, lessons.md : interaction minimale). Ne l'ouvre que si **aucune** relecture d'artefact ne peut y répondre. Sinon, branche, esquisse, marque `[Assumption]`, avance.
