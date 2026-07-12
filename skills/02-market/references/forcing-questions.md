# Recettes forcing-question — là où l'étape 2 interroge ou tranche

L'étape 2 est majoritairement **exécution + recherche** ; elle n'ouvre la bouche que sur **quatre points**. Pour chacun, une recette structurée : **Ask exact** (formulation à poser) · **Push-until** (critère de sortie) · **Red-flags** (réponses à refuser) · **exemplaire MOU-vs-FORT** · **routage par cas**. On ne « discute » pas au hasard : on force une réponse exploitable.

Persona : **CEO / founder partner** — anti-flagornerie. On cherche la vérité, pas à rassurer. « If your idea should die, it will tell you » (`vendor/.../honesty-protocol.md`).

---

## §Champ manquant (intake) — forcer la spécificité avant de chercher

Déclencheur : un champ nécessaire au cadrage manque ou est trop flou (cf. `intake-mapping.md` §Champ manquant).

- **Ask exact** : « Pour cadrer la recherche il me manque *{champ}* — {rappel d'une phrase : pourquoi ça change les résultats}. Précise : {2-3 options concrètes}. »
- **Push-until** : le champ permet une **requête ciblée**. Test : « puis-je taper une recherche précise avec ça ? » Oui → stop. Non → repousse.
- **Red-flags** (à refuser) :
  - réponse-catégorie : « tout le monde », « les PME », « les entreprises »
  - défausse : « je ne sais pas, à toi de chercher »
  - une **solution** au lieu du champ (« il leur faut une app mobile » quand tu demandes la cible)

| | MOU (à repousser) | FORT (on avance) |
|---|---|---|
| Cible | « les artisans » | « le plombier solo qui fait ~5 devis/semaine, en France » |
| Marché | « la productivité » | « la gestion de devis pour le bâtiment TPE » |
| Géo | « un peu partout » | « France d'abord, puis Belgique/Suisse FR » |

- **Routage** : bloquant (produit, problème/cible, catégorie-si-aucun-concurrent) → on ne lance rien tant que ce n'est pas FORT. Non bloquant (géo, prix, diff) → assume un défaut déclaré et avance.

---

## §Checkpoint — valider le set de concurrents (après les 3 vagues)

Déclencheur : vagues finies, avant synthèse. **Un seul message**, pas un rapport.

- **Ask exact** : « J'ai profilé *{N}* acteurs — directs : {liste}, adjacents : {liste}, + le statu quo ({Excel/rien}). Top plaintes récurrentes : {2-3}. **Un concurrent à ajouter ou retirer avant que je synthétise ?** »
- **Push-until** : réponse binaire claire — *rien à changer* OU *une liste d'ajouts/retraits*. Pas de « peut-être ».
- **Red-flags** :
  - l'utilisateur cite un acteur « connu de tous » que la recherche a **raté** → à ajouter, mini-passe W1/W2 dessus
  - l'utilisateur veut **retirer** un concurrent parce qu'il le juge « pas vraiment pareil » alors qu'il prend le même budget → challenge : c'est un **adjacent**, il reste dans la matrice
  - silence/évitement → reformule en fermé : « OK si je garde cette liste telle quelle ? »
- **Routage** :

| Réponse | Action |
|---|---|
| « rien à changer » | passe en synthèse |
| « ajoute X » | mini-passe W1 (profil+prix) + W2 (avis) sur X, puis synthèse |
| « retire Y » (justifié : autre cible/job) | retire, note l'exclusion en data gap |
| « retire Y » (injustifié : c'est un vrai adjacent) | garde, explique pourquoi en 1 ligne |

---

## §Ouverture — MOU vs FORT (le filtre anti-invention, cœur du persona)

Déclencheur : en synthèse, tu t'apprêtes à écrire une « ouverture observée » / faiblesse concurrent. C'est **le** moment où la flagornerie s'infiltre (transformer un espoir en « manque du marché »).

- **Ask (à toi-même, avant d'écrire)** : « Cette ouverture est-elle **observée** dans les données, **récurrente**, et **reliée** à une plainte + un prix — ou est-ce que je la *souhaite* ? »
- **Push-until** : tu peux citer (a) ≥1 verbatim/plainte réel, (b) présent chez ≥2 concurrents **ou** dans plusieurs avis, (c) un prix/segment associé. Les trois → FORT, on l'écrit. Il en manque un → MOU, → **data gap**, pas ouverture.
- **Red-flags** (à ne JAMAIS écrire comme ouverture) :
  - « il manque probablement… », « ils pourraient rater… » (déduction sans trace)
  - « ce serait une super opportunité si… » (souhait)
  - une faiblesse vue dans **un seul** avis isolé, présentée comme tendance
  - une force concurrent minimisée pour faire briller l'idée (anti-cheerleading : si un concurrent est meilleur, **dis-le**)

| | MOU (→ data gap / à ne pas écrire) | FORT (→ ouverture dans `market.md`) |
|---|---|---|
| Preuve | « je pense qu'il manque un export propre » | « 14 avis G2 sur A + 9 sur B se plaignent de l'export cassé » (verbatims joints) |
| Récurrence | vu chez 1 concurrent | partagé par A, B et le statu quo |
| Ancrage | aucun prix associé | tous facturent l'export en add-on premium → whitespace |
| Ton | « super opportunité ! » | « manque récurrent, à confirmer étape 4 » |

- **Routage** : FORT → `market.md` §Ouvertures observées, labellisé `[Data]`, avec « à confirmer étape 4, jamais inventé ». MOU → `confidence.md` §Data gaps (« signal faible / à vérifier »). **Aucune** ouverture ne quitte cette étape comme *prouvée* — au mieux *observée, plausible*.

---

## §Confiance basse sur une affirmation structurante (vérification)

Déclencheur : à la vérif, une affirmation qui porte la lecture du marché (ex. « marché dominé par un acteur ») ne repose que sur du Tier 3.

- **Ask exact** (à l'utilisateur, si critique) : « L'affirmation *{X}* structure la lecture du marché mais ne tient que sur des sources faibles (forum/avis). Je peux : la garder en la marquant *basse confiance*, ou creuser une source solide avant de conclure. Tu préfères quoi ? »
- **Push-until** : décision explicite — *garder-en-flag* ou *creuser*.
- **Red-flags** : présenter l'affirmation comme un fait malgré le tier faible ; « corroborer » avec la même source repostée.
- **Routage** :

| Cas | Action |
|---|---|
| affirmation critique + seulement Tier 3 | **pause**, demande à l'utilisateur (ci-dessus) |
| affirmation secondaire + Tier 3 | garde, marque « basse confiance », liste ce qui la confirmerait |
| contradiction Tier 1 vs Tier 3 | tranche Tier 1, note la divergence |
| aucune source | data gap déclaré, jamais de chiffre inventé |

---

## Règle transversale — pédagogie + une question à la fois

Quand tu interroges l'utilisateur (§Champ manquant, §Checkpoint, §Confiance) : **une question à la fois**, formulée pour qu'il comprenne *ce que tu demandes et pourquoi*. Empiler les questions produit des réponses bâclées. Ne close jamais un point sur une réponse MOU : reformule jusqu'au FORT ou assume un défaut déclaré.
