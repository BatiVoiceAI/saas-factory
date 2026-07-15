// ─────────────────────────────────────────────────────────────────────────────
// Client Supabase REST minimal (fetch global, ZÉRO SDK)
// ─────────────────────────────────────────────────────────────────────────────
// Design dependency-light : on ne tire PAS `@supabase/supabase-js`. Le webhook de
// paiement parle à Postgres via PostgREST (`/rest/v1/<table>`, `/rest/v1/rpc/<fn>`)
// authentifié en service-role (bypass RLS). Ce module ne fait QUE fabriquer URL +
// headers : chaque call-site (catalogue, appel de la RPC fulfill_paid_order) gère
// ses verbes. Miroir exact du même module dans le châssis `automation`.
//
// ⚠️ La service-role bypasse la RLS et vaut « root » sur la base : elle vit
// UNIQUEMENT côté serveur (route webhook, jobs). JAMAIS dans un bundle client.
// ─────────────────────────────────────────────────────────────────────────────

/** Coordonnées Supabase résolues (cf. Config.supabase). */
export type SupabaseRest = { url: string; serviceRoleKey: string };

// ─────────────────────────────────────────────────────────────────────────────
// Couture de testabilité — `fetch` injectable
// ─────────────────────────────────────────────────────────────────────────────
// Tout le code qui fait du réseau (lecture catalogue, appel RPC) appelle `fetch`
// par cette indirection : en prod c'est le `fetch` GLOBAL de Node 20+ ; en test on
// injecte une impl loopback/mock (fonction qui renvoie des `Response`) pour prouver
// P1/P2/P3 SANS réseau réel. Aucune dépendance ajoutée : c'est le type du `fetch`
// natif. Même patron que `automation/test/_smoke.test.ts` (`loopbackSupabase`).

/** Type de l'implémentation `fetch` injectable (défaut = `fetch` global). */
export type FetchImpl = typeof fetch;

/**
 * Résout l'impl `fetch` à utiliser : celle injectée (test/loopback) sinon le
 * `fetch` global (prod). Point unique de la couture réseau du châssis.
 */
export function resolveFetch(fetchImpl?: FetchImpl): FetchImpl {
  return fetchImpl ?? fetch;
}

/**
 * Headers PostgREST en service-role : `apikey` + `Authorization: Bearer`. Le
 * service-role bypasse la RLS — c'est l'identité du webhook qui crée les commandes
 * et décrémente le stock via la RPC. Ne JAMAIS exposer cette clé côté client.
 */
export function restHeaders(
  sb: SupabaseRest,
  extra: Record<string, string> = {},
): Record<string, string> {
  return {
    apikey: sb.serviceRoleKey,
    Authorization: `Bearer ${sb.serviceRoleKey}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

/** Construit l'URL REST d'une ressource PostgREST (`table`, `table?filtre=...`, `rpc/<fn>`). */
export function restUrl(sb: SupabaseRest, pathAndQuery: string): string {
  return `${sb.url.replace(/\/+$/, "")}/rest/v1/${pathAndQuery}`;
}
