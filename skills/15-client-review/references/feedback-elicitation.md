# Référence — Recueillir le feedback en langage naturel (étape 3)

L'humain vient de tester (étape 2). Maintenant il **raconte son ressenti** — avec **ses mots**. On capte **fidèlement**, sans traduire ni juger : la traduction en tâches, c'est l'étape 4 (`client-liaison`). Ici, un seul objectif : **extraire la vérité du ressenti**, pas remplir un formulaire.

## Objectif de passage
On a du feedback **exploitable** : au moins un « ce qui a plu », un « ce qui a gêné », le « une chose à changer », et une réponse claire à « est-ce que ça résout ton problème ». Critère de sortie : les réponses sont **spécifiques** (pas « c'est bien »), et le verbatim est capté **mot pour mot** dans `client-feedback.md` (template `assets/templates/client-feedback.md`).

## Sous-procédure (dans l'ordre)
1. **Ouvrir sur le ressenti, pas le bug report.** « Raconte-moi ton impression » avant toute question fermée.
2. **Poser les 4 questions d'ancrage** (ci-dessous), une à la fois, sans enchaîner trop vite.
3. **Pousser jusqu'au spécifique** sur chaque réponse molle (recette forcing-question).
4. **Capter fidèlement.** Recopie **ses mots** dans le template — pas de reformulation, pas de « ce qu'il voulait dire ».
5. **Ne pas défendre le produit.** Si l'humain critique, on **note**, on ne justifie pas. Défendre = tuer le feedback suivant.
6. **Clore proprement.** « Autre chose, même minime ? » — les petites gênes non dites sortent souvent ici.

## Les 4 questions d'ancrage
Élicitation en **langage naturel**, pas un bug report :
- « Qu'est-ce qui t'a plu ? Qu'est-ce qui t'a gêné ? »
- « Si tu devais changer une chose, ce serait quoi ? »
- « Est-ce que ça résout bien ton problème de départ ? »

**Capte fidèlement** ses mots dans `client-feedback.md` (template `assets/templates/client-feedback.md`) — **sans traduire ni juger** à ce stade. La traduction, c'est l'étape 4 (`client-liaison`).

## Recette forcing-question (par question d'ancrage)

### A. « Est-ce que ça résout ton problème de départ ? »
- **Ask exact** : « En repensant au problème qui t'a fait vouloir cet outil — est-ce que, là, tu l'utiliserais pour de vrai à la place de ta solution actuelle ? »
- **Push-until** (critère : réponse binaire + raison) : si « oui c'est bien » → « Tu le préfères à ce que tu fais aujourd'hui, oui ou non ? Et qu'est-ce qui fait pencher ? »
- **Red-flags** (réponses à ne pas prendre pour argent comptant) :
  - « C'est prometteur » → **creuse** : prometteur ≠ utilisable aujourd'hui.
  - « Je suppose que oui » → **creuse** : l'a-t-il vraiment ressenti ou est-il poli ?
  - Silence / enthousiasme vague → **creuse** : demande un usage concret.
- **MOU vs FORT** :
  - 🔴 MOU : « Ouais c'est cool, bravo. »
  - 🟢 FORT : « Oui — je remplacerais mon tableur par ça dès demain, parce que la partie X me fait gagner l'étape la plus pénible. » / ou 🟢 FORT négatif : « Non — tant qu'il ne fait pas Y, je reste sur mon outil actuel. »

### B. « Ce qui t'a gêné »
- **Ask exact** : « À quel moment précis tu as tiqué, hésité, ou eu envie de fermer l'onglet ? »
- **Push-until** (critère : un moment localisé, pas un jugement global) : « ‘C'est un peu confus' — confus **où** ? À quel écran, à quelle étape ? »
- **Red-flags** : « rien de spécial », « c'est bien dans l'ensemble » (politesse qui masque des frictions) → reposer en pointant un écran précis.
- **MOU vs FORT** :
  - 🔴 MOU : « L'interface pourrait être mieux. »
  - 🟢 FORT : « À l'écran d'export, j'ai cliqué trois fois avant de trouver le bouton — je pensais qu'il serait en haut. »

### C. « La chose à changer (une seule) »
- **Ask exact** : « Si tu ne pouvais changer **qu'une** chose avant de le donner à quelqu'un, ce serait laquelle ? »
- **Push-until** (critère : forcer la priorité unique) : s'il en liste cinq → « Laquelle en premier, celle sans laquelle tu ne l'utiliserais pas ? »
- **Red-flags** : une liste de wishlist (souvent des expansions de scope) → noter, mais faire ressortir **la** priorité.
- **MOU vs FORT** :
  - 🔴 MOU : « Plus de fonctionnalités. »
  - 🟢 FORT : « Que je puisse annuler ma dernière action — j'ai eu peur de tout perdre. »

### D. « Ce qui t'a plu »
- **Ask exact** : « Qu'est-ce qui t'a fait dire ‘ah, ça c'est bien' ? »
- **Push-until** (critère : rattacher à un moment vécu) : « ‘C'est fluide' — à quel moment tu l'as senti ? »
- Sert à **protéger l'edge** : si ce qui plaît n'est **pas** l'edge du PRD, signal fort (la valeur perçue diverge de la valeur prévue) — à remonter tel quel à l'étape 4.

## Matrice — router une réponse ambiguë
| L'humain dit… | On fait… |
|---|---|
| Un jugement global (« c'est bien / bof ») | **Push-until** : localiser un écran, un moment, une action |
| Une émotion sans cause (« j'ai été frustré ») | **Push-until** : « à quel moment précis ? » |
| Une demande de feature | **Capter tel quel** (le tri bug/expansion, c'est l'étape 4, pas ici) |
| Une critique du produit | **Noter, ne pas défendre** ; enchaîner la question suivante |
| Un compliment poli / de politesse | **Ne pas s'en contenter** ; creuser l'usage réel |
| Un silence après une question | **Laisser respirer**, puis reformuler concrètement |

## Definition of Done (étape 3)
- [ ] Les 4 questions d'ancrage posées, réponses **spécifiques** obtenues (pas de molle non creusée).
- [ ] Verbatim capté **mot pour mot** dans `client-feedback.md` (aucune reformulation).
- [ ] Zéro traduction, zéro jugement, zéro tâche à ce stade.
- [ ] Question de clôture posée (« autre chose, même minime ? »).
- [ ] Signal « ce qui plaît vs edge du PRD » noté si divergence.

## Modes d'échec + parade
| Mode d'échec | Symptôme | Parade |
|---|---|---|
| **Bug-report déguisé** | On fait remplir des champs techniques | Revenir au ressenti : « raconte », pas « catégorise » |
| **Politesse prise pour validation** | « C'est bien » → on conclut ship | Push-until : usage réel, préférence vs solution actuelle |
| **On défend le produit** | On justifie chaque critique | Se taire, noter, enchaîner |
| **Traduction prématurée** | On note « bug X » au lieu des mots de l'humain | Recopier le verbatim ; classer plus tard (étape 4) |
| **Une seule question, réponse molle** | « Ça va » et on passe | Localiser : écran / moment / action précis |
| **Wishlist prise pour des bugs** | On promet 5 features | Capter tel quel, laisser l'étape 4 trancher bug vs expansion |

## Micro-exemple (niche-agnostique)
> — « Alors, ton impression ? »
> — « C'est pas mal. » *(🔴 MOU)*
> — « Qu'est-ce qui t'a fait dire ‘pas mal' plutôt que ‘nickel' ? »
> — « L'écran de départ, j'ai pas su où commencer. » *(🟢 localisé → on capte : « écran de départ, pas su où commencer »)*
> — « Et si tu devais changer **une** chose ? »
> — « Un truc qui me dit quoi faire en premier. » *(🟢 priorité unique → capté)*
> — « Tu l'utiliserais à la place de ta méthode actuelle ? »
> — « Une fois ce point réglé, oui. » *(🟢 FORT conditionnel → capté tel quel)*

## Principe
L'humain **raconte son ressenti** ; c'est **notre** job (pas le sien) de transformer ça en tâches (étape 4). Ici : zéro friction, zéro jargon, **fidélité absolue** à ses mots.
