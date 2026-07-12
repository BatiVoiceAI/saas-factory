# Référence — Fiche feature profonde (étape 5, cœur de la profondeur PM)

> **Constat fondateur.** Les Phases 1-2 étaient « trop light ». Une fiche feature d'une ligne n'est pas une spec de PM : c'est un titre. Ici on ne cherche pas la rapidité mais la **qualité** — chaque feature **Must** est exécutée avec le plus grand soin. Cette référence définit l'**anatomie complète** d'une fiche `product/features/NN-<slug>.md` : ce qu'un vrai PM écrit pour qu'un ingénieur puisse construire sans réinventer, et pour que le Verifier puisse cocher.

La fiche feature **absorbe la user story et ses critères d'acceptation** (décision de fusion §5 : on garde les **fiches**, pas un `user-stories.md` séparé — cf. `procedure.md`). Une fiche **Must** sans **flow + états + critères testables + volet technique** est une spec non finie : c'est la condition d'échec du HARD GATE de l'étape 7.

## Champ d'application (proportionnalité)
| Bucket | Profondeur exigée |
|---|---|
| **Must** | Fiche **complète** : les 11 sections ci-dessous, chacune remplie. C'est le contrat de build. |
| **Should** | Fiche **allégée** : Objectif, Persona, Story, Comportement + **états clés**, critères **nominaux**, volet technique en 2-3 lignes, N'inclut pas. Approfondie si/quand elle remonte en Must. |
| **Could / Won't** | **Pas de fiche** — une ligne dans la liste du PRD suffit. |

Le **socle « produit complet »** (`completeness-baseline.md`) : fiche complète pour **S1 (onboarding)** et **S2 (profil/settings)** ; les éléments mécaniques (S3-S8) peuvent être groupés dans **une** fiche « socle produit complet » traitée avec le même sérieux.

## Les 11 sections d'une fiche Must

```
  1 Objectif/job   2 Persona   3 User story   4 Flow détaillé   5 États
  6 Règles métier  7 Boucles fermées   8 Critères d'acceptation
  9 Volet technique   10 Dépendances   11 N'inclut pas
```

### 1 — Objectif / job
Le **job-to-be-done** que la feature accomplit, du point de vue de la cible, **rattaché Phase 1** (workflow cœur, `demand-signals`, manque concurrent, ou `socle complétude`). 2-3 lignes : la situation, le progrès que l'utilisateur cherche, ce que la feature change pour lui. Pas « ce que ça fait » (mécanique) mais « **pourquoi** ça existe » (valeur).
- **MOU :** « Permet de gérer les réservations. »
- **FORT :** « Quand une cliente veut un créneau, elle réserve seule en 30 s sans appeler ; le gérant cesse de jouer le standard téléphonique et récupère ~1 h/jour. »

### 2 — Persona
L'utilisateur **précis** qui déclenche la feature (le même que la cible Phase 1, ou un rôle secondaire nommé — ex. la cliente **et** le gérant si les deux la touchent). Jamais « un utilisateur ».

### 3 — User story
Format imposé : **En tant que** \<persona\>, **je veux** \<action observable\>, **afin de** \<bénéfice rattaché Phase 1\>. Méthode + red-flags : `acceptance-criteria.md` Partie A. Si plusieurs rôles agissent, **une story par rôle**.

### 4 — Flow détaillé (le cœur fonctionnel)
Le parcours **nominal**, **étape par étape**, du **déclencheur** au **résultat à valeur** — numéroté, chaque étape = une action utilisateur **ou** une réaction produit observable. C'est ce qui manquait aux fiches d'une ligne. Un ingénieur doit pouvoir **maquetter l'écran** rien qu'en lisant le flow.
- Commence par le **déclencheur** (« la cliente ouvre le lien de réservation »).
- Une étape par interaction : saisie, choix, validation, transition d'écran, feedback.
- Termine par le **résultat observable** (« la cliente voit la page de confirmation **et** reçoit l'email » → renvoie à la boucle §7).
- Nomme les **écrans / vues** traversés (sans les dessiner : le design est l'étape 8).

**MOU :** « L'utilisateur réserve un créneau. »
**FORT :**
```
1. La cliente ouvre le lien public de réservation → voit la liste des prestations.
2. Elle choisit une prestation → le produit affiche les créneaux libres des 14 prochains jours.
3. Elle choisit un créneau → un formulaire minimal s'affiche (prénom, téléphone, email).
4. Elle valide → le produit vérifie que le créneau est toujours libre (§ Règles métier).
5. Créneau libre → écran de confirmation + email récap (.ics + lien annuler) → notification au gérant (§ Boucles fermées).
```

### 5 — États (jamais un seul « happy path »)
Pour **chaque** écran/vue du flow, nomme l'état rendu dans chaque condition. Un produit fini gère **tous** ses états ; un squelette n'a que le succès.

| État | Ce qu'il faut spécifier | Source / renvoi |
|---|---|---|
| **Vide** (empty state) | Aucune donnée encore : message pédagogique + CTA vers l'action. Jamais un tableau vide muet. | socle **S3** (`completeness-baseline.md`) |
| **Chargement** (loading) | Action longue / fetch : feedback (skeleton, spinner, progression), pas de gel, annulation si pertinent. | — |
| **Succès** | Résultat obtenu + **trace durable** (pas seulement l'écran qui se ferme). | boucle §7 (`_shared/boucles-fermees.md`) |
| **Erreur** | Échec (validation, panne dépendance, permission) : message **clair et actionnable**, état **non corrompu**, repli honnête. | `_shared/safety-rails.md` §6 ; catalogue `acceptance-criteria.md` C |
| **Edge / partiel** | Cas limites pertinents : volume, accès concurrent, quota atteint, session expirée, double-clic. | catalogue `acceptance-criteria.md` Partie C |

**Règle :** balayer le catalogue de cas limites (`acceptance-criteria.md` Partie C) une fois — chaque cas **pertinent** devient un état ici **et** un critère d'acceptation en §8. Rien ne se perd. On ne **duplique pas** le catalogue : on le **référence** et on nomme les états retenus.

### 6 — Règles métier
Les **contraintes et invariants fonctionnels** que le produit doit faire respecter — le « pourquoi ça peut échouer » de l'état **Erreur** (§5), formalisé. Ce sont des règles **métier** (le *quoi*), pas des contraintes techniques (le *comment* = 09).
- **Validations d'entrée** : champ requis, format (email, téléphone), bornes (durée > 0), unicité métier.
- **Invariants** : ce qui doit **rester vrai** quoi qu'il arrive. Ex. « deux réservations ne se chevauchent jamais sur la même ressource/créneau » ; « le total d'une commande = somme des lignes » ; « un congé approuvé décrémente le solde ».
- **Droits / propriété** : qui a le droit de faire quoi sur quelle ressource.
- **Effets de bord métier** : « annuler une résa libère le créneau **et** notifie l'autre partie » (→ §7).

Chaque règle métier **non triviale** doit ressortir en §8 sous forme d'un critère d'acceptation testable.

### 7 — Boucles fermées (si la feature est une action de valeur)
Si la feature **crée / modifie / annule l'entité métier** (résa, commande, dossier, invitation, demande…), remplis ici les **5 questions** de dérivation de `_shared/boucles-fermees.md` — chaque « oui » devient une exigence de cette feature (et un critère en §8). **Aucune action de valeur muette.**

| # | Question | Réponse pour cette feature |
|---|---|---|
| 1 | L'**acteur** reçoit-il une trace durable ? | \<email/notif de confirmation, ou « écran + historique suffisent » justifié\> |
| 2 | La **contrepartie** est-elle informée ? | \<notif à l'autre partie — jamais sautable si contrepartie existe\> |
| 3 | L'action est-elle **réversible/modifiable** ? | \<lien annuler/déplacer (token signé si sans compte)\> |
| 4 | Un **rappel** a-t-il du sens ? | \<rappel J-1/H-2 si échéance\> |
| 5 | Trace **consultable** des deux côtés ? | \<historique acteur + contrepartie\> |

Le **canal** s'adapte au type de produit (email client / email pro / notif in-app / webhook interne) ; l'**existence** de la boucle, non. « Pas de boucle » est une réponse **justifiée par action** (action solo instantanée dont l'écran + l'historique suffisent), jamais un défaut de type. Si la boucle exige une brique non listée (email de confirmation, lien d'annulation) → **remonter** en feature/exigence dans le PRD.

### 8 — Critères d'acceptation (ce qui rend la fiche exécutable)
Given/When/Then **vérifiables** oui/non. Méthode, format et catalogue : `acceptance-criteria.md` Parties B-C. Couverture exigée :
- **1 critère nominal** (le flow §4 réussit).
- **1 critère par état** non trivial de §5 (vide, erreur, chaque edge pertinent).
- **1 critère par règle métier** non triviale de §6 (surtout les invariants).
- **1 critère par boucle** de §7 (« alors l'email de confirmation part », « alors le gérant est notifié »).
- **≥1 critère de frontière** vérifiant une exclusion de §11 (« quand l'utilisateur cherche X hors-scope, alors le produit ne le propose pas »).

Un critère = un résultat **concret** (valeur, message, état, count, email parti), jamais une impression (« alors c'est fluide » ✗).

### 9 — Volet technique (le contrat logique — l'interface vers 09)
Ce que la feature **exige du système**, au niveau **fonctionnel/logique**. C'est ce que la Phase 3 (`09-architecture`) **consomme** pour concevoir le *comment*. On décrit le **QUOI logique**, jamais le **COMMENT concret**.

| On écrit ici (07 — le QUOI logique) | On NE écrit PAS ici (→ 09 — le COMMENT) |
|---|---|
| **Entités touchées** : lesquelles la feature crée / lit / modifie / supprime (noms métier : `Réservation`, `Prestation`, `Client`) | Schéma SQL, types de colonnes, index, migrations |
| **Actions logiques / endpoints** au sens fonctionnel : `créer une réservation`, `annuler une réservation` | Verbe HTTP exact, route, contrôleur, découpage services |
| **Validations** à garantir : champs requis, formats, unicité métier | Librairie de validation, couche où elle vit |
| **Invariants** à préserver (repris de §6, côté données) : « pas de chevauchement de créneau » | Verrou pessimiste vs optimiste, transaction isolation level, cache |

**Règle de cohérence 07 ↔ 09 :** les **noms d'entités et d'actions** posés ici sont ceux que 09 reprend dans le schéma de données et le contrat d'API. Divergence de nommage = dette. 07 nomme et contraint ; 09 conçoit et implémente. Le volet technique ne **déborde jamais** en choix de stack, schéma concret ou architecture (ça, c'est le HARD GATE de l'étape 7).

### 10 — Dépendances
Features / briques qui doivent exister **avant** celle-ci (alimente le build order, étape 6). Ex. « dépend de : Auth, Profil salon (l'entité cœur doit exister pour réserver) ».

### 11 — N'inclut pas
La **frontière** : ce qu'un ingénieur pourrait **raisonnablement croire inclus** et qui ne l'est **pas** en v1. Au moins une exclusion **non triviale** (méthode + red-flags : `forcing-questions.md` Q4). Sans frontière, la feature gonfle en silence au build.

## Critères de passage (par fiche Must)
- [ ] Objectif rattaché Phase 1 (ou `socle complétude`), formulé côté **valeur**.
- [ ] Flow §4 **numéroté**, du déclencheur au résultat observable — maquettable tel quel.
- [ ] États §5 : **au moins** vide + erreur nommés (plus les edge pertinents) ; jamais que le happy path.
- [ ] Règles métier §6 : **≥1 invariant** nommé quand la feature écrit des données.
- [ ] Boucles fermées §7 remplies **si action de valeur** ; « pas de boucle » justifié sinon.
- [ ] Critères §8 : nominal + 1 par état + 1 par règle + 1 par boucle + ≥1 frontière, tous **vérifiables**.
- [ ] Volet technique §9 : entités + actions + validations + invariants, **sans** déborder en 09.
- [ ] Dépendances §10 listées ; N'inclut pas §11 ≥1 exclusion non triviale.
- [ ] Priorité **cohérente** avec la matrice du PRD (source unique : `product-spec.md` § Priorisation).

## Modes d'échec (et comment les gérer)
| Mode d'échec | Symptôme | Correction |
|---|---|---|
| **Fiche titre** | La fiche tient en une ligne (« gère les réservations ») | Dérouler le flow §4 étape par étape ; sans flow, pas de spec |
| **Happy path only** | Seul le succès est décrit | Nommer les états §5 (vide, erreur, edge) via le catalogue `acceptance-criteria.md` C |
| **Action muette** | Feature de valeur sans §7 rempli | Dériver les 5 questions ; câbler confirmation + notif contrepartie |
| **Règles implicites** | Aucun invariant nommé alors que la feature écrit | Formaliser §6 : que doit-il **rester vrai** ? → critère en §8 |
| **Débordement 09** | §9 décrit le schéma SQL, la stack, les index | Remonter au **QUOI logique** (entités, actions, validations, invariants) ; le COMMENT = 09 |
| **Story sans critère** | §3 présente mais §8 vide | Non finie : nominal + 1 par état/règle/boucle |
| **Frontière absente** | §11 vide | Forcer une exclusion non triviale (`forcing-questions.md` Q4) |
| **Sur-spec d'un Could** | Fiche complète pour un Could/Won't | Pas de fiche : une ligne dans la liste suffit |
