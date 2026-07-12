# Référence — Le moteur d'itération (étape 4)

On sait où ça fuit (étape 3). Ici on produit **1 à 3 pistes priorisées** — **pas un backlog**. Chaque piste = **une** métrique visée + **un** changement testable. La discipline (peu de pistes, chacune falsifiable) est le produit ; une longue liste d'idées est un échec, pas une richesse.

## Anatomie d'une piste (le gabarit non négociable)
Une piste valide tient en une ligne et contient **quatre** éléments :

```
[Levier]  →  [Métrique cible]  →  [Changement testable]  →  [Impact × Effort]
```

- **Levier** : la fuite qu'on attaque (une seule).
- **Métrique cible** : le chiffre **précis** qui doit bouger (ex. « taux d'activation »), pas « l'engagement ».
- **Changement testable** : une action **falsifiable** — on saura dire si ça a marché (« si l'activation passe de 25→35 % en 2 semaines »).
- **Impact × Effort** : la cotation qui justifie la priorité.

Micro-exemple (niche-agnostique) :
> **Piste 1** — La marche « connecter une source » fait chuter 60 % des inscrits → **métrique : taux d'activation** → **test : pré-remplir avec une source de démo pour que le moment magique soit atteint sans setup** → **Impact fort × Effort faible** → à faire en premier.

## Matrice impact × effort (l'ordre de priorité)
```
        EFFORT →
        faible          élevé
  ┌───────────────┬───────────────┐
I │   QUICK WIN   │   GROS PARI   │  fort
M │  (piste n°1)  │ (1 seule, si  │
P │  fais-le      │  vraiment le  │
A │  d'abord      │  levier reine)│
C ├───────────────┼───────────────┤
T │  BOUCHE-TROU  │    PIÈGE      │  faible
  │ (souvent à    │ (à refuser :  │
↓ │  couper)      │ effort haut / │
  │               │ impact bas)   │
  └───────────────┴───────────────┘
```

**Règle de sélection** : ordonne par **impact d'abord**, effort ensuite. Prends les quick wins ; n'inclus un « gros pari » que s'il attaque le **plus gros levier** identifié en étape 3. Coupe tout le quadrant bas.

## Routage fuite → levier (condition → type de piste)
| Fuite dominante (étape 3) | Type de piste (le changement testable) | Métrique cible |
|---|---|---|
| Bug sur le chemin d'activation | corriger l'erreur Sentry (+ signal étape 17) | taux d'activation |
| Onboarding trop lourd | retirer une étape / pré-remplir / démo | taux d'activation, délai signup→magique |
| Moment magique flou | rendre le résultat visible plus tôt | taux d'activation |
| Rétention plate mais > 0 | renforcer la boucle de retour (rappel, valeur récurrente) | rétention D7/D30 |
| Rétention → 0 (pas de fit) | **PAS une piste d'optimisation** → signal fond pour l'étape 19 | (question de continuité) |
| Conversion sous l'hypothèse | déplacer le paywall / clarifier la valeur payante | conversion free→payant |
| Mauvais trafic (acquisition) | resserrer message/canal (peut renvoyer Phase 5) | activation des nouveaux du canal |

## Recette forcing — valider une piste
Avant d'écrire une piste, passe-la au filtre :

- **Ask exact** : « Quelle **unique** métrique cette piste fait-elle bouger, et comment saurai-je dans 2 semaines qu'elle a marché ? »
- **Push-until** : la métrique cible est **nommée** et le critère de succès est **chiffré et daté** (falsifiable).
- **Red-flags — pistes à REFUSER** :
  - « Améliorer l'UX » / « rendre plus engageant » (pas de métrique, pas de test).
  - une piste qui vise **plusieurs** métriques à la fois (impossible à lire).
  - un **backlog déguisé** (« et aussi : refonte, blog, intégrations, mobile… »).
  - une piste sur un **ratio issu du bruit** (n sous le seuil, cf. `reading-procedure.md`).
  - « refaire le design » comme réponse à un problème de **fond** (pas de fit).
  - une grosse refonte (Effort élevé, Impact non prouvé) posée avant les quick wins.
- **MOU vs FORT** :
  - **MOU** : « Piste : améliorer l'onboarding pour booster l'engagement. »
  - **FORT** : « **Piste 1** — 60 % lâchent à l'étape "connecter une source" → **métrique : activation** → **test : source de démo pré-remplie**, succès = activation 25→35 % sous 14 j → **Impact fort × Effort faible**. »

## Combien de pistes ? (la discipline du peu)
| Situation | Nb de pistes |
|---|---|
| Un levier écrase les autres | **1** (concentre) |
| Deux fuites distinctes, indépendantes | 2 |
| Trois max, jamais plus | 3 |
| « J'en ai 6 » | tu n'as pas priorisé — coupe au plus gros levier |
| Données sous le bruit | **0 piste** → recommander d'attendre / pousser l'acquisition |

**Pourquoi ce plafond** : 1-3 pistes forcent le choix et rendent l'itération mesurable. Un backlog de 15 idées disperse l'effort et rend impossible d'attribuer un mouvement de métrique à une cause (`_shared/lessons.md` : biais pour l'action, décider aux portes).

## Definition of Done — pistes
- [ ] 1 à 3 pistes (ou 0 assumé si données insuffisantes), jamais un backlog.
- [ ] Chaque piste : **une** métrique cible nommée + **un** changement testable falsifiable.
- [ ] Critère de succès **chiffré et daté** pour chacune.
- [ ] Priorité justifiée par impact × effort (la n°1 attaque le plus gros levier).
- [ ] Aucune piste « molle » (UX/engagement sans métrique) ni ratio-du-bruit.
- [ ] Un écart PRD de fond est marqué « question de continuité » (étape 19), pas maquillé en piste.

## Modes d'échec de l'itération
- **Le backlog.** Dix idées listées, aucune priorisée. *Parade :* plafond 1-3 + matrice impact×effort.
- **La piste molle.** « Améliorer l'engagement » sans métrique. *Parade :* gabarit à 4 éléments + critère falsifiable.
- **L'optimisation d'un produit sans fit.** Peaufiner l'onboarding d'un produit que personne ne retient. *Parade :* routage « rétention→0 = signal fond, pas piste ».
- **La grosse refonte prématurée.** Réécrire avant d'avoir testé un quick win. *Parade :* impact×effort, quick wins d'abord.
- **La piste sur du bruit.** Optimiser un taux calculé sur n=4. *Parade :* GATE de suffisance en amont.
