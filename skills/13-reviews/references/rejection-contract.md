# Référence — Contrat de rejet (le `FAIL` qui fait converger)

Le rejet est le **seul mécanisme** qui améliore quoi que ce soit dans la cascade. Un `FAIL` mal écrit fait tourner la boucle dans le vide (le dev ne sait pas quoi corriger) → budget cramé, feature `DONE_WITH_CONCERNS` pour rien. Ce fichier fixe **le format non négociable** du rejet. Règle maison : **jamais « refais »**.

> S'applique à **tout `FAIL`**, quel que soit le cran. Écrit dans `status/<feature>.md`, jamais dans la conversation (`_shared/validation-cascade.md`).

## Le format (4 champs obligatoires)
Chaque `FAIL` DOIT porter les quatre :
1. **QUOI** — le défaut, en une phrase factuelle (pas un jugement).
2. **OÙ** — `fichier:ligne` exact (l'ancrage anti-hallucination ; pas d'ancrage → pas de veto).
3. **POURQUOI** — l'**impact concret** (ce qui casse / le risque exploité / le critère PRD non tenu). Pas « c'est fragile ».
4. **QUOI FAIRE** — la **correction attendue**, assez précise pour que le dev agisse sans re-deviner. Pas la solution complète imposée, mais la direction et le critère de sortie.

## Forcing-question — « ce rejet est-il actionnable ? »
Avant d'écrire un `FAIL`, le cran se le passe à lui-même :
- **Ask exact** : *« Si je donne CE texte à un dev qui n'a pas assisté à la revue, sait-il exactement quoi changer, où, et comment vérifier que c'est réglé ? »*
- **Push-until** : les 4 champs sont remplis **et** le champ QUOI FAIRE contient un **critère de sortie vérifiable** (« l'export se fait en 1 action », « la requête est paramétrée », « l'état erreur affiche un message inline »).
- **Red-flags — rejets à refuser (à réécrire avant d'émettre)** :
  - « refais cette partie » (aucune information → interdit).
  - « ça ne va pas / c'est fragile / à revoir » (jugement sans ancrage ni impact).
  - « voir plus haut » / « comme d'habitude » (non autonome).
  - `FAIL` sans `fichier:ligne` (viole le gate anti-hallucination → pas un veto valide).
  - impact spéculatif (« pourrait poser problème un jour ») → ce n'est pas un `FAIL`, au plus `CONCERNS`.

## MOU vs FORT (le même défaut, deux rejets)
- **MOU** (inutile, fait tourner la boucle) :
  > *« La validation du formulaire ne va pas, à refaire. »*
- **FORT** (actionnable, fait converger) :
  > **QUOI** : le formulaire accepte un email vide et renvoie 500.
  > **OÙ** : `api/subscribe.ts:31`.
  > **POURQUOI** : entrée non validée → crash serveur + aucune feedback utilisateur (critère PRD A2 « erreur claire » non tenu).
  > **QUOI FAIRE** : valider `email` avant persistance ; champ vide → 400 + message inline. Critère de sortie : test « email vide → 400 » vert.

## Routage du rejet (où repart la feature)
```
FAIL émis (n'importe quel cran)
      │  (4 champs + fichier:ligne + critère de sortie)
      ▼
status/<feature>.md ← bloc rejet écrit
      ▼
RETOUR DEV (étape 12, feature-dev)
      ▼
dev lit le rejet → corrige → re-teste (recette) → DEV-DONE
      ▼
la feature RE-GRIMPE depuis le cran 1 (Tech Lead), toute la cascade
```
> **Toujours retour au dev**, jamais « je corrige au cran ». Ici on **valide**, on ne construit pas (HARD GATE). Et toujours **re-grimpe complète** : une correction peut casser un cran déjà passé.

## Ce qui n'est PAS un rejet
| Situation | Décision correcte | Pourquoi pas `FAIL` |
|---|---|---|
| Réserve non bloquante (dette mineure, edge secondaire) | `CONCERNS` (loguée pour client-review) | Ne renvoie pas au dev ; l'humain tranchera étape 15 |
| Contrainte assumée / décidée à une porte antérieure | `WAIVED` (tracée + justifiée) | Dérogation explicite, pas un défaut |
| Risque théorique sans exploit / impact | rien, ou `CONCERNS` conf. ≤ 4 | Gate anti-hallucination + exclusions dures |
| Préférence de style du reviewer sans impact | rien | Le cran juge sa lentille, pas ses goûts |

## Micro-exemples (niche-agnostiques, un par cran)
- **Tech Lead** — QUOI : deux handlers dupliqués divergent déjà. OÙ : `a.ts:40` / `b.ts:12`. POURQUOI : correction à faire en double → source de bug. QUOI FAIRE : extraire dans `_shared/blocks/`, un seul point de vérité. *(Note : duplication structurante → `FAIL` ; cosmétique → `CONCERNS`.)*
- **CTO** — QUOI : SQL concaténé depuis l'entrée. OÙ : `query.ts:22`. POURQUOI : injection démontrée (`;DROP TABLE`). QUOI FAIRE : requête paramétrée + allow-list de colonnes ; critère : test d'injection rejeté. Tag `[SÉCU]`.
- **Designer** — QUOI : aucun état erreur sur le submit. OÙ : `Form.tsx:1-60`. POURQUOI : en cas d'échec réseau, l'utilisateur ne voit rien (état perdu). QUOI FAIRE : ajouter l'état erreur (message inline + retry), comme les 3 autres surfaces.
- **CEO** — QUOI : l'export exige 4 étapes. OÙ : `flow.md` / parcours observé. POURQUOI : PRD A3 exige « 1 clic » ; workflow cœur non servi. QUOI FAIRE : ramener à une action unique ; critère : export en 1 clic.
