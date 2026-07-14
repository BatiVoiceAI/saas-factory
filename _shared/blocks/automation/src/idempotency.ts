// ─────────────────────────────────────────────────────────────────────────────
// AU5 — Idempotence : re-run sûr, pas de double effet
// ─────────────────────────────────────────────────────────────────────────────
// Un worker est déclenché AT-LEAST-ONCE : retry, double-tick cron, redelivery de
// webhook. Sans garde, la première reprise DOUBLE les effets métier. withIdempotency
// dérive une clé DÉTERMINISTE (sha256) de l'unité de travail, la RÉCLAME avant de
// lancer le job, et skippe si la clé a déjà tourné dans la fenêtre.
//
// Sémantique « claim-avant » :
//   • On pose le marqueur AVANT d'exécuter → un crash en plein job ne rejoue pas
//     l'effet (garantie « au plus un effet »).
//   • Si le job LÈVE, on RELÂCHE la clé → un échec franc peut être réessayé (le
//     travail n'a pas abouti). C'est le compromis retenu : pas de double effet sur
//     succès, retry possible sur échec.
//
// Store : Supabase `automation_idempotency` (durable, multi-instance) si configuré ;
// sinon fallback FICHIER local (`.automation/idempotency.json`) doublé d'un cache
// mémoire — suffisant pour un worker mono-instance/one-shot.
// ─────────────────────────────────────────────────────────────────────────────

import { createHash } from "node:crypto";
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

/** Résultat de withIdempotency : soit sauté (doublon), soit exécuté avec son résultat. */
export type IdempotencyOutcome<T> =
  | { skipped: true; result: null }
  | { skipped: false; result: T };

/** Abstraction de stockage : timestamp (ms) de la dernière réclamation d'une clé. */
type Store = {
  get: (key: string) => Promise<number | null>;
  claim: (key: string, at: number) => Promise<void>;
  release: (key: string) => Promise<void>;
};

/** Dérive une clé d'idempotence déterministe et bornée (sha256 hex) du brut fourni. */
export function deriveKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

// ── Store Supabase (durable) ────────────────────────────────────────────────
function supabaseStore(sb: SupabaseRest, fetchImpl: FetchImpl = fetch): Store {
  return {
    async get(key) {
      const res = await fetchImpl(
        restUrl(
          sb,
          `automation_idempotency?key=eq.${encodeURIComponent(key)}&select=claimed_at`,
        ),
        { headers: restHeaders(sb) },
      );
      if (!res.ok) {
        throw new Error(`get idempotency → ${res.status} ${await res.text()}`);
      }
      const rows = (await res.json()) as Array<{ claimed_at: string }>;
      const first = rows[0];
      if (first == null) return null;
      const ms = Date.parse(first.claimed_at);
      return Number.isNaN(ms) ? null : ms;
    },
    async claim(key, at) {
      // Upsert idempotent : merge-duplicates réécrit claimed_at sur la même clé.
      const res = await fetchImpl(restUrl(sb, "automation_idempotency"), {
        method: "POST",
        headers: restHeaders(sb, {
          Prefer: "resolution=merge-duplicates,return=minimal",
        }),
        body: JSON.stringify({ key, claimed_at: new Date(at).toISOString() }),
      });
      if (!res.ok) {
        throw new Error(`claim idempotency → ${res.status} ${await res.text()}`);
      }
    },
    async release(key) {
      const res = await fetchImpl(
        restUrl(sb, `automation_idempotency?key=eq.${encodeURIComponent(key)}`),
        { method: "DELETE", headers: restHeaders(sb, { Prefer: "return=minimal" }) },
      );
      if (!res.ok) {
        throw new Error(`release idempotency → ${res.status} ${await res.text()}`);
      }
    },
  };
}

// ── Store fallback fichier + mémoire (mono-instance) ────────────────────────
const FILE_PATH = join(process.cwd(), ".automation", "idempotency.json");
const memory = new Map<string, number>();

function readFileMap(): Record<string, number> {
  try {
    if (!existsSync(FILE_PATH)) return {};
    return JSON.parse(readFileSync(FILE_PATH, "utf8")) as Record<string, number>;
  } catch {
    return {};
  }
}

function writeFileMap(map: Record<string, number>): void {
  try {
    mkdirSync(dirname(FILE_PATH), { recursive: true });
    writeFileSync(FILE_PATH, JSON.stringify(map, null, 2), "utf8");
  } catch (err) {
    // Fichier indisponible (FS read-only en serverless…) : on garde le cache mémoire.
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[idempotency] écriture fichier ignorée, cache mémoire seul : ${msg}`);
  }
}

function fileStore(): Store {
  return {
    async get(key) {
      const fromMem = memory.get(key);
      if (fromMem != null) return fromMem;
      const at = readFileMap()[key];
      return at ?? null;
    },
    async claim(key, at) {
      memory.set(key, at);
      const map = readFileMap();
      map[key] = at;
      writeFileMap(map);
    },
    async release(key) {
      memory.delete(key);
      const map = readFileMap();
      delete map[key];
      writeFileMap(map);
    },
  };
}

/**
 * Surcharges explicites d'un claim d'idempotence (P0-A + P1-D). Évitent le HACK
 * de clone de `Config` (`{ ...config, idempotencyWindowSec }`) au site d'appel.
 */
export type IdempotencyOptions = {
  /**
   * ⚠️ Fenêtre d'idempotence (secondes) pour CE claim, PRIORITAIRE sur
   * `config.idempotencyWindowSec`. À FOURNIR pour tout worker SUB-QUOTIDIEN
   * (cadence < 24 h) : le défaut châssis est 86400 s (24 h) + bucket jour (voir
   * `index.ts idempotencyKeyFor`) → sans surcharge, tous les runs après le 1er
   * du jour seraient SKIPPÉS EN SILENCE (le worker croit tourner toutes les N h
   * mais ne tourne qu'1×/jour). Dérive-la de ta cadence, p.ex.
   * `windowSec: SYNC_INTERVAL_HOURS * 3600` + une `rawKey` bucketisée sur la même
   * période (`sync:${Math.floor(now/1000/windowSec)}`).
   */
  windowSec?: number;
  /** Impl `fetch` injectable (défaut = global) — couture de test loopback (P1-D). */
  fetchImpl?: FetchImpl;
};

/**
 * Exécute `fn` au plus une fois par clé et par fenêtre d'idempotence (AU5).
 *
 * @param config   config chargée (fenêtre par défaut + store Supabase ou fallback).
 * @param rawKey   identifiant de l'unité de travail (ex. `job:2026-07-12`, un
 *                 delivery-id de webhook…). Haché en clé déterministe. Pour une
 *                 cadence sub-quotidienne, BUCKETISE-le sur la période (sinon un
 *                 seul run/jour passe — cf. `IdempotencyOptions.windowSec`).
 * @param fn       le travail à protéger. Rejoué UNIQUEMENT s'il a échoué avant.
 * @param opts     surcharges explicites : `windowSec` (fenêtre de cadence, à
 *                 fournir en sub-quotidien) et `fetchImpl` (test loopback).
 * @returns        `{ skipped: true }` si doublon dans la fenêtre, sinon le résultat.
 */
export async function withIdempotency<T>(
  config: Config,
  rawKey: string,
  fn: () => Promise<T>,
  opts: IdempotencyOptions = {},
): Promise<IdempotencyOutcome<T>> {
  const key = deriveKey(rawKey);
  const store: Store = config.supabase
    ? supabaseStore(config.supabase, resolveFetch(opts.fetchImpl))
    : fileStore();
  const now = Date.now();
  // Fenêtre effective : la surcharge de cadence (P0-A) l'emporte sur le défaut config.
  const windowSec = opts.windowSec ?? config.idempotencyWindowSec;
  const windowMs = windowSec * 1000;

  // 1) Déjà réclamée dans la fenêtre ? → doublon, on skippe (pas de double effet).
  const previous = await store.get(key);
  if (previous != null && now - previous < windowMs) {
    return { skipped: true, result: null };
  }

  // 2) Réclamer AVANT d'exécuter (un crash en plein vol ne rejouera pas l'effet).
  await store.claim(key, now);

  // 3) Exécuter. En cas d'échec, RELÂCHER la clé pour permettre un retry propre.
  try {
    const result = await fn();
    return { skipped: false, result };
  } catch (err) {
    try {
      await store.release(key);
    } catch (releaseErr) {
      const msg =
        releaseErr instanceof Error ? releaseErr.message : String(releaseErr);
      console.warn(`[idempotency] relâche de clé après échec impossible : ${msg}`);
    }
    throw err;
  }
}
