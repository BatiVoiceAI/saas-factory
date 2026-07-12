# Référence — Forcing questions (points de décision de l'étape 7)

Comme à l'étape 6, cette étape **ne ré-interroge pas** l'utilisateur sur ce que la Phase 1 a tranché (problème, cible, edge, écosystème). Les forcing questions sont d'abord des **auto-interrogations** : tu les poses **à ton propre brouillon de PRD** pour t'empêcher de bâcler. Tu n'ouvres une question **à l'utilisateur** que dans les rares cas de routage listés en R1, et à la **Porte** finale.

Format de chaque recette :
- **Ask exact** — la question, mot pour mot.
- **Push-until** — le critère qui autorise à passer à la suite.
- **Red-flags** — les réponses à **refuser** (elles trahissent un raccourci).
- **MOU vs FORT** — un exemplaire faible et un exemplaire solide.
- **Routage** — quoi faire selon la réponse.

---

## Q1 — Le workflow cœur est-il UN parcours, ou trois ? (étape 1)
- **Ask exact :** « Décris le parcours de l'utilisateur **de l'entrée au livrable** en une seule ligne continue — combien de fois change-t-il de but en route ? »
- **Push-until :** un **seul** parcours nommé, du déclencheur au résultat à valeur, sans bifurcation « et aussi il peut… ».
- **Red-flags :** « le produit permet de faire A, B **ou** C » (trois workflows) ; un parcours qui n'aboutit à aucun livrable ; « ça dépend de l'utilisateur ».
- **MOU :** « Une plateforme où l'utilisateur gère ses projets, discute avec l'équipe et facture ses clients. » (trois produits)
- **FORT :** « L'utilisateur saisit X → le produit génère Y → il l'édite → il l'exporte au format Z. » (un parcours, un livrable)
- **Routage :** plusieurs workflows → en choisir **un** (le plus douloureux/fréquent) comme cœur ; les autres deviennent des notes « expansion possible », **pas** des Must.

## Q2 — Chaque feature se rattache-t-elle à la Phase 1 ? (étape 2)
- **Ask exact :** « Cette feature répond à **quel** élément de `research/` — le workflow cœur, une demande de `demand-signals`, ou un manque concurrent — et si aucun, pourquoi est-elle là ? »
- **Push-until :** chaque feature de la liste porte **une** source rattachée ; zéro feature « tant qu'on y est ».
- **Red-flags :** « ce serait cool d'avoir… » ; « les concurrents l'ont donc nous aussi » sans lien au problème cœur ; une feature justifiée par elle-même.
- **MOU :** feature « tableau de bord analytics » ajoutée sans qu'aucun signal ne la réclame.
- **FORT :** feature « export au format Z », rattachée à un manque concurrent **et** à une demande explicite de `demand-signals`.
- **Routage :** feature orpheline → couper, ou passer en **Won't have** (documentée comme non-goal). Ne jamais la glisser en Must. **Exception :** les éléments du socle « produit complet » portent le rattachement `socle complétude` (`completeness-baseline.md`) — injectés d'office, jamais orphelins.

## Q3 — Le comportement est-il testable, ou vague ? (étape 5)
- **Ask exact :** « Pour cette feature, quel est le résultat **observable** quand l'utilisateur fait l'action nominale — peux-tu l'écrire en Given/When/Then dès maintenant ? »
- **Push-until :** le comportement nominal se transforme **directement** en un critère d'acceptation vérifiable (oui/non).
- **Red-flags :** « le système gère intelligemment X » ; « une bonne expérience de Y » ; tout verbe non observable (« optimise », « facilite ») sans résultat mesurable.
- **MOU :** « L'utilisateur peut facilement retrouver ses anciens documents. »
- **FORT :** « Quand l'utilisateur ouvre l'historique, alors la liste de ses documents s'affiche, triée par date décroissante, 20 par page. »
- **Routage :** comportement vague → le réécrire en résultat observable ; s'il résiste, c'est peut-être du design (étape 8), pas de la spec.

## Q4 — Le « N'inclut pas » borne-t-il vraiment la feature ? (étape 5)
- **Ask exact :** « Qu'est-ce qu'un dev pourrait **raisonnablement croire inclus** dans cette feature et qui ne l'est **pas** en v1 ? »
- **Push-until :** au moins une exclusion **non triviale** nommée (pas « ne fait pas le café »), qui prévient un vrai gonflement.
- **Red-flags :** « N'inclut pas » vide ; exclusions absurdes qui ne bornent rien ; frontière qui recouvre en fait une autre feature Must (contradiction).
- **MOU :** (champ vide) ou « N'inclut pas : les fonctionnalités hors périmètre. »
- **FORT :** « Export : v1 = format Z uniquement. **N'inclut pas** : PDF, envoi par email, planification récurrente. »
- **Routage :** champ vide → forcer une exclusion ; sans frontière la feature gonfle en silence au build.

## Q5 — Le MVP est-il le plus PETIT qui résout le problème ? (étape 3)
- **Ask exact :** « Si je retire cette feature du MVP, le problème cœur **reste-t-il résolu** — oui ou non ? »
- **Push-until :** chaque Must échoue au test de retrait (l'enlever **casse** le job cœur) ; tout ce qui survit au retrait sort du MVP.
- **Red-flags :** « c'est mieux avec » (≠ indispensable) ; « les utilisateurs s'attendront à… » sans que le job cœur en dépende ; un Must qui est en fait un confort.
- **MOU :** MVP = 9 features dont 5 « améliorent l'expérience ».
- **FORT :** MVP = 3 features, chacune sans laquelle le workflow cœur ne s'accomplit pas ; le reste en Should/Could.
- **Routage :** feature qui survit au retrait → la descendre en Should/Could ; le MVP ne garde que l'indispensable (voir `prioritization.md`). **Exception :** le socle « produit complet » est **exempté** du test de retrait (Must d'office, `completeness-baseline.md`) — on adapte ses éléments à la niche, on ne les débat pas.

## Q6 — Le Won't have est-il nommé, ou implicite ? (étape 3)
- **Ask exact :** « Quelles capacités un utilisateur pourrait attendre et que l'on décide **explicitement** de ne pas faire cette fois — les as-tu **écrites** ? »
- **Push-until :** le bucket **Won't have** est non vide et **nommé** (features précises, pas « le superflu »), repris en Non-goals du PRD.
- **Red-flags :** Won't have vide ; non-goals génériques ; hors-scope « oublié » qui ressurgira au build.
- **MOU :** « Won't have : tout le reste. »
- **FORT :** « Won't have (this time) : collaboration multi-utilisateurs, appli mobile, intégration W, mode hors-ligne. » (nommés → protègent le scope)
- **Routage :** Won't vide → le remplir en listant les attentes plausibles qu'on écarte ; c'est lui qui protège du scope-creep.

## Q7 — La story a-t-elle un bénéfice rattaché, et des critères ? (étape 5)
- **Ask exact :** « Le "afin de" de cette story se rattache-t-il à un besoin **validé en Phase 1**, et as-tu écrit ses critères d'acceptation **testables** ? »
- **Push-until :** format « En tant que / je veux / afin de » respecté, bénéfice rattaché Phase 1, **≥1** critère Given/When/Then couvrant le nominal + les cas limites de la fiche.
- **Red-flags :** bénéfice tautologique (« afin de pouvoir le faire ») ; story sans aucun critère ; critères non vérifiables.
- **MOU :** « En tant qu'utilisateur, je veux un bon produit, afin d'être satisfait. »
- **FORT :** « En tant que [persona], je veux exporter mon livrable au format Z, afin de le transmettre à mon client sans ressaisie. » + critères Given/When/Then.
- **Routage :** story sans critère → **non finie**, la compléter (`acceptance-criteria.md`) ; bénéfice orphelin → rattacher ou couper la feature.

## Q8 — Le build order suit-il les dépendances, pas les envies ? (étape 6)
- **Ask exact :** « Cette feature dépend-elle d'une autre qui n'existe pas encore dans l'ordre — y a-t-il un **cycle** ? »
- **Push-until :** l'ordre respecte le DAG (aucune feature avant sa dépendance) ; aucun cycle ; à dépendances égales, RICE départage.
- **Red-flags :** « on commence par la feature la plus fun » ; une feature placée avant son socle ; deux features qui se dépendent mutuellement.
- **MOU :** build order = ordre de la liste (§2), sans regarder les dépendances.
- **FORT :** « 1. Auth (socle, dont tout dépend) → 2. Saisie → 3. Génération (dépend de saisie) → 4. Export (dépend de génération). »
- **Routage :** cycle détecté → casser la dépendance (extraire un socle commun) ; ordre incohérent → refaire le tri topologique (`dependencies-build-order.md`).

## Q9 — Chaque action de valeur ferme-t-elle sa boucle ? (étape 4)
- **Ask exact :** « Pour cette action qui crée/modifie/annule l'entité métier, ai-je répondu aux **5 questions** de `_shared/boucles-fermees.md` — l'acteur a une trace durable, la contrepartie est informée, l'action est réversible, un rappel/une trace existent ? »
- **Push-until :** les 5 questions **répondues** pour chaque action de valeur ; chaque « oui » devient une exigence de la feature (et un critère G/W/T) ; chaque « pas de boucle » est **justifié par action**, jamais par type de produit.
- **Red-flags :** « l'écran de confirmation suffit » alors qu'une contrepartie existe ; aucune notification à l'autre partie ; « on ajoutera l'email plus tard » ; boucle sautée « parce que c'est un outil interne ».
- **MOU :** « La résa est confirmée à l'écran. » (l'écran se ferme, la cliente n'a rien, le gérant ne sait rien)
- **FORT :** « Résa créée → email client (récap + .ics + lien annuler) **et** notification gérant → rappel J-1 → historique des deux côtés. »
- **Routage :** boucle manquante → l'**ajouter** comme exigence de la feature (§7 de la fiche) ; si elle réclame une brique absente (email de confirmation, lien d'annulation) → la **remonter** en feature/exigence du PRD. Dès qu'une **contrepartie** existe, les questions 1-2 ne sont **jamais** sautables.

## Q10 — Tous les états sont-ils spécifiés, ou seulement le succès ? (étape 5)
- **Ask exact :** « Pour chaque écran de cette feature, qu'affiche-t-on **vide**, **en chargement**, en **erreur** et sur les **cas limites** pertinents — pas seulement le happy path ? »
- **Push-until :** au moins l'état **vide** et l'état **erreur** nommés (plus les edge pertinents du catalogue `acceptance-criteria.md` C) ; chaque état devient un critère d'acceptation.
- **Red-flags :** fiche qui ne décrit que le succès ; « le tableau affiche les données » sans dire ce qu'il montre à vide ; erreurs non gérées (« ça ne devrait pas arriver »).
- **MOU :** « L'utilisateur voit sa liste de rendez-vous. »
- **FORT :** « Vide → "Aucun RDV — partagez votre lien" + bouton copier ; chargement → skeleton ; erreur de chargement → message + retry ; >200 RDV → pagination 50/page. »
- **Routage :** états manquants → balayer le catalogue de cas limites (`acceptance-criteria.md` C) et nommer les états retenus (`feature-spec-depth.md` §5).

## Q11 — Le volet technique reste-t-il le QUOI logique, sans déborder en 09 ? (étape 5)
- **Ask exact :** « Ai-je nommé les **entités** touchées, les **actions logiques**, les **validations** et les **invariants** — sans décrire le schéma SQL, la stack ou l'archi ? »
- **Push-until :** entités + actions + validations + invariants présents (le **contrat logique** que 09 consomme) ; **zéro** choix de schéma concret, stack, index, migration.
- **Red-flags :** « table `reservations` avec colonnes… » ; « endpoint POST /api/... » avec route exacte ; choix de librairie/ORM ; « on met un index sur… ». Ces éléments = **débordement 09**.
- **MOU :** (champ vide) ou « on stockera ça en base ».
- **FORT :** « Entités : `Réservation` (créée), `Prestation` (lue), `Client` (créé/retrouvé). Action logique : *créer une réservation*. Validation : créneau requis + libre. Invariant : deux réservations ne se chevauchent jamais sur la même ressource. »
- **Routage :** débordement → **remonter** au QUOI logique (entités/actions/validations/invariants) et laisser le COMMENT à 09 ; champ vide → forcer au moins les entités touchées + un invariant si la feature écrit des données (`feature-spec-depth.md` §9).

---

## R1 — Les seuls cas où l'on interroge VRAIMENT l'utilisateur (hors Porte finale)
Par défaut : **zéro question**. On branche la Phase 1 et on esquisse le reste. On **ouvre une question à l'utilisateur uniquement** dans ces cas de routage :

| Cas | Condition déclenchante | Question minimale à poser |
|---|---|---|
| **Artefact Phase 1 manquant** | Un des 4 artefacts d'entrée est **absent ou vide** sur un point clé (workflow cœur, cible) | Poser **la seule** question qui débloque, en citant l'artefact manquant — puis reprendre en autonomie |
| **Contradiction inter-artefacts** | `opportunity-brief` et `positioning` se contredisent sur la cible ou l'edge | Exposer les deux versions, demander de trancher (choix binaire), documenter |
| **Ambiguïté de scope structurante** | Le produit peut raisonnablement viser un **solo** ou une **équipe**, ce qui change le workflow cœur et les features | Poser **une** question de cadrage (« usage solo ou collaboratif en v1 ? ») car la liste de features en dépend |
| **Arbitrage MVP frontière** | Deux découpages MVP défendables et **non tranchables** par les artefacts (ex. inclure ou non l'export dans le Must) | Présenter les deux périmètres + leur implication build, demander de choisir |

**Règle d'or du routage :** une question ouverte est un **coût** (friction, `lessons.md` : interaction minimale). Ne l'ouvre que si **aucune** relecture d'artefact ne peut y répondre. Sinon : branche, esquisse, marque `[Assumption]`, avance. La **Porte** finale (validation Must/MVP/non-goals via `AskUserQuestion`) reste, elle, obligatoire.
