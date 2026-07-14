// ─────────────────────────────────────────────────────────────────────────────
// EC4 — Construire la commande de domaine (Order + OrderItems) d'une vente payée
// ─────────────────────────────────────────────────────────────────────────────
// Une fois le paiement confirmé, DEUX matérialisations coexistent, distinctes :
//   1. La matérialisation TRANSACTIONNELLE en base — c'est `webhook.ts` qui appelle
//      la RPC `fulfill_paid_order` (migrations/0003) : décrément stock atomique (P1),
//      prix serveur (P2), idempotence sur `stripe_session_id` (P3), snapshot des
//      lignes — le tout dans UNE transaction. C'est la source de vérité DB.
//   2. La projection de DOMAINE en mémoire — CE module : à partir des données de la
//      session payée (déjà normalisées par `webhook.ts`) + du catalogue serveur, il
//      construit l'`Order` (entête) + les `OrderItem[]` (lignes snapshot) NÉCESSAIRES
//      à la boucle fermée EC4 : l'e-mail de confirmation CLIENT et la notification
//      MARCHAND (« aucune vente muette »). Pur, hors-ligne, sans round-trip DB.
//
// Ce module NE re-parse PAS l'événement Stripe (métadonnées, signature, e-mail) :
// c'est le périmètre exclusif de `webhook.ts` (P3). Il consomme la sortie NORMALISÉE
// du webhook (`PaidOrderSource`, structurellement identique à `UpsertOrderInput`) —
// la route passe le MÊME objet à `upsertOrder` (écriture DB) et à
// `buildOrderFromPaidSession` (e-mail), sans dupliquer la lecture de Stripe (pas de
// dérive possible entre les deux). Dépendance à sens unique : domaine (ici) ←
// transport (webhook), jamais l'inverse.
//
// ── P2 partout : le prix passe par `pricing`, jamais par le client ────────────
// Le total et le prix unitaire figé de chaque ligne viennent de `computeOrderTotal`
// (`./pricing`), qui lit le catalogue SERVEUR. Ce module n'ajoute qu'une chose que
// `pricing` ne porte pas (à dessein — « une fonction de prix ne s'invente pas un
// nom ») : le SNAPSHOT du libellé produit (`OrderItem.productName`), pris au même
// catalogue serveur — exactement comme la RPC 0003 fait `select products.name`.
//
// Fonction PURE : testable sans réseau ni base, comme les modules du châssis `automation`.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Cents,
  CurrencyCode,
  FulfillItem,
  Order,
  OrderItem,
  Product,
  Uuid,
} from "./types.js";
import { computeOrderTotal } from "./pricing.js";

/**
 * Échec de construction de commande : commande sans article (aucune ligne à
 * confirmer) ou catalogue incohérent (devises mélangées, produit manquant au
 * snapshot). Type dédié pour que le call-site EC4 le distingue et l'alerte.
 */
export class OrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderError";
  }
}

/**
 * Données NORMALISÉES d'une session payée — la charge que `webhook.ts` a extraite de
 * l'événement Stripe (`extractFulfillInput`) : identifiant d'idempotence, e-mail,
 * `user_id` optionnel, et les lignes `(productId, qty)` SANS PRIX (P2). Volontairement
 * identique, champ pour champ, à `UpsertOrderInput` de `webhook.ts` : la route peut
 * passer le même objet ici et à `upsertOrder`, sans re-parser Stripe.
 */
export type PaidOrderSource = {
  /** `cs_…`/`pi_…` — porte l'unicité `orders.stripe_session_id` (P3). */
  stripeSessionId: string;
  customerEmail: string;
  /** `null` = achat INVITÉ (checkout guest, le défaut e-commerce). */
  userId: Uuid | null;
  /** Lignes `(productId, qty)` SEULEMENT — le prix est recalculé serveur (P2). */
  items: FulfillItem[];
};

/**
 * Ce dont la CONSTRUCTION d'une commande a besoin d'un produit : son prix (autorité
 * P2), son libellé (à snapshoter dans `OrderItem.productName`) et sa devise. `Product`
 * (catalogue admin) ET `PublicProduct` (vue publique) satisfont ce contrat — le
 * call-site indexe la projection qu'il a ré-hydratée depuis Supabase (produits publiés).
 */
export type OrderCatalogEntry = Pick<Product, "priceCents" | "name" | "currency">;

/** Catalogue indexé par id produit, PORTEUR DU LIBELLÉ (contrairement au catalogue prix-seul de `pricing`). */
export type OrderCatalog = ReadonlyMap<Uuid, OrderCatalogEntry>;

/**
 * `Order` tel qu'on peut le CONSTRUIRE avant persistance : sans les champs générés
 * par la base (`id`, `createdAt`, `updatedAt`). La vraie commande (avec son id) est
 * créée par la RPC `fulfill_paid_order` ; ce draft porte tout ce qu'on connaît
 * PUREMENT de la session + du catalogue. Le call-site fusionne l'`orderId` renvoyé
 * par la RPC (`FulfillResult`) s'il lui faut un `Order` complet.
 */
export type DraftOrder = Omit<Order, "id" | "createdAt" | "updatedAt">;

/** Résultat pur du build : entête (draft) + lignes snapshot, prêts pour l'e-mail EC4. */
export type BuiltOrder = {
  order: DraftOrder;
  items: OrderItem[];
};

/**
 * Construit la projection de domaine d'une vente payée : l'entête `Order` (draft) +
 * ses `OrderItem[]` au prix SERVEUR figé (snapshot P2). Le montant vient
 * EXCLUSIVEMENT de `computeOrderTotal` (`./pricing`, autorité de prix) ; le libellé
 * de chaque ligne est snapshoté depuis le même catalogue serveur (ce que `pricing`
 * ne fabrique pas).
 *
 * Précondition : la session est CONFIRMÉE payée (le webhook n'appelle ceci qu'après
 * `upsertOrder`). Statut de la commande construit : toujours `"paid"`.
 *
 * @param session données normalisées de la session payée (cf. `PaidOrderSource`).
 * @param catalog catalogue serveur indexé par id (prix + libellé + devise) — produits publiés.
 * @throws OrderError   si aucune ligne (commande vide) ou devises mélangées au catalogue.
 * @throws Error        (propagé de `computeOrderTotal`) si un produit est hors catalogue
 *                      ou une quantité invalide (P2).
 */
export function buildOrderFromPaidSession(
  session: PaidOrderSource,
  catalog: OrderCatalog,
): BuiltOrder {
  // Projection prix-seul pour l'autorité P2 : `computeOrderTotal` n'a besoin QUE des
  // cents. Les deux catalogues partagent leurs clés (produits publiés ré-hydratés).
  const priceCatalog = new Map<Uuid, Cents>();
  for (const [productId, entry] of catalog) {
    priceCatalog.set(productId, entry.priceCents);
  }

  // P2 — total + prix unitaire figé de chaque ligne, RECALCULÉS serveur (jamais le client).
  const { totalCents, lines } = computeOrderTotal(session.items, priceCatalog);

  // Enrichit chaque ligne tarifée du LIBELLÉ snapshoté (que `pricing` ne porte pas) et
  // dérive la devise commune de la commande (boutique mono-devise ; incohérence = refus).
  const items: OrderItem[] = [];
  let currency: CurrencyCode | null = null;
  for (const line of lines) {
    // `PricedLine.productId` est typé `Uuid | null` (dérivé d'`OrderItem`, dont la
    // colonne devient `null` si le produit est supprimé APRÈS la vente). Au build,
    // `computeOrderTotal` le remplit TOUJOURS depuis un `CartItem` non-null ; on narrow
    // explicitement et on échoue si l'invariant est violé (état incohérent).
    const productId = line.productId;
    if (productId === null) {
      throw new OrderError("Ligne tarifée sans identifiant produit — état incohérent.");
    }
    // Invariant : `computeOrderTotal` a déjà exigé la présence du prix (donc du produit)
    // dans le catalogue prix-seul, dérivé de CE catalogue. Garde défensive contre une
    // divergence des deux vues (bug d'hydratation) — jamais un libellé inventé.
    const entry = catalog.get(productId);
    if (entry === undefined) {
      throw new OrderError(`Produit hors catalogue au snapshot du libellé : ${productId}.`);
    }
    if (currency === null) {
      currency = entry.currency;
    } else if (currency !== entry.currency) {
      throw new OrderError(
        `Devises mélangées dans une même commande (${currency} vs ${entry.currency}).`,
      );
    }
    items.push({
      productId,
      productName: entry.name, // P2 — SNAPSHOT du libellé, figé au paiement (comme la RPC 0003)
      unitPriceCents: line.unitPriceCents, // P2 — prix serveur via `pricing`
      qty: line.qty,
    });
  }

  if (currency === null) {
    // Aucune ligne : une vente payée sans article est incohérente (rien à confirmer, EC4).
    throw new OrderError("Commande sans article — aucune ligne à confirmer (EC4).");
  }

  const order: DraftOrder = {
    stripeSessionId: session.stripeSessionId,
    userId: session.userId,
    customerEmail: session.customerEmail,
    status: "paid",
    totalCents, // P2 — total recalculé serveur (Σ unitPriceCents × qty)
    currency,
  };

  return { order, items };
}
