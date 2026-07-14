// ─────────────────────────────────────────────────────────────────────────────
// Sentinelle du runner + patron de fixtures LOOPBACK (mire automation/_smoke.test.ts)
// ─────────────────────────────────────────────────────────────────────────────
// Ce fichier a TROIS rôles (comme `automation/test/_smoke.test.ts`) :
//   1. SENTINELLE — prouver que la chaîne `node --test --import tsx` exécute bien un
//      test TypeScript ET que TOUS les modules du châssis se chargent (graphe d'import
//      sain : config, pricing, cart, inventory, orders, webhook, supabase, types).
//   2. FUMÉE TRANSVERSE — un touché rapide de chaque brique (config AU1-équiv +
//      EC2 panier + EC4 commande) et des trois pièges (P1/P2/P3). Les PREUVES DURES,
//      elles, vivent dans les tests dédiés : `pricing.test.ts` (P2), `inventory.test.ts`
//      (P1, concurrence), `webhook.test.ts` (P3, signature + idempotence).
//   3. PATRON DE FIXTURES — `loopbackFulfillRpc()` : un `fetchImpl` en mémoire qui
//      répond à `/rest/v1/rpc/fulfill_paid_order` de façon IDEMPOTENTE (imite
//      `on conflict do nothing`), + `signStripe()` (vraie signature HMAC node:crypto).
//      Ensemble : un e2e webhook→RPC SANS RÉSEAU réel, à copier par verticale.
//
// Lancement : `npm test` (glob `test/**/*.test.ts`, runner `node --test --import tsx`).
// ─────────────────────────────────────────────────────────────────────────────

import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

import { loadConfig } from "../src/config.js";
import { computeOrderTotal } from "../src/pricing.js";
import { addItem, setItemQty, removeItem, cartSubtotal } from "../src/cart.js";
import { decrementStock, OutOfStockError, type AtomicDecrement } from "../src/inventory.js";
import { buildOrderFromPaidSession, type OrderCatalog, type OrderCatalogEntry } from "../src/orders.js";
import {
  handleStripeWebhook,
  restUpsertOrder,
  stripeVerifier,
  CART_ITEMS_META_KEY,
  USER_ID_META_KEY,
} from "../src/webhook.js";
import { restUrl, restHeaders, resolveFetch, type FetchImpl, type SupabaseRest } from "../src/supabase.js";
import type { CartItem, Cents, Uuid } from "../src/types.js";

// UUID produit valide (le schéma zod des métadonnées webhook exige un uuid).
const PID_A: Uuid = "11111111-1111-4111-8111-111111111111";

// ── 1. SENTINELLE : le runner exécute du TS et tous les modules se chargent ───
test("harness : le runner node:test exécute du TypeScript et le graphe de modules se charge", () => {
  assert.equal(1 + 1, 2);
  // Chaque export public appelé au moins par son type : preuve que l'import a résolu.
  for (const fn of [
    loadConfig, computeOrderTotal, addItem, setItemQty, removeItem, cartSubtotal,
    decrementStock, buildOrderFromPaidSession, handleStripeWebhook, restUpsertOrder,
    stripeVerifier, restUrl, restHeaders, resolveFetch,
  ]) {
    assert.equal(typeof fn, "function");
  }
  assert.equal(typeof CART_ITEMS_META_KEY, "string");
  assert.equal(typeof USER_ID_META_KEY, "string");
});

// ── 2. Config (AU1-équiv) : valide un env complet, échoue TÔT sur un env cassé ─
// Aucun autre test ne couvre `loadConfig` : la sentinelle porte ce smoke. Les tests
// construisent des `Config` à la main (sans réseau) ; ici on prouve le fail-fast.
const COMPLETE_ENV: NodeJS.ProcessEnv = {
  SUPABASE_URL: "https://loopback.test",
  SUPABASE_SERVICE_ROLE_KEY: "svc-role-test",
  STRIPE_SECRET_KEY: "stripe-secret-test",
  STRIPE_WEBHOOK_SECRET: "whsec-test",
  RESEND_API_KEY: "resend-test",
  EMAIL_FROM: "Boutique <ventes@shop.test>",
};

test("config (AU1-équiv) : loadConfig valide un env complet et échoue tôt sinon", () => {
  const config = loadConfig(COMPLETE_ENV);
  assert.equal(config.supabase.url, "https://loopback.test");
  assert.equal(config.stripe.webhookSecret, "whsec-test");
  assert.equal(config.resend.from, "Boutique <ventes@shop.test>");

  // Env vide → message clair listant les variables fautives (jamais une boutique à
  // moitié configurée qui plante en plein checkout).
  assert.throws(() => loadConfig({}), /Configuration ecommerce invalide/);
});

// ── 3. P2 (fumée) : le total vient du serveur, un prix client est ignoré ──────
test("P2 (fumée) : computeOrderTotal recalcule serveur (le panier ne porte aucun prix)", () => {
  const catalog = new Map<Uuid, Cents>([
    [PID_A, 1500],
    ["22222222-2222-4222-8222-222222222222", 4200],
  ]);
  const items: CartItem[] = [
    { productId: PID_A, qty: 2 },
    { productId: "22222222-2222-4222-8222-222222222222", qty: 1 },
  ];
  const { totalCents, lines } = computeOrderTotal(items, catalog);
  assert.equal(totalCents, 1500 * 2 + 4200); // = 7200, depuis le catalogue serveur
  assert.equal(lines.length, 2);
});

// ── 4. EC2 (fumée) : le panier fusionne les qty, sans prix ; le sous-total délègue ─
test("EC2 (fumée) : addItem fusionne, le panier ne porte aucun prix, cartSubtotal délègue au serveur", () => {
  let items: CartItem[] = [];
  items = addItem(items, PID_A); //           qty 1
  items = addItem(items, PID_A, 2); //         fusion → qty 3 (invariant unique (cart,product))
  items = addItem(items, "b", 1);
  assert.equal(items.length, 2);
  assert.equal(items.find((l) => l.productId === PID_A)?.qty, 3);
  // Aucune ligne ne porte de prix (P2, garanti par le TYPE `CartItem`).
  for (const line of items) {
    assert.deepEqual(Object.keys(line).sort(), ["productId", "qty"]);
  }
  // Le sous-total vient du catalogue SERVEUR, jamais d'une donnée de panier.
  const catalog = new Map<Uuid, Cents>([[PID_A, 1000], ["b", 500]]);
  assert.equal(cartSubtotal(items, catalog), 3 * 1000 + 1 * 500);

  items = setItemQty(items, PID_A, 0); //      qty 0 ⇒ retrait
  items = removeItem(items, "b");
  assert.equal(items.length, 0);
});

// ── 5. P1 (fumée) : decrementStock — 1 ligne = vendu, 0 ligne = rupture ───────
test("P1 (fumée) : decrementStock délègue à l'atome — 1 ligne = vendu, 0 = OutOfStockError", async () => {
  const sold: AtomicDecrement = async () => 1;
  await decrementStock(PID_A, 1, sold); // ne lève pas

  const rupture: AtomicDecrement = async () => 0;
  await assert.rejects(() => decrementStock(PID_A, 1, rupture), OutOfStockError);
});

// ── 6. EC4 (fumée) : la commande de domaine snapshotte prix + libellé serveur (P2) ─
test("EC4 (fumée) : buildOrderFromPaidSession fige prix + libellé serveur (snapshot P2)", () => {
  const catalog: OrderCatalog = new Map<Uuid, OrderCatalogEntry>([
    [PID_A, { priceCents: 1500, name: "Mug émaillé", currency: "eur" }],
  ]);
  const { order, items } = buildOrderFromPaidSession(
    { stripeSessionId: "cs_smoke", customerEmail: "b@shop.test", userId: null, items: [{ productId: PID_A, qty: 2 }] },
    catalog,
  );
  assert.equal(order.status, "paid");
  assert.equal(order.currency, "eur");
  assert.equal(order.totalCents, 3000); //          Σ prix serveur × qty
  assert.equal(items[0]?.productName, "Mug émaillé"); // snapshot du libellé (comme la RPC 0003)
  assert.equal(items[0]?.unitPriceCents, 1500); //    snapshot du prix serveur
});

// ═════════════════════════════════════════════════════════════════════════════
// PATRON DE FIXTURES LOOPBACK (réutilisable) — e2e webhook → RPC SANS réseau
// ═════════════════════════════════════════════════════════════════════════════

/**
 * `fetchImpl` LOOPBACK en mémoire : répond à `/rest/v1/rpc/fulfill_paid_order` de
 * façon IDEMPOTENTE sur `p_stripe_session_id` (imite `on conflict do nothing` de la
 * RPC 0003). `orders.size` = nombre de commandes matérialisées. Étends ce patron aux
 * autres tables de ta verticale — miroir de `loopbackSupabase()` du châssis automation.
 */
function loopbackFulfillRpc(): { fetchImpl: FetchImpl; orders: Map<string, string> } {
  const orders = new Map<string, string>(); // p_stripe_session_id → order_id
  const fetchImpl: FetchImpl = async (input, init) => {
    const url = typeof input === "string" ? input : input.toString();
    if (url.includes("rpc/fulfill_paid_order") && (init?.method ?? "GET") === "POST") {
      const sid = (JSON.parse(String(init?.body)) as { p_stripe_session_id: string }).p_stripe_session_id;
      const existing = orders.get(sid);
      if (existing != null) {
        // Redelivery : la RPC ressort la commande existante, `already_processed = true`.
        return new Response(JSON.stringify([{ order_id: existing, already_processed: true }]), { status: 200 });
      }
      const orderId = `order_${orders.size + 1}`;
      orders.set(sid, orderId);
      return new Response(JSON.stringify([{ order_id: orderId, already_processed: false }]), { status: 200 });
    }
    return new Response("loopback : route inattendue", { status: 404 });
  };
  return { fetchImpl, orders };
}

/** En-tête `Stripe-Signature` valide — même schéma HMAC que `verifyStripeSignature`. */
function signStripe(rawBody: string, secret: string): string {
  const t = Math.floor(Date.now() / 1000);
  const hmac = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  return `t=${t},v1=${hmac}`;
}

test("P3 (fumée, e2e sans réseau) : signature HMAC réelle + RPC loopback ⇒ 3 redeliveries = 1 commande", async () => {
  const secret = "whsec-smoke-secret";
  const sb: SupabaseRest = { url: "https://loopback.test", serviceRoleKey: "svc-role-test" };
  const { fetchImpl, orders } = loopbackFulfillRpc();
  const deps = { verifySignature: stripeVerifier(secret), upsertOrder: restUpsertOrder(sb, fetchImpl) };

  const event = {
    id: "evt_smoke",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_smoke_1",
        customer_details: { email: "b@shop.test" },
        metadata: { [CART_ITEMS_META_KEY]: JSON.stringify([{ product_id: PID_A, qty: 2 }]) },
      },
    },
  };
  const rawBody = JSON.stringify(event);
  const header = signStripe(rawBody, secret);

  // Stripe redélivre 3× le MÊME événement (at-least-once).
  const r1 = await handleStripeWebhook(rawBody, header, deps);
  const r2 = await handleStripeWebhook(rawBody, header, deps);
  const r3 = await handleStripeWebhook(rawBody, header, deps);

  assert.equal(r1.outcome, "created");
  assert.equal(r2.outcome, "duplicate-ignored");
  assert.equal(r3.outcome, "duplicate-ignored");
  assert.equal(orders.size, 1, "3 redeliveries ⇒ 1 seule commande matérialisée (P3), sans réseau");

  // Signature invalide ⇒ rejet AVANT tout accès DB (aucune commande de plus).
  const bad = await handleStripeWebhook(rawBody, "t=1,v1=deadbeef", deps);
  assert.equal(bad.outcome, "invalid-signature");
  assert.equal(orders.size, 1, "une signature invalide n'écrit rien");
});
