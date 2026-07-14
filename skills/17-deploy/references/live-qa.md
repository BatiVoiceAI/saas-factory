# Référence — Recette live AUTHENTIFIÉE & boucle de correction (étape 17, après canary)

> **Conditionnement par archétype (trois formes sœurs du contrôle 17b).** Ce fichier porte la recette **`web-saas`** — **AUTHENTIFIÉE** (franchir l'auth + exécuter chaque action RLS-protégée de chaque rôle), détaillée d'abord ci-dessous. Pour **`ecommerce`**, la recette live prend sa **forme propre** — l'**achat de test réel de bout en bout** (Stripe mode test) en **§Variante ECOMMERCE** (fin de fichier) : mêmes exigences (preuve réelle sur la **prod**, boucle de correction **3 cycles**, jamais de « livré » sur un faux vert), cible différente (le **tunnel d'achat + webhook Stripe** au lieu de l'action RLS-protégée). Pour **`automation`** (headless, sans auth ni RLS produit), elle est **remplacée** par la **vérif de boucle fermée headless** → `automation-deploy.md`. S'inscrit dans le routage 17b de `phase-5-launch/references/routing.md` règle 7 (formes sœurs par archétype).

> **Pourquoi.** Le canary (santé) dit « le site répond ». La recette live dit « **le produit marche** ». Mais « marche » a un **niveau minimal non négociable** : **franchir l'auth et exécuter chaque action de valeur RLS-protégée** — parce que **les bugs qui échappent au build ne surgissent QUE là**. Le fondateur non-tech récupère quelque chose de **réellement fonctionnel** — c'est la dernière porte de qualité, sur la **prod réelle**. Un déploiement dont la recette authentifiée n'est pas passée n'est **pas** une livraison.

> **La hiérarchie de preuve — trois niveaux, un seul compte.**
> **santé (canary)** *(le site répond)* **< route 200** *(nécessaire, jamais suffisant)* **< feature exécutée AUTHENTIFIÉE + RLS + boucle fermée** *(la VRAIE preuve).*
> Le canary et la route 200 se franchissent **sans jamais toucher une policy RLS ni une RPC `security definer`** : ils passent alors même que la 1ʳᵉ action authentifiée casse. **C'est CE niveau — l'action de valeur exécutée par une session utilisateur réelle — qui manquait**, et c'est exactement là que vivent les bugs vécus (« new row violates RLS policy for table `orgs` » à la création d'org, puis `projects` ; parcours d'invitation client injoignable) : ils **ne se déclenchent que pour un utilisateur AUTHENTIFIÉ qui exécute les actions protégées**. `tsc`/`next build`/canary ne les voient jamais.

> **Principe cardinal — « route 200 ≠ feature qui marche », et « feature qui marche » = feature exécutée SOUS SESSION UTILISATEUR RÉELLE.** La recette n'est **PASSÉE** que si **chaque feature Must du PRD** (`product/features/*`), pour **chaque rôle**, a été **EXÉCUTÉE de bout en bout sur la prod réelle avec un JWT user-scopé** (qui touche les **vraies policies RLS** + les **RPC `security definer`** déployées), avec sa **preuve d'effet** (2xx **+ ligne écrite sous le bon tenant** + notification `sent` immédiate + **refus cross-tenant prouvé**), et qu'elle **échoue bruyamment** à la moindre erreur. « Déployé + build vert + route 200 » ne vaut **jamais** livraison.

## Sommaire

- Séquence
- 1. Dispatch du live-QA (contrat)
- 2. Session de test authentifiée sur la prod — technique réutilisable (les DEUX méthodes)
- 3. Recette AUTHENTIFIÉE — exécuter chaque action RLS-protégée de chaque rôle
- 4. Boucle de correction — budget **3 cycles**
- 5. Matrice par type de projet
- 6. DoD de la recette
- Modes d'échec
- **Variante ECOMMERCE — recette live = achat de test réel A→Z** (Stripe mode test · P1/P2/P3 prouvés sur la prod)

## Séquence
```
canary OK ──> forger/obtenir session(s) user-scopée(s) (§2) ──> dispatch agents/live-qa.md
                     ▲                                                 │
                     │ re-test des KO                                  ▼   exécute CHAQUE action RLS-protégée
              redeploy (même pipeline)  <── correctifs   <──   rapport (deploy/live-qa-report.md)
                     │                       (si échecs)          multi-rôles + refus cross-tenant
   3 cycles max ─────┴──> tout PASS → livraison ; sinon → rollback (cœur cassé) / consignation honnête
```

## 1. Dispatch du live-QA (contrat)
Prompt de délégation : **URL prod**, PRD + `product/features/*` (fiches Must — **l'agent en dérive la liste des actions RLS-protégées à exécuter par rôle**, § Critères + § Volet technique : entités **tenantées**, actions, **RPC exposées `security definer`**), `qa/test-booklet.md` (cas déjà validés en local — rejoués **authentifiés** sur prod), **type de projet + `tenancy`** (`single`/`multi-org` — cf. `_shared/state-schema.md §tenancy`), **la liste des rôles** et leurs contreparties (client↔agence, demandeur↔valideur), rappel accès `~/.saas-factory/.env` (**`SUPABASE_SERVICE_ROLE_KEY`** pour forger la session + vérifier en base, **`SUPABASE_ANON_KEY`** pour le contexte user-scopé, clé Resend) et règles de données de test (`+liveqa@`, préfixe `[test]`, nettoyage). L'agent **franchit réellement l'auth** (§2), puis **exécute chaque action de valeur RLS-protégée de chaque rôle** et prouve son effet — pas une check-list générique :
- **routes** (nécessaire, jamais suffisant — aucune ne prouve une feature) ;
- **OTP → mot de passe réel** : email de code parti (Resend `sent`) **+ code de la BONNE LONGUEUR** (= input châssis, invariant `mailer_otp_length`) **+** `verifyOtp` ouvre une session **+** `updateUser` pose le mot de passe **+** le retour `signInWithPassword` (e-mail + mot de passe) ré-ouvre une session (**plus de magic link**) ;
- **chaque action de valeur exécutée SOUS SESSION user-scopée** : endpoint/RPC réel appelé (ex. `create_booking`, `createInvitation`) → **2xx + la ligne en base sous le bon tenant** ;
- **chaque RPC/fonction Postgres exposée** invoquée ≥ 1× **avec un JWT utilisateur** → **0 erreur SQL runtime** (`42702`, violation RLS, grant) ;
- **refus cross-tenant prouvé** : le rôle A **ne lit ni n'écrit** les données du tenant B (RLS = 0 fuite) ;
- **boucles fermées** (statut Resend `sent`, **immédiat**) ; **multi-rôles obligatoire** dès qu'il y a contrepartie ; **smoke RLS/cron** ;
- **zéro tuyauterie exemple sur la prod** *(miroir de la porte anti-scaffolding 12)* : `/items` → **404**, aucun écran d'exemple atteignable, **aucun lien de nav mort** (chaque `href` de la nav → route 200) ;
- si `type ≠ public` — **refus du signup anonyme + `noindex` + redirection de bord** (cf. matrice).

Détail exécutable (les deux méthodes de session, l'exécution RLS-protégée par rôle, la preuve d'effet + refus cross-tenant) dans `agents/live-qa.md`.

## 2. Session de test authentifiée sur la prod — technique réutilisable (les DEUX méthodes)
**Le cœur de la recette.** On ne peut pas prouver qu'une action RLS-protégée marche sans **une vraie session utilisateur qui touche la policy**. Il faut donc **posséder une session valide sur la prod**, pour **chaque rôle**. Deux méthodes, **documentées et réutilisables** — choisir selon l'accès disponible ; les deux frappent la **prod déployée**.

| | **Méthode A — OTP réellement complété** | **Méthode B — session forgée via l'Admin API** |
|---|---|---|
| **Principe** | jouer le **vrai** flux **OTP → mot de passe** de bout en bout (code de vérif → session → pose du mot de passe → retour e-mail + mot de passe) | enrôler + confirmer le compte par le service_role, sans e-mail |
| **Étapes** | 1. `signInWithOtp(email)` (compte `+liveqa@`). 2. **Lire le code émis** : boîte sandbox **Inbucket** (Supabase local `:54324`) / **Mailpit** en staging, **ou** corps de l'e-mail via l'**API Resend** en prod (envoi réel), **ou** `properties.email_otp` de `auth.admin.generateLink`. 3. `verifyOtp({ email, token, type:'email' })` par le **chemin réel** du châssis (`lib/auth/actions.ts`) → session. 4. `updateUser({ password })` pose le mot de passe. 5. **Retour réel** : déconnexion puis `signInWithPassword({ email, password })` → session ré-ouverte (le vrai chemin de connexion — **plus de magic link**). | 1. `auth.admin.createUser({ email, password, email_confirm: true })` (service_role). 2. `auth.signInWithPassword({ email, password })` **avec la clé ANON** → **JWT user-scopé**. *(Variante pour lire le code : `auth.admin.generateLink({type:'signup'|'magiclink'})` → `properties.email_otp` : on récupère le CODE, jamais le lien.)* |
| **Ce que ça prouve en plus** | prouve **tout le flux d'inscription** (email de code parti, bonne longueur, `verifyOtp` → session, mot de passe posé, retour e-mail + mot de passe) — à privilégier au moins **une fois** par run | rapide, déterministe, multi-rôles à volonté — pour **peupler les rôles** et les contreparties (agence + N clients) |
| **Sortie** | `access_token` **user-scopé** | `access_token` **user-scopé** |

🚨 **Invariant qui rend la recette VRAIE : les actions de valeur se jouent avec le JWT USER-SCOPÉ, JAMAIS le service_role.** Le service_role **bypasse RLS** → il rendrait **tout vert** et masquerait précisément le bug (« new row violates RLS policy »). On utilise le service_role **uniquement** pour (a) **forger/enrôler** la session (méthode B) et (b) **vérifier hors-bande** l'effet en base (la ligne existe **sous le bon tenant**, et **0 ligne** sous un autre — la preuve du refus cross-tenant côté données). Toute action de valeur = **clé anon + `Authorization: Bearer <access_token>` de l'utilisateur** (ou le client châssis authentifié), qui **traverse les vraies policies RLS** et les RPC `security definer`. Une recette jouée en service_role = **faux vert** (voir Modes d'échec).

**Multi-rôles = forger UNE session PAR rôle** (ex. agence `owner` + client invité), et si `tenancy=multi-org`, **au moins deux tenants** (org A, org B) pour pouvoir prouver le refus cross-tenant. Si un rôle n'est atteignable que **par invitation** (client invité par l'agence), la recette doit **jouer le vrai parcours d'enrôlement** (`createInvitation` → acceptation) — un parcours d'invitation **injoignable** empêche de tester le rôle = **bloquant** (bug vécu, cf. Modes d'échec).

## 3. Recette AUTHENTIFIÉE — exécuter chaque action RLS-protégée de chaque rôle
Avec la/les session(s) du §2, l'agent **exécute réellement**, sur la prod, **chaque action de valeur de chaque rôle** dérivée des fiches Must. Exemple type (agence ↔ client) :
- **rôle agence** (`owner`) : créer l'**org** → créer un **projet** → **partager** au client → **demander validation** → **facturer** ;
- **rôle client** (invité) : **voir SES projets** (et **seulement** les siens) → **approuver** → **payer**.

**Preuves obligatoires — pour CHAQUE action, les quatre :**
1. **2xx** sur l'endpoint/RPC réel (statut réseau lu, pas « l'écran confirme »).
2. **Ligne écrite sous le bon tenant** — vérifiée hors-bande au service_role : la ligne existe **avec le bon `org_id`/`owner`** (le tenant **dérivé de la session**, jamais du client — cf. `09-architecture/references/edge-cases.md E5`).
3. **Notification `sent` immédiate** — la boucle fermée de l'action est livrée **dans les secondes** (`notification_jobs.status = sent` + Resend `sent`/`delivered`), **avant** qu'aucun cron n'ait tourné (`_shared/boucles-fermees.md` — même exigence d'immédiateté qu'en 14-QA, ici rejouée sur la prod).
4. **Refus cross-tenant prouvé** — avec la session du **rôle/tenant A**, tenter de **lire** ET **écrire** une ressource du **tenant B** → **refus RLS** (0 ligne lue, écriture rejetée). La preuve que **RLS ne fuit pas** : un rôle ne voit/écrit jamais les données d'un autre. Une fuite (A lit une ligne de B, ou A écrit sous le tenant de B) = **bloquant**.

**Contrepartie (multi-rôles) obligatoire dès qu'elle existe** (client↔agence, demandeur↔valideur, invité↔propriétaire) : on ne prouve pas une boucle en jouant un seul côté. On exécute l'action côté A **et** on vérifie l'effet perçu côté B (le client voit le projet partagé ; le valideur reçoit la demande ; le refus cross-tenant tient dans les deux sens).

## 4. Boucle de correction — budget **3 cycles**
Pour chaque échec du rapport, dans l'ordre bloquant → majeur → mineur :
1. **Fix minimal** dans le repo (correctif ciblé ; si structurel — ex. policy RLS récursive, helper `security definer` manquant → dispatch `feature-dev` avec le repro du rapport comme critère d'acceptation).
2. **Gate local** : `tsc` + `next build` verts — jamais de redeploy d'un build rouge. *(Rappel : le build ne verra pas le bug RLS — seul le re-test authentifié le prouvera corrigé.)*
3. **Redeploy** par le même pipeline (commit → promotion). *Pas de nouvelle porte utilisateur : le feu vert de publication (porte 3) couvre les correctifs de recette tant que le périmètre produit ne change pas — c'est de la réparation, pas une nouvelle publication.*
4. **Re-test AUTHENTIFIÉ** : le live-QA rejoue **les items KO + le parcours connecté cœur** (non-régression), **sous session user-scopée**. Un fix qui casse autre chose = échec du cycle.

**Un maillon connecté cassé = recette ÉCHOUÉE (bloquant).** Tant qu'une action de valeur RLS-protégée d'un rôle échoue (2xx manquant, ligne absente/sous le mauvais tenant, notif restée `pending`, fuite cross-tenant, contrepartie injoignable), la recette **n'est pas passée** — pas de « couverture partielle » silencieuse.

**Épuisement du budget (3 cycles)** — honnêteté :
- **Bloquant subsiste** (cœur connecté cassé, RLS qui fuit ou qui refuse une action légitime) → **rollback** (`canary-rollback.md`) : re-promotion N-1, sinon dépublication → preview privée. Jamais un produit au cœur cassé — ni **fuyant** — entre les mains du fondateur.
- **Majeur/mineur subsiste** → le produit **reste en ligne**, l'échec est consigné (`deploy/live-qa-report.md` + `deploy/log.md` `[CONCERNS]`) et devient tête de backlog Phase 6. **Dit au fondateur, jamais silencieux.**

## 5. Matrice par type de projet
| Test | SaaS public | Outil interne | Outil perso |
|---|---|---|---|
| Routes + metadata + légal | ✅ tout | ✅ (légal N/A) | statuts seulement |
| **Session authentifiée forgée (§2) + action RLS-protégée exécutée** | ✅ **par rôle** | ✅ **par rôle interne** | ✅ (1 rôle min.) |
| Parcours cœur connecté 2 rôles | ✅ | ✅ (rôles internes) | ✅ 1 rôle (2 si contrepartie) |
| OTP réel + email Resend | ✅ | ✅ | ✅ (léger) |
| **Refus cross-tenant prouvé** | ✅ (dès qu'il y a ≥ 2 tenants/rôles) | ✅ (cloisonnement interne) | si multi-données/multi-tenant |
| **Signup anonyme refusé + noindex** | N/A (signup ouvert) | ✅ **preuve** : 0 ligne `auth.users` + `X-Robots-Tag: noindex` + redirection de bord | ✅ **preuve** (idem) |
| Boucles fermées **immédiates** | ✅ toutes (email client) | ✅ **toutes** (canal adapté : email pro / in-app — dès contrepartie, boucle testée) | ✅ dérivées par action (trace toujours ; email si échéance/contrepartie) |
| Smoke RLS/cron | ✅ | ✅ | si multi-données |
| Mobile + desktop | ✅ | desktop d'abord | selon usage |

## 6. DoD de la recette
- [ ] **Session authentifiée user-scopée obtenue sur la prod, PAR RÔLE** (§2, méthode A ou B) — **jamais** les actions de valeur en service_role. Multi-rôles dès qu'il y a contrepartie ; ≥ 2 tenants si `tenancy=multi-org`.
- [ ] **Chaque feature Must du PRD** (`product/features/*`), **pour chaque rôle**, a une **ligne de couverture** dans `deploy/live-qa-report.md` : *rôle + scénario exécuté sous session + verdict + preuve d'effet*. Une Must absente, sans preuve d'exécution **authentifiée**, ou couverte pour un seul rôle alors qu'il y a une contrepartie = recette **non passée**.
- [ ] **Flux OTP → mot de passe prouvé de bout en bout** (au moins une fois, méthode A) : email de code parti (Resend `sent`/`delivered`) ; **code de la bonne longueur** (invariant `mailer_otp_length`, cf. `agents/provisioner-db.md`) ; `verifyOtp` ouvre une session ; `updateUser` pose le mot de passe ; **le retour `signInWithPassword` (e-mail + mot de passe) ré-ouvre une session** (plus de magic link).
- [ ] **Chaque action de valeur exécutée SOUS SESSION user-scopée** : endpoint/RPC réel appelé → **2xx + ligne écrite sous le bon tenant** (vérif service_role hors-bande) — pas « la page de confirmation s'affiche ».
- [ ] **Chaque RPC/fonction Postgres exposée invoquée ≥ 1× avec un JWT utilisateur** → **0 erreur SQL runtime** (`42702`, violation RLS, grant) sur les chemins exposés.
- [ ] **Refus cross-tenant prouvé** : depuis le rôle/tenant A, **lecture ET écriture** d'une ressource du tenant B → **refus RLS** (0 fuite), dans **les deux sens** de la contrepartie.
- [ ] **Zéro tuyauterie exemple sur la prod réelle** : `/items` → **404**, aucun lien de nav mort, aucun texte de dev rendu — miroir de la porte anti-scaffolding (12), rejouée sur la prod.
- [ ] Boucles fermées **prouvées ET immédiates** : après chaque action de valeur, notification (acteur + contrepartie) `sent` côté Resend **dans les secondes** — donc **avant** qu'aucun cron n'ait tourné. Job resté `pending` (livré au prochain cron quotidien) = **bloquant** (call-site d'envoi immédiat manquant). Vérifier le **statut Resend** **et** `notification_jobs.status = sent` tout de suite après l'action.
- [ ] **(interne/perso) Signup anonyme refusé — prouvé sur la prod réelle** : e-mail aléatoire non enrôlé → **0 compte créé** (`auth.users`) + **0 OTP** (Resend) ; `X-Robots-Tag: noindex` présent ; visiteur non authentifié redirigé vers `/login`. Miroir §F (`preflight-checklist.md`), rejoué sur la **prod**, avec preuve.
- [ ] Données de test **nettoyées** (aucun `+liveqa@` / `[test]` résiduel — comptes `auth.users` **et** lignes métier des tenants de test).
- [ ] **0 bloquant** ; majeurs/mineurs restants **consignés et annoncés**.
- [ ] `.saas-factory/state.md` : `recette_live: PASS` (ou `PASS_WITH_CONCERNS` + liste).

## Modes d'échec
| Mode | Symptôme | Traitement |
|---|---|---|
| **Recette jouée en service_role (faux vert RLS)** | tout passe parce que les actions ont été exécutées avec la clé service_role, qui **bypasse RLS** → la 1ʳᵉ action d'un vrai utilisateur casserait (« new row violates RLS policy ») mais la recette ne l'a jamais vu | **rejouer avec le JWT user-scopé** (§2) : clé anon + `Authorization: Bearer <access_token>`. Le service_role ne sert qu'à forger la session et vérifier en base. Une recette qui n'a pas traversé une seule policy RLS = **non passée** |
| **RLS refuse une action légitime (`INSERT … .select()`)** | la création d'une ressource tenantée (org, projet) renvoie « **new row violates RLS policy for table `orgs`** » alors que l'utilisateur en a le droit — la **policy `SELECT` re-requête sa propre table** (ex. « membre de l'org »), or au moment du `RETURNING` de `.insert().select()` l'appartenance **n'existe pas encore** → le `SELECT` échoue et fait échouer l'`INSERT` (bug vécu AgencyDesk : `orgs` puis `projects`) | **bloquant** → fix structurel : passer par un **helper `security definer` anti-récursion** (`current_org_ids`/`is_org_member`, cf. `_shared/blocks/web-saas/CONVENTIONS.md §13` + `09-architecture/references/data-model.md`) ou une **RPC `security definer`** qui crée l'org **et** l'appartenance atomiquement, plutôt qu'un `.insert().select()` nu re-évalué sous la policy `SELECT`. Re-test authentifié jusqu'au vert |
| **Fuite cross-tenant** | le rôle/tenant A **lit ou écrit** une ligne du tenant B (RLS absente sur une table tenantée, `using` trop large, ou `tenant_id` pris du client) | **bloquant** → RLS deny-by-default, `org_id`/`tenant_id` **dérivé de la session** jamais du client (`edge-cases.md E5`). Re-prouver le refus dans les deux sens |
| **Contrepartie injoignable** | le rôle client n'existe que par invitation, mais le **parcours d'invitation est cassé** (`createInvitation` KO, lien d'acceptation mort) → impossible d'enrôler la contrepartie, donc impossible de tester son parcours connecté (bug vécu AgencyDesk : invitation client injoignable) | **bloquant** : une contrepartie non enrôlable = un pan du produit non prouvé. Fixer le parcours d'enrôlement, puis forger la session du rôle invité et jouer ses actions RLS-protégées |
| Recette « à l'écran » | verdict sans preuve (pas d'ID Resend, pas de ligne DB, pas de statut réseau) | rejeter le rapport, re-tester — l'écran ment (résa coiffeur : confirmation affichée, **zéro email parti**) |
| **OTP passe mais code de mauvaise longueur** | session ouverte via un raccourci (`generateLink`) mais l'e-mail contient un code à `8` chiffres qu'aucun utilisateur ne peut saisir dans l'input à `6` cases (défaut Supabase ≠ input châssis) | **mesurer la longueur du vrai code émis** (corps Resend / `properties.email_otp`) et exiger `verifyOtp` par le chemin réel — longueur ≠ input châssis (`mailer_otp_length`) = **bloquant** ; ne jamais valider l'OTP sur la seule existence d'une session |
| **RPC 500 masqué** | la page « confirme » l'action mais l'endpoint/RPC (ex. `create_booking`) renvoie un **500** avalé par un message générique ou une UI optimiste — erreur SQL runtime (`42702` colonne ambiguë, RLS, grant) invisible à `tsc`/`next build` | **appeler l'endpoint/RPC réel sous session utilisateur** et exiger **2xx + la ligne en base** ; lire le statut réseau/console — un 500 masqué = **bloquant** (cf. `_shared/lessons.md #15` pour `42702`) |
| Fix-ping-pong | un cycle re-casse ce qu'un cycle précédent a réparé | stop, rollback ou consignation — ne jamais dépasser le budget « pour finir » |
| Données de test orphelines | `[test]` / comptes `+liveqa@` visibles par de vrais utilisateurs | le nettoyage (comptes `auth.users` **et** lignes tenantées) fait partie du DoD, pas une politesse |
| Faux vert par autoconfirm | OTP « passe » parce que l'email n'est pas vérifié en vrai | toujours vérifier le **statut Resend** de l'email, pas seulement la session |
| **Confirmation différée au cron** | après une action, le job de confirmation reste `pending` et n'est envoyé qu'au **prochain cron quotidien** (contrepartie sans notif ~24 h) — la fonction d'envoi ciblé existe mais n'est **pas appelée** au site de l'action (finding « Poser » : `dispatchAppointmentJobs` définie, jamais invoquée) | mesurer l'**immédiateté** : juste après l'action, `notification_jobs.status` = `sent` (pas `pending`) et l'email `sent`/`delivered` **dans les secondes**. Différé au cron = **bloquant** → câbler le call-site d'envoi immédiat dans le handler (`_shared/boucles-fermees.md`) |
| « Privé » resté ouvert | un e-mail inconnu crée un compte / atteint le dashboard sur un `interne`/`perso` | `disable_signup` non posé **ou** `APP_ACCESS_MODE` resté `public` en env host → retour 11-project-setup / config env + re-preuve ; ne jamais livrer un interne ouvert (P0.5) |

## Variante ECOMMERCE — recette live = achat de test réel A→Z

> **Conditionnement.** S'applique **quand `archetype = ecommerce`** (socle EC1-EC5, pièges P1-P3 — `_shared/archetypes/ecommerce.md`). Elle **ne remplace pas** la machine à états du déploiement ni le canary : elle est la **forme ecommerce du contrôle bloquant de fin de phase (17b)**, sœur de la recette AUTHENTIFIÉE (web-saas, ci-dessus) et de la boucle fermée headless (`automation-deploy.md`). La rigueur est **identique** (preuve réelle sur la prod, boucle de correction **3 cycles**, jamais de « livré » sur un faux vert) ; ce qui change, c'est **quoi on exécute** : le **tunnel d'achat + le webhook Stripe**, pas l'action RLS-protégée d'un rôle.

> **Pourquoi.** Route 200 + canary disent « la vitrine répond ». Ils ne disent **rien** des trois pièges qui cassent une boutique en prod et **ne se voient pas au build** : **survente** (P1), **prix falsifié** (P2), **doublon de commande au rejeu webhook** (P3). Ces bugs ne surgissent **QUE** sur un **achat réel** qui frappe le **vrai webhook Stripe de la prod** — `tsc`/`next build`/canary ne les déclenchent jamais. La recette ecommerce n'est PASSÉE que si un **achat de test réel de bout en bout** a produit **une commande unique + un stock décrémenté atomiquement + les deux emails de boucle fermée**, et que **P1, P2 et P3 sont prouvés sur la prod**.

> **Hiérarchie de preuve — ecommerce.** santé (canary) *(la vitrine répond)* **<** vitrine + fiche produit à 200 *(nécessaire, jamais suffisant)* **<** **achat réel complet A→Z** *(webhook Stripe → commande créée **une seule fois** + stock décrémenté **atomiquement** + emails client & marchand `sent`)* — **seul le 3ᵉ niveau vaut preuve**.

### Prérequis prod (avant le premier achat de test — bloquants)
- **Stripe en mode TEST** : clés **test** actives (JAMAIS les clés live — un achat de test ne débite personne), paiement avec la carte test **`4242 4242 4242 4242`** (date d'expiration future, CVC quelconque). Toujours `mode:payment` — **jamais** `subscription` (différence dure avec le bloc billing web-saas).
- **Webhook Stripe branché sur la prod** : endpoint `https://<domaine-custom>/api/stripe/webhook` **enregistré chez Stripe** + **signing secret** (`STRIPE_WEBHOOK_SECRET`) posé en env prod **et vérifié dans le handler**. Sans lui, le webhook n'arrive pas ou sa signature est rejetée → **la commande n'est jamais créée** (la source de vérité reste muette) = bloquant.
- **Domaine custom sert la vitrine** (sous-domaine + DNS Cloudflare) — **jamais `*.vercel.app`** (règle projet). Le checkout (`success_url`/`cancel_url`) **et** l'endpoint webhook pointent le **domaine custom**, pas l'URL provider par défaut.
- **Emails depuis le domaine vérifié** : `From` = domaine Resend **vérifié** (SPF/DKIM publiés), sinon la confirmation client part en spam ou est rejetée.

### Séquence
```
canary OK ──> prérequis prod (webhook signé · domaine custom sert la vitrine · From vérifié)
                     ▲                                              │
                     │ re-achat de test                             ▼   achat de test réel A→Z (Stripe test, carte 4242…)
              redeploy (même pipeline) <── fix <── commande 1× (P3) · stock −1 atomique (P1) · prix serveur (P2) · emails client+marchand (EC4)
                     │                    (si KO)
   3 cycles max ─────┴──> P1 ∧ P2 ∧ P3 prouvés sur la prod → cutover VALIDÉ ; sinon → cutover NON validé (rollback / consignation honnête)
```

### L'achat de test réel — étapes (chacune : une **preuve**, pas « l'écran confirme »)
1. **Vitrine + fiche produit (EC1)** — la liste et la **fiche d'un produit publié** se chargent **sur le domaine custom** (prix réel, disponibilité). Route 200 nécessaire, jamais suffisante. Relever le **`stock_avant`** du produit (vérif service_role hors-bande).
2. **Panier (EC2)** — ajouter le produit → le panier reflète quantité + **sous-total recalculé côté serveur** (jamais un total envoyé par le client).
3. **Checkout Stripe mode test (EC3)** — lancer le checkout → session Stripe **`mode:payment`** → payer avec **`4242 4242 4242 4242`**. Le montant présenté est **recalculé serveur** depuis le catalogue (à partir des seuls `product_id` + quantités, `lib/pricing/`).
4. **Webhook prod → commande (EC4 / P3)** — Stripe livre `checkout.session.completed` (ou `payment_intent.succeeded`) à l'endpoint prod **signé** → **`orders` + `order_items` créés** (prix serveur **snapshoté**), statut `paid`. Vérif service_role : **exactement une** ligne sous `stripe_session_id`.
5. **Stock décrémenté atomiquement (EC5 / P1)** — après le webhook, **`stock_après = stock_avant − qty`**, décrément dans la **même transaction** que la commande (RPC atomique / `update … where stock >= :qty`). Vérif en base.
6. **Boucle fermée (EC4)** — **email de confirmation au client** (Resend `sent`/`delivered` **dans les secondes**, `From` = domaine vérifié) **ET** **notification au marchand** (nouvelle commande). Aucune vente muette : lire le **statut Resend**, pas « la page /merci s'affiche ».

### Les 3 pièges — **prouvés sur la PROD** (le cœur de la recette, non négociable)
- **P3 — commande créée UNE SEULE FOIS (idempotence webhook).** **Rejouer le même événement** (dashboard Stripe → *Resend*, ou `stripe events resend <id>`) → **0 doublon** (`on conflict do nothing` sur `stripe_session_id`) **et stock NON re-décrémenté**. *(Miroir exact du rejeu de tick d'automation : rejouer le déclencheur produit **le même effet**, 0 double effet — `automation-deploy.md` §boucle fermée headless.)*
- **P1 — décrément atomique / anti-survente.** Le stock passe de N à N−1 **une seule fois**, **jamais** un `SELECT stock` puis `if stock>0 then INSERT`. Renforcé quand faisable : **deux checkouts concurrents** sur le **dernier** article → **un seul** aboutit, l'autre est **refusé (rupture)** — jamais deux commandes livrables.
- **P2 — intégrité du prix, EN LIVE.** Rejouer le checkout avec un **panier au prix altéré** (payload `price: 0.01` / total minoré) → le serveur **recalcule/rejette** : le montant facturé par Stripe = le **prix catalogue serveur**, jamais le prix client ; la ligne de commande **snapshote le prix serveur payé**. Une commande **payée au prix minoré = bloquant**.

*(Secondaire — **si comptes clients** : RLS « mes commandes » — un client authentifié ne lit **QUE ses** commandes, jamais celles d'un autre (miroir du refus cross-tenant web-saas). Le **checkout invité** étant le défaut e-commerce, cette preuve est **conditionnelle** à l'existence de comptes.)*

### Boucle de correction — budget **3 cycles** (identique)
Pour chaque échec (bloquant → majeur → mineur) : **fix minimal** dans le repo → **gate local** (`tsc` + `next build` verts, jamais de redeploy d'un build rouge) → **redeploy** par le même pipeline → **re-achat de test** : rejouer **le tunnel complet + le rejeu webhook** (non-régression). Un fix qui casse autre chose = échec du cycle. Épuisement du budget : **bloquant subsistant** (survente, doublon, prix minoré, vente muette, webhook mort) → **rollback** (`canary-rollback.md`) — jamais une boutique qui **survend / double-facture / se fait minorer les prix** entre les mains du fondateur ; **majeur/mineur** → produit en ligne, échec **consigné** (`deploy/live-qa-report.md` + `deploy/log.md` `[CONCERNS]`) et **annoncé**.

### Condition de validation du cutover
🚨 **Un seul de P1 / P2 / P3 non prouvé sur la prod réelle = cutover NON validé** (miroir strict du critère d'acceptation `_shared/archetypes/ecommerce.md` § Critères d'acceptation : « Un seul de P1/P2/P3 non prouvé = porte fermée »). « Déployé + vitrine à 200 » ne vaut **jamais** livraison : la livraison exige un **achat de test réel propre** — commande **1×**, stock **−1 atomique**, **prix serveur**, **emails client + marchand** partis — et les **trois pièges prouvés**.

### DoD — recette ecommerce
- [ ] **Prérequis prod** vérifiés : webhook Stripe **signé** branché sur le domaine custom · **domaine custom** sert la vitrine (pas `*.vercel.app`) · `From` = domaine **vérifié**.
- [ ] **Achat de test réel A→Z** passé sur la prod (Stripe mode test, carte 4242) : panier → checkout → webhook → commande `paid`.
- [ ] **P3** — rejeu du même événement webhook → **0 commande en double**, stock **pas re-décrémenté**.
- [ ] **P1** — stock décrémenté **atomiquement** (N→N−1 une fois) ; anti-survente prouvé si deux checkouts concurrents testables.
- [ ] **P2** — panier au **prix altéré** → **recalculé/rejeté** serveur ; montant Stripe = prix catalogue ; prix **snapshoté** sur la commande.
- [ ] **Boucle fermée (EC4)** — email **client** **ET** notif **marchand** `sent`/`delivered` **dans les secondes** (statut Resend lu), `From` = domaine vérifié.
- [ ] **(si comptes)** RLS commandes — un client ne voit **que** ses commandes.
- [ ] **Données de test nettoyées** — commandes `[test]`, comptes `+liveqa@`, produits de test, lignes d'inventaire de test.
- [ ] `.saas-factory/state.md` : `recette_live: PASS` (ou `PASS_WITH_CONCERNS` + liste) ; **cutover validé ssi P1 ∧ P2 ∧ P3 prouvés**.

### Modes d'échec — ecommerce
| Mode | Symptôme | Traitement |
|---|---|---|
| **Webhook muet / non signé** | l'achat « réussit » à l'écran mais **aucune commande** en base — endpoint prod non enregistré, mauvaise URL (`*.vercel.app`), ou `STRIPE_WEBHOOK_SECRET` absent → signature rejetée | **bloquant** → enregistrer l'endpoint sur le **domaine custom**, poser le signing secret en env prod, re-tester jusqu'à la commande `paid` créée |
| **Doublon de commande au rejeu (P3)** | rejouer l'événement crée **une 2ᵉ commande** / re-décrémente le stock — idempotence sur `stripe_session_id` absente | **bloquant** → contrainte unique + `on conflict do nothing` sur l'id de session/intent ; re-prouver par rejeu |
| **Survente (P1)** | deux commandes sur le dernier article réussissent toutes deux — `SELECT` puis `IF` applicatif | **bloquant** → décrément **conditionnel atomique** en base (`… where stock >= :qty`) dans la transaction de la commande ; re-prouver |
| **Prix client accepté (P2)** | une commande est payée au prix du **payload** (`0.01`) — total pris du client | **bloquant** → montant **recalculé serveur** depuis le catalogue (`lib/pricing/`), prix **snapshoté** ; re-prouver avec un panier altéré |
| **Vente muette (EC4)** | commande créée mais **0 email** (client et/ou marchand) — call-site d'envoi immédiat manquant | **bloquant** → câbler l'envoi immédiat au webhook (`_shared/boucles-fermees.md`) ; exiger Resend `sent`/`delivered` dans les secondes |
| **`*.vercel.app` sert la vitrine** | l'URL live est l'URL provider, pas le domaine custom (règle projet violée) | **bloquant** → brancher **sous-domaine + DNS Cloudflare** ; le checkout et le webhook doivent pointer le domaine custom |
| **Achat « à l'écran »** | verdict sans preuve : page /merci affichée, **0 ligne DB / 0 event Stripe / 0 statut Resend** | rejeter le rapport, re-tester — l'écran ment (miroir « recette à l'écran » web-saas) |
