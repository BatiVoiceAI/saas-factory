# Référence — Protocole du faux-client (A→Z)

Comment l'agent `fake-client` teste le produit comme un vrai utilisateur.

## Posture
Tu es **l'utilisateur cible** (le persona du PRD), pas un dev. Tu ne lis pas le code : tu **utilises le produit** dans un vrai navigateur, tu cliques, tu remplis, tu observes. Tu juges **l'expérience et la conformité à l'attendu**.

> **Règle de séparation** (non négociable) : le faux-client **ne lit jamais le source** pour se rassurer, **ne corrige jamais** un bug lui-même, **ne re-spécifie jamais** l'attendu. Il constate — c'est la cascade/dev (étapes 13/12) qui corrige. Lire le code = tricher (tu verrais l'intention, pas le vécu). Corriger = casser le HARD GATE (« on teste et on prouve, on ne construit pas »).

### Machine à états d'un test faux-client
```
        ┌────────────┐
        │  CHARGER   │  (staging / local, persona chargé, données propres)
        └─────┬──────┘
              ▼
        ┌────────────┐   attendu absent / bloqué
        │  PARCOURS  │───────────────────────────► BUG (bloquant)
        │  (clic,    │
        │  remplir,  │   comportement ≠ critère
        │  observer) │───────────────────────────► BUG (majeur/mineur)
        └─────┬──────┘
              │ conforme à TOUS les critères + états OK
              ▼
        ┌────────────┐
        │   PASS     │  (verdict + preuve : screenshot / trace)
        └────────────┘
```

## Deux passes

### Passe 1 — chaque feature, seule
Pour chaque feature Must/Should : rejoue son **parcours** dans le navigateur, vérifie le **comportement attendu** (critères d'acceptation) + les **états** (loading, vide, erreur, succès). Rien ne doit avoir régressé depuis la validation cascade.

**Sous-procédure (par feature, dans cet ordre) :**
1. **Charger l'attendu** : ouvre `product/product-spec.md` + la user story de la feature → liste ses **critères d'acceptation** (c'est le barème, pas ton feeling) + la ligne du livret (`qa/test-booklet.md` — colonne *Fonctionnel*).
2. **Réinitialiser l'état** : compte/données propres (cf. « Données de test » plus bas). Un test qui part d'un état sale ne prouve rien.
3. **Happy path** : joue le parcours nominal de bout en bout. Chaque critère d'acceptation → coché ou non (binaire).
4. **Balayage d'états** : force **loading** (réseau lent), **vide** (0 donnée), **erreur** (entrée invalide, action refusée), **succès** (confirmation visible). Un état non géré = bug.
5. **Cas limites de la feature** : voir `references/edge-cases-catalog.md` (double-clic, entrée hostile, session expirée, offline, gros volume, retour arrière).
6. **Verdict + preuve** : `PASS/CONCERNS/FAIL` (`skills/13-reviews/references/verdict-schema.md`) + **screenshot ou trace Playwright** à l'appui. Pas de preuve → pas de verdict.

**Critère de passage passe 1 :** toutes les features Must sont `PASS` (ou `CONCERNS` tracé) sur leur parcours seul. Un `FAIL` Must → régression + retour dev **avant** d'attaquer la passe 2 (inutile de tester l'intégration d'une feature cassée).

### Passe 2 — intégration (toutes ensemble)
Rejoue les **parcours de bout en bout** qui traversent plusieurs features (ex. onboarding → workflow cœur → billing → résultat). **C'est là que sortent les bugs de jonction** (état partagé, navigation, données qui transitent). Teste les **combinaisons réalistes**, pas juste le happy path.

#### Parcours #0 — l'arrivée réelle (imposé, joué en PREMIER)
Le scénario commence là où le **vrai client** commence : l'URL publique, compte inexistant. **Aucun raccourci** (URL interne, compte pré-créé, OTP contourné) — le but est de **vivre** l'arrivée réelle, pas de la supposer.

1. **Landing** — arrive sur la page publique. Juge-la contre la checklist de `_shared/landing-playbook.md` (dont le **5-second test** : que vend ce site ? pour qui ? que fait le bouton ?) ; zéro placeholder/lorem. Clique le CTA primaire.
2. **Signup OTP / magic link** — crée le compte. Vérifie la **réception réelle** du code/lien (boîte de test sandbox : Inbucket/Mailpit en local, boîte de test du provider en staging — `safety-rails` §2) **et sa saisie réelle dans l'input**. **Le code reçu doit TENIR dans l'input** : s'il a **plus de chiffres que le nombre de cases** de l'input OTP, l'utilisateur ne peut physiquement pas le saisir → `FAIL` **bloquant** *(bug vécu : e-mail à `8` chiffres, input à `6` cases — défaut Supabase `mailer_otp_length` ≠ input châssis ; invisible au build, seule la saisie réelle l'attrape)*. Code qui n'arrive pas, expire trop vite, ou boucle de renvoi = `FAIL` bloquant. Signup **mot de passe seul** (sans OTP ni magic link) = `FAIL` (non conforme au standard produit).
3. **Onboarding complet** — déroule l'onboarding en remplissant chaque champ avec des **données réalistes du persona** : il doit **créer l'entité cœur** du produit (ex. profil salon : nom, adresse, horaires, prestations). Onboarding absent, sautable vers du vide, ou qui ne crée rien = `FAIL`.
4. **Dashboard d'arrivée** — il doit être **non-vide** : il reflète l'entité créée à l'étape 3. Toute liste encore vide porte un **empty state avec CTA**. Dashboard vide ou générique après onboarding = `FAIL`.
5. **Job cœur** — accomplis le job principal du persona de bout en bout (ex. publier une prestation et recevoir une réservation de test).
6. **Verdict d'ensemble** — tranche, preuve à l'appui : le produit fait-il « **pro et complet** » ou « **démo creuse** » ? (critères ci-dessous). « Démo creuse » = `FAIL` global, même si chaque écran isolé « marche ».

**Critères « pro et complet » vs « démo creuse » (binaires) :**
- Le persona atteint son but **sans aide** ni connaissance du code.
- L'entité cœur créée à l'onboarding **persiste** et alimente réellement le dashboard et les features (pas un formulaire décoratif).
- **Aucun écran vide sans CTA**, aucune page placeholder, aucune 404 par défaut du framework, aucun lien mort (footer légal inclus).
- Branding partout : `<title>`, favicon, og — jamais « SaaS Factory Template ».
- Le rendu passe la **checklist anti-slop** de `_shared/design-doctrine.md` (desktop + mobile).
- **Pages légales FR** présentes (mentions légales, confidentialité ; CGV si vente).

Verse le résultat dans le livret (`qa/test-booklet.md`, section « Parcours d'arrivée réelle »).

#### Boucles fermées — les DEUX rôles (obligatoire dès qu'une contrepartie existe)
> Doctrine : `_shared/boucles-fermees.md`. **Une action de valeur qui ne ferme pas sa boucle est un bug de spec**, pas un raffinement. Constat fondateur : le booking confirmait la résa **à l'écran** mais n'envoyait **aucun email** à la cliente et ne notifiait **jamais** le gérant.

Pour **chaque action de valeur** du workflow cœur (créer / modifier / annuler l'entité métier — résa, commande, demande, invitation…), le faux-client joue **successivement les deux rôles** et **vérifie la réception réelle** de chaque côté — jamais « l'écran confirme, donc c'est bon » :

1. **Rôle acteur** — accomplis l'action (ex. la cliente réserve). **Vérifie d'abord que l'action a RÉELLEMENT abouti** : la réponse réseau de l'endpoint/RPC est **200** (lis l'onglet réseau — pas un **500 avalé par un toast générique** ni une UI optimiste qui « confirme » sans écriture) **et l'entité est persistée** (elle réapparaît après refresh / côté contrepartie). Puis vérifie que l'acteur reçoit une **trace durable** : email de confirmation **dans la boîte sandbox** (Inbucket/Mailpit en local, boîte de test du provider en staging — `_shared/safety-rails.md` §2), pas seulement la page de confirmation (l'écran se ferme). `.ics` + lien annuler/déplacer si la boucle les prévoit. *(Action « confirmée à l'écran » mais 500 masqué / non persistée = `FAIL` bloquant — bug vécu : erreur SQL runtime dans `create_booking`, invisible au build.)*
2. **Rôle contrepartie** — bascule sur l'autre partie (ex. le gérant). Vérifie qu'elle est **notifiée** de l'action (email pro / notification in-app / webhook selon le type). Dès qu'une contrepartie existe (client↔gérant, demandeur↔valideur, invité↔propriétaire), cette vérification n'est **jamais** sautable.
3. **Réversibilité** — si l'action est annulable/modifiable, joue l'annulation **par la contrepartie** (ex. le salon annule) et vérifie que **l'acteur reçoit** l'avis. Puis l'inverse.
4. **Verdict par boucle** : réception prouvée des **deux** côtés = `PASS`. **Une boucle silencieuse** (email jamais reçu, contrepartie jamais notifiée, « TODO plus tard » dans le code) = **`FAIL` bloquant** — pas un `CONCERNS`. Preuve : screenshot de la boîte sandbox / du centre de notifications.

Le **canal** varie honnêtement selon le type (email client / email pro / notification in-app / webhook interne), **jamais l'existence de la boucle** : la dérivation est **universelle** (public, interne, perso — `_shared/boucles-fermees.md`).

**Sous-procédure :**
1. **Charge la liste des parcours A→Z** depuis `qa/test-plan.md` (section « Parcours d'intégration ») + complète-la via `references/integration-journeys.md` (comment cartographier un parcours + le data-flow). **Calibrage par type** : le parcours **upgrade/billing** n'est joué que si le produit est **public + billing** ; en interne/perso, joue à la place le test « **signup anonyme refusé** » — **route selon `skills/saas-factory/references/routing.md`** (ligne `14-qa`), ne recopie pas la matrice.
2. **Joue chaque parcours d'un seul tenant**, sans réinitialiser entre les features — c'est le point : l'état de la feature A doit **arriver correct** dans la feature B.
3. **Traque les jonctions** (là où deux features se passent un objet, un état, une navigation) : voir la checklist « points de jonction » de `references/integration-journeys.md` — dont la jonction **action de valeur → notification** (la boucle fermée).
4. **Combinaisons réalistes** : ordre inattendu (payer avant de configurer), reprise après abandon, deux onglets, retour navigateur au milieu d'un flux.
5. **Verdict par parcours** + preuve. Un bug de jonction → régression + retour dev avec **le parcours complet** en contexte (pas juste l'écran final).

**Critère de passage passe 2 :** tous les parcours cœur A→Z passent bout-en-bout. C'est la sortie de la passe 2 — et la vraie preuve que « le produit entier tourne ».

## Ce qu'on juge (contre le PRD)
- Le **workflow cœur** fonctionne de bout en bout ?
- L'**edge** (la différenciation) est-il réellement là et utilisable ?
- Les **cas limites** (entrée invalide, double-clic, session expirée, offline, gros volume) sont-ils gérés côté utilisateur ?
- L'expérience a-t-elle du **sens pour la cible** ?
- Le produit fait-il « **pro et complet** » ou « **démo creuse** » (verdict du parcours #0 — critères binaires ci-dessus) ?

### Recette forcing-question — « ce parcours est-il vraiment conforme ? »
À chaque parcours, ne conclus pas `PASS` avant d'avoir tranché ces questions **contre la preuve**, pas contre l'impression.

- **Ask exact** : « Chaque critère d'acceptation de cette user story est-il *observable à l'écran* (pas déduit) ? » · « Le persona du PRD atteindrait-il son but **sans aide** ? »
- **Push-until** (critère d'arrêt) : pousse jusqu'à avoir **une preuve visuelle par critère** (screenshot/trace) **et** avoir balayé les 4 états (loading/vide/erreur/succès). Tant qu'un critère n'a pas de preuve, ce n'est **pas** `PASS`.
- **Red-flags (réponses/attitudes à refuser)** :
  - « Ça marche probablement » sans avoir cliqué → **refuser**, rejouer.
  - « Le happy path passe » alors que vide/erreur non testés → **pas `PASS`**, au mieux `CONCERNS`.
  - « J'ai lu le code, la logique est bonne » → **interdit** (le faux-client ne lit pas le code).
  - « L'écran s'affiche » ≠ « le critère est rempli » : afficher n'est pas fonctionner.
  - Erreur console/réseau ignorée parce que « l'UI a l'air ok » → **investiguer** (souvent un bug silencieux).

### Exemplaire MOU vs FORT (verdict de parcours)
- ❌ **MOU** : « L'inscription a l'air de marcher, l'utilisateur arrive sur le dashboard. »
- ✅ **FORT** : « Parcours *inscription → 1re action cœur* : PASS. Preuve : `trace-signup.zip` + screenshot dashboard. Critères couverts : email de confirmation reçu (crit. 2), onboarding sauté au 2e login (crit. 4), 1re action cœur produit le résultat attendu (crit. 1). État *erreur* testé : email déjà pris → message clair (crit. 5). État *vide* : dashboard sans donnée → CTA d'amorçage présent. **Réserve (`CONCERNS`)** : sur mobile 375px, le CTA passe sous la ligne de flottaison — non bloquant, logué pour client-review. »

### Routage par cas (verdict → action)
| Constat | Verdict | Action |
|---|---|---|
| Tous critères observés + états OK | `PASS` | Consigne preuve, feature/parcours suivant. |
| Critère rempli mais défaut non bloquant (cosmétique, mobile, micro-copy) | `CONCERNS` | Passe, **logue** pour client-review (étape 15). Pas de retour dev. |
| Critère Must non rempli / parcours cassé | `FAIL` | **Régression générée** + retour dev (via cascade) avec contexte complet. |
| Comportement contredit le PRD mais « voulu » par le code | `FAIL` | Retour dev — le PRD est l'attendu, pas le code. Ne re-spécifie pas. |
| Ambiguïté : le PRD ne tranche pas | `CONCERNS` | Ne devine pas. Logue la question pour le client-review humain. |

## Sur bug
- **Génère un test de régression** qui reproduit le bug (il ne reviendra pas). *(Recette exacte : `references/qa-engine.md` → « Test de régression par bug ».)*
- **Retour dev** (via la cascade, étapes 13/12) avec le **contexte** : parcours, écran, **attendu vs obtenu** (quoi/où/pourquoi/quoi faire).
- Respecte le **budget d'itération** (`_shared/validation-cascade.md`).

### Anatomie d'un rapport de bug faux-client (actionnable)
```
[BUG] <titre court>            gravité: bloquant | majeur | mineur
Parcours : <A→Z ou feature seule>        Écran : <route/URL>
Repro (pas-à-pas) :
  1. …  2. …  3. …
Attendu (critère PRD #n) : <ce que la user story exige>
Obtenu : <ce qui se passe réellement>
Preuve : <screenshot / trace Playwright / log console>
Régression ajoutée : <chemin du test qui reproduit>
Pour le dev (pourquoi) : <impact utilisateur concret — pas « refais »>
```

## Données de test (pré-requis silencieux mais critique)
- **Compte neuf par run** (sandbox, `_shared/safety-rails.md` §2) : jamais tester sur des données de prod ou un compte réutilisé sali par un run précédent.
- **Jeux réalistes** : au moins un cas *vide*, un cas *nominal*, un cas *volumineux*, un cas *hostile* (voir catalogue).
- **Secrets/paiement** : en mode test (clés sandbox du provider), jamais de vraie carte. Si un flux exige un vrai paiement/KYC non simulable → **repli honnête** (`_shared/safety-rails.md` §6) : stoppe, documente, n'invente pas un succès.
- **Idempotence** : un test doit pouvoir tourner deux fois de suite et donner le même verdict (sinon il pollue son propre état).

## Modes d'échec du faux-client (et parade)
| Mode d'échec | Symptôme | Parade |
|---|---|---|
| **Complaisance** | Tout passe au 1er coup, aucun `CONCERNS` | Suspecte-toi : as-tu balayé les 4 états ? testé une entrée hostile ? Un run sans le moindre réserve est rare. |
| **Lecture de code** | « La logique semble correcte » | Interdit. Ferme le source, rejoue dans le navigateur. |
| **Happy-path only** | Seul le chemin nominal testé | La passe 2 et le catalogue de cas limites sont **obligatoires**, pas optionnels. |
| **Faux vert (état sale)** | PASS parce que la donnée d'un run précédent était déjà là | Réinitialise l'état avant chaque test. |
| **Bug avalé** | Erreur console/réseau mais UI « ok » | Lis la console + le réseau (`webapp-testing`) ; une 500 silencieuse = bug. |
| **OTP trop long pour l'input** | Le code arrive mais a plus de chiffres que de cases → saisie impossible (bug vécu : `8` chiffres vs input `6`) | Sur le vrai code reçu, compte les chiffres : longueur ≠ nombre de cases de l'input = `FAIL` **bloquant** (défaut Supabase `mailer_otp_length` ≠ input châssis). Invisible au build. |
| **Action « confirmée » mais non persistée** | L'écran affiche « c'est réservé » mais l'endpoint/RPC a renvoyé un 500 avalé (bug vécu : erreur SQL runtime dans `create_booking`) | Exige la réponse réseau **200 + l'entité persistée** (réapparaît après refresh / côté contrepartie) — pas l'écran de confirmation. Un 500 masqué = `FAIL` bloquant. |
| **Re-spec** | « En fait ce comportement est mieux » | Tu ne décides pas l'attendu — le PRD si. Logue en `CONCERNS`, laisse l'humain trancher (étape 15). |
| **Preuve manquante** | Verdict sans screenshot/trace | Pas de preuve → pas de verdict. Rejoue en capturant. |
| **Départ en milieu de produit** | Le test commence sur une URL interne, avec un compte pré-créé ou un OTP contourné | Parcours #0 obligatoire : landing publique, compte neuf, code OTP **réellement reçu et saisi**. |
| **Complétude jugée à la somme des écrans** | « Chaque feature marche » alors que l'ensemble fait démo creuse (dashboard vide, entité cœur jamais créée) | Le verdict « pro et complet » vs « démo creuse » est un critère **à part entière** : juge le produit entier, pas la somme des écrans. |
| **Boucle muette validée sur l'écran** | « La résa est confirmée à l'écran » → `PASS`, sans avoir ouvert la boîte sandbox ni le rôle contrepartie | Joue les **deux rôles**, **ouvre la boîte de réception** : boucle non reçue d'un côté = `FAIL` bloquant (`_shared/boucles-fermees.md`). |
