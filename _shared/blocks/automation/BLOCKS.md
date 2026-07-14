# BLOCKS — châssis `automation`

Inventaire des **blocs** du châssis d'archétype `automation`. Contrairement au châssis `web-saas` (où les blocs S1-S8 sont des features UI assemblées), l'archétype `automation` est **headless** : ses « blocs » sont les cinq briques du socle **AU1-AU5**, chacune un module `src/*` autonome. Zéro UI produit, zéro fuite métier (aucun booking / rdv / salon).

Référence doctrinale : `../../archetypes/automation.md` (fiche archétype) · `../../boucles-fermees.md` (boucle fermée, réutilisée en autonome) · `../../lessons.md` (lesson #15, appliquée à la migration).

---

## AU1 — `config` → `src/config.ts`
**Config / secrets déclarés, validés, jamais en dur.**
- Schéma **zod** de `process.env` ; `loadConfig()` parse + valide et **échoue tôt** avec un message listant les variables fautives.
- Invariants encodés : `OWNER_EMAIL` requis (cible AU4) ; **au moins un canal** de boucle fermée (email **ou** webhook) ; paires cohérentes (Supabase, Resend = les deux ou aucun).
- Sortie : un type `Config` avec sous-objets non-nuls (`supabase`, `resend`, …) → le reste du code teste une capacité, pas des champs épars.
- **Dépend de** : `zod`. **Consommé par** : tous les autres modules.

## AU2 — `runs` → `src/runs.ts`
**Historique des runs + logs consultables.**
- `startRun(config, name)` ouvre un run (`id`, `name`, `started_at`, `status='running'`, `logs[]`), `log(run, msg)` empile une ligne horodatée, `finishRun(config, run, status, summary)` clôt (`success` | `failure`) et flushe la trace.
- Persistance Supabase `automation_runs` en **REST** ; **fallback console** si `config.supabase == null`. Best-effort : la persistance ne fait jamais échouer le job.
- `getLastRun()` alimente AU3 ; `renderRun(run)` produit le corps des notifications AU4.
- **Dépend de** : `supabase.ts`, `node:crypto`. **Consommé par** : `index.ts`, `health.ts`.

## AU3 — `health` → `src/health.ts`
**Healthcheck / statut d'exécution.**
- `startHealthServer(port)` : serveur `node:http`, `GET /health` → 200 + dernier statut de run (`getLastRun`). Toute autre route → 404.
- **Optionnel** : ouvert seulement si `HEALTHCHECK_PORT` est défini (mode long-running / conteneur). En mode cron one-shot, pas de serveur.
- **Dépend de** : `runs.ts`, `node:http`. **Consommé par** : `index.ts`.

## AU4 — `notify` → `src/notify.ts`
**Boucle fermée — TROIS régimes, pas « un email par succès » (P2-G).**
- `notifyOwner(config, {subject, body, ok}, opts?)` diffuse vers `OWNER_EMAIL` par **Resend REST** et/ou **webhook** (Slack, générique), en parallèle sur tous les canaux configurés. `opts.fetchImpl` = couture de test (P1-D).
- **Best-effort absolu** : ne lève jamais ; chaque échec d'envoi est loggué, jamais propagé (sinon la notif d'un run en échec ferait elle-même échouer le process).
- **Trois régimes** (voir `index.ts`) : (1) succès nominal **silencieux/journalisé** (défaut, pas d'envoi — anti-spam) ; (2) **rapport périodique planifié** (une cadence dédiée, ex. digest, EST le succès notifié) ; (3) **alerte immédiate** (échec de run, garanti ; ou événement métier actionnable, au site du run).
- Application headless de `../../boucles-fermees.md` : l'accusé va au **propriétaire du job**, pas à un client final.
- **Dépend de** : `config.ts`, `supabase.ts` (`FetchImpl`). **Consommé par** : `index.ts`.

## AU5 (grain RUN) — `idempotency` → `src/idempotency.ts`
**Re-run sûr, pas de double effet — au grain du RUN.**
- `withIdempotency(config, rawKey, fn, opts?)` : clé **déterministe** (`node:crypto` sha256), **claim-avant** (un crash en plein vol ne rejoue pas l'effet), **skip** si la clé a tourné dans la fenêtre. Sur échec de `fn`, la clé est **relâchée** (retry propre possible).
- `opts.windowSec` **surcharge** `config.idempotencyWindowSec` (P0-A : ⚠️ sub-quotidien DOIT dériver sa fenêtre de sa cadence) ; `opts.fetchImpl` = couture de test (P1-D).
- Store Supabase `automation_idempotency` (durable, multi-instance) ; **fallback fichier** (`.automation/idempotency.json`) + cache mémoire si Supabase absent.
- **Dépend de** : `supabase.ts`, `node:crypto`, `node:fs`. **Consommé par** : `index.ts`.

## AU5 (grain ENTITÉ) — `store` → `src/store.ts` (P1-C)
**Idempotence d'ENTITÉ — « un besoin = au plus un ouvert » (le grain que `withIdempotency` NE couvre PAS).**
- `domainStore(config, spec, opts?)` : `listOpen` / `upsertOpen` / `close` sur une entité métier. Clé d'identité déterministe (`idem_key`, attributs **mutables exclus**).
- Deux branches : **Supabase** (upsert **RPC atomique** sur index unique **partiel** → unicité DB sous concurrence, la branche de vérité) ; **fichier** (`.automation/<table>.json`, ⚠️ mono-instance one-shot seulement — runner éphémère ⇒ Supabase obligatoire).
- **Dépend de** : `supabase.ts`, `node:crypto`, `node:fs`. **Patron SQL** : `migrations/0002_entity_idempotency.example.sql`.

## Orchestration — `src/index.ts`
`main()` (régime `sync`) enchaîne AU1 → AU3 (si port) → AU2 → **AU5(job)** → AU2 → **régime de notif AU4**. Succès nominal = **journalisé + silencieux** (régime 1) ; `try/catch` global : toute exception → `finishRun('failure')` + `notifyOwner(ok:false)` + `exit 1` (régime 3). Patron **dispatch `RUN_MODE`** (sync|digest…) commenté pour le multi-cadence. Le job métier est un **stub** `// TODO` que chaque projet remplace. `runJob`/`main` exportés (testables) ; le runner ne s'exécute que si le fichier est le point d'entrée.

## Support — `src/supabase.ts`
Client Supabase REST minimal (`restUrl`, `restHeaders` en service-role). Zéro SDK. Partagé par `runs.ts`, `idempotency.ts`, `store.ts`. Expose `resolveFetch`/`FetchImpl` : **couture `fetch` injectable** (défaut = global) → châssis testable sans réseau réel (P1-D).

## Test — `test/_smoke.test.ts` (P1-D)
Runner `node --test --import tsx` (script `npm test`, **0 dépendance runtime nouvelle**). Sentinelle TS + **patron de fixtures loopback** (`loopbackSupabase()` en mémoire) prouvant que le châssis se teste **sans réseau** via `fetchImpl`.

## Persistance — `migrations/0001_automation.sql` · `0002_entity_idempotency.example.sql`
- **0001** : `automation_runs` (AU2) + `automation_idempotency` (AU5 run). **RLS activée, aucune policy** → service-role only. Fonction `automation_prune_idempotency` en plpgsql conforme **lesson #15** (`#variable_conflict use_column`, params `p_`, vars `v_`, colonnes qualifiées, `search_path = ''`, `security definer` + `revoke`). **Supabase optionnel** : le worker tourne sans DB (fallback console/fichier).
- **0002 (EXEMPLE/template, ne tourne pas tel quel)** : patron d'idempotence d'**entité** (P1-C) — index unique **partiel** `WHERE statut='ouvert'` + **RPC upsert atomique** (lesson #15, RETURNING-safe). À copier/adapter par verticale.

---

### Ce que ce châssis n'a PAS (par archétype)
Pas de socle UI S1-S8, pas de dashboard, pas d'onboarding, pas d'auth produit, pas de Stripe, pas de Next.js/`app/`. L'admin de statut/logs éventuel est **optionnel** et hors de ce châssis minimal.
