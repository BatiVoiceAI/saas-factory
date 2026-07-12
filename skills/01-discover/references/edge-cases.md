# Référence — Cas limites & modes d'échec

Catalogue des situations qui font dérailler la Découverte, et la conduite à tenir. Chaque cas : *symptôme → risque → action*. Le fil rouge : **cadrer, pas résoudre** ; **spécificité** ; **ne rien inventer**.

## Modes d'échec de l'entretien

### E1 — L'utilisateur arrive avec la solution (« je veux une app qui fait X »)
- **Symptôme** : il décrit une feature/techno, pas une douleur.
- **Risque** : on valide une réponse au lieu de valider un problème (le HARD GATE existe pour ça).
- **Action** : « Mets l'outil de côté 30 secondes — c'est quoi la **galère** que ça soulage, pour qui, à quel moment ? » Reformule vers le problème. Ne note la solution que comme *piste*, jamais comme cadrage.

### E2 — Problème irréductiblement abstrait
- **Symptôme** : après 2 relances, toujours « gagner du temps / être plus pro ».
- **Risque** : brief creux → recherche floue en étape 2.
- **Action** : propose **2-3 moments concrets candidats** (« c'est plutôt : la ressaisie du soir ? les relances impayés ? les devis ratés ? ») et fais-le choisir/corriger. Si vraiment rien → écris « problème à préciser » et signale-le à la porte comme risque.

### E3 — Cible = « tout le monde »
- **Symptôme** : refuse de restreindre.
- **Risque** : cible incherchable → étape 2 ne peut rien miner.
- **Action** : « Le **premier** à qui tu le vendrais demain, c'est qui exactement ? » Prends **ce** persona comme cible v1, note les autres en segments adjacents. Ne close pas sur une catégorie.

### E4 — Idées multiples en une
- **Symptôme** : l'utilisateur empile 2-3 produits.
- **Risque** : brief schizophrène, aval ingérable.
- **Action** : « On en cadre **une** à fond — laquelle a le problème le plus douloureux et la cible la plus atteignable ? » Les autres → note « pistes parkées », un seul brief.

### E5 — Zéro concurrent revendiqué
- **Symptôme** : « il n'existe rien de tel ».
- **Risque** : soit vrai (rare), soit angle mort (fréquent).
- **Action** : creuse l'alternative de contournement (« ils bricolent comment quand même ? »). Note ce qui sort comme « alternatives indirectes » pour l'étape 2. Le vrai zéro-concurrent est un signal à vérifier, pas à célébrer.

### E6 — L'utilisateur veut coder / choisir la stack tout de suite
- **Symptôme** : « on part sur Next + Supabase ? », « montre-moi un proto ».
- **Risque** : viole le HARD GATE (aucune techno, aucun code avant le brief).
- **Action** : « Tout ça arrive — mais tant que le brief n'est pas posé, choisir la techno c'est bâtir sur du flou. On finit le cadrage, puis ça va vite. » L'archétype se **pressent** (decision-matrices §3), il ne se **débat** pas ici.

### E7 — Type flou / mouvant (public↔interne↔perso)
- **Symptôme** : « public mais d'abord pour moi », « interne mais on vendra ».
- **Risque** : mauvais routage → étapes inutiles ou manquantes.
- **Action** : tranche sur l'**intention v1** (voir decision-matrices §1), note l'ambition ailleurs. En doute franc : demande, ne devine pas.

### E8 — Sur-partage : secrets / clés dans la conversation
- **Symptôme** : l'utilisateur colle une clé API, un mot de passe, des données sensibles.
- **Risque** : fuite si écrit au brief/état.
- **Action** : **ne jamais** recopier un secret dans `idea-brief.md` ni `state.md` (safety-rails §4). Signale-le, dis que les accès vivront côté env plus tard, poursuis le cadrage.

### E9 — Contrainte potentiellement fatale (données santé, budget nul, accès indispo)
- **Symptôme** : une contrainte qui pourrait tuer l'idée.
- **Risque** : investir l'étape 2 pour rien.
- **Action** : remonte-la **en gras** dans Contraintes, et pose la question de viabilité tôt (« si [accès X] est impossible, est-ce que ça reste faisable ? »). Repli honnête si ça bloque (safety-rails §6) — ne bluffe pas un « ça ira ».

### E10 — Utilisateur pressé / laconique (« fais au mieux »)
- **Symptôme** : répond en un mot, veut sauter l'entretien.
- **Risque** : brief inventé = tout l'aval pollué.
- **Action** : concentre le forcing sur les **deux** questions qui décident de tout (problème, cible) ; pour le reste, propose des valeurs par défaut à valider d'un mot. Ne remplis **jamais** problème/cible à sa place sans validation.

## Anti-patterns à s'auto-interdire (côté agent)
| Anti-pattern | Correctif |
|---|---|
| Empiler plusieurs questions d'un coup | une seule (`AskUserQuestion`) |
| Poser une question déjà répondue en S0 | sauter + le dire |
| Reformuler en injectant une solution/techno | reformuler la **douleur**, neutre |
| Accepter une réponse-catégorie | re-questionner jusqu'au persona |
| Inventer un champ vide pour « faire propre » | écrire « à préciser » |
| Flatter (« super idée ! ») | position honnête + ce qui changerait l'avis |
| Écrire un secret dans le brief/état | jamais (env only) |
| Lancer le teardown concurrentiel ici | c'est l'étape 2 (`02-market`) |

## Definition-of-Done → `definition-of-done.md`
Principe de sortie : chaque champ tient son critère **ou** est marqué « à préciser » (jamais inventé), **zéro secret**, et la porte est confirmée. Les deux champs critiques — **problème** et **cible** — non résolus rendent le brief fragile. La checklist complète (champ par champ, red-flags, auto-vérif) vit dans `definition-of-done.md`.
