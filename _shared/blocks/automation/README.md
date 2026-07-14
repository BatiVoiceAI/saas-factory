# Bloc / châssis — archétype `automation`

Châssis **headless** de l'archétype `automation` (worker / cron / bot / intégration) — parallèle au châssis `web-saas`, **sans** UI produit, **sans** Next.js/Vercel. Il implémente le socle **AU1-AU5** de `../../archetypes/automation.md` et réutilise conceptuellement la boucle fermée (`../../boucles-fermees.md`) **en autonome** (aucun import du châssis web-saas).

Ce README est le **manifeste** du bloc : il fait foi pour les noms de fichiers exacts.

## Manifeste des fichiers

| Fichier | Socle | Rôle |
|---|---|---|
| `src/config.ts` | **AU1** | Schéma **zod** des variables d'environnement → `loadConfig()` : parse + valide `process.env`, **échoue tôt** avec un message clair. Aucun secret en dur. |
| `src/runs.ts` | **AU2** | `startRun` / `log` / `finishRun` : historique des runs (id, name, début, fin, statut, résumé, logs) écrit dans Supabase `automation_runs` (REST) — **fallback console** si Supabase absent. `renderRun` (corps des notifs), `getLastRun` (pour AU3). |
| `src/health.ts` | **AU3** | `startHealthServer(port)` : mini serveur `node:http`, `GET /health` → 200 + dernier statut de run. Mode **long-running** seulement (port optionnel). |
| `src/notify.ts` | **AU4** | `notifyOwner({subject, body, ok})` : boucle fermée vers `OWNER_EMAIL` via **Resend REST** et/ou **webhook**. **Best-effort** (ne fait jamais échouer le run). Appelée sur **succès ET échec**. |
| `src/idempotency.ts` | **AU5** | `withIdempotency(config, key, fn, opts?)` : clé déterministe (`node:crypto` sha256), claim-avant, skip si déjà tournée dans la fenêtre. `opts.windowSec` **surcharge la fenêtre** (⚠️ sub-quotidien, cf. § Fenêtre d'idempotence) ; `opts.fetchImpl` = couture de test. Store Supabase `automation_idempotency` — **fallback fichier/mémoire**. |
| `src/store.ts` | **AU5 (grain ENTITÉ)** | `domainStore(config, spec, opts?)` : idempotence d'**entité** (« un besoin = au plus un ouvert »). Branche **Supabase** (upsert RPC atomique, unicité DB) + branche **fichier** (mono-instance one-shot). Le grain que `withIdempotency` (grain RUN) ne couvre PAS. |
| `src/index.ts` | — | `main()` (régime `sync`) : `loadConfig` → `startRun` → `withIdempotency(job)` → `finishRun` → **régime de notif AU4** (succès nominal **silencieux/journalisé** par défaut ; cf. § Trois régimes). `try/catch` global → `finishRun('failure')` + `notifyOwner(ok:false)` + `exit 1`. Patron **dispatch `RUN_MODE`** commenté. Job métier = **stub** `// TODO`. |
| `src/supabase.ts` | — | Client Supabase REST minimal (URL + headers service-role). Zéro SDK. `resolveFetch`/`FetchImpl` : **couture `fetch` injectable** (test loopback, P1-D). |
| `migrations/0001_automation.sql` | AU2/AU5 | Tables `automation_runs` + `automation_idempotency` (**RLS activée, service-role only**). Fonction de purge plpgsql conforme **lesson #15**. |
| `migrations/0002_entity_idempotency.example.sql` | AU5 (entité) | **EXEMPLE / template** (ne tourne pas tel quel) : patron d'idempotence d'entité — index unique **partiel** sur la clé d'identité + **RPC upsert atomique** (lesson #15, RETURNING-safe). À adapter par verticale. |
| `test/_smoke.test.ts` | — | Sentinelle du runner `node:test` + **patron de fixtures loopback** (teste le châssis SANS réseau via `fetchImpl`). |
| `.env.example` | AU1 | **Noms** de secrets uniquement — jamais de valeurs. |
| `package.json` · `tsconfig.json` | — | ESM strict NodeNext, `tsc --noEmit`- et `npm test`-vérifiable. |

## Design — dependency-light
- **Runtime = Node 20+ built-ins uniquement** : `fetch` global (Supabase REST, Resend REST, webhooks), `node:crypto`, `node:http`, `node:fs`, `process.env`.
- **Une seule dépendance externe** : `zod` (validation de la config). Dev : `typescript`, `@types/node`, `tsx`.
- **Pas de** `@supabase/supabase-js`, **pas de** SDK `resend` → tout en REST via `fetch` → deps minimales → `tsc` rapide à vérifier.
- ESM TypeScript strict (`module`/`moduleResolution` **NodeNext** → les imports relatifs portent l'extension `.js`).

## Socle AU1-AU5 (résumé)
1. **AU1 — config/secrets** déclarés, validés (zod), jamais en dur.
2. **AU2 — historique des runs + logs** consultables.
3. **AU3 — healthcheck / statut** d'exécution.
4. **AU4 — boucle fermée** : succès **comme** échec notifie/rapporte au **propriétaire** (email et/ou webhook).
5. **AU5 — idempotence** : re-run sûr, pas de double effet.

## Commandes
```bash
npm install          # zod + typescript + @types/node + tsx (7 paquets)
npm run typecheck    # tsc --noEmit  (doit être vert)
npm test             # node --test --import tsx "test/**/*.test.ts" (doit être vert)
npm run run:once     # tsx src/index.ts — un run one-shot (cron externe)
npm run dev          # tsx watch src/index.ts
npm run build        # tsc → dist/
npm start            # node dist/index.js
```

## Mapping des variables d'environnement (AU1)
Connectées **une fois, en amont, via `infra-setup`** — jamais ad hoc. Détails dans `.env.example`.

| Variable | Requis | Rôle |
|---|---|---|
| `OWNER_EMAIL` | **oui** | Destinataire de la boucle fermée (AU4). |
| `RESEND_API_KEY` + `EMAIL_FROM` | paire | Canal email de la boucle fermée. |
| `WEBHOOK_URL` | non | Canal webhook (ex. Slack). Au moins **un** canal (email **ou** webhook) requis. |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | paire | État d'automatisation (runs, idempotence). Absent → fallback console/fichier. |
| `CRON_SECRET` | non | Secret de déclenchement (protège un `/trigger` ou `/health`). |
| `IDEMPOTENCY_WINDOW_SEC` | non | Fenêtre d'idempotence PAR DÉFAUT (défaut `86400` = 24 h). ⚠️ Défaut **job quotidien** — sub-quotidien : cf. § Fenêtre d'idempotence. |
| `HEALTHCHECK_PORT` | non | Port `/health` (AU3). Défini → mode long-running. |
| `RUN_MODE` | non | (Patron) sélecteur de cadence pour le dispatch multi-cadence (ex. `sync`\|`digest`) — cf. § Trois régimes. Commenté dans `index.ts`, à câbler par verticale. |

## Fenêtre d'idempotence — ⚠️ le piège sub-quotidien (P0-A)
Le défaut `IDEMPOTENCY_WINDOW_SEC=86400` (24 h) + le bucket **jour calendaire** de `index.ts idempotencyKeyFor` sont calibrés pour un **job QUOTIDIEN**. Un worker **sub-quotidien** (cadence < 24 h — sync toutes les N h, la majorité des automations) qui s'appuie sur ce défaut voit **tous les runs après le 1er du jour SKIPPÉS EN SILENCE** (0 erreur : le worker croit tourner toutes les N h et ne tourne qu'1×/jour — l'inverse de l'intention).

→ Un worker sub-quotidien **DOIT** dériver sa fenêtre de sa cadence et bucketiser sa clé sur la **même période**, au site d'appel :
```ts
const periodeSec = SYNC_INTERVAL_HOURS * 3600;
const bucket = Math.floor(Date.now() / 1000 / periodeSec);   // fenêtre déterministe
await withIdempotency(config, `sync:${bucket}`, job, { windowSec: periodeSec });
```
`opts.windowSec` (prioritaire sur `config.idempotencyWindowSec`) évite le hack de clone de `Config`. Voir `IdempotencyOptions` (`src/idempotency.ts`).

## Trois régimes de notification (AU4 · P2-G)
La boucle fermée **n'est pas** « un email par succès » (à N=4 h ⇒ ~6 mails « run réussi »/jour = spam). Un worker réel combine :
1. **Succès nominal SILENCIEUX** (défaut de `index.ts`) — rien à signaler ⇒ on **journalise** (AU2) et on n'envoie rien.
2. **Rapport périodique planifié** — une cadence dédiée (ex. digest quotidien) envoie **un** récapitulatif : c'est LUI le « succès notifié ». Route via `RUN_MODE` (dispatch commenté dans `index.ts`, une 2ᵉ entrée cron).
3. **Alerte immédiate** — un échec de run (garanti, `catch` global) OU un événement métier actionnable (entité créée, seuil franchi) ⇒ `notifyOwner` **tout de suite**, au site du run.

## Idempotence d'ENTITÉ — le grain que `withIdempotency` ne couvre PAS (P1-C)
`withIdempotency` garantit « au plus un effet **par run** ». Dès qu'une automation **crée des entités**, le vrai risque est le grain **ENTITÉ** : « un besoin = au plus **une** entité ouverte », même sur plusieurs runs/instances/cadences. Il exige (rien de gratuit) :
- une **clé d'identité déterministe** (`idem_key`) — les attributs **mutables** (quantité, sévérité…) en sont **EXCLUS** (les inclure re-crée un doublon dès qu'ils changent) ;
- un **index unique PARTIEL** `WHERE statut = 'ouvert'` + un **upsert RPC atomique** (`INSERT ... ON CONFLICT`, jamais un `SELECT`-puis-`INSERT` applicatif).

Outillé par `src/store.ts` (`domainStore`, deux branches) + `migrations/0002_entity_idempotency.example.sql` (template à copier). ⚠️ La branche fichier ne tient l'invariant qu'en **mono-instance one-shot** ; sur runner **éphémère** (GitHub Actions, Cloud Scheduler), le disque est effacé à chaque tick → **Supabase obligatoire** (l'unicité vit dans la DB).

## Tester le châssis sans réseau réel (P1-D)
Tous les modules réseau (`runs` AU2, `idempotency` AU5, `notify` AU4, `store`) prennent un `fetchImpl` optionnel (défaut = `fetch` global). En test, on injecte une impl **loopback** en mémoire — zéro réseau. Patron réutilisable dans `test/_smoke.test.ts` :
```ts
function loopbackSupabase() {
  const store = new Map<string, string>();          // état en mémoire
  const fetchImpl: FetchImpl = async (input, init) => {
    const url = typeof input === "string" ? input : input.toString();
    // … router selon url + (init?.method ?? "GET") ; renvoyer new Response(json, {status})
  };
  return { fetchImpl, store };
}
// puis : await withIdempotency(config, key, job, { fetchImpl });
```

## Déploiement — trois cibles (pas de Vercel/Next.js)
- **Cron externe** (défaut jobs courts/périodiques) : un ordonnanceur (cron système, GitHub Actions `schedule`, Cloud Scheduler, Supabase pg_cron HTTP…) invoque `node dist/index.js` (mode one-shot). Pas de `HEALTHCHECK_PORT` : le process ouvre un run, exécute, notifie, sort (`0` succès / `1` échec).
- **Worker long-running / conteneur** : `HEALTHCHECK_PORT` défini → `GET /health` supervisable ; l'orchestrateur (Docker/Kubernetes/Fly machine) redémarre sur `exit 1` ou `/health` KO. Boucle de scheduling interne à ajouter selon le besoin.
- **Consommateur de queue / webhook handler** : `main()` s'invoque par message/événement ; l'idempotence (AU5) absorbe la livraison at-least-once.

Base de données **optionnelle** : appliquer `migrations/0001_automation.sql` sur le projet Supabase pour une trace durable et multi-instance ; sans DB, le worker tourne en fallback console/fichier.

## Vérification (critères d'acceptation, cf. fiche archétype)
- `npm run typecheck` **vert** (Node 20+, deps minimales).
- `npm test` **vert** (`node:test` via `tsx`, sentinelle + fixtures loopback).
- Run réussi nominal → **journalisé** (AU2) et **silencieux** par défaut (régime 1) ; notification = rapport périodique (régime 2) ou alerte métier (régime 3).
- Run en **échec** → `finishRun('failure')` + **alerte immédiate** au propriétaire (AU4, régime 3) + `exit 1`.
- **Re-run** dans la fenêtre → **skippé** (AU5, pas de double effet).
- `/health` répond quand `HEALTHCHECK_PORT` est défini (AU3).
- **Aucun secret en dur** ; config invalide → arrêt clair au démarrage (AU1).
