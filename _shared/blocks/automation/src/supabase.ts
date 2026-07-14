// ─────────────────────────────────────────────────────────────────────────────
// Client Supabase REST minimal (fetch global, ZÉRO SDK)
// ─────────────────────────────────────────────────────────────────────────────
// Design dependency-light : on ne tire PAS `@supabase/supabase-js`. L'état
// d'automatisation (runs AU2, idempotence AU5) tient en quelques requêtes REST
// via PostgREST (`/rest/v1/<table>`), authentifiées en service-role (bypass RLS).
// Ce module ne fait QUE fabriquer URL + headers : chaque table gère ses verbes.
// ─────────────────────────────────────────────────────────────────────────────

/** Coordonnées Supabase résolues (cf. Config.supabase). */
export type SupabaseRest = { url: string; serviceRoleKey: string };

// ─────────────────────────────────────────────────────────────────────────────
// Couture de testabilité (P1-D) — `fetch` injectable
// ─────────────────────────────────────────────────────────────────────────────
// Tous les modules qui font du réseau (runs AU2, idempotency AU5, notify AU4)
// appellent `fetch` par cette indirection : en prod c'est le `fetch` GLOBAL de
// Node 20+ ; en test on injecte une impl loopback/mock (serveur `node:http` local
// ou fonction qui renvoie des `Response`) pour prouver une ingestion custom ou un
// e2e SANS réseau réel. Aucune dépendance ajoutée : c'est le type du `fetch` natif.

/** Type de l'implémentation `fetch` injectable (défaut = `fetch` global). */
export type FetchImpl = typeof fetch;

/**
 * Résout l'impl `fetch` à utiliser : celle injectée (test/loopback) sinon le
 * `fetch` global (prod). Point unique de la couture réseau du châssis (P1-D).
 */
export function resolveFetch(fetchImpl?: FetchImpl): FetchImpl {
  return fetchImpl ?? fetch;
}

/**
 * Headers PostgREST en service-role : `apikey` + `Authorization: Bearer`. Le
 * service-role bypasse la RLS — ces tables sont volontairement sans policy
 * (infrastructure serveur, pas ressource utilisateur). Ne JAMAIS exposer cette
 * clé côté client.
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

/** Construit l'URL REST d'une ressource PostgREST (`table` ou `table?filtre=...`). */
export function restUrl(sb: SupabaseRest, pathAndQuery: string): string {
  return `${sb.url.replace(/\/+$/, "")}/rest/v1/${pathAndQuery}`;
}
