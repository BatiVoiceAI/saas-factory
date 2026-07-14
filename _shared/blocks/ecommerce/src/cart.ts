// ─────────────────────────────────────────────────────────────────────────────
// EC2 — Panier : opérations PURES + sous-total RECALCULÉ SERVEUR (P2)
// ─────────────────────────────────────────────────────────────────────────────
// Le panier est une donnée de CONFORT (`../../archetypes/ecommerce.md §EC2`,
// migrations/0002 `cart_items`) : une liste de `CartItem` = { productId, qty } et
// RIEN d'autre — AUCUN prix (P2, porté par le TYPE lui-même : `CartItem` ne peut pas
// transporter de montant). Les opérations ci-dessous sont PURES : elles ne mutent
// jamais le tableau reçu (`readonly` en entrée) ni ses éléments, elles renvoient un
// NOUVEAU tableau. Persistance (cookie httpOnly `cart_token` invité / table `carts`
// connecté) et fusion invité→user à la connexion sont gérées au call-site REST —
// ici, uniquement la LOGIQUE de panier, testable sans réseau.
//
// INVARIANTS tenus, miroir des contraintes de `migrations/0002` sur `cart_items` :
//   • une seule ligne par produit (`unique (cart_id, product_id)`) — `addItem`
//     ACCUMULE la quantité sur la ligne existante, ne crée jamais un doublon ;
//   • quantité entière strictement positive (`check (qty > 0)`) — une quantité ≤ 0
//     n'existe pas en base : y ramener une ligne la SUPPRIME (retrait).
//
// Le SOUS-TOTAL n'est PAS calculé ici : `cartSubtotal` DÉLÈGUE à `computeOrderTotal`
// (`./pricing`) — le prix se lit au CATALOGUE serveur (`Map<productId → cents>`), une
// seule autorité de prix (P2). Un total assemblé côté navigateur n'entre jamais.
// ─────────────────────────────────────────────────────────────────────────────

import type { CartItem, Cents, Uuid } from "./types.js";
import { computeOrderTotal } from "./pricing.js";

/**
 * Valide une quantité destinée à EXISTER en base : entier strictement positif
 * (miroir du `check (qty > 0)` de `cart_items`). Une qty fractionnaire ou ≤ 0 est un
 * bug d'appel — on échoue FORT plutôt que de fabriquer un panier invalide.
 */
function ensurePositiveIntQty(qty: number, productId: Uuid): void {
  if (!Number.isInteger(qty) || qty <= 0) {
    throw new RangeError(
      `Quantité invalide pour ${productId} (${qty}) — entier strictement positif attendu.`,
    );
  }
}

/**
 * Ajoute `qty` (défaut 1) d'un produit au panier. Si une ligne existe déjà pour ce
 * produit, la quantité s'ACCUMULE (jamais une 2ᵉ ligne — invariant `unique (cart_id,
 * product_id)`). `qty` doit être un entier strictement positif.
 * @returns un NOUVEAU tableau (l'entrée n'est pas mutée).
 */
export function addItem(
  items: readonly CartItem[],
  productId: Uuid,
  qty: number = 1,
): CartItem[] {
  ensurePositiveIntQty(qty, productId);
  let found = false;
  const next = items.map((line) => {
    if (line.productId === productId) {
      found = true;
      return { productId, qty: line.qty + qty };
    }
    return line;
  });
  if (!found) {
    next.push({ productId, qty });
  }
  return next;
}

/**
 * Retire complètement la ligne d'un produit (no-op si absente).
 * @returns un NOUVEAU tableau (l'entrée n'est pas mutée).
 */
export function removeItem(items: readonly CartItem[], productId: Uuid): CartItem[] {
  return items.filter((line) => line.productId !== productId);
}

/**
 * Fixe la quantité EXACTE d'un produit (upsert). `qty ≤ 0` ⇒ la ligne est SUPPRIMÉE
 * (une quantité nulle n'existe pas en base — c'est le retrait). `qty > 0` doit être
 * un entier ; la ligne est créée si absente, remplacée sinon.
 * @returns un NOUVEAU tableau (l'entrée n'est pas mutée).
 */
export function setItemQty(
  items: readonly CartItem[],
  productId: Uuid,
  qty: number,
): CartItem[] {
  if (qty <= 0) {
    return removeItem(items, productId);
  }
  ensurePositiveIntQty(qty, productId);
  let found = false;
  const next = items.map((line) => {
    if (line.productId === productId) {
      found = true;
      return { productId, qty };
    }
    return line;
  });
  if (!found) {
    next.push({ productId, qty });
  }
  return next;
}

/**
 * Sous-total SERVEUR du panier (P2) — DÉLÈGUE à `computeOrderTotal` (`./pricing`) :
 * le prix vient du catalogue serveur (`Map<productId → unitPriceCents>`), jamais
 * d'une donnée de panier. Panier vide ⇒ 0. C'est ce montant (recalculé) qui doit
 * alimenter l'affichage ET la création de la Checkout Session Stripe, jamais un total
 * assemblé côté navigateur. Lève (via `computeOrderTotal`) si un produit est hors
 * catalogue ou une quantité invalide.
 * @param catalog autorité de prix serveur : productId → unitPriceCents (cents entiers).
 */
export function cartSubtotal(items: readonly CartItem[], catalog: Map<Uuid, Cents>): Cents {
  // Copie défensive : `computeOrderTotal` attend un `CartItem[]` mutable ; on ne lui
  // cède jamais notre entrée `readonly` (il ne la mute pas, mais le type l'exige).
  return computeOrderTotal([...items], catalog).totalCents;
}
