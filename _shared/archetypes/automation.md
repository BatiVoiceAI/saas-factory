# Archétype : automation (V1 — bloc partagé, lu à la demande)

Un archétype parmi 4 — le modèle **3 axes orthogonaux** (`archetype` / `type` / `tenancy`) et le **conditionnement du socle par archétype** vivent dans `../state-schema.md` §modèle 3 axes (SOURCE UNIQUE) ; voir aussi `web-saas.md`, `landing.md`, `ecommerce.md`. Ici : la fiche de l'archétype **automation**.

> ✅ **Scaffold code réel livré (C2c) → `../blocks/automation/`.** Ce fichier pose le **modèle** de l'archétype ; le **châssis** qui scaffolde un worker/cron headless existe désormais comme bloc partagé **`_shared/blocks/automation/`** (parallèle à `web-saas/`, **PAS** le châssis web-saas ni l'assemblage `landing`). Il est **dependency-light** — **Node 20+ built-ins** au runtime (`fetch` global, `node:crypto`, `process.env`), **une seule dép externe** (`zod`, validation de la config), ESM TypeScript strict, `tsc --noEmit`-vérifiable — et implémente le socle **AU1-AU5** en fichiers réels `src/*` (mapping ci-dessous). Déploiement = **cron externe / worker long-running / conteneur**, **pas** Next.js/Vercel. Boucle fermée réutilisée conceptuellement (`../boucles-fermees.md`) mais en autonome. Manifeste des fichiers → `../blocks/automation/README.md` (fait foi pour les chemins exacts).

Livrable = **worker / cron / bot / intégration HEADLESS** (job planifié, consommateur de queue, webhook handler, bot). **PAS de socle UI produit** (ni onboarding, ni dashboard, ni entité cœur CRUD). Admin minimal **optionnel** (une page de statut/logs en lecture, jamais un dashboard produit). Le plus souvent couplé à `type = interne` (axe 2, orthogonal), parfois `perso`. Cas d'usage : synchronisation périodique, enrichissement, relances, veille, ETL léger, bot de notification.

## Stack
**Worker headless TypeScript, dependency-light** — **Node 20+ built-ins** au runtime (`fetch` global, `node:crypto`, `process.env`), **une seule dép externe** : `zod` (validation de la config). **PAS de framework UI, PAS de Next.js/Vercel** ; **PAS de SDK lourds** (`@supabase/supabase-js`, `resend`) → on parle **REST via `fetch`** à Supabase (état d'automatisation) et à Resend / aux webhooks (boucle fermée). ESM TypeScript strict, `tsc --noEmit`-vérifiable sans install lourde. Déclenché par **cron externe** / une **queue** / des **webhooks** entrants. Persistance via Supabase (Postgres, en REST) **pour l'état d'automatisation** (config, historique de runs, curseurs d'idempotence) — **pas** un schéma applicatif orienté utilisateur. **Pas de Stripe, pas d'auth produit** (secrets d'intégration seulement ; l'admin optionnel se protège par un accès restreint, pas par un signup public). Défauts et alternatives self-host : `../stack-defaults.md`.

## Structure du châssis généré → `../blocks/automation/`
```
src/
  config.ts       # AU1 — config/secrets validés (zod + process.env), jamais en dur
  runs.ts         # AU2 — historique des runs + logs (écrits en Supabase REST)
  health.ts       # AU3 — healthcheck / statut d'exécution (dernier run OK ? retard ?)
  notify.ts       # AU4 — boucle fermée : succès ET échec → propriétaire (email Resend / webhook)
  idempotency.ts  # AU5 — clé/curseur d'idempotence : re-run sûr, pas de double effet
  index.ts        # point d'entrée : orchestre un run (config → travail → runs + notify)
.env.example      # NOMS de secrets uniquement (jamais de valeurs)
package.json · tsconfig.json · README.md   (README = manifeste bloc → fichiers réels)
```
**PAS de** dashboard produit, **PAS de** socle UI S1-S8, **PAS d'**onboarding, **PAS de** Next.js/`app/`. Chemins `src/*` **indicatifs** : le manifeste `../blocks/automation/README.md` fait foi pour les noms exacts. Sélection & câblage par l'étape 11 : `../../skills/11-project-setup/references/scaffold-procedure.md` §Sélection des blocs par archétype.

## Socle inclus par défaut — socle **AUTOMATION** (remplace le socle S1-S8 web-saas)
Le socle de complétude dépend de l'**archétype** (règle canonique dans `../state-schema.md` §modèle 3 axes ; le S1-S8 de `../../skills/07-product-spec/references/completeness-baseline.md` est le socle **web-saas**, sans objet ici). Pour automation, l'existence non négociable porte sur :
- **AU1 — Config / secrets** (`src/config.ts`) — paramètres du job (source, cible, planning, seuils) hors code ; secrets d'intégration en variables d'environnement, **validés** (zod), jamais en dur (cf. `../safety-rails.md`). Nommés dans `.env.example`, connectés via `infra-setup`.
- **AU2 — Historique de runs + logs** (`src/runs.ts`) — chaque exécution écrit un enregistrement `run_log` (début, fin, statut, volume traité, erreur éventuelle) consultable via Supabase REST. Sans historique, un job headless est une boîte noire.
- **AU3 — Healthcheck** (`src/health.ts`) — statut d'exécution (le job tourne-t-il ? dernier run OK ? retard vs planning ?) pour la supervision.
- **AU4 — BOUCLE FERMÉE — alerte / rapport au propriétaire** (`src/notify.ts`, 🚨 non négociable). Aucun run de valeur sans accusé de réception, MAIS **notifier chaque succès = spam** (à N=4 h, ~6 mails « run OK »/jour). La boucle fermée se décline en **3 régimes** — voir §Doctrine AU4 (3 régimes de boucle fermée + `RUN_MODE`) ci-dessous. Application headless **autonome** de la doctrine `../boucles-fermees.md` (canon « travail asynchrone » : l'accusé va au **propriétaire du job**, pas à un client final). La règle est universelle, seul le canal et le régime s'adaptent.
- **AU5 — Idempotence** (`src/idempotency.ts`) — rejouer un run (retry, double-déclenchement cron, redelivery de webhook) doit produire le **même effet**. ⚠️ **Deux grains distincts** : le grain RUN (`withIdempotency`, « un effet au plus par tick ») **ne suffit pas** dès que le worker **crée des entités** — il faut aussi le grain ENTITÉ (« un manque = au plus une entité ouverte »). Voir §Doctrine AU5 (idempotence 2-grains) ci-dessous. Un worker non idempotent double les effets à la première reprise ; un worker idempotent au seul grain run **double quand même ses entités**.

**PAS de socle UI produit** : ni onboarding wizard, ni dashboard, ni empty states, ni profil/settings — ils n'ont pas d'objet pour un livrable headless. **Admin minimal optionnel** seulement (page de statut + logs en lecture, accès restreint) si le propriétaire doit inspecter à la main ; ce n'est pas un dashboard produit et il reste facultatif.

## Doctrine AU5 — idempotence à **2 grains** (le grain entité est le vrai piège)

> 🚨 **Le risque n°1 de toute automation. `withIdempotency` (grain RUN) ne couvre que la moitié — la moins dangereuse.** Un worker qui **crée des entités** (réappro, relance, ticket, commande…) et qui ne protège QUE le grain run **double ses entités** à la première reprise. Les deux grains sont **orthogonaux** : il faut les deux.

### Grain RUN — « un effet au plus par tick » (`src/idempotency.ts` · `withIdempotency`)
Absorbe le déclenchement AT-LEAST-ONCE (retry, double-tick cron, redelivery webhook). Le châssis pose une clé déterministe, la **réclame AVANT** d'exécuter (crash en plein job ⇒ pas de rejeu), la relâche si le job lève (échec franc ⇒ retry possible).

🚨 **Piège de la fenêtre par défaut — casse tout worker sub-quotidien.** Le châssis bucketise par **jour calendaire** et `IDEMPOTENCY_WINDOW_SEC` vaut **86400 (24 h)** par défaut. Un worker cadencé toutes les N h < 24 h (le cas de la majorité des « sync ») voit **tous les runs après le 1er du jour SKIPPÉS en silence** — il tourne 1×/jour en croyant tourner toutes les N h, **sans aucune erreur**. Règle dure :
- **la fenêtre run se DÉRIVE de la cadence**, pas d'un défaut 24 h : `IDEMPOTENCY_WINDOW_SEC ≈ SYNC_INTERVAL_HOURS·3600` (ou l'override de `idempotencyKeyFor`) ;
- **tout worker sub-quotidien DOIT** surcharger la clé run + la fenêtre — le châssis le documente en gros, et le domaine le câble (cf. `../blocks/automation/`, ADR « surcharge idempotence run »).

**Fenêtre déterministe (motif normatif)** — la clé run comme la clé d'identité entité utilisent le même bucket temporel :
```
bucket = floor((t − EPOCH) / période)        # EPOCH = constante DE CODE (jamais now())
clé    = "<préfixe-versionné>:<bucket>:<identité stable>"
```
- **EPOCH constante** (une date d'origine figée dans le code), **jamais** `Date.now()` / minuit local → sinon la frontière de fenêtre glisse et rejoue/dédouble ;
- **préfixe versionné** (`v2:…`) → changer d'algorithme de clé n'entre pas en collision avec l'ancien ;
- **période = la cadence** (grain run) ou la **période métier du besoin** (grain entité).

### Grain ENTITÉ — « un manque = AU PLUS UNE entité ouverte » (le vrai piège, **rien à copier**)
`withIdempotency` ne dit rien sur les **entités** qu'un run crée. Si le run rouvre un manque déjà couvert (même besoin, run suivant), il faut **une seule entité ouverte**. Trois pièces, toutes à câbler dans le domaine (patron dans `../blocks/automation/` migration exemple + RPC) :
1. **Clé d'identité déterministe** de l'entité — dérivée des seuls attributs **STABLES** du besoin (ex. `sku` + `besoin_window_id`). 🚨 **L'identité EXCLUT tout attribut MUTABLE** (quantité, montant, sévérité) : les inclure re-crée un doublon dès que l'attribut change.
2. **Index unique PARTIEL** sur la clé d'identité, restreint à l'état **ouvert** (`… where statut = 'proposé'`) → après résolution/expiration, un nouveau besoin légitime peut ré-ouvrir une ligne, mais **jamais deux ouvertes** en même temps.
3. **Upsert RPC atomique** (`insert … on conflict (clé) where (statut ouvert) do update …`) qui **crée si absent, RÉVISE la quantité mutable si présent** — concurrence-safe (2 upserts simultanés ⇒ 1 ligne ouverte), conforme **lesson #15** (`#variable_conflict use_column` + variables `v_`/`p_` + colonnes qualifiées, `SECURITY DEFINER search_path=''`, `revoke` aux rôles clients). Jamais un check applicatif « SELECT puis INSERT » (fenêtre de course).

🚨 **Corriger l'exemple de clé piégeur.** Ne pas illustrer la clé d'identité par `sha256(sku | besoin | fenêtre)` : `besoin` = la **quantité manquante**, un attribut **mutable** → à la moindre révision de quantité, la clé change et une **2e entité ouverte** naît (I1 cassé). La bonne clé exclut la quantité :
```
# ❌ PIÈGE — inclut un attribut mutable (la quantité « besoin ») :
idem_key = sha256("sku|besoin|fenêtre")        # double dès que le besoin change
# ✅ CORRECT — identité = attributs STABLES seulement ; la quantité vit dans le PAYLOAD, révisée par l'upsert :
idem_key = sha256("v1|" + sku + "|" + besoin_window_id)   # window_id = floor((t−EPOCH)/période)
```

## Doctrine AU4 — **3 régimes** de boucle fermée + pattern `RUN_MODE`

> Le socle notifie sur succès ET échec ; mais **« notifier chaque succès » est un anti-pattern** (spam qui noie l'alerte utile, à rebours de `../boucles-fermees.md`). Choisir le régime par **nature d'événement**, pas « toujours notifier ».

| Régime | Quand | Canal / effet |
|---|---|---|
| **1 · Succès silencieux journalisé** | run routinier réussi, sans événement métier notable | AU2 seulement (`run_log` + metrics) — **aucune** notif. C'est le défaut d'un run OK. |
| **2 · Rapport périodique planifié** | résumé d'activité (digest quotidien/hebdo) | notif **agrégée** au propriétaire à une cadence propre (≠ celle du run de travail) — donne l'accusé de réception sans spammer. |
| **3 · Alerte immédiate au propriétaire** | **échec** de run, OU événement métier à forte valeur (ex. réappro **critique**, seuil franchi) | notif **immédiate** (email/webhook, avec cause) — le seul cas qui interrompt le propriétaire. |

**Pattern `RUN_MODE` (multi-cadence).** Un worker réel porte ≥ 2 cadences (ex. `sync` toutes les N h **+** `digest` quotidien) ; `main()` ne doit **pas** supposer 1 job / 1 cadence. Le châssis dispatch par **mode** (`RUN_MODE=sync|digest|…`), chaque mode ayant **sa propre fenêtre d'idempotence run** (grain RUN dérivé de SA cadence, cf. AU5). Le régime AU4 se choisit **par mode** : `sync` = régime 1 (silencieux) + régime 3 (alerte si échec ou événement critique) ; `digest` = régime 2 (rapport périodique). Un **helper « domain store »** (REST service-role + fallback fichier) porte l'entité métier — le châssis n'outille nativement que `runs`/`idempotency`.

## Infra & déploiement
- **Déclenchement** : `cron` (planning fixe — **cron externe** : crontab système, GitHub Actions `schedule`, cron de l'hébergeur ; **pas** Vercel Cron) **ou** `queue` (traitement de messages) **ou** `webhooks` (réaction à un événement externe). Le choix est capté à l'intake et écrit dans l'état.
- **Déploiement** : **worker long-running** (traitement continu / consommateur de queue) **ou** **conteneur** planifié **ou** **process one-shot** (`node dist/index.js`) lancé par un cron externe. **PAS de déploiement Next.js/Vercel** : le livrable est un binaire Node headless, pas une app web. Contraintes (at-least-once des webhooks, double-déclenchement cron, retries) → renforce l'exigence d'**idempotence** (AU5) ci-dessus.

## Pipeline (allégé, orienté job)
**intake** (quoi automatiser, déclencheur, source/cible, canal d'alerte, propriétaire, `locale` pour les alertes/rapports) → **architecture minimale** (état d'automatisation : config, run_log, idempotence) → **build du job** (logique + boucle fermée + healthcheck) → **deploy** (worker/conteneur + cron externe). Sautées vs web-saas : socle UI S1-S8, design system produit complet, billing.

## Critères d'acceptation
Build vert (`tsc --noEmit`), test du job vert **y compris le rejeu** (idempotence AU5 : deux exécutions = un seul effet), le healthcheck (`src/health.ts`) rend son statut, un **run d'échec déclenche l'alerte** au propriétaire (AU4) et un run réussi est journalisé (AU2), secrets absents du code (AU1), déployé + planifié (cron externe / worker) sur l'environnement sandbox. Si admin optionnel présent : accès restreint, logs lisibles.

## Clés API requises
Connectées **une fois, en amont, via `infra-setup`** (`~/.saas-factory/`) — jamais ad hoc. Selon le job : Supabase (état d'automatisation, en REST), l'hôte du worker (cron externe / conteneur), les **secrets d'intégration** des systèmes source/cible, et le canal de boucle fermée (Resend et/ou webhook Slack). **Pas de** Stripe, **pas d'**auth produit. Chaque clé = un guide pas-à-pas ; jamais stockée par le plugin.
