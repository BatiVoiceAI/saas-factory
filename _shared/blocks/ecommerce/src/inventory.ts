// ─────────────────────────────────────────────────────────────────────────────
// EC5 / P1 — Décrément de stock ATOMIQUE (anti-survente), au grain produit
// ─────────────────────────────────────────────────────────────────────────────
// Le piège n°1 de l'archétype ecommerce (portes 13/14) : deux clients achètent le
// DERNIER article « en même temps » → sans protection, les DEUX paient, un ne sera
// jamais livré (survente). La parade n'est PAS applicative : c'est un décrément
// CONDITIONNEL atomique porté par le moteur SQL —
//
//     update inventory set stock = stock - :qty
//     where product_id = :id and stock >= :qty;    -- 0 ligne affectée = rupture
//
// combiné à un `CHECK (stock >= 0)` en base (cf. migrations/0002_orders_inventory).
// L'atomicité vit DANS le moteur : l'`update ... where stock >= qty` compare-et-écrit
// en UNE opération indivisible. Deux décréments concurrents sur stock=1 : le premier
// prend la ligne (1 ligne affectée), le second n'a plus rien (0 ligne) → refusé.
//
// ⚠️ INTERDIT ABSOLU — le read-then-write : `select stock` PUIS `if stock > 0 then
// update`. Entre le SELECT et l'UPDATE s'ouvre une FENÊTRE DE COURSE : deux requêtes
// lisent stock=1, toutes deux passent le `if`, toutes deux décrémentent → stock=-1,
// survente. Ce module ne LIT JAMAIS le stock : il délègue le décrément conditionnel
// à `atomicDecrement` (injecté) et ne fait qu'INSPECTER le nombre de lignes affectées.
//
// ── Où le vrai décrément se produit-il ? ─────────────────────────────────────
// EN PROD, ce décrément n'est PAS émis ici isolément : il est UNE ligne de la RPC
// `fulfill_paid_order` (migrations/0003_fulfill_paid_order.sql), appelée par le
// WEBHOOK Stripe (service_role) sur `checkout.session.completed`. La RPC décrémente
// le stock ET crée la commande dans UNE seule transaction, idempotente sur
// `stripe_session_id` (P3) et au prix serveur recalculé depuis le catalogue (P2) :
// une rupture sur une ligne y lève un `raise exception` qui ANNULE TOUTE la vente
// (rollback stock + commande — jamais une commande à moitié créée).
//
// Ce module TS est le MIROIR PUR et TESTABLE (sans réseau, sans base, sans Stripe)
// de cet invariant : il fixe la sémantique « 1 ligne = vendu, 0 ligne = rupture »,
// vérifiable par `node:test` (cf. test/inventory.test.ts) exactement comme la couture
// `fetchImpl` du châssis automation. Le décrément réel, transactionnel, reste la RPC.
// ─────────────────────────────────────────────────────────────────────────────

import type { Uuid } from "./types.js";

/**
 * Décrément conditionnel atomique INJECTÉ — la couture de testabilité (l'équivalent
 * du `fetchImpl` du châssis automation). Sa signature est celle de l'`update
 * inventory set stock = stock - qty where product_id = id and stock >= qty` : il
 * renvoie le NOMBRE DE LIGNES AFFECTÉES (le `cmdTuples` PostgREST / rowCount). Contrat :
 *   • `1` → la ligne existait ET `stock >= qty` : décrément appliqué (vendu).
 *   • `0` → produit inexistant OU `stock < qty` : RUPTURE (aucun décrément).
 *
 * L'implémentation DOIT être atomique (compare-et-écrit indivisible) : c'est LE point
 * où l'anti-survente se joue. En prod, c'est la ligne SQL de la RPC `fulfill_paid_order`
 * (le moteur Postgres garantit l'atomicité) ; en test, un compteur mémoire à section
 * critique synchrone (cf. test/inventory.test.ts) qui modélise fidèlement cette garantie.
 * `inventory.product_id` étant clé primaire, cet UPDATE affecte AU PLUS une ligne.
 */
export type AtomicDecrement = (productId: Uuid, qty: number) => Promise<number>;

/**
 * Rupture de stock (P1) : le décrément conditionnel n'a affecté AUCUNE ligne — le
 * stock est insuffisant (ou le produit a disparu). Signale une SURVENTE ÉVITÉE : la
 * commande doit être refusée. En prod, l'équivalent est le `raise exception 'rupture
 * de stock'` de la RPC `fulfill_paid_order`, qui annule toute la transaction de vente.
 * Porte `productId` + `qty` pour un message marchand actionnable (boucle fermée EC4).
 */
export class OutOfStockError extends Error {
  readonly productId: Uuid;
  readonly qty: number;

  constructor(productId: Uuid, qty: number) {
    super(`Rupture de stock : produit ${productId} (quantité demandée : ${qty}).`);
    this.name = "OutOfStockError";
    this.productId = productId;
    this.qty = qty;
  }
}

/**
 * Décrémente ATOMIQUEMENT le stock d'un produit, ou REFUSE en cas de rupture (P1).
 *
 * Ne LIT JAMAIS le stock (aucun read-then-write) : délègue le décrément conditionnel
 * à `atomicDecrement` en UN seul appel, puis branche sur le nombre de lignes affectées.
 *   • 1 ligne  → succès (la promesse résout).
 *   • 0 ligne  → `OutOfStockError` (rupture / survente évitée) : la vente est refusée.
 *
 * Une erreur levée par `atomicDecrement` lui-même (panne réseau/DB en prod) se
 * PROPAGE telle quelle : une indisponibilité n'est pas une rupture, on ne l'avale pas.
 *
 * @param productId       produit ciblé (grain stock = produit, cf. `InventoryRow`).
 * @param qty             quantité à retirer — entier STRICTEMENT positif.
 * @param atomicDecrement décrément conditionnel atomique injecté (prod : ligne de la
 *                        RPC `fulfill_paid_order` ; test : fake mémoire sans réseau).
 * @throws RangeError      si `qty` n'est pas un entier > 0. Une qty ≤ 0 court-
 *                         circuiterait la garde `stock >= qty` — pire, une qty
 *                         NÉGATIVE AUGMENTERAIT le stock (`stock - (-n)`). On refuse
 *                         AVANT d'émettre le moindre décrément (le contrat `cart_items`
 *                         impose déjà `qty > 0`).
 * @throws OutOfStockError si 0 ligne affectée (rupture) — P1.
 * @throws Error           si le décrément renvoie un nombre de lignes ABERRANT
 *                         (< 0, > 1, ou non entier) : `inventory.product_id` étant clé
 *                         primaire, au plus 1 ligne peut matcher — tout autre compte
 *                         trahit un `atomicDecrement` qui viole son contrat. On échoue
 *                         FORT plutôt que de « réussir » à l'aveugle.
 */
export async function decrementStock(
  productId: Uuid,
  qty: number,
  atomicDecrement: AtomicDecrement,
): Promise<void> {
  // Garde d'entrée : une qty ≤ 0 (ou non entière) rendrait `where stock >= qty`
  // trivialement vrai — et une qty négative gonflerait le stock. On refuse AVANT
  // d'émettre le moindre décrément (jamais un UPDATE avec une quantité invalide).
  if (!Number.isInteger(qty) || qty <= 0) {
    throw new RangeError(
      `Quantité invalide (${qty}) : un entier strictement positif est requis.`,
    );
  }

  // Décrément conditionnel atomique — UN SEUL appel, AUCUNE lecture préalable (P1).
  const affected = await atomicDecrement(productId, qty);

  if (affected === 1) {
    return; // Vendu : la ligne existait et stock >= qty.
  }
  if (affected === 0) {
    throw new OutOfStockError(productId, qty); // Rupture (P1) : vente refusée.
  }

  // Compte aberrant : product_id est clé primaire ⇒ au plus 1 ligne matchée. Tout
  // autre nombre trahit un `atomicDecrement` cassé (ou un schéma changé) : échec franc.
  throw new Error(
    `Décrément de stock incohérent : ${affected} lignes affectées pour le produit ` +
      `${productId} (attendu 0 ou 1 ; product_id est clé primaire de inventory).`,
  );
}
