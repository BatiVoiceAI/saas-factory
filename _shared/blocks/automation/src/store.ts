// ─────────────────────────────────────────────────────────────────────────────
// P1-C — Store de DOMAINE (idempotence d'ENTITÉ) : le grain que le châssis
//         n'outillait PAS. Réutilisable pour UNE entité métier créée par un job.
// ─────────────────────────────────────────────────────────────────────────────
// `withIdempotency` (AU5) ne garantit que « au plus un effet PAR RUN ». Mais dès
// qu'une automation CRÉE des entités, le vrai risque est l'idempotence au grain de
// l'ENTITÉ : « un besoin = au plus UNE entité ouverte », même sur plusieurs runs,
// plusieurs instances, plusieurs cadences. Ça exige :
//   1. une CLÉ D'IDENTITÉ déterministe (`idem_key`) — les attributs MUTABLES
//      (quantité, sévérité…) en sont EXCLUS : les inclure re-crée un doublon dès
//      qu'ils changent (piège #16/#23 de la rétro) ;
//   2. un INDEX UNIQUE PARTIEL sur `idem_key WHERE statut = <ouvert>` (voir
//      `migrations/0002_entity_idempotency.example.sql`) ;
//   3. un UPSERT ATOMIQUE (RPC `INSERT ... ON CONFLICT`) — jamais un check
//      applicatif « SELECT puis INSERT » (fenêtre de course sous concurrence).
//
// Ce module fournit un store à DEUX branches, calqué sur `idempotency.ts` :
//   • branche SUPABASE (prod) — la SEULE qui enforce l'unicité sous CONCURRENCE
//     (via l'index partiel + la RPC atomique). C'est la branche de vérité.
//   • branche FICHIER (`.automation/<table>.json`) — run de test autonome / local
//     one-shot UNIQUEMENT.
//
// ⚠️ CAVEAT CONCURRENCE (branche fichier) : l'upsert fichier fait
//    « find-open-by-idem_key → update|insert » SANS contrainte transactionnelle.
//    Il ne tient l'invariant qu'en MONO-INSTANCE one-shot. Deux process/ticks
//    concurrents PEUVENT créer deux ouverts. Sur runner ÉPHÉMÈRE (GitHub Actions,
//    Cloud Scheduler…) le fichier est de toute façon effacé à chaque tick →
//    Supabase OBLIGATOIRE (l'unicité d'entité vit dans la DB, pas dans le fichier).
// ─────────────────────────────────────────────────────────────────────────────

import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Config } from "./config.js";
import {
  resolveFetch,
  restHeaders,
  restUrl,
  type FetchImpl,
  type SupabaseRest,
} from "./supabase.js";

/**
 * Contrat minimal d'une entité de domaine : un `id` de ligne + une CLÉ D'IDENTITÉ
 * déterministe (`idem_key`, attributs mutables EXCLUS). La vraie ligne porte aussi
 * un statut, des colonnes métier, des horodatages — le type concret l'étend.
 */
export type DomainEntity = { id: string; idem_key: string };

/**
 * Spécifie une entité de domaine + comment mapper un PAYLOAD d'upsert vers ses deux
 * branches. `T` = type de ligne, `P` = payload d'upsert (doit porter `idem_key`).
 */
export type DomainStoreSpec<T extends DomainEntity, P extends { idem_key: string }> = {
  /** Table PostgREST + base du nom de fichier fallback (`.automation/<table>.json`). */
  table: string;
  /** RPC d'upsert atomique (`INSERT ... ON CONFLICT` sur l'index unique PARTIEL). */
  upsertRpc: string;
  /** Valeur « ouverte » du statut — celle que filtre l'index unique partiel. */
  openStatus: string;
  /** Nom de la colonne de statut (défaut `"statut"`). */
  statusColumn?: string;
  /** Payload → arguments NOMMÉS de la RPC (branche Supabase). */
  toRpcArgs: (p: P) => Record<string, unknown>;
  /** Payload → NOUVELLE ligne complète (branche fichier, insert). */
  toRow: (p: P, id: string, now: string) => T;
  /** Révise sur place une ligne ouverte existante (branche fichier, update). */
  revise: (existing: T, p: P, now: string) => void;
  /**
   * (Optionnel) déduit `created` d'une ligne renvoyée par la RPC. La RPC atomique
   * ne distingue pas insert/update dans son retour ; sans ce mapper, la branche
   * Supabase renvoie `created: null` (indéterminé, best-effort — non critique).
   */
  wasCreated?: (row: T) => boolean;
};

/** Résultat d'un upsert : la ligne + si elle a été CRÉÉE (`null` = indéterminé, RPC). */
export type UpsertResult<T> = { row: T; created: boolean | null };

/** Store d'entité de domaine (deux branches) — cf. `domainStore`. */
export type DomainStore<T extends DomainEntity, P extends { idem_key: string }> = {
  /** Toutes les entités OUVERTES (statut = `spec.openStatus`). */
  listOpen(): Promise<T[]>;
  /**
   * Upsert idempotent sur `idem_key` d'une entité OUVERTE : révise si un ouvert
   * existe déjà pour cette clé, crée sinon. JAMAIS un 2ᵉ ouvert (invariant d'entité).
   */
  upsertOpen(p: P): Promise<UpsertResult<T>>;
  /**
   * Clôt les entités d'`ids` (statut ouvert → `patch` appliqué). Idempotent : ne
   * touche que les lignes encore ouvertes. Renvoie le nombre de lignes clôturées.
   */
  close(ids: string[], patch: Record<string, unknown>): Promise<number>;
};

// ── Branche FICHIER (mono-instance, run de test / local one-shot) ────────────
function filePath(baseDir: string, table: string): string {
  return join(baseDir, ".automation", `${table}.json`);
}

function readAll<T>(baseDir: string, table: string): T[] {
  const path = filePath(baseDir, table);
  if (!existsSync(path)) return [];
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8"));
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeAll<T>(baseDir: string, table: string, rows: T[]): void {
  const path = filePath(baseDir, table);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(rows, null, 2), "utf8");
}

/** Store fichier — ⚠️ n'enforce l'unicité d'entité qu'en MONO-INSTANCE one-shot. */
export function fileDomainStore<T extends DomainEntity, P extends { idem_key: string }>(
  spec: DomainStoreSpec<T, P>,
  baseDir: string,
): DomainStore<T, P> {
  const statusOf = (r: T): unknown => (r as Record<string, unknown>)[spec.statusColumn ?? "statut"];
  return {
    async listOpen() {
      return readAll<T>(baseDir, spec.table).filter((r) => statusOf(r) === spec.openStatus);
    },
    async upsertOpen(p) {
      const rows = readAll<T>(baseDir, spec.table);
      const now = new Date().toISOString();
      const existing = rows.find(
        (r) => r.idem_key === p.idem_key && statusOf(r) === spec.openStatus,
      );
      if (existing != null) {
        // Révision (attributs mutables HORS identité) : update, jamais un 2ᵉ ouvert.
        spec.revise(existing, p, now);
        writeAll(baseDir, spec.table, rows);
        return { row: { ...existing }, created: false };
      }
      const row = spec.toRow(p, randomUUID(), now);
      rows.push(row);
      writeAll(baseDir, spec.table, rows);
      return { row: { ...row }, created: true };
    },
    async close(ids, patch) {
      if (ids.length === 0) return 0;
      const rows = readAll<T>(baseDir, spec.table);
      const idSet = new Set(ids);
      let n = 0;
      for (const r of rows) {
        if (idSet.has(r.id) && statusOf(r) === spec.openStatus) {
          Object.assign(r, patch);
          n += 1;
        }
      }
      if (n > 0) writeAll(baseDir, spec.table, rows);
      return n;
    },
  };
}

// ── Branche SUPABASE (prod) — unicité d'entité = contrainte DB (index partiel) ─
/** Store Supabase — la branche de VÉRITÉ : enforce l'unicité d'entité sous concurrence. */
export function supabaseDomainStore<T extends DomainEntity, P extends { idem_key: string }>(
  sb: SupabaseRest,
  spec: DomainStoreSpec<T, P>,
  fetchImpl: FetchImpl = fetch,
): DomainStore<T, P> {
  const statusCol = spec.statusColumn ?? "statut";
  return {
    async listOpen() {
      const res = await fetchImpl(
        restUrl(
          sb,
          `${spec.table}?${statusCol}=eq.${encodeURIComponent(spec.openStatus)}&select=*`,
        ),
        { headers: restHeaders(sb) },
      );
      if (!res.ok) throw new Error(`get ${spec.table} → ${res.status} ${await res.text()}`);
      return (await res.json()) as T[];
    },
    async upsertOpen(p) {
      // RPC atomique : INSERT ... ON CONFLICT sur l'index unique PARTIEL (concurrence-safe).
      const res = await fetchImpl(restUrl(sb, `rpc/${spec.upsertRpc}`), {
        method: "POST",
        headers: restHeaders(sb),
        body: JSON.stringify(spec.toRpcArgs(p)),
      });
      if (!res.ok) {
        throw new Error(`rpc ${spec.upsertRpc} → ${res.status} ${await res.text()}`);
      }
      const row = (await res.json()) as T;
      return { row, created: spec.wasCreated ? spec.wasCreated(row) : null };
    },
    async close(ids, patch) {
      if (ids.length === 0) return 0;
      const inList = ids.map((id) => `"${id}"`).join(",");
      const res = await fetchImpl(
        restUrl(
          sb,
          `${spec.table}?${statusCol}=eq.${encodeURIComponent(spec.openStatus)}&id=in.(${inList})`,
        ),
        {
          method: "PATCH",
          headers: restHeaders(sb, { Prefer: "return=representation" }),
          body: JSON.stringify(patch),
        },
      );
      if (!res.ok) throw new Error(`patch ${spec.table} → ${res.status} ${await res.text()}`);
      const updated = (await res.json()) as T[];
      return updated.length;
    },
  };
}

/**
 * Sélectionne la branche selon la config : Supabase (prod, unicité DB) si
 * `config.supabase` est présent, sinon fichier (test/local one-shot). Injecte
 * `fetchImpl` (P1-D) et `baseDir` (isolation des tests) au besoin.
 *
 * @example
 * type Reappro = DomainEntity & { sku: string; qte: number; statut: string };
 * type Payload = { idem_key: string; sku: string; qte: number };
 * const store = domainStore<Reappro, Payload>(config, {
 *   table: "reappro", upsertRpc: "reconcile_reappro", openStatus: "proposé",
 *   toRpcArgs: (p) => ({ p_idem_key: p.idem_key, p_sku: p.sku, p_qte: p.qte }),
 *   toRow: (p, id, now) => ({ id, idem_key: p.idem_key, sku: p.sku, qte: p.qte,
 *     statut: "proposé", created_at: now, updated_at: now }),
 *   revise: (row, p, now) => { row.qte = p.qte; (row as any).updated_at = now; },
 * });
 */
export function domainStore<T extends DomainEntity, P extends { idem_key: string }>(
  config: Config,
  spec: DomainStoreSpec<T, P>,
  opts: { baseDir?: string; fetchImpl?: FetchImpl } = {},
): DomainStore<T, P> {
  return config.supabase
    ? supabaseDomainStore(config.supabase, spec, resolveFetch(opts.fetchImpl))
    : fileDomainStore(spec, opts.baseDir ?? process.cwd());
}
