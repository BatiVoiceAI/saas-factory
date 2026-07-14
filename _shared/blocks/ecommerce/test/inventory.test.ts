// ─────────────────────────────────────────────────────────────────────────────
// P1 — Preuve de l'anti-survente SANS RÉSEAU (le piège n°1 de l'archétype)
// ─────────────────────────────────────────────────────────────────────────────
// Ce fichier a DEUX rôles (comme test/_smoke.test.ts du châssis automation) :
//   1. PROUVER l'invariant DUR P1 — deux décréments CONCURRENTS sur le dernier
//      article : un SEUL réussit, l'autre est refusé, le stock ne passe JAMAIS < 0.
//   2. PATRON DE FIXTURE — un `atomicDecrement` LOOPBACK en mémoire qui modélise
//      fidèlement l'`update inventory set stock = stock - qty where stock >= qty` du
//      moteur SQL : une SECTION CRITIQUE SYNCHRONE (compare-et-écrit indivisible)
//      précédée d'un point d'entrelacement `await`. C'est cette indivisibilité — et
//      non le hasard d'ordonnancement — qui garantit l'anti-survente, exactement
//      comme l'atomicité de l'UPDATE conditionnel côté Postgres.
//
// Lancement : `npm test` (glob `test/**/*.test.ts`, runner `node --test --import tsx`).
// ─────────────────────────────────────────────────────────────────────────────

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  decrementStock,
  OutOfStockError,
  type AtomicDecrement,
} from "../src/inventory.js";

/** UUID produit fixe pour les scénarios (une seule ligne de stock modélisée). */
const PID = "11111111-1111-1111-1111-111111111111";

/**
 * Fabrique un `atomicDecrement` LOOPBACK (zéro réseau) modélisant fidèlement
 * `update inventory set stock = stock - qty where product_id = id and stock >= qty`
 * pour UNE ligne de stock (un seul produit). L'atomicité — donc l'anti-survente —
 * repose sur la SECTION CRITIQUE SYNCHRONE (le `if stock >= qty` puis `stock -= qty`,
 * sans `await` entre les deux) : indivisible, comme l'UPDATE conditionnel du moteur.
 * Le `await Promise.resolve()` en amont ouvre un POINT D'ENTRELACEMENT réel : deux
 * appels lancés en parallèle s'y croisent (tels deux webhooks Stripe concurrents),
 * et la preuve tient QUAND MÊME parce que la section critique, elle, ne s'entrelace pas.
 */
function fakeInventory(initialStock: number): {
  decrement: AtomicDecrement;
  readonly stock: number;
  readonly calls: number;
} {
  let stock = initialStock;
  let calls = 0;

  const decrement: AtomicDecrement = async (_productId, qty) => {
    calls += 1;
    // Point d'entrelacement AVANT la section critique : les appels concurrents se
    // croisent ICI. Ce qui suit (compare-et-écrit) reste SYNCHRONE = indivisible.
    await Promise.resolve();
    if (stock >= qty) {
      stock -= qty; // 1 ligne affectée (la garde `stock >= qty` a tenu).
      return 1;
    }
    return 0; // 0 ligne affectée = rupture.
  };

  return {
    decrement,
    get stock() {
      return stock;
    },
    get calls() {
      return calls;
    },
  };
}

// ── 1. LE test mandaté : deux décréments concurrents sur stock=1 ──────────────
test("P1 : deux décréments concurrents sur stock=1 → un seul réussit, jamais de survente", async () => {
  const inv = fakeInventory(1);

  // Deux ventes du DERNIER article, lancées EN MÊME TEMPS (deux webhooks concurrents).
  // `allSettled` : on n'interrompt rien, on observe les deux issues.
  const results = await Promise.allSettled([
    decrementStock(PID, 1, inv.decrement),
    decrementStock(PID, 1, inv.decrement),
  ]);

  const fulfilled = results.filter((r) => r.status === "fulfilled");
  const rejected = results.filter((r) => r.status === "rejected");

  // EXACTEMENT un gagnant, EXACTEMENT un refusé : l'anti-survente en une ligne.
  assert.equal(fulfilled.length, 1, "un seul décrément doit réussir");
  assert.equal(rejected.length, 1, "l'autre doit être refusé (rupture)");

  // Le refus est bien une rupture P1 (OutOfStockError ciblant le bon produit),
  // pas une autre erreur qui masquerait un vrai bug.
  const reason = (rejected[0] as PromiseRejectedResult).reason;
  assert.ok(reason instanceof OutOfStockError, "le refus doit être une OutOfStockError");
  assert.equal(reason.productId, PID);
  assert.equal(reason.qty, 1);

  // L'invariant DUR : le stock finit à 0 et n'est JAMAIS passé sous zéro
  // (le pendant du `CHECK (stock >= 0)` en base). Les deux tentatives ont bien
  // frappé le décrément atomique (aucune n'a été court-circuitée en amont).
  assert.equal(inv.stock, 0, "le stock finit à 0, jamais négatif");
  assert.equal(inv.calls, 2, "les deux tentatives ont atteint le décrément atomique");
});

// ── 2. Chemin nominal : stock suffisant → vente appliquée ────────────────────
test("succès : 1 ligne affectée → décrément appliqué (vente)", async () => {
  const inv = fakeInventory(5);
  await decrementStock(PID, 3, inv.decrement); // ne doit pas lever
  assert.equal(inv.stock, 2, "stock 5 − 3 = 2");
});

// ── 3. Rupture simple : stock insuffisant → OutOfStockError, stock intact ─────
test("rupture : 0 ligne affectée → OutOfStockError, stock inchangé", async () => {
  const inv = fakeInventory(0);
  await assert.rejects(
    () => decrementStock(PID, 1, inv.decrement),
    (err: unknown) => err instanceof OutOfStockError && err.qty === 1,
  );
  assert.equal(inv.stock, 0, "un refus ne modifie pas le stock");
});

// ── 4. Garde d'entrée : une qty ≤ 0 est refusée AVANT tout décrément ──────────
// Preuve forte : sans garde, `qty = -5` ferait `stock - (-5) = stock + 5` — un
// décrément négatif GONFLERAIT le stock. La garde doit intercepter en amont.
test("garde : qty ≤ 0 refusée AVANT tout décrément (pas de gonflage de stock)", async () => {
  const inv = fakeInventory(1);
  await assert.rejects(() => decrementStock(PID, 0, inv.decrement), RangeError);
  await assert.rejects(() => decrementStock(PID, -5, inv.decrement), RangeError);
  await assert.rejects(() => decrementStock(PID, 1.5, inv.decrement), RangeError);
  assert.equal(inv.calls, 0, "atomicDecrement ne doit JAMAIS être appelé avec une qty invalide");
  assert.equal(inv.stock, 1, "une qty négative ne doit surtout pas augmenter le stock");
});

// ── 5. Défensif : un compte de lignes aberrant échoue fort (product_id est PK) ─
test("défensif : un décrément renvoyant > 1 ligne échoue fort (product_id est clé primaire)", async () => {
  const bogus: AtomicDecrement = async () => 2; // impossible contre une vraie base
  await assert.rejects(
    () => decrementStock(PID, 1, bogus),
    (err: unknown) => err instanceof Error && !(err instanceof OutOfStockError),
  );
});

// ── 6. P1 généralisé : N ventes concurrentes sur un stock borné ───────────────
// Au-delà de n=2 : 10 ventes simultanées sur stock=3 → EXACTEMENT 3 réussissent,
// 7 sont refusées, le stock atterrit à 0 (jamais négatif). L'atomicité tient à l'échelle.
test("P1 (généralisé) : 10 ventes concurrentes sur stock=3 → exactement 3 réussissent", async () => {
  const inv = fakeInventory(3);
  const attempts = Array.from({ length: 10 }, () =>
    decrementStock(PID, 1, inv.decrement),
  );
  const results = await Promise.allSettled(attempts);

  const ok = results.filter((r) => r.status === "fulfilled").length;
  const ko = results.filter((r) => r.status === "rejected").length;

  assert.equal(ok, 3, "autant de succès que de stock disponible");
  assert.equal(ko, 7, "toutes les tentatives excédentaires sont refusées");
  assert.equal(inv.stock, 0, "le stock ne passe jamais sous zéro");
});
