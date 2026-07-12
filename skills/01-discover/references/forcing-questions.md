# Référence — Recettes de forcing-questions

Le cœur du déterminisme de la Découverte : la qualité du brief = la qualité de l'entretien. Chaque question a une **recette** : *Ask* (formulation exacte) · *Push-until* (le critère qui autorise à passer) · *Red-flags* (réponses à **refuser**, avec la relance) · *MOU vs FORT* (un exemplaire de réponse faible et sa version forte, niche-agnostique) · *Routage par cas* (quoi faire selon la réponse).

Ordre imposé : **Type → Problème → Cible → Alternative → Écosystème → Signal → Contraintes → Non-goals**. Chaque question est **pédagogique** (dis quoi/pourquoi, puis les options) et **posée seule** (`AskUserQuestion`). Saute ce qui est déjà couvert en S0 — et dis-le.

---

## §1 — Type / destination (l'aiguilleur, en premier)
- **Ask** : « Avant tout : à qui c'est destiné ? Ce choix décide des étapes qu'on fera ou qu'on sautera. » Options `AskUserQuestion` :
  - **Public** — vendu à des externes, n'importe qui s'inscrit → *on fait marché, SEO, billing.*
  - **Interne entreprise** — pour une boîte précise et ses employés → *pas de marché public ; on vérifie le fit outils/sécurité.*
  - **Perso** — pour ton usage → *droit au build : pas de marché, pas de billing.*
- **Push-until** : un des trois est tranché **et** tu as **annoncé l'impact** du choix à voix haute.
- **Red-flags** :
  - *« Public mais d'abord juste pour moi »* → tranche sur l'**intention v1** (perso maintenant, on note l'ambition public pour plus tard) ; ne route pas sur un futur hypothétique.
  - *« Interne, mais on le vendra peut-être »* → route **interne** pour la v1 ; note l'option produit dans les non-goals/ambition.
- **MOU** : « c'est pour des entreprises » → **FORT** : « interne : une agence précise de 12 personnes, pour ses chefs de projet ».
- **Routage par cas** : voir `decision-matrices.md §1`. Écris `type` **et** `route` dans le brief.

---

## §2 — Problème & douleur
- **Ask** : « Décris le **moment précis** où ça fait mal aujourd'hui — la douleur, pas la solution. »
- **Push-until** : un **QUI** + un **QUAND** + une **CONSÉQUENCE** (idéalement chiffrée). Les trois, sinon on ne close pas.
- **Red-flags** (à refuser + relance) :
  - « gagner du temps », « être plus efficace », « simplifier » → *l'abstrait*. Relance : « Time quel moment exact ? Qui, à quelle heure, fait quoi de pénible ? »
  - Le problème décrit **la solution** (« il leur manque une app ») → « Oublie l'outil une seconde : c'est quoi la galère *avant* toute solution ? »
  - Un problème **à toi** projeté sur d'autres sans preuve → note-le comme hypothèse, creuse le *qui* réel.
- **MOU** : « les gens perdent du temps sur leur compta. »
- **FORT** : « le freelance, le dimanche soir, ressaisit à la main ses factures dans un tableur ; il y passe ~2h et se trompe 1 fois sur 5, ce qui décale un paiement. »
- **Routage par cas** : problème solide → S4. Problème encore flou après 2 relances → voir `edge-cases.md` (utilisateur qui n'arrive pas à spécifier : on propose 2-3 moments candidats et on lui fait choisir/corriger).

---

## §3 — Cible
- **Ask** : « On cherche **une personne précise**, pas une catégorie. À qui tu penses exactement ? »
- **Push-until** : un **métier/segment précis + un volume** (« le plombier solo qui fait ~5 devis/semaine »). La cible doit être *cherchable* : si l'étape 2 ne peut pas la Googler, elle est trop vague.
- **Red-flags** : « les PME », « les artisans », « les indépendants », « tout le monde qui… » → catégorie. Relance : « Si tu devais aller en voir **un seul** demain, ce serait qui ? Quel métier, quelle taille, combien de fois par semaine il vit le problème ? »
- **MOU** : « les petites entreprises du bâtiment. »
- **FORT** : « l'artisan électricien seul ou à 2, qui fait 5-10 devis/semaine et n'a pas de secrétaire. »
- **Routage par cas** :
  - Plusieurs cibles possibles → fais **choisir la plus douloureuse / la plus atteignable** comme cible v1 ; note les autres en « segments adjacents ».
  - Cible = « moi » (type perso) → OK, persona = l'utilisateur lui-même ; on saute le forcing marché.

---

## §4 — Alternative actuelle
- **Ask** : « Comment ils font **aujourd'hui**, sans ton outil — Excel, papier, un concurrent, rien ? »
- **Push-until** : au moins une alternative concrète nommée. « Rien / à la main » est une réponse **valide et forte** (signal de douleur brute).
- **Red-flags** : « il n'y a rien qui existe » balancé vite → **creuse** (« et pour s'en sortir quand même, ils bricolent quoi ? »). Le zéro-concurrent absolu est rare et souvent faux.
- **MOU** : « ils utilisent d'autres logiciels. »
- **FORT** : « la moitié bricole sur Excel + photos WhatsApp ; deux ou trois payent [Concurrent X] à ~30 €/mois mais s'en plaignent. »
- **Routage par cas** : **extrait et note chaque outil/concurrent nommé** → champ « Alternative (dont concurrents nommés) » du brief → **input direct du review-mining de l'étape 2**. C'est la donnée la plus précieuse de cette question.

---

## §5 — Écosystème métier
- **Ask** : « Dans quel environnement ça s'insère ? Secteur, pays/langue, règles (RGPD, données sensibles), et surtout les **outils à connecter**. »
- **Push-until** : secteur · géo/langue · réglementaire · intégrations — chacun rempli ou explicitement « rien de particulier ».
- **Red-flags** : intégration mentionnée en survol (« ça se connectera à leurs trucs ») → nomme les outils précis (WhatsApp ? Gmail ? un ERP nommé ?), sinon la faisabilité reste opaque.
- **MOU** : « ça devra s'intégrer à leurs outils. »
- **FORT** : « secteur BTP, France, RGPD standard (pas de données santé) ; doit envoyer les devis par **WhatsApp** et se connecter à **Sage** pour la compta. »
- **Routage par cas** : réglementaire lourd (santé, finance, données sensibles) → **note-le en gras** dans Contraintes ; ça pèsera sur la Phase 3 (archi/sécurité).

---

## §6 — Signal préliminaire (léger ici)
- **Ask** : « As-tu déjà des **signes** que des gens en veulent — qui s'en plaignent, cherchent, paient déjà pour un truc proche ? »
- **Push-until** : un signal noté **ou** « aucun à ce stade » (les deux valides). On ne force pas — le creusé réel est l'étape 4.
- **Red-flags** : confondre **enthousiasme poli** avec demande (« mes potes trouvent ça cool »). Rappel : **interest ≠ demand**. Ne le compte pas comme signal fort ; note-le comme « à valider ».
- **MOU** : « les gens aiment bien l'idée. »
- **FORT** : « 3 artisans m'ont dit spontanément qu'ils galèrent là-dessus, et 1 paie déjà [X] qu'il déteste. »
- **Routage par cas** : signal comportemental (ils paient / cherchent / se plaignent) → note-le comme **fort**, il aidera l'étape 4/5. Signal déclaratif → note-le **faible**.

---

## §7 — Contraintes
- **Ask** : « Des contraintes à connaître dès maintenant ? Budget, données sensibles, technique, légal. »
- **Push-until** : contraintes listées ou « aucune connue ».
- **Red-flags** : contrainte molle non chiffrée (« pas trop cher ») → précise si tu peux (budget mensuel visé ?), sinon note « budget indicatif : faible ».
- **Routage par cas** : contrainte **bloquante** (données santé, dépendance à un accès qu'on n'aura pas, budget quasi nul) → remonte-la tôt et vérifie qu'elle ne tue pas l'idée avant d'investir l'étape 2.

---

## §8 — Non-goals (optionnel)
- **Ask** : « Qu'est-ce que ton produit **ne fera pas**, au moins en v1 ? »
- **Push-until** : au moins tenté. Si l'utilisateur sèche, **déduis** 1-2 non-goals plausibles et marque-les « déduit, à confirmer ».
- **Red-flags** : liste de vœux déguisée en non-goals (« ça ne fera pas [tout ce qu'il rêve d'ajouter] ») → recadre : un non-goal borne le **scope v1**, il n'énumère pas le rêve.
- **MOU** : « on verra plus tard pour le reste. »
- **FORT** : « v1 : pas de compta complète, pas d'appli mobile native, pas de multi-utilisateurs — juste le devis solo. »

---

## Garde-fou transverse (anti-flagornerie)
Ne dis jamais « intéressant » ou « ça peut marcher » pour meubler. Prends position, dis **ce qui changerait ton avis**. Protocole vendoré : `vendor/startup-skill/startup-competitors/references/honesty-protocol.md`. La **spécificité est la seule monnaie** — une réponse-catégorie se re-questionne, toujours.
