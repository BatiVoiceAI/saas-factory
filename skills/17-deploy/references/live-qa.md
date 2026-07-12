# Référence — Recette live & boucle de correction (étape 17, après canary)

> **Pourquoi.** Le canary (santé) dit « le site répond ». La recette live dit « **le produit marche** ». Le fondateur non-tech récupère quelque chose de **réellement fonctionnel** — c'est la dernière porte de qualité, sur la **prod réelle**. Un déploiement dont la recette n'est pas passée n'est pas une livraison.

> **Principe cardinal — « route 200 ≠ feature qui marche ».** La recette n'est **PASSÉE** que si **chaque feature Must du PRD** (`product/features/*`) a été **EXÉCUTÉE de bout en bout sur la prod réelle**, avec sa **preuve d'effet** (ligne en base, statut Resend `sent`, session ouverte), et qu'elle **échoue bruyamment** à la moindre erreur. « Déployé + build vert » ne vaut **jamais** livraison : `tsc` et `next build` ne voient ni un code OTP de mauvaise longueur, ni une erreur SQL runtime (`42702`, RLS, grant) — **seule l'exécution réelle les attrape**. Ce sont les **deux bugs vécus** que cette recette existe pour prendre.

## Séquence
```
canary OK ──> dispatch agents/live-qa.md ──> rapport (deploy/live-qa-report.md)
                     ▲                              │
                     │ re-test des KO               ▼
              redeploy (même pipeline)  <── correctifs (si échecs)
                     │
   3 cycles max ─────┴──> tout PASS → livraison ; sinon → escalade honnête
```

## 1. Dispatch du live-QA (contrat)
Prompt de délégation : **URL prod**, PRD + `product/features/*` (les fiches Must — **c'est de là que l'agent dérive la liste des features à exécuter**, § Critères + § Volet technique/RPC exposées), `qa/test-booklet.md` (les cas déjà validés en local — à rejouer sur prod pour le cœur), **type de projet** (public/interne/perso — cf. matrice plus bas), rappel accès `.env` (service_role Supabase, clé Resend) et règles de données de test (`+liveqa@`, préfixe `[test]`, nettoyage). L'agent **exécute chaque feature Must** et prouve son effet — pas une check-list générique :
- **routes** (nécessaire, jamais suffisant) ;
- **OTP réel** : email parti (Resend `sent`) **+ code de la BONNE LONGUEUR** (= input châssis, invariant `mailer_otp_length`) **+** `verifyOtp` ouvre une session ;
- **chaque action de valeur** : endpoint/RPC réel appelé (ex. `create_booking`) → **200 + la ligne en base** ;
- **chaque RPC/fonction Postgres exposée** invoquée ≥ 1× → **0 erreur SQL runtime** (`42702`, RLS, grant) ;
- **CRUD gérant** exécuté → effet en base ; **boucles fermées** (statut Resend) ; **parcours 2 rôles** ; **smoke RLS/cron** ;
- si `type ≠ public` — **refus du signup anonyme + `noindex` + redirection de bord** (cf. matrice).

Détail exécutable (les trois maillons OTP, la preuve d'effet par action) dans `agents/live-qa.md`.

## 2. Boucle de correction — budget **3 cycles**
Pour chaque échec du rapport, dans l'ordre bloquant → majeur → mineur :
1. **Fix minimal** dans le repo (correctif ciblé ; si structurel → dispatch `feature-dev` avec le repro du rapport comme critère d'acceptation).
2. **Gate local** : `tsc` + `next build` verts — jamais de redeploy d'un build rouge.
3. **Redeploy** par le même pipeline (commit → promotion). *Pas de nouvelle porte utilisateur : le feu vert de publication (porte 3) couvre les correctifs de recette tant que le périmètre produit ne change pas — c'est de la réparation, pas une nouvelle publication.*
4. **Re-test** : le live-QA rejoue **les items KO + le parcours cœur** (non-régression). Un fix qui casse autre chose = échec du cycle.

**Épuisement du budget (3 cycles)** — honnêteté :
- **Bloquant subsiste** (cœur cassé) → **rollback** (`canary-rollback.md`) : re-promotion N-1, sinon dépublication → preview privée. Jamais un produit au cœur cassé entre les mains du fondateur.
- **Majeur/mineur subsiste** → le produit **reste en ligne**, l'échec est consigné (`deploy/live-qa-report.md` + `deploy/log.md` `[CONCERNS]`) et devient tête de backlog Phase 6. **Dit au fondateur, jamais silencieux.**

## 3. Matrice par type de projet
| Test | SaaS public | Outil interne | Outil perso |
|---|---|---|---|
| Routes + metadata + légal | ✅ tout | ✅ (légal N/A) | statuts seulement |
| Parcours cœur 2 rôles | ✅ | ✅ (rôles internes) | ✅ 1 rôle |
| OTP réel + email Resend | ✅ | ✅ | ✅ (léger) |
| **Signup anonyme refusé + noindex** | N/A (signup ouvert) | ✅ **preuve** : 0 ligne `auth.users` + `X-Robots-Tag: noindex` + redirection de bord | ✅ **preuve** (idem) |
| Boucles fermées | ✅ toutes (email client) | ✅ **toutes** (canal adapté : email pro / in-app — dès qu'il y a contrepartie, la boucle est testée) | ✅ dérivées par action (trace toujours ; email si échéance/contrepartie) |
| Smoke RLS/cron | ✅ | ✅ | si multi-données |
| Mobile + desktop | ✅ | desktop d'abord | selon usage |

## 4. DoD de la recette
- [ ] **Chaque feature Must du PRD** (`product/features/*`) a une **ligne de couverture** dans `deploy/live-qa-report.md` : *scénario exécuté + verdict + preuve d'effet* (ligne DB / ID email Resend / session / screenshot). Une Must absente ou sans preuve d'exécution = recette **non passée** (pas de couverture partielle silencieuse).
- [ ] **OTP prouvé sur les trois maillons** : email parti (Resend `sent`/`delivered`) ; **code de la bonne longueur** (= input châssis, invariant `mailer_otp_length`, cf. `agents/provisioner-db.md`) ; `verifyOtp` ouvre une session.
- [ ] **Chaque action de valeur exécutée** : endpoint/RPC réel appelé → **200 + ligne écrite en base** (pas « la page de confirmation s'affiche »).
- [ ] **Chaque RPC/fonction Postgres exposée invoquée au moins une fois** → **0 erreur SQL runtime** (`42702`, RLS, grant) sur les chemins exposés.
- [ ] Rapport `deploy/live-qa-report.md` complet : chaque parcours du PRD a un verdict **avec preuve** (screenshot / ID email Resend / ligne DB).
- [ ] **0 bloquant** ; majeurs/mineurs restants **consignés et annoncés**.
- [ ] **(interne/perso) Signup anonyme refusé — prouvé sur la prod réelle** : e-mail aléatoire non enrôlé → **0 compte créé** (`auth.users`) + **0 OTP** (Resend) ; `X-Robots-Tag: noindex` présent ; visiteur non authentifié redirigé vers `/login`. Miroir de la porte pré-vol §F (`preflight-checklist.md`) — ici rejoué sur la **prod**, avec preuve.
- [ ] Boucles fermées **prouvées** (les emails partent vraiment — statut Resend, pas « le code les envoie »).
- [ ] Données de test **nettoyées** (aucun `+liveqa@` / `[test]` résiduel en base).
- [ ] `.saas-factory/state.md` : `recette_live: PASS` (ou `PASS_WITH_CONCERNS` + liste).

## Modes d'échec
| Mode | Symptôme | Traitement |
|---|---|---|
| Recette « à l'écran » | verdict sans preuve (pas d'ID Resend, pas de ligne DB) | rejeter le rapport, re-tester — l'écran ment (cf. résa coiffeur : confirmation affichée, **zéro email parti**) |
| **OTP passe mais code de mauvaise longueur** | la session s'ouvre via un raccourci (`generateLink`/magic link) mais l'e-mail contient un code à `8` chiffres qu'aucun utilisateur ne peut saisir dans l'input à `6` cases (défaut Supabase ≠ input châssis) | **mesurer la longueur du vrai code émis** (corps Resend / `properties.email_otp`) et exiger `verifyOtp` par le chemin réel — longueur ≠ input châssis (`mailer_otp_length`) = **bloquant** ; ne jamais valider l'OTP sur la seule existence d'une session |
| **RPC 500 masqué** | la page « confirme » l'action mais l'endpoint/RPC (ex. `create_booking`) renvoie un **500** avalé par un message d'erreur générique ou une UI optimiste — erreur SQL runtime (`42702` colonne ambiguë, RLS, grant) invisible à `tsc`/`next build` | **appeler l'endpoint/RPC réel** et exiger **200 + la ligne en base** ; lire le statut réseau/console — un 500 masqué = **bloquant**, jamais un « l'écran confirme donc ça marche » |
| Fix-ping-pong | le cycle 3 re-casse ce que le cycle 2 a réparé | stop, rollback ou consignation — ne jamais dépasser le budget « pour finir » |
| Données de test orphelines | `[test]` visibles par de vrais utilisateurs | le nettoyage fait partie du DoD, pas une politesse |
| Faux vert par autoconfirm | OTP « passe » parce que l'email n'est pas vérifié en vrai | toujours vérifier le **statut Resend** de l'email, pas seulement la session |
| « Privé » resté ouvert | un e-mail inconnu crée un compte / atteint le dashboard sur un `interne`/`perso` | `disable_signup` non posé **ou** `APP_ACCESS_MODE` resté `public` en env host → retour 11-project-setup / config env + re-preuve ; ne jamais livrer un interne ouvert (P0.5) |
