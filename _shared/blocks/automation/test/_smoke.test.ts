// ─────────────────────────────────────────────────────────────────────────────
// P1-D — Sentinelle du runner de test + patron de fixtures LOOPBACK.
// ─────────────────────────────────────────────────────────────────────────────
// Ce fichier a DEUX rôles :
//   1. SENTINELLE : prouver que la chaîne `node --test --import tsx` exécute bien
//      un test TypeScript (0 dépendance runtime nouvelle — `node:test` intégré).
//   2. PATRON DE FIXTURES : montrer comment tester le châssis SANS RÉSEAU RÉEL,
//      grâce à la couture `fetchImpl` injectable (P1-D). Une verticale reprend ce
//      `loopbackSupabase()` pour prouver son ingestion custom / son e2e hors-ligne.
//
// Lancement : `npm test` (glob `test/**/*.test.ts`).
// ─────────────────────────────────────────────────────────────────────────────

import { test } from "node:test";
import assert from "node:assert/strict";
import type { Config } from "../src/config.js";
import { withIdempotency } from "../src/idempotency.js";
import type { FetchImpl } from "../src/supabase.js";

// ── 1. Sentinelle : le runner exécute bien du TypeScript ─────────────────────
test("harness : le runner node:test exécute un test TypeScript", () => {
  assert.equal(1 + 1, 2);
});

// ── 2. Fixture loopback : un faux Supabase REST en mémoire (ZÉRO réseau) ──────
// Modèle réutilisable : un `fetchImpl` qui répond aux verbes PostgREST de la table
// `automation_idempotency` depuis une Map en mémoire. On l'injecte via `opts` — le
// châssis ne touche jamais le réseau. Étends ce patron aux tables de ta verticale.
function loopbackSupabase(): { fetchImpl: FetchImpl; store: Map<string, string> } {
  const store = new Map<string, string>(); // key → claimed_at ISO
  const fetchImpl: FetchImpl = async (input, init) => {
    const url = typeof input === "string" ? input : input.toString();
    const method = init?.method ?? "GET";

    if (url.includes("automation_idempotency")) {
      const keyMatch = url.match(/key=eq\.([^&]+)/);
      const key = keyMatch ? decodeURIComponent(keyMatch[1]!) : "";
      if (method === "GET") {
        const claimed = store.get(key);
        const rows = claimed != null ? [{ claimed_at: claimed }] : [];
        return new Response(JSON.stringify(rows), { status: 200 });
      }
      if (method === "POST") {
        const payload = JSON.parse(String(init?.body)) as {
          key: string;
          claimed_at: string;
        };
        store.set(payload.key, payload.claimed_at);
        return new Response(null, { status: 201 });
      }
      if (method === "DELETE") {
        store.delete(key);
        return new Response(null, { status: 204 });
      }
    }
    return new Response("loopback: route inattendue", { status: 404 });
  };
  return { fetchImpl, store };
}

/** Construit une Config minimale « avec Supabase » pour les tests (pas de réseau). */
function testConfig(): Config {
  return {
    supabase: { url: "https://loopback.test", serviceRoleKey: "svc-role-test" },
    resend: null,
    owner: { email: "owner@test.local" },
    webhookUrl: null,
    cronSecret: null,
    idempotencyWindowSec: 3600, // fenêtre sub-quotidienne explicite (1 h)
    healthcheckPort: null,
  };
}

test("fixtures : withIdempotency testable via fetchImpl loopback (sans réseau)", async () => {
  const { fetchImpl, store } = loopbackSupabase();
  const config = testConfig();
  let effets = 0;

  // 1er déclenchement dans la fenêtre → exécuté (effet appliqué une fois).
  const first = await withIdempotency(
    config,
    "job:fixture",
    async () => {
      effets += 1;
      return "fait";
    },
    { fetchImpl },
  );
  assert.equal(first.skipped, false);
  assert.equal(first.result, "fait");

  // 2ᵉ déclenchement même clé dans la fenêtre → SKIPPÉ (pas de double effet AU5).
  const second = await withIdempotency(
    config,
    "job:fixture",
    async () => {
      effets += 1;
      return "fait";
    },
    { fetchImpl },
  );
  assert.equal(second.skipped, true);

  assert.equal(effets, 1, "l'effet ne doit s'appliquer qu'une fois (idempotence)");
  assert.equal(store.size, 1, "une seule clé réclamée dans le store loopback");
});

test("fixtures : surcharge windowSec (P0-A) prise en compte au site d'appel", async () => {
  const { fetchImpl } = loopbackSupabase();
  const config = testConfig();

  // Fenêtre de cadence explicite (2 h) surchargeant le défaut config — sub-quotidien.
  const opts = { fetchImpl, windowSec: 2 * 3600 };
  const a = await withIdempotency(config, "sync:bucket", async () => "ok", opts);
  const b = await withIdempotency(config, "sync:bucket", async () => "ok", opts);
  assert.equal(a.skipped, false);
  assert.equal(b.skipped, true);
});
