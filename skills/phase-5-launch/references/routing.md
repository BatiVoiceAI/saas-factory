# Routing — Phase 5 : appliquer la route (renvoi)

Le triplet **`archetype` × `type` × `tenancy`** a été capté à l'**étape 1** (discover) et propagé dans `.saas-factory/state.md` (`Archétype` + `Type / route` + `Tenancy`). En Phase 5 tu **appliques** ce routage — tu ne reposes **jamais** le cadrage (state-resume.md).

**Le modèle des 3 axes vit dans `_shared/state-schema.md` (source unique). La table canonique « étape × (archétype × type × tenancy) » et les portes actives vivent à UN seul endroit : `skills/saas-factory/references/routing.md` — route selon routing.md.** Pas de copie de matrice ici : pour savoir si 16 s'exécute, si la porte de 17 s'ouvre et sous quelle forme, ouvre la matrice canonique (archétype web-saas / landing / automation + § Portes actives par archétype × type). Ce fichier ne garde que les **règles d'application** locales à la phase.

> ⚠️ Périmètre v0.4.4 : le code châssis des archétypes `landing`/`automation` et du substrat `multi-org` est **déféré au Thème C**. Ici on applique la route au MODÈLE ; on signale honnêtement quand le scaffold correspondant n'est pas encore buildable.

## L'archétype se lit AVANT le type (ordre canonique)

Le SEO et la forme du deploy dépendent d'abord de l'**archétype**, pas du seul `type` :

| Archétype × type | SEO (16) | Deploy (17) | Recette live auth. (17b) |
|---|---|---|---|
| web-saas + public (dont **multi-org**) | **actif** | web public + porte complète | **complète, multi-rôles + matrice cross-tenant** (au max en multi-org) |
| web-saas + interne / perso | **sauté + noindex** | privé/preview, porte conditionnelle | interne : complète + cross-tenant · perso : preuve d'action authentifiée (cross-tenant sans objet) |
| **ecommerce** (public — boutique) | **actif** (vitrine publique — SEO conservé) | web public + porte complète (+ cutover webhook Stripe) | **achat de test réel A→Z** : panier → checkout Stripe test → webhook → commande (P3) → stock (P1) → email ; **prix serveur (P2)** + RLS commandes ; **gate NON contournable** (un seul de P1/P2/P3 non prouvé = cutover invalidé) |
| **landing** (public) | **actif** (landing publique — SEO conservé) | web public + porte | **sans objet** (pas d'auth) |
| **automation** | **sauté + noindex** (headless) | **worker / cron** + porte conditionnelle | **remplacée** par la vérif de boucle fermée (14/17) |

> La colonne 17b détaille la règle 7 ci-dessous (bloquante dès qu'il y a auth + RLS, après le canary vert de 17) — pas une porte utilisateur mais un **contrôle BLOQUANT de fin de phase**.

🚨 **Ne pas transposer l'ancienne règle « SEO sauté si type ≠ public » telle quelle** : elle valait pour web-saas. Une **landing** est publique → **SEO ACTIF**. Une **automation** est headless → SEO sauté même si son type était « public ».

## Règles d'application (calibrage local — jamais le skip-set)

1. **Le routage saute des ÉTAPES ; les portes suivent la liste réelle par archétype × type** (canonique) : porte de publication complète en web-saas `public` et en `landing`, **conditionnelle** en web-saas `interne` (+ check « signup anonyme refusé ») et en `automation`, **absente** en web-saas `perso` quand la cible est la preview URL du provider à **coût nul** — mais dès que ça touche un domaine public ou que ça dépense, `safety-rails.md` §1 s'applique et la porte revient.
2. **SEO selon l'archétype × type** (cf. table ci-dessus) : quand SEO est sauté, annonce-le explicitement (« SEO sauté + noindex (web-saas interne) » / « (archétype automation) »), pose le **noindex** et passe à 17 — `seo/*` reste absent, 17 le gère sans bluff. Quand SEO est **actif** (public **ou landing**), 16 s'exécute et 17 vérifie sa gate contenu.
3. **Deploy selon l'archétype** : web-saas/landing → **web** (public ou privé) ; **automation → worker/cron** (ordonnanceur actif, healthcheck vert, **boucle fermée** vérifiée). Dans tous les cas : pré-vol, plan chiffré, apply réversible, canary → **identiques**. Ce qui change : la **surface publique** (indexation, DNS/accès) et la **cible** (page web vs worker), pas la rigueur.
4. **`multi-org` = public + substrat org** : landing/pricing/SEO **conservés** (type public), et 17 vérifie que le substrat org (Org, membres, invitations, switch, rôles) est présent avant publication — scaffold = Thème C.
5. **L'archétype/type prime sur la demande ponctuelle** : si l'utilisateur demande « fais-moi du SEO » sur un web-saas `perso` ou une `automation`, propose-le mais rappelle que c'est hors route par défaut — décision utilisateur explicite pour l'activer.
6. **Triplet inconnu / non fixé** (cas anormal en P5) : ne devine pas → relis `state.md` ; si vraiment absent, traite comme **web-saas + public + single** par prudence (route complète) et signale l'anomalie.
7. **Recette live AUTHENTIFIÉE (17b) — bloquante dès qu'il y a auth + RLS.** Après le canary de 17, sur la **PROD réelle**, on franchit l'auth (login OTP **complété** via boîte sandbox de test **ou** session forgée par l'**Admin API** : `createUser` `email_confirm` + `signIn`) et on joue **chaque action RLS-protégée de chaque rôle** avec preuve (2xx + **ligne au bon tenant** + notif `sent` + **refus cross-tenant**). Application par archétype × type × tenancy :
   - **web-saas `public`/`interne`** → 17b **complète**, **multi-rôles** (au moins deux rôles quand ils existent) avec **matrice cross-tenant** ;
   - **web-saas `multi-org`** → 17b **au maximum** : agence vs client **ET** org A vs org B — c'est le cas où surgissent les bugs **RLS/scoping/junction** et les **parcours d'invitation injoignables** (bugs vécus AgencyDesk 2026-07 : `orgs` puis `projects` RLS, invitation client injoignable) ;
   - **web-saas `perso`** (mono-utilisateur/mono-tenant) → preuve d'**action authentifiée** conservée, **matrice cross-tenant sans objet** (un seul tenant) ;
   - **`ecommerce`** → 17b = **achat de test réel A→Z** sur la prod (Stripe mode test) : panier → checkout → **webhook** → **commande créée une seule fois (P3)** → **stock décrémenté atomiquement (P1)** → **email confirmation client + notif marchand (EC4)**, avec **prix recalculé serveur prouvé (P2)** et **RLS commandes** (un client ne voit pas les commandes d'un autre) + back-office admin ; **un seul de P1/P2/P3 non prouvé = gate fermée, NON contournable** ;
   - **`landing`** → **sans objet** (pas d'auth) ;
   - **`automation`** → **remplacée** par la vérif de **boucle fermée** en connecté/headless déjà portée par 14/17 (run → logs → boucle → idempotence) — pas de recette d'auth utilisateur.
   17b ne se **saute jamais** quand l'archétype porte auth + RLS ; « ship plus vite » ne la supprime pas (les bugs RLS ne surgissent QU'en connecté). Détail normatif : règle d'or 19 (`_shared/lessons.md`).

## Ambition (secondaire)

Le champ `Ambition` de l'état module l'**intensité** du SEO quand 16 est active (nombre de clusters/pages dans la limite du plafond dur), pas le fait de l'exécuter. L'ambition ne change **jamais** la rigueur de 17.

## Ce que le routage NE fait pas

- Il ne saute pas la mise à jour d'état ni la sortie de phase.
- Il ne saute pas le pré-vol ni le rollback de 17 (quel que soit l'archétype/type).
- Il ne transforme pas un web-saas `public` (ou une `landing`) en déploiement sans SEO au motif de « ship plus vite » — pour aller vite sur du public, on **réduit** le SEO au plancher (landing propre + technique verte), on ne le supprime pas.
- Il ne prétend pas que le scaffold `landing`/`automation`/`multi-org` est buildable aujourd'hui : appliquer la route est valide au MODÈLE, le code châssis est **Thème C**.
- Il ne déclare **jamais « livré »** un web-saas à auth sans **recette live authentifiée (17b) VERTE** : une route 200 et un canary vert ne prouvent **pas** qu'un utilisateur **connecté** peut écrire sous son tenant, ni qu'il est **refusé** cross-tenant (règle d'or 19, `_shared/lessons.md`). Il ne « saute » pas 17b au motif de « ship plus vite » quand il y a auth + RLS.
