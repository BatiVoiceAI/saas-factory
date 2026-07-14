// ─────────────────────────────────────────────────────────────────────────────
// Preuve du webhook Stripe (P2 + P3) SANS RÉSEAU — deps injectées + loopback.
// ─────────────────────────────────────────────────────────────────────────────
// Deux exigences DURES prouvées ici, comme le smoke-test d'idempotence du châssis
// automation, mais au grain e-commerce :
//   • P3 (idempotence) — 3 REDELIVERIES du MÊME événement (même stripeSessionId)
//     ⇒ 1 SEULE commande créée ; les reprises ressortent `duplicate-ignored`.
//   • P3 (signature)   — une signature INVALIDE (ou absente) est rejetée AVANT tout
//     accès DB : `upsertOrder` n'est JAMAIS appelé, zéro écriture.
// + preuves de renfort : vérificateur HMAC réel (node:crypto, zéro SDK Stripe),
//   couture REST `restUpsertOrder` idempotente en loopback, P2 (aucun prix ne
//   transite), parité checkout.session ⇄ payment_intent, type ignoré acquitté.
//
// Lancement : `npm test` (glob `test/**/*.test.ts`, runner `node --test --import tsx`).
// ─────────────────────────────────────────────────────────────────────────────

import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  handleStripeWebhook,
  restUpsertOrder,
  stripeVerifier,
  StripeSignatureError,
  CART_ITEMS_META_KEY,
  USER_ID_META_KEY,
  type StripeWebhookEvent,
  type VerifySignature,
  type UpsertOrder,
  type UpsertOrderInput,
} from "../src/webhook.js";
import type { FetchImpl } from "../src/supabase.js";

// ── Fixtures partagées ───────────────────────────────────────────────────────

const GOOD_SIG = "sig_ok";
const PRODUCT_A = "11111111-1111-4111-8111-111111111111";
const USER_ID = "22222222-2222-4222-8222-222222222222";

/** Construit un événement Stripe minimal (checkout.session.completed par défaut). */
function makeEvent(opts: {
  id?: string;
  type?: string;
  sessionId: string;
  email?: string | null;
  items?: Array<{ product_id: string; qty: number }>;
  userId?: string;
}): StripeWebhookEvent {
  const items = opts.items ?? [{ product_id: PRODUCT_A, qty: 2 }];
  const metadata: Record<string, string> = {
    [CART_ITEMS_META_KEY]: JSON.stringify(items),
  };
  if (opts.userId != null) metadata[USER_ID_META_KEY] = opts.userId;
  return {
    id: opts.id ?? "evt_1",
    type: opts.type ?? "checkout.session.completed",
    data: {
      object: {
        id: opts.sessionId,
        customer_details: { email: opts.email === undefined ? "buyer@test.local" : opts.email },
        metadata,
      },
    },
  };
}

/**
 * Fake `upsertOrder` à store MÉMOIRE, idempotent sur `stripeSessionId` (imite le
 * `on conflict do nothing` de la RPC). `orders.size` = nombre de commandes créées ;
 * `captured` = chaque appel reçu (pour prouver P2 et le compte d'appels).
 */
function fakeUpsertStore(): {
  upsertOrder: UpsertOrder;
  orders: Map<string, string>;
  captured: UpsertOrderInput[];
} {
  const orders = new Map<string, string>(); // stripeSessionId → orderId
  const captured: UpsertOrderInput[] = [];
  const upsertOrder: UpsertOrder = async (input) => {
    captured.push(input);
    const existing = orders.get(input.stripeSessionId);
    if (existing != null) {
      return { orderId: existing, alreadyProcessed: true };
    }
    const orderId = `order_${orders.size + 1}`;
    orders.set(input.stripeSessionId, orderId);
    return { orderId, alreadyProcessed: false };
  };
  return { upsertOrder, orders, captured };
}

/** Fake `verifySignature` : rend l'événement si la signature vaut `GOOD_SIG`, sinon LÈVE. */
function fakeVerifier(): VerifySignature {
  return (rawBody, signature) => {
    if (signature !== GOOD_SIG) {
      throw new StripeSignatureError("fake : signature invalide");
    }
    const text = typeof rawBody === "string" ? rawBody : Buffer.from(rawBody).toString("utf8");
    return JSON.parse(text) as StripeWebhookEvent;
  };
}

/** Calcule un en-tête `Stripe-Signature` valide (même schéma que verifyStripeSignature). */
function signStripe(rawBody: string, secret: string, tSec = Math.floor(Date.now() / 1000)): string {
  const hmac = createHmac("sha256", secret).update(`${tSec}.${rawBody}`).digest("hex");
  return `t=${tSec},v1=${hmac}`;
}

/** Petit orderId ressorti d'un résultat (created/duplicate) — sinon chaîne vide. */
function orderIdOf(res: Awaited<ReturnType<typeof handleStripeWebhook>>): string {
  return res.outcome === "created" || res.outcome === "duplicate-ignored" ? res.orderId : "";
}

// ═════════════════════════════════════════════════════════════════════════════
// P3 — Idempotence : 3 redeliveries du MÊME event ⇒ 1 seule commande
// ═════════════════════════════════════════════════════════════════════════════
test("P3 idempotence : 3 redeliveries du même event ⇒ 1 commande créée", async () => {
  const event = makeEvent({ sessionId: "cs_test_dup" });
  const rawBody = JSON.stringify(event);
  const { upsertOrder, orders, captured } = fakeUpsertStore();
  const deps = { verifySignature: fakeVerifier(), upsertOrder };

  // Stripe redélivre 3× le MÊME événement (at-least-once).
  const r1 = await handleStripeWebhook(rawBody, GOOD_SIG, deps);
  const r2 = await handleStripeWebhook(rawBody, GOOD_SIG, deps);
  const r3 = await handleStripeWebhook(rawBody, GOOD_SIG, deps);

  // 1re livraison = création ; les suivantes = redelivery absorbée.
  assert.equal(r1.outcome, "created");
  assert.equal(r2.outcome, "duplicate-ignored");
  assert.equal(r3.outcome, "duplicate-ignored");

  // ⇒ UNE SEULE commande matérialisée malgré 3 livraisons (l'exigence centrale P3).
  assert.equal(orders.size, 1, "exactement une commande créée");
  assert.equal(captured.length, 3, "upsertOrder appelé à chaque livraison (idempotence portée par le store)");

  // Le même orderId ressort aux 3 livraisons (pas de commande fantôme).
  const distinctIds = new Set([r1, r2, r3].map(orderIdOf));
  assert.equal(distinctIds.size, 1, "le même orderId est ressorti aux 3 livraisons");

  // P2 — aucune ligne ne porte de prix : le store ne reçoit QUE productId + qty.
  for (const input of captured) {
    for (const line of input.items) {
      assert.deepEqual(
        Object.keys(line).sort(),
        ["productId", "qty"],
        "ligne = productId + qty SEULEMENT (aucun prix ne transite — P2)",
      );
    }
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// P3 — Signature invalide : rejet AVANT tout accès DB (zéro écriture)
// ═════════════════════════════════════════════════════════════════════════════
test("P3 signature : une signature invalide est rejetée sans écrire", async () => {
  const event = makeEvent({ sessionId: "cs_test_bad" });
  const rawBody = JSON.stringify(event);
  const { upsertOrder, orders, captured } = fakeUpsertStore();
  const deps = { verifySignature: fakeVerifier(), upsertOrder };

  // Signature forgée ⇒ verifySignature lève ⇒ handler rejette AVANT la DB.
  const forged = await handleStripeWebhook(rawBody, "sig_forgee", deps);
  assert.equal(forged.outcome, "invalid-signature");
  assert.equal(captured.length, 0, "upsertOrder ne doit JAMAIS être appelé sur signature invalide");
  assert.equal(orders.size, 0, "aucune commande écrite");

  // En-tête absent (null) ⇒ même rejet, toujours zéro écriture.
  const missing = await handleStripeWebhook(rawBody, null, deps);
  assert.equal(missing.outcome, "invalid-signature");
  assert.equal(captured.length, 0, "toujours aucun appel DB");
  assert.equal(orders.size, 0);
});

// ═════════════════════════════════════════════════════════════════════════════
// Renfort — Vérificateur HMAC réel (node:crypto), zéro SDK Stripe
// ═════════════════════════════════════════════════════════════════════════════
test("verifyStripeSignature (node:crypto) : corps signé ACCEPTÉ, corps altéré REJETÉ", async () => {
  const secret = "whsec_test_deadbeef";
  const event = makeEvent({ sessionId: "cs_signed" });
  const rawBody = JSON.stringify(event);
  const header = signStripe(rawBody, secret);
  const { upsertOrder, orders, captured } = fakeUpsertStore();
  const deps = { verifySignature: stripeVerifier(secret), upsertOrder };

  // Corps intact + signature concordante ⇒ commande créée.
  const ok = await handleStripeWebhook(rawBody, header, deps);
  assert.equal(ok.outcome, "created");
  assert.equal(orders.size, 1);

  // Corps ALTÉRÉ (même en-tête) ⇒ HMAC ne concorde plus ⇒ rejet, zéro écriture de plus.
  const tampered = rawBody + " ";
  const bad = await handleStripeWebhook(tampered, header, deps);
  assert.equal(bad.outcome, "invalid-signature");
  assert.equal(orders.size, 1, "le corps altéré n'a créé aucune commande supplémentaire");
  assert.equal(captured.length, 1, "un seul upsert au total (le corps authentique)");
});

// ═════════════════════════════════════════════════════════════════════════════
// Renfort — restUpsertOrder mappe vers la RPC (snake) et reste idempotent (loopback)
// ═════════════════════════════════════════════════════════════════════════════
test("restUpsertOrder : mappe vers la RPC fulfill_paid_order et reste idempotent (sans réseau)", async () => {
  // Loopback : imite `/rest/v1/rpc/fulfill_paid_order` idempotent sur p_stripe_session_id.
  const rows = new Map<string, string>(); // p_stripe_session_id → order_id
  const bodies: string[] = [];
  const fetchImpl: FetchImpl = async (input, init) => {
    const url = typeof input === "string" ? input : input.toString();
    if (url.includes("rpc/fulfill_paid_order") && (init?.method ?? "GET") === "POST") {
      const body = String(init?.body);
      bodies.push(body);
      const sid = (JSON.parse(body) as { p_stripe_session_id: string }).p_stripe_session_id;
      const existing = rows.get(sid);
      if (existing != null) {
        return new Response(JSON.stringify([{ order_id: existing, already_processed: true }]), {
          status: 200,
        });
      }
      const orderId = `order_${rows.size + 1}`;
      rows.set(sid, orderId);
      return new Response(JSON.stringify([{ order_id: orderId, already_processed: false }]), {
        status: 200,
      });
    }
    return new Response("loopback : route inattendue", { status: 404 });
  };

  const sb = { url: "https://loopback.test", serviceRoleKey: "svc-role-test" };
  const deps = { verifySignature: fakeVerifier(), upsertOrder: restUpsertOrder(sb, fetchImpl) };
  const rawBody = JSON.stringify(makeEvent({ sessionId: "cs_rest", userId: USER_ID }));

  const a = await handleStripeWebhook(rawBody, GOOD_SIG, deps);
  const b = await handleStripeWebhook(rawBody, GOOD_SIG, deps);
  const c = await handleStripeWebhook(rawBody, GOOD_SIG, deps);

  assert.equal(a.outcome, "created");
  assert.equal(b.outcome, "duplicate-ignored");
  assert.equal(c.outcome, "duplicate-ignored");
  assert.equal(rows.size, 1, "une seule commande matérialisée côté RPC loopback (P3 traverse la couche REST)");

  // Le corps POSTé respecte le CONTRAT de la RPC 0003 (paramètres p_*, items en snake, SANS prix).
  const first = JSON.parse(bodies[0]!) as {
    p_stripe_session_id: string;
    p_customer_email: string;
    p_user_id: string | null;
    p_items: Array<Record<string, unknown>>;
  };
  assert.equal(first.p_stripe_session_id, "cs_rest");
  assert.equal(first.p_customer_email, "buyer@test.local");
  assert.equal(first.p_user_id, USER_ID);
  assert.deepEqual(first.p_items, [{ product_id: PRODUCT_A, qty: 2 }]);
});

// ═════════════════════════════════════════════════════════════════════════════
// Renfort — payment_intent.succeeded matérialise aussi la vente (parité)
// ═════════════════════════════════════════════════════════════════════════════
test("parité : payment_intent.succeeded matérialise la vente (e-mail via receipt_email)", async () => {
  const event = makeEvent({ sessionId: "pi_ok", type: "payment_intent.succeeded" });
  // Payment Intent : pas de customer_details ; l'e-mail vient de receipt_email.
  event.data.object.customer_details = null;
  event.data.object.customer_email = null;
  event.data.object.receipt_email = "buyer@pi.local";
  const { upsertOrder, orders, captured } = fakeUpsertStore();

  const res = await handleStripeWebhook(JSON.stringify(event), GOOD_SIG, {
    verifySignature: fakeVerifier(),
    upsertOrder,
  });

  assert.equal(res.outcome, "created");
  assert.equal(orders.size, 1);
  assert.equal(captured[0]!.customerEmail, "buyer@pi.local");
  assert.equal(captured[0]!.userId, null, "achat invité par défaut (aucun user_id en métadonnées)");
});

// ═════════════════════════════════════════════════════════════════════════════
// Renfort — un type d'événement non concerné est acquitté sans effet
// ═════════════════════════════════════════════════════════════════════════════
test("type non concerné : acquitté (event-ignored) sans aucun accès DB", async () => {
  const event = makeEvent({ sessionId: "pi_created", type: "payment_intent.created" });
  const { upsertOrder, captured } = fakeUpsertStore();

  const res = await handleStripeWebhook(JSON.stringify(event), GOOD_SIG, {
    verifySignature: fakeVerifier(),
    upsertOrder,
  });

  assert.equal(res.outcome, "event-ignored");
  assert.equal(captured.length, 0, "aucun upsert sur un type d'événement ignoré");
});
