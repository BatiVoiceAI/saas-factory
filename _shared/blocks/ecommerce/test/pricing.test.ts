// ─────────────────────────────────────────────────────────────────────────────
// pricing.test.ts — preuve du piège P2 (intégrité du prix), SANS réseau
// ─────────────────────────────────────────────────────────────────────────────
// Mire `automation/test/_smoke.test.ts` : runner `node --test --import tsx`,
// assertions `node:assert/strict`, ZÉRO dépendance runtime nouvelle, ZÉRO réseau.
// La dépendance de `computeOrderTotal` (le catalogue serveur) est injectée en clair
// sous forme de `Map` en mémoire — la fonction étant pure, aucun stub réseau n'est
// nécessaire. On prouve ici les deux exigences DURES de P2 :
//   1. un panier au PRIX CLIENT FALSIFIÉ est ignoré → total = Σ prix catalogue × qty ;
//   2. un `productId` absent du catalogue LÈVE (jamais de vente à prix arbitraire).
// Plus deux garde-fous de robustesse (qty client falsifiée ; panier vide).
//
// Lancement : `npm test` (glob `test/**/*.test.ts`).
// ─────────────────────────────────────────────────────────────────────────────

import { test } from "node:test";
import assert from "node:assert/strict";
import type { CartItem, Cents, Uuid } from "../src/types.js";
import { computeOrderTotal } from "../src/pricing.js";

// ── 1. P2 — un prix client falsifié est IGNORÉ (le serveur fait autorité) ─────
test("P2 : un panier au prix client falsifié est ignoré (total = catalogue × qty)", () => {
  // Un panier tel qu'un navigateur MALVEILLANT pourrait l'émettre : en plus des
  // champs légitimes (productId, qty), il injecte un prix falsifié. `CartItem`
  // (types.ts) ne porte AUCUN prix — on modélise donc le payload brut comme un
  // SUR-ENSEMBLE (structurellement assignable à `CartItem`) pour prouver que les
  // champs pirates ne sont jamais lus par la fonction de prix.
  type MaliciousCartItem = CartItem & {
    unitPriceCents: number;
    priceCents: number;
    total: number;
  };
  const falsifiedCart: MaliciousCartItem[] = [
    { productId: "prod-mug", qty: 2, unitPriceCents: 1, priceCents: 1, total: 2 },
    { productId: "prod-tee", qty: 1, unitPriceCents: 0, priceCents: 0, total: 0 },
  ];

  // Catalogue SERVEUR = seule autorité de prix (productId → unitPriceCents).
  const catalog = new Map<Uuid, Cents>([
    ["prod-mug", 1500], // 15,00 €
    ["prod-tee", 4200], // 42,00 €
  ]);

  const { totalCents, lines } = computeOrderTotal(falsifiedCart, catalog);

  // Total = prix SERVEUR × qty (1500×2 + 4200×1), et NON le prix client (1 et 0).
  assert.equal(totalCents, 1500 * 2 + 4200 * 1);
  assert.equal(totalCents, 7200);

  // Une ligne par article ; chaque ligne SNAPSHOTe le prix serveur, jamais le prix
  // falsifié du client (1 / 0).
  assert.equal(lines.length, 2);
  assert.equal(lines[0].productId, "prod-mug");
  assert.equal(lines[0].unitPriceCents, 1500);
  assert.equal(lines[0].qty, 2);
  assert.equal(lines[1].productId, "prod-tee");
  assert.equal(lines[1].unitPriceCents, 4200);
  assert.equal(lines[1].qty, 1);
});

// ── 2. P2 — un productId inconnu du catalogue LÈVE ───────────────────────────
test("P2 : un productId absent du catalogue serveur lève (commande refusée)", () => {
  const catalog = new Map<Uuid, Cents>([["prod-reel", 100]]);
  assert.throws(
    () => computeOrderTotal([{ productId: "prod-fantome", qty: 1 }], catalog),
    /absent du catalogue/,
    "un produit inconnu/non publié doit refuser la commande, jamais recevoir un prix par défaut",
  );
});

// ── 3. Robustesse — une quantité client falsifiée lève (jamais un total truqué) ─
test("P2 : une quantité non entière ou < 1 lève (qty client non fiable)", () => {
  const catalog = new Map<Uuid, Cents>([["prod-mug", 1500]]);

  // qty négative : sans garde-fou, elle abaisserait (voire inverserait) le total.
  assert.throws(
    () => computeOrderTotal([{ productId: "prod-mug", qty: -3 }], catalog),
    /Quantité invalide/,
  );
  // qty fractionnaire : un panier bien formé n'a que des quantités entières ≥ 1.
  assert.throws(
    () => computeOrderTotal([{ productId: "prod-mug", qty: 1.5 }], catalog),
    /Quantité invalide/,
  );
  // qty zéro : une ligne à 0 ne devrait pas exister (elle serait retirée du panier).
  assert.throws(
    () => computeOrderTotal([{ productId: "prod-mug", qty: 0 }], catalog),
    /Quantité invalide/,
  );
});

// ── 4. Cas limite — un panier vide renvoie un total nul, sans lever ───────────
test("panier vide : total 0 et aucune ligne (le refus du checkout vide est au call-site)", () => {
  const { totalCents, lines } = computeOrderTotal([], new Map<Uuid, Cents>());
  assert.equal(totalCents, 0);
  assert.deepEqual(lines, []);
});
