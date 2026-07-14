# Référence — Procédure de déploiement (plan-then-apply + canary)

Le détail du déploiement **sûr et borné**. Ce fichier est la **colonne vertébrale** : chaque étape renvoie vers sa sous-référence quand la profondeur le mérite (`preflight-checklist.md`, `publication-gate.md`, `canary-rollback.md`).

Principe directeur : **rien d'irréversible sans porte**. On avance étape par étape, chaque apply est réversible en une commande, et on s'arrête au premier échec sans jamais fabriquer un succès (`_shared/safety-rails.md` §6).

## Sommaire

- Machine à états du déploiement
- Table de routage (calibrage par type de projet)
- 1. Pré-vol (bloquant)
- 2. Plan (présenté à l'humain)
- 3. Porte de publication
- 4. Apply (via MCP infra) — ordre strict
- 5. Canary (health check post-deploy)
- 6. Recette live AUTHENTIFIÉE (bloquant pour la livraison)
- Rollback

## Machine à états du déploiement

```
                 build/tests rouges
                 ┌──────────────────► RETOUR PHASE 4 (14-qa / 12-build)
                 │
 [PRÉ-VOL] ──────┤ tout vert
                 ▼
 [PLAN] ── présente quoi/où/coût/réversibilité
                 │
                 ▼
 [🚪 PORTE] ── AskUserQuestion ── NON/flou ──► STOP (on ne publie pas)
                 │ OK explicite
                 ▼
 [APPLY] ── migrations ─► promotion ─► DNS ─► tracking
                 │              │
                 │              └─ échec à toute sous-étape ──► ROLLBACK partiel + log
                 ▼
 [CANARY] ── health check post-deploy
                 │
        ┌────────┴────────┐
     sain               échec
        │                  │
        ▼                  ▼
 [RECETTE LIVE      [ROLLBACK: N-1, ou dépublier au 1er ship] + log + repli honnête
  AUTHENTIFIÉE] ── franchit l'auth + exécute chaque action RLS-protégée par rôle
        │                       (2xx + ligne bon tenant + notif sent + refus cross-tenant)
   ┌────┴─────────────┐
 tout PASS         bloquant irréparable (cœur connecté cassé / RLS fuit)
   │                  │
   ▼                  ▼
[LIVRÉ → PHASE 6]  [ROLLBACK] + consignation honnête
```

Règle d'aval : le canary **sain** n'est **pas** « livré » — il ouvre seulement la **recette live authentifiée** (§6). « Livré » n'est prononcé qu'**après** elle : santé (canary) < route 200 < **feature exécutée authentifiée + RLS + boucle**.

Règle de la machine : on ne **franchit jamais** une flèche vers l'aval tant que l'état courant n'est pas **vert**. Un doute = on reste dans l'état et on résout (ou on recule), on n'avance pas « pour voir ».

## Table de routage (calibrage par type de projet)

> ⚠️ Cette table calibre par **`type`** pour l'archétype **`web-saas`** (et `landing`, cible web). **Si `archetype = automation`** (worker/cron headless), la cible du cutover n'est pas un domaine + DNS mais un **ordonnanceur** (GitHub Actions `schedule:` par défaut), et la vérif finale n'est pas la recette live authentifiée mais une **boucle fermée headless** : tout le calibrage automation (cible scheduler, split Secret/Variable, caveats `schedule:`, règle « runner éphémère ⇒ Supabase obligatoire », pré-vol delta, vérif de boucle fermée) vit dans **`references/automation-deploy.md`**. La machine à états, le principe plan-then-apply et la porte de publication ci-dessous **restent identiques** ; seuls la **cible d'apply** et la **preuve finale** changent.

| `type` (config) | SEO (16) fait ? | Cible du cutover | Porte de publication |
|---|---|---|---|
| `public` | oui | domaine public, DNS Cloudflare | **obligatoire** (publie + dépense) |
| `interne` | non | sous-domaine privé / accès restreint | obligatoire (dépense hébergement) |
| `perso` | non | privé — **peut rester en preview URL** | **conditionnelle** : obligatoire dès qu'il y a cutover, dépense, ou migration BDD ; **pas de porte** si ça reste en preview URL privée, coût nul, sans migration prod |
| **`automation`** (archétype, tous types) | **sauté + noindex** (headless) | **ordonnanceur** (GitHub Actions `schedule:` / cron système / conteneur) — cf. `automation-deploy.md` | **conditionnelle** : obligatoire dès que ça provisionne un scheduler distant, dépense, ou migre une BDD d'état ; **pas de porte** en test local one-shot à coût nul |

Règle : la porte de publication existe **exactement quand** il y a une action §1 — ça **dépense, publie, ou touche DNS/BDD**. `public`/`interne` en ont toujours une (domaine et/ou hébergement facturé). `perso` peut légitimement rester en **preview URL privée à coût nul** : alors il n'y a **ni publication ni dépense ni migration prod**, donc **pas de cutover et pas de porte**. Mais dès qu'il dépense, publie, ou migre une BDD prod, la porte revient. Ce qui change selon le `type`, c'est la **cible du cutover** et le **contenu du plan** — pas l'existence de la porte quand elle s'applique.

---

## 1. Pré-vol (bloquant)

**But** : garantir qu'on ne pousse jamais du rouge en prod. Aucune étape aval ne démarre tant que le pré-vol n'est pas **entièrement vert**.

- Build prod + tests **verts** (sinon → retour Phase 4, pas de contournement).
- Le **livret de test** (`qa/test-booklet.md`) **sans `FAIL` bloquant** ; les `CONCERNS`/`WAIVED` sont documentés (pas cachés — ils remontent dans `deploy/log.md`).
- Secrets présents en **env** (depuis `~/.saas-factory/`), **aucun en dur / commité / loggé** (`safety-rails.md` §4).
- Migrations BDD prod prêtes et **idempotentes** (rejouables sans casse).
- Rollback **testé** en une commande : re-promotion **N-1** (redéploiement) **ou** **dépublication → preview URL privée** au premier ship (pas de N-1). Voir `canary-rollback.md` + `preflight-checklist.md`.
- **Services tiers & déclencheurs soldés** : décisions « déférées » des ADR/plan résolues, scheduler branché **+ exécution prouvée**, email transactionnel réel parti (config prod), confirmation d'email réactivée, redirect URLs prod posées, events du funnel (`user_signed_up` + `activation_completed`) **émis en staging** (PostHog live-events), plan noindex/redirect de `*.vercel.app`. → checklist §E de `preflight-checklist.md`.

Critère de passage → **checklist exhaustive + catalogue de cas limites dans `preflight-checklist.md`**. Ne pas passer à l'étape 2 tant qu'un item est rouge ou inconnu.

### Matrice de décision — pré-vol

| Condition observée | Action |
|---|---|
| Build ou tests rouges | STOP → retour Phase 4. Ne pas « fixer vite fait » ici. |
| `FAIL` bloquant dans le livret | STOP → retour Phase 4 jusqu'à résolution ou waiver explicite humain. |
| Secret en dur détecté (`grep`) | STOP → migrer en env, **rotationner la clé exposée**, puis reprendre. |
| Migration non idempotente | Réécrire en idempotent (`IF NOT EXISTS`, garde de version) avant apply. |
| Rollback non testé | Tester d'abord : déployer N-1 en staging (redéploiement), ou répéter la **dépublication → preview** (premier ship) — sinon pas de filet. |
| Décision « déférée » non soldée / cron jamais invoqué / email de test non parti / funnel muet en staging | STOP → solder via la section E du pré-vol (`preflight-checklist.md`). Le tracking ou l'instrumentation manquants se **codent en Phase 4** (12-build), pas ici. |
| `CONCERNS` non bloquants | Documenter dans le log, continuer. On ne les cache pas. |

---

## 2. Plan (présenté à l'humain)

**But** : rendre visible **quoi / où / coût / réversibilité** avant tout apply. Le plan est ce que l'humain approuve à la porte — il doit être exact, pas optimiste.

| Élément | Détail |
|---|---|
| Domaine prod | {app.tondomaine.com} |
| Promotion | version staging {commit/tag} → production |
| DNS | enregistrement à basculer (type, nom, ancienne→nouvelle cible, TTL) |
| Tracking | PostHog (funnel activation) + Sentry (erreurs) activés |
| Coût éventuel | {plan hébergeur / domaine / add-ons} — chiffré, pas « peut-être » |
| Réversibilité | rollback en une commande — **re-promotion N-1** si une version prod existe déjà, sinon (**premier ship**) **dépublication** → retour preview URL privée ; DNS restaurable (TTL bas) |

Règle de rédaction du plan : **chaque ligne est vérifiable**. Pas de « ~ », pas de « environ » sur le coût si on peut le lire dans la config du provider. Si un montant est inconnu → le dire (« coût inconnu, à confirmer avant apply »), pas l'arrondir.

### Data-flow du cutover (ce que le plan décrit)

```
   staging (validé)                         production
   ┌──────────────┐   promotion   ┌──────────────┐
   │ build vN     │ ────────────► │ build vN      │
   └──────────────┘               └──────┬───────┘
                                          │ pointé par
   DNS: app.domaine ─(avant)─► staging    │
                    └────(cutover)────────┘► prod
```

---

## 3. Porte de publication

`AskUserQuestion` : « On publie en prod ? » → **OK explicite requis**. C'est le feu vert **technique** au cutover, au-delà du « ship » produit de l'étape 15.

La **même** `AskUserQuestion` valide aussi le **Critère de KILL** proposé (`{métrique live + seuil + fenêtre}`) : c'est un livrable de sortie de l'étape 17, écrit dans `state.md` **avant** de voir les chiffres — jamais dans une question séparée ni après coup. Détail → `publication-gate.md`.

**Ne jamais** publier sans réponse claire. Une réponse floue, conditionnelle, ou qui déplace le sujet = **pas un OK** → on reste à la porte.

Recette forcing-question complète (Ask exact / Push-until / Red-flags / MOU-vs-FORT / routage) → **`publication-gate.md`**.

---

## 4. Apply (via MCP infra) — ordre strict

L'ordre n'est pas cosmétique : chaque sous-étape 1-4 est un point de rollback. On applique dans cet ordre parce que **la BDD doit être prête avant le code, et le DNS ne bascule qu'après un code sain en prod**. La sous-étape 5 (filet post-launch) n'est pas un point de rollback : c'est le **filet** qui surveille la prod après coup.

```
1. Migrations prod  ─►  2. Promotion staging→prod  ─►  3. DNS cutover  ─►  4. Tracking
   (Supabase)              (Vercel / CF Pages)            (Cloudflare)        (PostHog+Sentry)
   réversible: down        réversible: promote N-1        réversible: TTL      réversible: off
                           / dépublier (1er ship)         (retirer/repointer)
```

1. **Migrations prod** (Supabase) — appliquer, **vérifier** (schéma attendu présent). Garder le `down`/rollback de migration prêt.
2. **Promotion** (Vercel / CF Pages) — déployer la version **validée** (celle testée en staging, même commit) en production. Ne jamais re-builder « juste avant » : on promeut l'artefact testé, pas un nouveau. 🚨 Le commit promu doit être **authored par `config.git_author.email`** (membre de la team hébergeur Vercel) — sinon Vercel renvoie **`readyState = BLOCKED`** (déploiement **refusé**, `tsc`/`next build` verts pourtant), pas une erreur de build. Identité posée à l'onboarding, vérifiée au pré-vol → `config-schema.md §git_author` + `preflight-checklist.md`.
3. **DNS cutover** (Cloudflare) — le domaine pointe sur la prod. **Abaisser le TTL avant** (ex. 60s) pour une bascule/retour rapide, le remonter après stabilisation.
4. **Tracking** — activer PostHog (funnel activation) + Sentry (erreurs) **avant** le canary, pour que le health check ait des données à lire.
5. **Filet post-launch** — entre le canary de 15 min et le premier bilan (étape 18), personne ne regarde la prod : le fondateur doit apprendre une panne par un **signal**, pas par un client mécontent. Trois gestes, dans la foulée du tracking :
   - **Alert rule Sentry** sur le parcours cœur : « erreur sur les routes du parcours cœur → email au fondateur » (l'alerte par défaut « tout Sentry » noie ; celle-ci vise le cœur).
   - **Backups Supabase actés** : vérifier l'état réel (backups quotidiens actifs ? PITR ? rétention ?) et l'**écrire dans `deploy/log.md`** — un backup supposé n'est pas un backup.
   - **Uptime monitor si `type=public`** : un check HTTP externe sur le domaine prod (gratuit suffit) avec alerte email. Interne/perso : optionnel, à noter si sauté.

   Non bloquant pour le cutover lui-même, mais **bloquant pour clore l'étape** : pas de « déployé » déclaré sans filet posé (ou son absence explicitement actée dans `deploy/log.md`).

### Matrice de décision — pendant l'apply

| Sous-étape échoue | Action immédiate |
|---|---|
| Migration prod | Rollback migration (`down`), **ne pas** promouvoir le code. Log + diagnostic. Rien n'est public : le domaine sert encore N-1 (redéploiement) ou n'a pas basculé du tout (1er ship). |
| Promotion | Le DNS n'a pas encore basculé → rien de neuf n'est exposé (N-1 en redéploiement, ou toujours non-public au 1er ship). Log + diagnostic. |
| Promotion **BLOCKED** — Vercel refuse : `Git author … must have access to the team` | L'auteur du commit n'est **pas membre de la team** hébergeur (blocage silencieux : build vert, deploy refusé). **Ré-authorer** le commit (`git commit --amend --reset-author` avec `config.git_author.email`) **ou** ajouter cet email à la team Vercel, puis **re-promouvoir**. Rien de public n'a basculé (le DNS n'a pas bougé). Distinguer `readyState=BLOCKED` (auteur hors team, via API/CLI Vercel) de `ERROR` (build cassé) et de `READY`. → `config-schema.md §git_author`. |
| DNS cutover | Restaurer/retirer l'enregistrement (TTL bas → propagation rapide) : repointer sur **N-1** (redéploiement) ou **retirer** l'entrée → retour preview (1er ship). Le build neuf existe mais le domaine ne le sert plus. |
| Tracking | **Non bloquant pour le service** mais bloquant pour la Phase 6 : logger, réessayer, guider si accès manque (`safety-rails.md` §6). Ne pas déclarer « déployé » sans tracking si `type=public`. |
| Filet post-launch (alert rule / backups / uptime) | Non bloquant pour le cutover, **bloquant pour clore l'étape** : poser le filet ou acter honnêtement son absence dans `deploy/log.md` — jamais un « déployé » silencieusement sans filet. |

Détail des runbooks de rollback par sous-étape → **`canary-rollback.md`**.

---

## 5. Canary (health check post-deploy)

**But** : prouver que la prod est **saine** avec des mesures, pas une impression. Inspiré du pattern gstack **`canary`** (santé post-deploy) — sans le vendorer (couplé binaire).

- **Pages clés** à 200, parcours cœur qui marche **en prod** (pas seulement le homepage).
- Pas de **pic d'erreurs** Sentry dans les premières minutes (seuil chiffré).
- **Core Web Vitals** prod OK (Lighthouse / `unlighthouse`) — LCP / CLS / INP dans les seuils.
- **Échec → rollback immédiat** (re-promotion N-1, ou **dépublication → preview URL privée** au 1er ship) + log + **pas de faux succès**.

Seuils exacts, fenêtre de surveillance, machine à états sain/dégradé/échec, et catalogue des modes d'échec → **`canary-rollback.md`**.

---

## 6. Recette live AUTHENTIFIÉE (bloquant pour la livraison)

**But** : le canary prouve la **santé** (« le site répond ») ; il ne touche **jamais** une policy RLS ni une RPC `security definer`. La recette live authentifiée prouve que **le produit marche pour un vrai utilisateur** — c'est le **niveau de preuve qui manquait**, et le seul qui attrape les bugs vécus (« new row violates RLS policy for table `orgs` » à la 1ʳᵉ action, parcours d'invitation client injoignable, fuite cross-tenant), invisibles à `tsc`/`next build`/canary.

**Hiérarchie de preuve — un seul niveau compte pour dire « livré » :**
> **santé (canary)** *(nécessaire)* **< route 200** *(nécessaire, jamais suffisant)* **< feature exécutée AUTHENTIFIÉE + RLS + boucle fermée** *(la VRAIE preuve).*

**Elle suit le canary, avant de déclarer « livré ».** Après un canary **sain**, dispatcher l'agent **`live-qa`** (`agents/live-qa.md`) sur la **prod réelle** : il **franchit réellement l'auth** (session user-scopée par rôle — OTP complété via boîte sandbox **ou** session forgée via l'Admin API Supabase), puis **exécute chaque action de valeur RLS-protégée de chaque rôle** (JWT user-scopé qui touche les vraies policies + RPC `security definer`), avec ses **quatre preuves par action** : **2xx + ligne sous le bon tenant + notification `sent` immédiate + refus cross-tenant prouvé**. **Multi-rôles obligatoire** dès qu'il y a contrepartie (client↔agence, demandeur↔valideur). Chaque échec → **fix → redeploy → re-test authentifié** (budget **3 cycles**). **Un maillon connecté cassé = recette ÉCHOUÉE (bloquant)** : cœur cassé ou RLS qui fuit → rollback ; reste → consigné et **annoncé** au fondateur. Le fondateur non-tech récupère du **fonctionnel authentifié vérifié**, pas du « déployé ».

Séquence, **les deux méthodes de session (réutilisables)**, exécution RLS-protégée par rôle, preuves + refus cross-tenant, boucle de correction, matrice par type, DoD, modes d'échec → **`live-qa.md`**.

---

## Rollback

Toute étape d'apply est **réversible** : garder la version précédente déployable en une commande. Le rollback n'est pas un plan B honteux — c'est le **filet qui autorise à shipper vite**. Documenter systématiquement dans `deploy/log.md` (ce qui a basculé, ce qui a été restauré, verdict).

Runbook complet (par sous-étape + rollback total) → **`canary-rollback.md`**.
