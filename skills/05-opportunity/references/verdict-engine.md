# Référence — Le moteur de verdict (procédure de l'étape 4)

Le verdict est le produit de l'étape 5. Il croise **4 axes** — marché × edge × demande × risques — et sort **honnête ET humble**. Pré-vol obligatoire : `vendor/startup-skill/startup-competitors/references/honesty-protocol.md` prime (« if your idea should die, it will tell you »).

## Les 4 axes (comment coter chacun, sobrement)

Pas de score chiffré agrégé (un « 7,4/10 » est une fausse précision). On cote chaque axe **Fort / Moyen / Faible**, avec la preuve derrière.

| Axe | Fort | Moyen | Faible |
|---|---|---|---|
| **Marché** | Taille servable réelle + dynamique ↗ | Correct mais stagnant | Petit ou en déclin |
| **Edge** | Angle net défendable | Pas d'edge mais niche claire (pari exéc.) | Ni edge ni niche → bataille de prix |
| **Demande** (proxy) | Signal proxy dense et récurrent | Signal présent mais banalisé | Signal ténu / inféré de rien |
| **Risques** | Pas de tueur identifié | Tueurs gérables | Un tueur non contournable |

## Matrice de décision — combinaison des axes → orientation de verdict

Lecture par **le maillon faible d'abord** : un seul axe « Faible » sur Demande ou Risques peut suffire à basculer en No-Go, même si le reste est Fort.

| Marché | Edge | Demande | Risques | Orientation | Lecture type |
|---|---|---|---|---|---|
| Fort | Fort | Fort | Fort | **Go** franc | Rare — les 4 convergent |
| Fort | Moyen | Fort | Moyen | **Go** prudent | Pari exécution sur niche, demande là |
| Fort | Faible | Fort | Moyen | **Ajuster** (edge) | Reboucler 04 : trouver l'angle ou assumer le pari prix |
| Moyen | Moyen | Moyen | Fort | **Ajuster** | Rien de bloquant, rien de saillant → resserrer la cible (01) |
| Faible | * | * | * | **No-Go** (ou pivot) | Marché trop petit/déclin — le produit ne sauvera pas |
| * | * | **Faible** | * | **No-Go** tendanciel | Sans signal de demande, on construit à l'aveugle |
| * | * | * | **Faible** (tueur) | **No-Go** | Un tueur non contournable prime sur tout |

`*` = quelle que soit la valeur. Cette matrice **oriente** ; elle ne remplace pas le raisonnement du résumé. Toute case limite se tranche par le POURQUOI, pas par la table.

## Garde-fou 1 — anti-flagornerie

Prends **position**. Bannis « intéressant », « ça peut marcher », « prometteur », « à creuser ». Si l'idée doit mourir, dis-le — **et** dis ce qui changerait ton avis.

- **MOU** : « C'est un espace intéressant avec du potentiel, ça vaut le coup de continuer. »
- **FORT** : « Je penche No-Go : marché stagnant + 5 concurrents corrects + aucun edge = bataille de prix perdue d'avance. **Ce qui me ferait basculer :** un segment que personne ne sert (ex. un métier de niche) où l'exécution seule suffirait. »

**Clause obligatoire « ce qui le ferait basculer ».** Tout verdict, Go comme No-Go, nomme la condition qui l'inverserait. Un verdict sans point de bascule est une opinion fermée, pas une analyse.

## Garde-fou 2 — humilité (signal par proxy)

L'IA ne fait **pas** d'interviews terrain (cf. `conventions.md`, principe n°3). La demande est **inférée** des avis concurrents. Donc :

- Toujours « demande **plausible** », jamais « demande **prouvée** ».
- Toujours assortir d'un « **à valider par toi** ».
- Le verdict ne peut pas être plus confiant que `confidence.md` (plafond hérité, cf. `synthesis-and-confrontation.md`).

| Formulation à refuser | Formulation à écrire |
|---|---|
| « Les gens veulent ça. » | « [Assumption] Demande plausible : ~200 avis réclament X sur 3 concurrents. » |
| « Le marché est prêt. » | « Signal proxy présent, à valider par un test terrain de ton côté. » |
| « Ça va marcher. » | « Go prudent — pari exécution ; le risque résiduel est Y. » |

## Definition of Done — verdict
- [ ] Les 4 axes cotés Fort/Moyen/Faible, chacun avec sa preuve.
- [ ] Lecture « maillon faible d'abord » faite (Demande/Risques peuvent primer).
- [ ] Position nette prise — aucun mot-valise.
- [ ] Clause « ce qui le ferait basculer » présente.
- [ ] Demande formulée « plausible / à valider par toi ».
- [ ] Confiance du verdict ≤ confiance de `confidence.md`.

## Modes d'échec du verdict
- **La flagornerie.** Le verdict rassure au lieu de trancher. *Parade :* honesty-protocol + bannir la liste de mots-valises.
- **La fausse précision.** Un score agrégé « 7,4/10 ». *Parade :* Fort/Moyen/Faible + raisonnement, pas de note.
- **La certitude sur du proxy.** « Demande prouvée ». *Parade :* garde-fou humilité, plafond de confiance.
- **Le verdict fermé.** Aucune condition de bascule. *Parade :* clause obligatoire.
- **Le tueur noyé.** Un risque fatal dilué parmi dix mineurs. *Parade :* lecture maillon faible + risques ordonnés.
