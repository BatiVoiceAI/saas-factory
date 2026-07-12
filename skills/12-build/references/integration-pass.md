# Référence — Merge & passe d'intégration

L'étape 5 de la procédure. Le parallélisme a un coût caché : les **bugs de jonction** (`_shared/lessons.md`, anti-pattern « parallélisme non maîtrisé »). Un build qui parallélise **sans** passe d'intégration ment sur son état final. Piloté par le Tech Lead.

## Flux merge → intégration
```
lanes DEV-DONE (status/*.md)         Chaque lane part de main (skeleton),
   A ─┐                              zones disjointes.
   B ─┤   merge SÉQUENTIEL sur main
   C ─┘   dans l'ordre A → B → C
              │
              ▼
     conflit git ?
       ├─ oui → résous (jamais d'écrasement aveugle) → re-run tests
       └─ non → suite complète verte ?
                    ├─ non → bug de jonction → tâche d'intégration
                    └─ oui → lane suivante
              │
              ▼
     PASSE D'INTÉGRATION (dédiée) : parcours A→Z qui traverse les features mergées
              │
              ▼
     DEV-DONE consolidé → prêt pour l'étape 13 (cascade)
```

## Procédure
1. **Pré-check** : lis tous les `status/*.md`. Ne merge que les lanes `DEV-DONE` (une lane `BLOCKED` attend, ne bloque pas les autres).
2. **Merge séquentiel** (jamais deux merges concurrents) : intègre une lane, fais tourner la **suite complète**, puis la suivante. L'ordre suit les dépendances (le contrat/skeleton d'abord).
3. **Conflits git** : résous à la main (jamais « accepter les leurs/nôtres » à l'aveugle sur du code métier). Re-teste après résolution.
4. **Bugs de jonction** : deux features vertes séparément peuvent casser ensemble (types divergents, contrat d'API mal aligné, effets de bord partagés). Traite via une **tâche d'intégration** dédiée.
5. **Passe d'intégration** : lance un parcours **A→Z** qui traverse plusieurs features mergées (pas les unitaires de chaque lane) — le chemin cœur + les greffes.
6. **Consolide** : mets `status/*` à jour (DEV-DONE consolidé) ; les bugs résolus, les réserves restantes en `CONCERNS` (l'étape 13/14 tranchera).

## Catalogue de bugs de jonction (à chercher activement)
| Type | Exemple niche-agnostique | Où ça casse |
|---|---|---|
| **Contrat divergent** | Lane A renvoie `{id}` , lane B attend `{itemId}` | Frontière API/types |
| **Schéma partagé** | Deux migrations touchent la même table dans un ordre incompatible | BDD |
| **Effet de bord global** | Deux features écrivent le même cache/état global | Runtime |
| **Auth / middleware** | Une lane suppose un middleware qu'une autre a modifié | Pipeline de requête |
| **Dépendance de version** | Deux lanes bumpent la même lib vers des versions différentes | Build/lockfile |
| **Route en collision** | Deux features déclarent la même route/chemin | Routeur |
| **Ordre d'init** | B suppose une ressource initialisée par A, pas garantie au boot | Démarrage |

## Definition-of-Done de la passe d'intégration
- [ ] Toutes les lanes `DEV-DONE` mergées sur `main` (les `BLOCKED` documentées, pas oubliées).
- [ ] **Suite complète verte** après le dernier merge (0 régression).
- [ ] Au moins **un parcours A→Z** vert qui traverse les features greffées (pas seulement les unitaires par lane).
- [ ] Chaque conflit git résolu **et re-testé** (pas d'écrasement aveugle).
- [ ] Catalogue de jonction parcouru ; bugs corrigés ou logués en `CONCERNS`.
- [ ] **Garde-fous de sortie produit** verts (charte + anti-slop / landing playbook *(public)* / **pricing = livré** *(public)* / métadonnées + favicon / premier usage complet / **boucles fermées** / empty states / légal FR *(public)* / 404 + loading — cf. section suivante). **Calibrés par type** (interne/perso : pas de landing, racine=login, noindex) — `skills/saas-factory/references/routing.md`.
- [ ] **Boucles fermées** (`_shared/boucles-fermees.md`) : chaque action de valeur enfile+envoie sa notification (acteur + contrepartie), **zéro action muette** ; testable par le faux-client (étape 14).
- [ ] **Registre `tech/plan-ledger.md` posé** (P0.1) : chaque `[SÉCU]` + tâche d'intégration du plan tracé *fait (fichier) / repoussé (raison + décision humaine)* ; tests du plan **committés** ; ≥1 **E2E cœur exécuté vert** (trace) — prêt à être signé par l'étape 14 (`skills/14-qa/references/plan-solde-gate.md`).
- [ ] `status/*` consolidé ; secrets absents ; état prêt pour l'étape 13.

## Garde-fous de sortie produit (non-régression du « générique châssis » et du « squelette »)
Le parallélisme livre des features vertes mais peut laisser sortir un produit au **look châssis**, au **contenu squelette** ou au **premier usage vide**. Ces checks sont **bloquants** — un seul échec = le produit n'est pas prêt pour l'étape 13, même si la suite est verte. Ils vérifient que les **gestes de fondation** du walking skeleton ont tenu après tous les merges, et que le produit sort **complet et pro**, pas en démo creuse. Règle de fond : **l'onboarding est une feature Must implicite de tout SaaS public — jamais livrer un produit qui atterrit sur du vide.**

| Garde-fou | Ce qu'on vérifie | Check concret | Échec = |
|---|---|---|---|
| **Charte appliquée** | Le produit porte les couleurs de `DESIGN.md`, pas le noir/blanc du châssis | `app/globals.css` (`:root`/`.dark`) ≠ valeurs par défaut du châssis | Look générique → bloquant |
| **Anti-slop passé** | Aucun marqueur d'AI slop sur les pages clés (landing, auth, dashboard) | Checklist de review de `_shared/design-doctrine.md` passée **point par point, en binaire**, sur screenshot **desktop + mobile** → 0 marqueur coché (+ le grep lint de la doctrine : indigo/violet, hex en dur, buzzwords) | Look AI slop → bloquant |
| **Landing conforme au playbook** *(public)* | Structure + copy de `_shared/landing-playbook.md` (sections canoniques, copy spécifique au métier) | Checklist landing du playbook (passes A + B) verte ; `grep -riE "lorem|placeholder|TODO"` sur les pages marketing → **0 occurrence** | Landing faible / placeholder → bloquant |
| **Pricing = features livrées** *(public)* (P0.7) | Chaque ligne de pricing correspond à une **capacité effectivement livrée** — zéro vaporware public | **Diff** chaque tier/feature de la page pricing contre la **liste des Must implémentés** du PRD (`product/product-spec.md` + `product/pricing.md`) : toute feature vendue **doit** exister dans le code livré. Feature absente = badge « **bientôt** » explicite **ou** retirée de la carte. Structurellement impossible (ex. « multi-praticiens » quand le schéma l'interdit) = **retirée**. | Promesse commerciale fausse sur un site public → bloquant |
| **Métadonnées brandées + favicon** | `<title>`, description et og portent le **produit** ; favicon présent | `lib/brand.ts` `name` ≠ `"SaaS Factory Template"` **ET** `grep -rn "SaaS Factory Template"` sur le repo → **0 occurrence** ; metadata (`description`, `openGraph`) dérivées de `lib/brand.ts` ; favicon ≠ défaut châssis | `<title>`/og génériques sur le site live → bloquant |
| **Parcours premier usage complet** | L'arrivée d'un vrai client fonctionne et aboutit sur du **plein** | Joué en staging/local : signup **OTP ou magic link** (le code arrive et se saisit — jamais mot de passe seul) → onboarding qui **crée l'entité cœur** (ex. profil salon : nom, adresse, horaires, prestations) → dashboard **non-vide** qui reflète l'entité créée | Atterrissage sur du vide → bloquant |
| **Boucles fermées — zéro action muette** | Chaque **action de valeur** du workflow cœur (créer / modifier / annuler l'entité) ferme sa boucle : trace durable à l'acteur **ET** avis à la contrepartie | Pour chaque action de valeur : un job `notification_jobs` **enfilé et envoyé** (best-effort, **même transaction logique** que l'action — jamais « TODO plus tard ») ; l'acteur reçoit sa trace, la contrepartie est notifiée. Dérivation des 5 questions faite en 07 (`_shared/boucles-fermees.md`) → chaque « oui » du PRD **câblé et testable** ici. | Action de valeur muette (booking coiffeur : email jamais parti) → bloquant |
| **Empty states avec CTA** | Chaque liste/tableau encore vide guide vers l'action | 0 liste vide « nue » : chaque état vide a un message + un CTA d'amorçage | Écran mort → bloquant |
| **Pages légales FR** *(public)* | Conformité légale du site public (`landing-playbook.md` §légal) | `/legal/mentions-legales` + `/legal/confidentialite` générées (+ `/legal/cgv` si vente), liées dans le footer, **zéro lien mort** | Site non conforme → bloquant |
| **404 brandée + loading states** | Signal « produit fini » jusque dans les recoins | Page 404 personnalisée (pas la 404 par défaut du framework) ; skeletons/loading sur les surfaces à données | Produit brut → bloquant |

> **Calibrage par type (renvoi, pas de copie).** Les garde-fous marqués *(public)* — **landing conforme**, **pricing = livré**, **pages légales FR** — ne s'appliquent qu'au type **public**. Pour un **outil interne / perso**, il n'y a **pas de landing marketing** (racine = **login**) : le garde-fou devient « **pas de template châssis visible** » (aucun écran par défaut du châssis, `<title>` brandé, `X-Robots-Tag: noindex`) et l'accès privé est prouvé au faux-client par « **signup anonyme refusé** » (étape 14). Les garde-fous **charte / anti-slop / premier usage / boucles fermées / empty states / 404 / loading** restent **universels** (les trois types). **Route selon `skills/saas-factory/references/routing.md`** (lignes `12-build` et `14-qa`) — ne recopie jamais la matrice ici.

> **Pourquoi le check `grep` en plus du diff de `lib/brand.ts`** : le `<title>` n'apparaît **pas** dans le corps de la page — c'est le dernier vestige châssis qui passe la QA visuelle et se retrouve sur le site déployé. Le grep attrape aussi toute ré-écriture en dur du nom ailleurs (un bloc qui aurait re-codé `"SaaS Factory Template"` au lieu d'importer `brand`). La source de vérité reste **unique** : `lib/brand.ts`.

## Porte « plan soldé » — le producteur du registre (P0.1)
La passe d'intégration est le **producteur** du registre de solde ; l'étape **14** en est le vérificateur qui l'**exécute et le signe**. **Critères canoniques : `skills/14-qa/references/plan-solde-gate.md`** (source unique — ne pas les redéfinir ici). Ce que la passe d'intégration **fait** :

1. **Relis `tech/execution-plan.md`** : recense **chaque** item `[SÉCU]` et **chaque** tâche d'intégration.
2. **Pose `tech/plan-ledger.md`** : une ligne par item — `fait (fichier:ligne / test)` **ou** `repoussé (raison tracée + décision humaine loguée `state.md` + `CONCERNS`)`. **Aucun `[SÉCU]` sans ligne** (c'est là qu'ils s'évaporent). Un `[SÉCU]` `fait` **exige** une référence fichier, pas une relecture.
3. **Committe les tests du plan** : les rouges du TDD (étape 10/12) et recettes que le plan nomme deviennent des **fichiers versionnés** (`git ls-files` les trouve) — pas « décrits ».
4. **Exécute ≥1 E2E du parcours cœur** et joins la trace verte : la preuve est l'**exécution**, jamais la lecture. *(L'E2E `upgrade/billing` n'est requis que si public + billing — `skills/saas-factory/references/routing.md`.)*

> Un `[SÉCU]` repoussé ne se **`WAIVE` jamais** sur épuisement de budget sans décision humaine explicite (`_shared/validation-cascade.md`). Le registre part à l'étape 14, qui **ferme la porte** si un `[SÉCU]` manque, si les tests ne sont pas committés, ou si aucun E2E cœur n'a tourné.

## Matrice de décision
| Condition | Action |
|---|---|
| Suite verte après un merge | Lane suivante |
| Rouge après un merge (feature seule était verte) | Bug de jonction → tâche d'intégration ciblée |
| Conflit git sur du code métier | Résous à la main + re-teste ; jamais « ours/theirs » aveugle |
| Deux lanes bumpent une lib différemment | Aligne sur une version, re-teste les deux |
| Bug de jonction non résolu dans le budget | Loge en `CONCERNS` + remonte ; l'humain tranchera (étape 15) |
| Une lane est `BLOCKED` | Merge les autres ; ne bloque pas tout ; traite le blocage à part |

## Forcing-question — « l'intégration est-elle prouvée ? »
- **Ask exact** : *« Existe-t-il un parcours A→Z exécuté qui traverse PLUSIEURS features mergées, vert, sur main à jour ? »*
- **Push-until** : validé quand un test de parcours transverse passe **après** le dernier merge — pas la somme des tests par lane.
- **Red-flags** :
  - « chaque feature était verte » (séparément ≠ ensemble),
  - « ça compile » (compiler ≠ le chemin cœur tourne),
  - conflit résolu sans re-lancer les tests,
  - pas de test transverse, seulement des unitaires par lane.
- **MOU vs FORT** :
  - MOU : *« Tout est mergé, ça build. »*
  - FORT : *« A,B,C mergées ; suite 84/84 verte ; e2e ‘créer → commenter → notifier' vert sur main. 1 bug de contrat corrigé (B attendait itemId). »*

## Modes d'échec
| Mode d'échec | Symptôme | Parade |
|---|---|---|
| **Pas de passe d'intégration** | On déclare fini sur la somme des lanes | Toujours une passe A→Z dédiée après merge |
| **Merge concurrent** | Deux merges en //, historique cassé | Merge **séquentiel**, une lane à la fois |
| **Résolution aveugle** | `ours/theirs` sur du métier → perte de code | Résolution manuelle + re-test |
| **Faux « fini »** | Vert par lane, rouge ensemble non détecté | Test transverse obligatoire dans la DoD |
| **Blocage propagé** | Une lane BLOCKED gèle le merge de tout | Merge les DEV-DONE, isole le blocage |
| **Sortie générique** | Le `<title>` live affiche encore « SaaS Factory Template » (ou look/landing châssis) | Garde-fous de sortie produit : `lib/brand.ts` renseigné au walking skeleton + gate `grep "SaaS Factory Template"` = 0 |
| **Produit squelette** | Features vertes mais le premier usage atterrit sur du vide (pas d'onboarding, dashboard vide, listes nues, légal absent) | Garde-fous « premier usage / empty states / légal / 404 » : le parcours OTP → onboarding → entité cœur → dashboard non-vide est **joué** avant l'étape 13, pas supposé |
| **Action de valeur muette** | Une action cœur (résa, commande, annulation) confirme à l'écran mais **aucune notification** ne part (job jamais consommé, « TODO plus tard ») | Garde-fou **boucles fermées** : chaque action enfile+envoie sa notif (acteur + contrepartie) dans la même transaction logique ; vérifié des deux côtés au faux-client (`_shared/boucles-fermees.md`) |
| **Vaporware pricing** | La landing vend un tier/feature que le code ne livre pas (ou que le schéma interdit) | Garde-fou **pricing = livré** *(public)* : diff pricing ↔ Must implémentés ; feature absente = « bientôt » ou retirée (P0.7) |
| **`[SÉCU]` évaporé / faux « fini »** | Un item `[SÉCU]` du plan absent du code sans trace ; « c'est fait » sans test ni E2E | **Registre `tech/plan-ledger.md`** : une ligne par `[SÉCU]` (fait fichier / repoussé tracé), tests committés, E2E cœur exécuté — la porte 14 ferme sinon (`skills/14-qa/references/plan-solde-gate.md`) |
