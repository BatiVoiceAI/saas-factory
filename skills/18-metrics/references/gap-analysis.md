# Référence — Écart à l'attendu (étape 3)

On a les chiffres (étapes 1-2). Ici on les **confronte à l'intention** — le PRD (le workflow cœur attendu) et le pricing (l'hypothèse de conversion de l'étape 6) — et on **nomme les tensions honnêtement**. C'est le cœur du jugement PM/CEO : la donnée ne parle que confrontée à ce qu'on **espérait**.

## Principe — la donnée seule ne dit rien
« 25 % d'activation » n'est ni bon ni mauvais dans l'absolu. Il devient un signal quand on le pose **à côté de ce que le PRD promettait** et **de ce que le pricing supposait**. L'écart, c'est l'information.

## Matrice de confrontation — mesuré × attendu → diagnostic

| Ce qu'on mesure | Ce que l'attendu disait | Écart → diagnostic | Nature |
|---|---|---|---|
| Activation faible | Workflow cœur « évident » (PRD) | Le moment magique n'est **pas atteint** → onboarding/friction, ou promesse pas tenue | **écart PRD** |
| Activation OK mais **rétention → 0** | On pensait l'outil « récurrent » | Valeur livrée **une fois** mais pas de raison de revenir → pas de fit ou usage ponctuel | **écart PRD** (fond) |
| Les gens utilisent une **feature secondaire**, pas le workflow cœur | PRD centré sur le workflow cœur | Le vrai job-to-be-done est **ailleurs** → candidat pivot de valeur | **écart PRD** |
| Conversion free→payant sous l'hypothèse | Pricing tablait sur X % (étape 6) | Prix/packaging/valeur perçue décalés → paywall mal placé | **écart pricing** |
| Bonne activation, **personne ne paie** | On pensait la valeur « payante » | Valeur réelle mais pas assez pour sortir la CB, ou friction paiement | **écart pricing** |
| Erreur sur l'écran d'activation (Sentry) | On pensait le parcours sain | Chute de funnel = **cause technique**, pas désintérêt | **écart santé** |
| Acquisition forte, activation faible | Canal supposé qualifié | Mauvais trafic (intention ≠ produit) → problème d'audience/message | **écart acquisition** |

**Lecture par le maillon faible d'abord** : identifie **le plus gros levier** (la marche qui fuit le plus × son poids sur la valeur), pas la somme des petits écarts. Un seul écart PRD sur l'activation prime sur trois micro-écarts en aval.

## Séparer la cause : désintérêt vs friction vs bug
Une même chute de funnel a trois causes possibles — le diagnostic change la piste :

```
        Chute à la marche X
                │
    ┌───────────┼───────────────┐
    ▼           ▼               ▼
 BUG          FRICTION        DÉSINTÉRÊT
(Sentry       (parcours       (le job ne
 montre       lourd, étape    vaut pas
 erreur)      de trop)        l'effort)
    │           │               │
    ▼           ▼               ▼
 fix tech    simplifier      écart PRD de fond
 (→ 17)      le flow         → question de fit
                              (nourrit l'étape 19)
```

Ne conclus jamais « désintérêt » sans avoir éliminé **bug** (Sentry) puis **friction** (nombre d'étapes) — c'est l'erreur de lecture la plus coûteuse.

## Recette forcing — nommer la tension (anti-lissage)
Le réflexe à combattre : moyenner un bon et un mauvais signal en un tiède rassurant (« globalement encourageant »). On **sépare** et on **nomme**.

- **Ask exact** : « Le workflow cœur du PRD est-il réellement le plus utilisé ? La conversion tient-elle l'hypothèse de l'étape 6 — oui ou non, avec le chiffre ? »
- **Push-until** : chaque écart est **chiffré** et **étiqueté** (écart PRD / pricing / santé / acquisition), et le **plus gros levier** est désigné nommément.
- **Red-flags (formulations à refuser)** :
  - « Les métriques sont globalement positives. » (moyenne qui cache la fuite)
  - « L'activation pourrait être meilleure. » (ni chiffre, ni cause)
  - « Les utilisateurs semblent apprécier. » (projection sans event)
  - lisser un churn élevé avec une acquisition en hausse.
- **MOU vs FORT** :
  - **MOU** : « Bonne traction globale, quelques points à améliorer côté conversion. »
  - **FORT** : « **[Data]** Activation 31 % (correct), mais **rétention D30 à 4 %** (faible) et **0 conversion sur 22 activés**. Tension nette : la valeur est livrée une fois mais **ne donne pas de raison de revenir ni de payer** — c'est un écart PRD de fond, pas un souci de paywall. »

## Routage par cas — quel écart pointe vers quoi
| Écart dominant | Ce que ça informe | Où ça va |
|---|---|---|
| **Santé** (bug sur le chemin) | fix technique | piste « corriger X » (étape 4) + signal à l'étape 17 |
| **Acquisition** (mauvais trafic) | message/audience | piste ciblage/positionnement (peut renvoyer Phase 5) |
| **Pricing** | paywall/packaging | piste d'expérimentation prix (étape 4) |
| **PRD friction** | onboarding/flow | piste de simplification (étape 4) |
| **PRD fond** (pas de fit) | **question de continuité** | ne se « répare » pas par une piste → **nourrit la porte kill/continue de l'étape 19** |

Un écart PRD **de fond** (le produit ne tient pas sa promesse de valeur récurrente) ne se corrige pas par un petit test : c'est le signal le plus important à transmettre à l'étape 19. Ne le déguise pas en « piste d'itération » optimiste.

## Definition of Done — écart
- [ ] Chaque marche qui fuit est confrontée à l'attendu (PRD ou pricing), pas lue seule.
- [ ] Le **plus gros levier** est désigné nommément (pas une liste plate).
- [ ] La cause de la chute principale est triée : bug / friction / désintérêt.
- [ ] Les tensions sont **nommées** (séparées), aucun lissage « globalement positif ».
- [ ] Un éventuel écart PRD **de fond** est signalé comme tel pour l'étape 19.
