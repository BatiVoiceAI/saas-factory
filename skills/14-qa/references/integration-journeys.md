# Référence — Plan de test & parcours d'intégration A→Z

Couvre l'**étape 1 de la procédure** (dresser le plan de test depuis le PRD) et la **passe 2** (intégration). C'est ici que sortent les **bugs de jonction** — le coût caché Spendly (`_shared/lessons.md` : « parallélisme non maîtrisé → bugs à la jonction »).

## 1. Dresser/compléter le plan de test (étape 1)
La **recette** (`qa/test-plan.md`) a été écrite par le QA Analyst à l'ouverture de la Phase 4. Ton job ici : la **charger, la compléter, la rendre jouable** — pas la réécrire.

### Sous-procédure (dans l'ordre)
1. **Inventaire des features** : liste toutes les features Must/Should du PRD (`product/product-spec.md`). Chacune → une ligne en passe 1.
2. **Extraire les parcours cœur** : depuis les user stories, identifie les **2 à 5 parcours de bout en bout** qui portent la valeur (le workflow cœur + l'edge). Ce sont les parcours de la passe 2. Le **premier est imposé — mais SA FORME est CONDITIONNÉE PAR ARCHÉTYPE** (🚨 `_shared/state-schema.md` §socle-par-archétype ; portes 14 : `skills/saas-factory/references/routing.md`, ligne `14-qa`) : **`web-saas`** → l'**arrivée réelle** (landing → signup OTP → mot de passe → onboarding créant l'entité cœur → dashboard non-vide → job cœur) ; **`landing`** → le **visiteur** (landing conforme au 5-second test → CTA/waitlist fonctionne → confirmation ; **pas de signup/onboarding/dashboard** — `_shared/archetypes/landing.md`) ; **`automation`** → le **run** (déclencheur → run exécuté → effet + idempotence → boucle fermée au propriétaire ; **headless** — `_shared/archetypes/automation.md`). Protocole exact par archétype : `fake-client-protocol.md`, « Parcours #0 ». **Ne recale jamais un `landing`/`automation` faute d'onboarding/dashboard.**
3. **Rattacher les critères** : chaque parcours ↔ les critères d'acceptation qu'il traverse (traçabilité — chaque test pointe un critère PRD).
4. **Cataloguer les cas limites** : croise avec `references/edge-cases-catalog.md` → note ceux qui s'appliquent à ce produit.
5. **Ordonner** : passe 1 (features seules) d'abord, passe 2 (A→Z) ensuite. Une feature Must cassée en passe 1 bloque son inclusion en passe 2.

### Forcing-question — « ai-je les bons parcours cœur ? »
- **Ask exact** : « Si le persona ne pouvait faire qu'**un seul** trajet dans le produit, lequel prouve la promesse ? » → c'est le parcours cœur #1, celui à ne jamais laisser rouge.
- **Push-until** : continue de lister jusqu'à couvrir *acquisition → activation → valeur → (paiement) → rétention/résultat*. Un parcours manquant = un trou de QA.
- **Red-flags** : un « parcours » qui tient sur un seul écran (ce n'est pas de l'intégration) ; un parcours qui ne traverse **aucune** jonction entre features (inutile en passe 2) ; lister 15 parcours (tu diluesle vrai risque — garde 2-5 parcours cœur).

## 2. Anatomie d'un parcours A→Z
Un parcours d'intégration = une **suite d'étapes utilisateur** qui traverse **plusieurs features**, où **un état doit transiter** de l'une à l'autre.

> 🚨 **La forme ci-dessous (landing → signup → onboarding → paiement → résultat) est celle de l'archétype `web-saas`.** Un **`landing`** n'a qu'un mini-parcours *visiteur → CTA/waitlist → confirmation* (aucune jonction auth/billing) ; un **`automation`** a un parcours *déclencheur → run → effet/idempotence → boucle fermée* (jonctions = *run → persistance*, *run → notification propriétaire* ; **pas d'UI**). Renvoi : `fake-client-protocol.md` « Parcours #0 » + `_shared/archetypes/{landing,automation}.md`.

```
 ACQUISITION      ACTIVATION         VALEUR CŒUR        PAIEMENT         RÉSULTAT
 ┌─────────┐      ┌──────────┐       ┌──────────┐       ┌────────┐       ┌─────────┐
 │ landing │─────▶│ signup   │──────▶│ 1re      │──────▶│ upgrade│──────▶│ résultat│
 │  → CTA  │      │ onboard  │       │ action   │       │ / plan │       │ livré + │
 │         │      │          │       │ cœur     │       │        │       │ rétention│
 └─────────┘      └────┬─────┘       └────┬─────┘       └───┬────┘       └─────────┘
                       │                  │                 │
                    JONCTION           JONCTION          JONCTION
                  (compte créé →     (donnée saisie →   (plan choisi →
                   session active)    résultat calculé)  quota débloqué)
```

À chaque **JONCTION**, un objet/état passe d'une feature à la suivante. **C'est là que ça casse.**

## 3. Catalogue des points de jonction (où traquer les bugs)
| Jonction | Ce qui doit transiter | Bug typique |
|---|---|---|
| **Landing → signup OTP** | CTA → formulaire → code/lien émis, **reçu**, **d'une longueur qui rentre dans l'input**, saisi → session | Email OTP jamais envoyé (mail sandbox non branché) ; **code plus long que le nombre de cases de l'input → saisie impossible** (bug vécu : `8` chiffres vs input `6`, défaut Supabase `mailer_otp_length`) ; code expiré avant saisie ; magic link qui pointe sur la mauvaise URL. |
| **Auth → app** | Session, identité, rôles/permissions | Utilisateur connecté mais traité comme anonyme sur une page ; rôle non propagé. |
| **Onboarding → feature cœur** | Préférences, plan choisi, données d'amorçage | Choix d'onboarding perdu ; feature démarre sur un état vide inattendu. |
| **Feature A → Feature B** | Objet métier (devis, projet, doc…) | Objet créé en A introuvable/incomplet en B ; ID non passé. |
| **Action de valeur → persistance (endpoint/RPC)** | Réponse **200** + **ligne réellement écrite** en base | Endpoint/RPC renvoie un **500 avalé** par un toast générique / UI optimiste ; **erreur SQL runtime** (`42702` colonne ambiguë, RLS, grant) **invisible au build** — « confirmé à l'écran » mais **rien n'est écrit** (bug vécu : `create_booking`). Exige **200 + l'objet qui réapparaît** (refresh / côté B), pas l'écran de confirmation. |
| **Action de valeur → notification (boucle fermée)** | Trace durable à l'acteur **ET** avis à la contrepartie | **Email jamais envoyé** (mailer non branché, job `notification_jobs` posé mais jamais consommé) ; contrepartie jamais notifiée ; « confirmé à l'écran » mais rien ne part. → `_shared/boucles-fermees.md`, vérifié des **deux côtés** en sandbox. |
| **Action → billing** *(public + billing)* | Quota, plan, compteur d'usage | Action autorisée au-delà du quota ; upgrade non reflété immédiatement. |
| **Paiement → déblocage** *(public + billing)* | Statut d'abonnement, features premium | Payé mais premium toujours verrouillé (webhook non traité) ; double-charge. |
| **État partagé (multi-onglet/refresh)** | Cache, state client, cookies | Deux onglets divergent ; refresh perd l'état ; retour navigateur casse le flux. |
| **Async / webhook / job** | Résultat d'un traitement différé | UI dit « prêt » avant que le job ait fini ; résultat jamais rafraîchi. |

> **Calibrage par type** : les jonctions *billing/paiement* ne s'appliquent qu'aux produits **public + billing** ; en **interne/perso**, elles sont remplacées par la vérification « **signup anonyme refusé** » (accès privé réel). La jonction **boucle fermée**, elle, est **universelle** — dès qu'une contrepartie existe, elle vaut pour les trois types. **Route selon `skills/saas-factory/references/routing.md`** (ligne `14-qa`) — ne recopie pas la matrice.

## 4. Data-flow d'un objet cœur (à vérifier de bout en bout)
```
  [Feature A: création]        [transit]          [Feature B: consommation]
   saisie utilisateur  ──▶  persistance (BDD) ──▶  lecture par B
        │                        │                      │
   validé ? complet ?      ID stable ? pas de     l'objet arrive-t-il
   états loading/erreur    perte au refresh ?     COMPLET et à jour ?
```
**Test :** crée l'objet en A, **navigue** jusqu'à B (sans réinitialiser), vérifie qu'il **arrive intact**. Puis stresse : refresh au milieu, retour arrière, deux onglets.

## 5. Combinaisons réalistes (au-delà du happy path)
Rejoue chaque parcours cœur avec **une** de ces perturbations à la fois :
- **Ordre inattendu** : payer avant de configurer ; inviter un membre avant d'avoir un projet.
- **Abandon + reprise** : quitter au milieu de l'onboarding, revenir plus tard → reprend-il correctement ?
- **Retour navigateur** au milieu d'un flux à étapes (wizard, checkout).
- **Deux onglets** sur le même compte : action dans l'un, l'autre est-il cohérent au refresh ?
- **Session qui expire** pendant un flux long → reprise propre ou perte de données ?
- **Double soumission** (double-clic sur l'action finale) → idempotent ?

## 6. Definition-of-done de la passe 2
- [ ] Chaque parcours cœur du PRD joué **bout-en-bout, sans réinitialiser** entre features.
- [ ] Chaque **jonction** du parcours vérifiée (l'objet/état arrive intact).
- [ ] Chaque **action de valeur exécutée → réponse 200 + entité persistée** (pas un 500 avalé ; l'objet réapparaît après refresh / côté contrepartie).
- [ ] Chaque **action de valeur → boucle fermée** vérifiée des **deux côtés** (acteur + contrepartie reçoivent réellement — `_shared/boucles-fermees.md`) ; aucune boucle muette.
- [ ] Au moins **une combinaison réaliste** (perturbation) testée par parcours cœur.
- [ ] Le data-flow de l'**objet métier central** vérifié de création à consommation.
- [ ] Tout bug de jonction → **régression E2E multi-features** générée + retour dev avec le **parcours complet** en contexte.
- [ ] Preuve (trace Playwright) attachée à chaque parcours.

## Modes d'échec de l'intégration
| Mode | Symptôme | Parade |
|---|---|---|
| **Passe 2 sautée** | Seules les features seules testées | Interdit : la passe 2 est la raison d'être de l'étape 14. Les bugs de jonction ne sortent que là. |
| **Réinitialisation entre features** | Chaque feature repart d'un état propre | Casse le test d'intégration : joue le parcours **d'un seul tenant**. |
| **Jonction non identifiée** | Un parcours « passe » mais une jonction jamais observée | Cartographie les jonctions **avant** (tableau §3), coche-les une par une. |
| **Happy-path only en passe 2** | Aucune perturbation testée | Ajoute au moins une combinaison réaliste (§5) par parcours. |
| **Contexte de bug amputé** | Retour dev avec juste l'écran final | Fournis le **parcours entier** : un bug de jonction se corrige avec l'amont, pas l'écran d'arrivée. |
| **Boucle fermée non traquée** | Le parcours « passe » mais la notification n'est jamais vérifiée (jonction *action → notif* oubliée) | Traite la boucle comme une jonction à part entière : ouvre la boîte sandbox des **deux** rôles ; rien reçu = `FAIL` bloquant. |
| **Persistance non vérifiée (500 masqué)** | Le parcours « passe » parce que l'écran confirme, mais l'endpoint/RPC a renvoyé un 500 avalé et rien n'est écrit (bug vécu : erreur SQL runtime `create_booking`) | Lis la réponse réseau : **200** exigé ; **rejoue une lecture** (refresh / côté contrepartie) pour prouver que l'entité existe. Écran ≠ écriture. |
