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

## Pré-requis machine — le plancher exécutable (avant toute passe)
> 🚨 **`npm run verify:machine` doit être VERT avant que le faux-client ne juge quoi que ce soit.** La couche machine (le PLANCHER exécutable ; liste + point d'entrée définis **une seule fois** à la porte `12-build` `integration-pass.md` DoD, `_shared/blocks/web-saas/scripts/`) passe **avant** le jugement d'agent (le PLAFOND). L'agent ne juge **que ce que la machine ne sait pas juger** (goût, cohérence métier, vécu). Rouge machine = **STOP, retour dev (12/13)** — inutile de recetter au faux-client un livrable qui échoue au grep exécutable (`_shared/lessons.md` §18).

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

#### Parcours #0 — l'arrivée réelle (imposé, joué en PREMIER) — **CONDITIONNÉ PAR ARCHÉTYPE**
> 🚨 **Le Parcours #0 existe pour les trois archétypes, mais SA FORME dépend de l'`archetype`** (`state.md`) — parce que le **socle de complétude est lui-même conditionné par archétype** (🚨 SOURCE : `_shared/state-schema.md` §« le socle est CONDITIONNÉ PAR ARCHÉTYPE » ; portes 14 par archétype : `skills/saas-factory/references/routing.md`, ligne `14-qa`). Un `landing` n'a **ni signup, ni onboarding, ni dashboard** ; un `automation` est **headless** (pas d'UI produit). **Ne JAMAIS recaler un `landing`/`automation` au motif « pas d'onboarding/dashboard »** : c'est le faux-négatif que ce modèle corrige (au même titre que « légal FR en dur »). Le **calibrage par type** (public/interne/perso) s'ajoute **par-dessus** l'archétype — il ne le remplace pas. Joue **la branche de l'archétype du run**, pas les trois.

Point commun aux trois : **on commence là où le vrai utilisateur commence, aucun raccourci** (pas d'URL interne, pas d'état pré-fabriqué, pas de déclencheur contourné) — le but est de **vivre** l'arrivée réelle, pas de la supposer.

##### A · `web-saas` — l'arrivée réelle (landing → signup → onboarding → dashboard non-vide → job cœur)
Le scénario commence là où le **vrai client** commence : l'URL publique, compte inexistant. **Aucun raccourci** (URL interne, compte pré-créé, OTP contourné).

1. **Landing** — arrive sur la page publique. Juge-la contre la checklist de `_shared/landing-playbook.md` (dont le **5-second test** : que vend ce site ? pour qui ? que fait le bouton ?) ; zéro placeholder/lorem. Clique le CTA primaire.
2. **Signup OTP → mot de passe** — crée le compte. Vérifie la **réception réelle** du **code** (boîte de test sandbox : Inbucket/Mailpit en local, boîte de test du provider en staging — `safety-rails` §2 ; **plus de magic link** — l'e-mail ne porte QUE le code) **et sa saisie réelle dans l'input**. **Le code reçu doit TENIR dans l'input** : s'il a **plus de chiffres que le nombre de cases** de l'input OTP, l'utilisateur ne peut physiquement pas le saisir → `FAIL` **bloquant** *(bug vécu : e-mail à `8` chiffres, input à `6` cases — défaut Supabase `mailer_otp_length` ≠ input châssis ; invisible au build, seule la saisie réelle l'attrape)*. Après vérification de l'e-mail, l'écran **« créer un mot de passe »** doit apparaître et **poser le mot de passe** → compte créé. Code qui n'arrive pas, expire trop vite, ou boucle de renvoi = `FAIL` bloquant. **Un magic link présent dans l'UI ou l'e-mail** (contraire au standard) **ou** un signup **par mot de passe seul, sans vérification OTP préalable de l'e-mail** = `FAIL` (non conforme au standard produit). Vérifie aussi le **retour** : déconnexion puis **reconnexion en e-mail + mot de passe** (`signInWithPassword`) ré-ouvre la session — le vrai chemin de connexion.
3. **Onboarding complet** — déroule l'onboarding en remplissant chaque champ avec des **données réalistes du persona** : il doit **créer l'entité cœur** du produit (ex. profil salon : nom, adresse, horaires, prestations). Onboarding absent, sautable vers du vide, ou qui ne crée rien = `FAIL`.
4. **Dashboard d'arrivée** — il doit être **non-vide** : il reflète l'entité créée à l'étape 3. Toute liste encore vide porte un **empty state avec CTA**. Dashboard vide ou générique après onboarding = `FAIL`.
5. **Job cœur — EN SESSION AUTHENTIFIÉE RÉELLE** — accomplis le job principal du persona de bout en bout (ex. publier une prestation et recevoir une réservation de test), **dans la session ouverte par le flux OTP → mot de passe de l'étape 2** — jamais un état/URL seedé qui court-circuite l'auth. C'est ici que se joue **tout le cœur RLS-protégé** : voir le bloc dédié « **Cœur RLS-protégé — le parcours CONNECTÉ, prouvé** » plus bas (créer l'entité tenant, exécuter les actions scopées org/projet, jouer les deux rôles, prouver le cloisonnement). Une coquille qui « marche » sans que le persona **écrive vraiment sous son tenant** en session = démo creuse, pas un job cœur.
6. **Verdict d'ensemble** — tranche, preuve à l'appui : le produit fait-il « **pro et complet** » ou « **démo creuse** » ? (critères ci-dessous). « Démo creuse » = `FAIL` global, même si chaque écran isolé « marche ».

**Critères « pro et complet » vs « démo creuse » (binaires) :**
- Le persona atteint son but **sans aide** ni connaissance du code.
- L'entité cœur créée à l'onboarding **persiste** et alimente réellement le dashboard et les features (pas un formulaire décoratif).
- **Aucun écran vide sans CTA**, aucune page placeholder, aucune 404 par défaut du framework, aucun lien mort (footer légal inclus).
- **Zéro tuyauterie exemple du châssis** *(rejeu de la porte anti-scaffolding, `skills/12-build/references/integration-pass.md`)* : en parcourant **toute la nav** en persona, aucun **écran d'exemple** (entité `items`, dashboard/sidebar de démo), aucun **texte de dev** rendu (« à cloner », « entité exemple », « bloc CRUD »), aucun **lien de nav mort** — la nav est **dérivée des features livrées**, et **Facturation** n'apparaît que si le produit vend. Atterrir sur « Items — entité exemple à cloner » ou un lien « Facturation » → `/billing` en 404 = `FAIL` **bloquant**.
- Branding partout : `<title>`, favicon, og — jamais « SaaS Factory Template ».
- Le rendu passe la **checklist anti-slop + convergence** de `_shared/design-doctrine.md` (**19 points**, desktop + mobile), dont la **porte distinctiveness** au niveau produit : **(17) pas de convergence** — la direction ne ressemble ni à une recette non modifiée ni à un autre projet de l'usine (test anti-convergence : ne pourrait pas servir un autre métier tel quel) ; **(18) rationale par page** présent dans `DESIGN.md` **et tenu** par le rendu de chaque type de page ; **(19) `prefers-reduced-motion`** respecté.
- **Pages légales adaptées à la juridiction/langue** présentes — **conditionnées par `jurisdiction`/`locale`**, jamais « FR » en dur (🚨 source du champ : `_shared/state-schema.md` §locale/jurisdiction) : **FR** → mentions légales + confidentialité ; **US/EN** → Terms of Service + Privacy Policy ; **DE** → Impressum + Datenschutz ; **+ CGV / Terms of Sale si vente**. Un produit anglais avec **Terms + Privacy** = **conforme** — ne JAMAIS recaler au motif « mentions légales FR absentes » (faux-négatif). Liées dans le footer, zéro lien mort.

##### B · `landing` — le visiteur (landing conforme → CTA/waitlist → confirmation)
Le scénario commence à l'URL publique de la landing. **PAS de signup, PAS d'onboarding, PAS de dashboard, PAS d'entité cœur** — ils n'existent pas dans l'archétype (`_shared/archetypes/landing.md`). Ce qu'on prouve :
1. **Landing conforme** — la page charge, passe le **5-second test** (que vend ce site ? pour qui ? que fait le bouton ?) et la checklist `_shared/landing-playbook.md` (sections attendues, hiérarchie, zéro placeholder/lorem). Slop / section manquante = `FAIL`.
2. **CTA / waitlist fonctionne** — clique le CTA primaire, soumets le formulaire waitlist avec un email réaliste : la soumission **aboutit réellement** (réponse réseau **200**, pas un 500 avalé par un toast) et déclenche sa **confirmation** (message à l'écran **et**, si la boucle le prévoit, email de confirmation dans la **boîte sandbox** — `_shared/boucles-fermees.md`). CTA mort / waitlist qui n'enregistre rien = `FAIL` bloquant.
3. **Métadonnées & responsive** — `<title>`, favicon, **OG** corrects (aperçu de partage propre) ; rendu desktop + mobile sans casse ; anti-slop **+ porte distinctiveness** (`_shared/design-doctrine.md`, 19 points : pas de convergence, rationale par page tenu, reduced-motion).
4. **Légal adapté à la juridiction** — pages légales **conditionnées par `jurisdiction`/`locale`** (FR → mentions légales + confidentialité ; US/EN → Terms + Privacy ; DE → Impressum + Datenschutz), liées au footer, zéro lien mort. Une landing EN conforme **ne se recale jamais** au motif « mentions légales FR absentes ».
5. **Verdict** — « landing **pro et convaincante** » vs « **page creuse** » : le visiteur comprend l'offre **sans aide** et peut **agir** (CTA/waitlist fonctionnel). **Aucun flow auth/dashboard n'est attendu ni jugé.**

##### C · `automation` — le run (déclencheur → run → effet/idempotence → boucle fermée)
Headless : **pas d'UI produit à parcourir** (admin minimal au plus). Le faux-client agit par le **déclencheur réel** (cron simulé, webhook, invocation manuelle) et **observe l'effet à la source**, pas un écran (`_shared/archetypes/automation.md`). Ce qu'on prouve :
1. **Déclencheur** — provoque un run par le **vrai chemin d'entrée** (pas un appel interne contourné).
2. **Run exécuté + trace** — le run tourne jusqu'au bout ; **historique de run + logs** enregistrés (statut, horodatage, entrée/sortie). Run qui échoue en silence ou n'écrit aucun log = `FAIL`.
3. **Effet réel + idempotence** — l'effet attendu est **réellement produit** (ligne écrite / message posté / fichier généré, **vérifié à la source**, pas déduit) ; **re-jouer le même déclencheur ne double pas** l'effet (idempotence — clé/verrou). Effet absent, ou dupliqué au re-run = `FAIL` bloquant.
4. **Boucle fermée — non négociable** (`_shared/boucles-fermees.md`) : un run **réussi comme raté** **notifie/rapporte au propriétaire** (email/rapport/alerte selon le canal). Un worker qui **échoue en silence** n'est **pas** livrable = `FAIL` bloquant (rejeu de la porte 12/07 automation — `routing.md`).
5. **Verdict** — « automation **fiable et observable** » vs « **boîte noire muette** » : le propriétaire **sait** qu'un run a eu lieu **et avec quel résultat**, sans lire les logs à la main.

Verse le résultat dans le livret (`qa/test-booklet.md`, section « Parcours #0 » — **remplir le bloc de l'archétype du run**).

#### Boucles fermées — les DEUX rôles (obligatoire dès qu'une contrepartie existe)
> Doctrine : `_shared/boucles-fermees.md`. **Une action de valeur qui ne ferme pas sa boucle est un bug de spec**, pas un raffinement. Constat fondateur : le booking confirmait la résa **à l'écran** mais n'envoyait **aucun email** à la cliente et ne notifiait **jamais** le gérant.

Pour **chaque action de valeur** du workflow cœur (créer / modifier / annuler l'entité métier — résa, commande, demande, invitation…), le faux-client joue **successivement les deux rôles** et **vérifie la réception réelle** de chaque côté — jamais « l'écran confirme, donc c'est bon » :

1. **Rôle acteur** — accomplis l'action (ex. la cliente réserve). **Vérifie d'abord que l'action a RÉELLEMENT abouti** : la réponse réseau de l'endpoint/RPC est **200** (lis l'onglet réseau — pas un **500 avalé par un toast générique** ni une UI optimiste qui « confirme » sans écriture) **et l'entité est persistée** (elle réapparaît après refresh / côté contrepartie). Puis vérifie que l'acteur reçoit une **trace durable** : email de confirmation **dans la boîte sandbox** (Inbucket/Mailpit en local, boîte de test du provider en staging — `_shared/safety-rails.md` §2), pas seulement la page de confirmation (l'écran se ferme). `.ics` + lien annuler/déplacer si la boucle les prévoit. *(Action « confirmée à l'écran » mais 500 masqué / non persistée = `FAIL` bloquant — bug vécu : erreur SQL runtime dans `create_booking`, invisible au build.)*
2. **Rôle contrepartie** — bascule sur l'autre partie (ex. le gérant). Vérifie qu'elle est **notifiée** de l'action (email pro / notification in-app / webhook selon le type). Dès qu'une contrepartie existe (client↔gérant, demandeur↔valideur, invité↔propriétaire), cette vérification n'est **jamais** sautable.
3. **Réversibilité** — si l'action est annulable/modifiable, joue l'annulation **par la contrepartie** (ex. le salon annule) et vérifie que **l'acteur reçoit** l'avis. Puis l'inverse.
4. **Verdict par boucle** : réception prouvée des **deux** côtés = `PASS`. **Une boucle silencieuse** (email jamais reçu, contrepartie jamais notifiée, « TODO plus tard » dans le code) = **`FAIL` bloquant** — pas un `CONCERNS`. **La réception doit être IMMÉDIATE** : l'email/notification arrive dans la boîte sandbox **tout de suite** après l'action, **sans** avoir à déclencher un cron à la main. Si la boucle ne part **qu'en exécutant le cron** (`notification_jobs` reste `pending` après l'action), le **call-site d'envoi immédiat manque** dans le handler → `FAIL` bloquant (bug vécu Poser : `dispatchAppointmentJobs(id)` définie mais jamais appelée). Le cron ne doit porter QUE les rappels J-1 + le retry. Preuve : screenshot de la boîte sandbox / du centre de notifications.

Le **canal** varie honnêtement selon le type (email client / email pro / notification in-app / webhook interne), **jamais l'existence de la boucle** : la dérivation est **universelle** (public, interne, perso — `_shared/boucles-fermees.md`).

#### Cœur RLS-protégé — le parcours CONNECTÉ, prouvé (session réelle, deux rôles, cloisonnement) — **obligatoire, bloquant**
> 🚨 **Franchir l'auth ne suffit pas : il faut EXÉCUTER le cœur derrière l'auth.** Les bugs RLS / scoping / junction **ne surgissent QUE** pour un utilisateur **authentifié qui exécute les actions protégées** — jamais pour la coquille (landing + login) ni au build (`next build`/`tsc` ne voient ni `new row violates RLS policy for table orgs`, ni un parcours d'invitation injoignable). Ce bloc est la **répétition générale en staging de la recette live authentifiée (étape 17, `skills/17-deploy/references/live-qa.md` — « parcours 2 rôles », « smoke RLS », « chaque RPC exposée invoquée »)**. *(Finding fondateur {2026-07}, run AgencyDesk : produit compilé, landing + auth (signup OTP → mot de passe) vertes, mais la **1ʳᵉ action AUTHENTIFIÉE** cassait — `new row violates RLS policy for table orgs` PUIS `projects` — et un parcours d'invitation client était **injoignable** ; passés inaperçus parce que le parcours CONNECTÉ n'était **pas complété**.)*

Une fois la session ouverte par le flux OTP → mot de passe réel du Parcours #0 (§A, étape 2), le faux-client **reste connecté** et exécute **chaque action de valeur RLS-protégée** de **chaque rôle** :

1. **Créer l'entité tenant EN SESSION** — la création de l'org/workspace/tenant est **elle-même** une écriture RLS-protégée (souvent un `.insert().select()` : une policy `SELECT` qui re-requête sa propre table casse l'insert). Prouve : réponse **2xx** + **ligne écrite sous le bon tenant** (elle réapparaît après refresh), pas l'écran de confirmation. Un `new row violates RLS policy` ici = **`FAIL` bloquant** (bug vécu AgencyDesk `orgs` puis `projects`).
2. **Exécuter TOUTES les actions scopées org/projet EN SESSION** — chaque action de valeur protégée par le tenant (créer/lister/modifier/supprimer sous l'org, sous le projet, junction org↔membre, org↔projet…). Preuve d'effet par action : **2xx + ligne sous le bon tenant + boucle fermée `sent`** (renvoi § « Boucles fermées »). Une action qui « marche » **seulement** avec des lignes seedées en dur (voir règle ci-dessous) ne prouve **rien**.
3. **Les DEUX rôles, chacun par SON vrai flux d'accès** — dès qu'il y a contrepartie (agence↔client, demandeur↔valideur, invité↔propriétaire), joue **les deux** rôles, et **obtiens la session de chaque rôle par son vrai parcours d'acquisition** : rôle 1 par son onboarding réel ; rôle 2 (le client invité) par l'**invitation réellement reçue et acceptée** (le lien d'invitation doit être **joignable** — le bug AgencyDesk était précisément une invitation injoignable). L'invitation est **elle-même une action de valeur** : son parcours d'acquisition se **teste**, il ne se contourne pas.
4. **Cloisonnement PROUVÉ (refus cross-tenant)** — connecté sous le rôle A, tente de **voir et d'écrire** les données du tenant du rôle B (liste scopée d'un autre org, action sur une ligne d'un autre tenant, ID deviné). Attendu : **refus** (0 ligne visible / **4xx**), jamais une fuite. Un rôle qui **voit ou écrit** les données d'un autre tenant = **`FAIL` bloquant** (RLS deny-by-default non tenue — `skills/09-architecture/references/data-model.md`). Le pendant positif : sous son propre tenant, le rôle voit **et** écrit normalement (un cloisonnement qui refuse **tout le monde**, y compris le légitime, est cassé aussi).
5. **Verdict du cœur connecté** — les 4 preuves réunies pour chaque action de valeur : **2xx sous le bon tenant + ligne écrite sous le bon tenant + boucle `sent` + refus cross-tenant prouvé**. Tant qu'une action de valeur n'a pas ce quadruplet, le cœur n'est **pas** `PASS`.

> 🚨 **Règle dure — session/accès obtenus par le VRAI flux, jamais seedés en dur.** Un parcours qui « marche » seulement parce que la session, le tenant ou l'appartenance ont été **fabriqués hors flux** (lignes seedées, membership inséré à la main, session forgée pour **remplacer** le parcours qu'on est censé tester) = **`FAIL`** : c'est exactement le masque qui a caché l'invitation injoignable. La règle de séparation tient (le faux-client **ne code pas**, ne seede pas son propre chemin de valeur).

**Technique de session de test (réutilisable, documentée — même socle qu'en 17) :** obtenir la session par le **vrai flux OTP → mot de passe** est le défaut — code réellement reçu dans la **boîte sandbox** (Inbucket/Mailpit en local, boîte de test du provider en staging — `_shared/safety-rails.md` §2) puis saisi, `verifyOtp` qui ouvre la session, **mot de passe posé**, et retour prouvé en e-mail + mot de passe. Le **forçage par Admin API** (`createUser email_confirm:true` + `signInWithPassword`/génération de session) est un **repli borné** : il sert à **dresser la ligne de base d'un rôle déjà légitime** (gagner du temps sur un OTP déjà prouvé par ailleurs), **jamais à contourner le parcours d'acquisition qu'on teste** (une invitation acceptée doit venir du **vrai** lien, pas d'un membership forgé). Détail live : `skills/17-deploy/references/live-qa.md` + `agents/live-qa.md`.

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
| **Départ en milieu de produit** | Le test commence sur une URL interne, avec un compte pré-créé, un OTP contourné, ou un run déclenché par un appel interne | Parcours #0 obligatoire, **dans la forme de l'archétype** : `web-saas` → landing publique + compte neuf + code OTP **réellement reçu et saisi puis mot de passe posé** ; `landing` → URL publique réelle (pas d'auth) ; `automation` → **vrai déclencheur** (pas d'appel interne contourné). |
| **Coquille validée, cœur jamais exécuté** | Landing + signup (OTP → mot de passe) vert → `PASS`, sans avoir écrit une seule ligne sous le tenant en session | Franchir l'auth ≠ tester le cœur. **Reste connecté** et exécute **chaque action RLS-protégée** (créer l'entité tenant, actions org/projet) : les bugs `new row violates RLS policy` / scoping / junction **ne sortent qu'en session** (bloc « Cœur RLS-protégé »). |
| **Session/accès seedés en dur** | Le parcours « marche » parce que session, tenant ou membership ont été fabriqués hors flux (lignes seedées, invitation contournée, session forgée en remplacement du parcours testé) | `FAIL` : c'est le masque qui a caché l'**invitation injoignable** (AgencyDesk). Session par le **vrai flux OTP → mot de passe** ; second rôle par l'**invitation réellement reçue**. Admin API = repli borné pour une base légitime, jamais pour contourner le flux d'acquisition qu'on teste. |
| **Cloisonnement jamais testé** | Un seul tenant joué → `PASS`, la fuite cross-tenant invisible | Sous le rôle A, tente de **voir/écrire** les données du tenant B (ID deviné, liste d'un autre org) : une fuite = `FAIL` bloquant (RLS deny-by-default). Preuve du **refus**, pas seulement du succès légitime. |
| **Complétude jugée à la somme des écrans** | « Chaque feature marche » alors que l'ensemble fait démo creuse (dashboard vide, entité cœur jamais créée) | Le verdict « pro et complet » vs « démo creuse » est un critère **à part entière** : juge le produit entier, pas la somme des écrans. |
| **Boucle muette validée sur l'écran** | « La résa est confirmée à l'écran » → `PASS`, sans avoir ouvert la boîte sandbox ni le rôle contrepartie | Joue les **deux rôles**, **ouvre la boîte de réception** : boucle non reçue d'un côté = `FAIL` bloquant (`_shared/boucles-fermees.md`). |
| **Tuyauterie exemple survivante** | En parcourant la nav, le persona atterrit sur l'entité `items` (« à cloner »), un dashboard/sidebar d'exemple, ou un lien de nav mort (« Facturation » → `/billing` 404) — le shell châssis a survécu au build (finding « Poser ») | Parcours **toute la nav** en persona : écran d'exemple / texte de dev (« à cloner », « entité exemple ») / 404 = `FAIL` **bloquant** — rejeu de la porte anti-scaffolding (12, `integration-pass.md`), re-prouvé en live (17). |
