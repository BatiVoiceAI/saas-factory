// ─────────────────────────────────────────────────────────────────────────────
// pricing.ts — P2 : intégrité du prix (le montant vient TOUJOURS du serveur)
// ─────────────────────────────────────────────────────────────────────────────
// Piège P2 de l'archétype ecommerce : ne JAMAIS faire confiance à un prix ou à un
// total envoyé par le navigateur. Un client peut altérer le payload du panier
// (`priceCents: 1`, `total: 0`). Ici, `computeOrderTotal` RECALCULE le montant
// depuis le SEUL catalogue serveur, à partir des seuls (productId, qty) du panier,
// et SNAPSHOTe le prix serveur dans chaque ligne. Tout prix soi-disant fourni par
// le client est structurellement inaccessible : `CartItem` (types.ts) ne porte que
// { productId, qty } — un éventuel champ `price` du payload brut n'est jamais lu.
//
// Fonction PURE + dépendance INJECTÉE (le catalogue) — zéro I/O, zéro réseau. En
// prod, le call-site (route webhook) hydrate `catalog` depuis `products.price_cents`
// (produits PUBLIÉS uniquement) puis appelle cette fonction ; en test on l'appelle
// avec une `Map` en mémoire. C'est le pendant TypeScript, testable HORS-LIGNE, du
// bloc P2 de la RPC SQL `fulfill_paid_order` (migrations/0003) : même doctrine
// « prix = serveur », deux gardiens (le TS ici, le SQL à l'écriture).
//
// ── Réconciliation avec le contrat de types ──────────────────────────────────
// Le catalogue injecté est, par contrat, `Map<productId → unitPriceCents>` : un
// PRIX seul, sans le libellé produit. `computeOrderTotal` retourne donc la
// PROJECTION « prix » d'`OrderItem` (`PricedLine` = productId + unitPriceCents +
// qty) : exactement les champs dont l'intégrité monétaire (P2) dépend. Le snapshot
// du nom (`OrderItem.productName`) est réalisé côté ÉCRITURE par la RPC SQL 0003
// (`select products.name into v_name`), pas fabriqué ici — une fonction de PRIX ne
// s'invente pas un nom qu'elle n'a pas en entrée.
// ─────────────────────────────────────────────────────────────────────────────

import type { CartItem, Cents, OrderItem, Uuid } from "./types.js";

/**
 * Projection « prix » d'une ligne de commande : exactement les champs d'`OrderItem`
 * (types.ts) dont dépend l'intégrité monétaire P2. `unitPriceCents` est le prix
 * SERVEUR figé (snapshot), jamais un montant venu du navigateur. Le libellé
 * (`OrderItem.productName`) est snapshotté par la RPC SQL 0003, hors de ce module.
 * Dérivé par `Pick` du contrat : si les types de ces champs changent, la projection
 * suit automatiquement (aucune dérive possible).
 */
export type PricedLine = Pick<OrderItem, "productId" | "unitPriceCents" | "qty">;

/** Résultat du recalcul serveur : total recomposé + lignes au prix serveur figé. */
export type OrderTotal = {
  /** Total RECALCULÉ serveur, en cents ENTIERS (Σ unitPriceCents × qty). */
  totalCents: Cents;
  /** Une ligne par article du panier — 1-pour-1, sans fusion (miroir de la RPC 0003). */
  lines: PricedLine[];
};

/**
 * Recalcule le total d'une commande depuis le catalogue SERVEUR (piège P2).
 *
 * Invariants garantis :
 *  • le montant vient EXCLUSIVEMENT de `catalog` (prix serveur) — tout prix présent
 *    dans le payload client est ignoré (structurellement : `CartItem` n'en porte pas) ;
 *  • chaque ligne SNAPSHOTe le prix serveur (`unitPriceCents`), figé — découplé du
 *    prix courant du catalogue, qui peut changer après la vente ;
 *  • arithmétique en CENTS ENTIERS uniquement (jamais de flottant : 0.1 + 0.2 ≠ 0.3).
 *
 * Note : un panier VIDE renvoie `{ totalCents: 0, lines: [] }` (fonction pure du
 * contenu) ; refuser un checkout à panier vide est un garde-fou du call-site, pas
 * de ce calcul.
 *
 * @param items   lignes du panier — { productId, qty } SEULEMENT (données client, NON fiables).
 * @param catalog autorité de prix serveur : productId → unitPriceCents (cents entiers ≥ 0).
 * @returns `{ totalCents, lines }` — total recomposé + lignes au prix serveur figé.
 * @throws si un `productId` est absent du catalogue (produit inconnu ou non publié).
 * @throws si une `qty` n'est pas un entier ≥ 1 (quantité client falsifiée / absurde).
 * @throws si un prix catalogue n'est pas un entier ≥ 0 (donnée serveur corrompue — échoue tôt).
 */
export function computeOrderTotal(
  items: CartItem[],
  catalog: Map<Uuid, Cents>,
): OrderTotal {
  let totalCents = 0;
  const lines: PricedLine[] = [];

  for (const item of items) {
    // La quantité est une donnée CLIENT : on la valide (entier ≥ 1) AVANT tout
    // calcul de montant. Une qty négative ou fractionnaire falsifierait le total
    // (baisser la facture, voire la rendre négative) — c'est exactement P2.
    if (!Number.isInteger(item.qty) || item.qty < 1) {
      throw new Error(
        `Quantité invalide pour le produit ${item.productId} : ` +
          `attendu un entier ≥ 1, reçu ${item.qty}.`,
      );
    }

    // P2 — le prix vient du CATALOGUE SERVEUR, jamais du panier. Absent = produit
    // inconnu ou non publié → on REFUSE la commande (jamais un prix par défaut, qui
    // laisserait passer une vente à un montant arbitraire).
    const unitPriceCents = catalog.get(item.productId);
    if (unitPriceCents === undefined) {
      throw new Error(
        `Produit absent du catalogue serveur : ${item.productId} ` +
          `(inconnu ou non publié) — commande refusée (P2).`,
      );
    }

    // Le catalogue est une donnée serveur (fiable), mais on vérifie tout de même que
    // le prix est un cent ENTIER ≥ 0 : un prix flottant ou négatif signale un
    // catalogue corrompu, à faire échouer TÔT plutôt que de propager un total faux.
    if (!Number.isInteger(unitPriceCents) || unitPriceCents < 0) {
      throw new Error(
        `Prix catalogue invalide pour ${item.productId} : ` +
          `attendu un entier de cents ≥ 0, reçu ${unitPriceCents}.`,
      );
    }

    // SNAPSHOT du prix serveur (P2) — figé dans la ligne. On conserve `productId`
    // pour la traçabilité ; le nom est snapshotté par la RPC 0003, hors de ce module.
    lines.push({ productId: item.productId, unitPriceCents, qty: item.qty });

    // Cents entiers × entier = cents entiers : le total reste exact (aucun flottant).
    totalCents += unitPriceCents * item.qty;
  }

  return { totalCents, lines };
}
