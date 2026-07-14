// ─────────────────────────────────────────────────────────────────────────────
// LE CONTRAT DE TYPES du châssis ecommerce (les modules l'importeront)
// ─────────────────────────────────────────────────────────────────────────────
// Ces types reflètent 1-pour-1 le schéma SQL (migrations/0001..0003). Deux
// invariants portés PAR LE TYPE, pas seulement par des commentaires :
//
//   • ARGENT EN CENTS ENTIERS. Tout montant est un entier en plus petite unité
//     monétaire (`Cents`) — JAMAIS un flottant (0.1 + 0.2 ≠ 0.3). C'est aussi la
//     représentation native de Stripe (`amount_total` en cents). Le SQL stocke des
//     colonnes `*_cents integer`, ce contrat les nomme `*Cents`.
//   • LE PANIER NE PORTE AUCUN PRIX (P2). `CartItem` = { productId, qty } et RIEN
//     d'autre : le prix est TOUJOURS recalculé serveur depuis le catalogue au
//     checkout. Un prix venu du navigateur n'existe pas dans ce contrat.
//
// Convention : identifiants de code en anglais, camelCase côté TS (les colonnes
// SQL sont en snake_case ; le mapping se fait au call-site REST).
// ─────────────────────────────────────────────────────────────────────────────

/** UUID Postgres (représenté en string côté TS). */
export type Uuid = string;

/** Horodatage ISO 8601 (`timestamptz` sérialisé par PostgREST). */
export type IsoTimestamp = string;

/**
 * Montant en PLUS PETITE UNITÉ MONÉTAIRE, entier (cents EUR/USD ; yen entier pour
 * une devise zéro-décimale comme JPY). JAMAIS un flottant. Aligné sur Stripe.
 */
export type Cents = number;

/** Code devise ISO 4217 en minuscules, comme attendu par Stripe (ex. `"eur"`). */
export type CurrencyCode = string;

// ── EC1 — Catalogue ──────────────────────────────────────────────────────────

/** Catégorie de classement du catalogue (taxonomie publique). */
export type Category = {
  id: Uuid;
  slug: string;
  name: string;
  createdAt: IsoTimestamp;
};

/**
 * Produit vendable. Lecture publique UNIQUEMENT si `published` (RLS `anon`). Le
 * prix de référence est `priceCents` — c'est LUI que le serveur lit au checkout
 * (P2), jamais un montant client.
 */
export type Product = {
  id: Uuid;
  categoryId: Uuid | null;
  slug: string;
  name: string;
  description: string | null;
  priceCents: Cents;
  currency: CurrencyCode;
  imageUrl: string | null;
  /** Brouillon (false) invisible à `anon` ; publié (true) visible au catalogue. */
  published: boolean;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
};

/**
 * Déclinaison d'un produit (taille, couleur…). `priceCents` non-null SURCHARGE le
 * prix produit pour cette variante. Dans ce socle, le cœur transactionnel (stock,
 * commandes) est au grain PRODUIT (cf. `InventoryRow`, `OrderItem`) ; le stock par
 * variante est un point d'extension documenté (BLOCKS.md), pas le défaut.
 */
export type Variant = {
  id: Uuid;
  productId: Uuid;
  name: string;
  sku: string | null;
  priceCents: Cents | null;
  createdAt: IsoTimestamp;
};

// ── EC5 — Inventaire / stock ─────────────────────────────────────────────────

/**
 * Ligne de stock, au grain PRODUIT (1-1 avec `Product`). `stock` porte un
 * `CHECK (stock >= 0)` en base : l'anti-survente (P1) est une contrainte DB, jamais
 * un check applicatif. Table service-role-only ; la dispo au catalogue passe par le
 * booléen dérivé `inStock` de la vue `products_public`, jamais ce compte brut.
 */
export type InventoryRow = {
  productId: Uuid;
  stock: number;
};

/** Projection publique du catalogue (vue `products_public`) : dispo dérivée, sans compte brut. */
export type PublicProduct = {
  id: Uuid;
  categoryId: Uuid | null;
  slug: string;
  name: string;
  description: string | null;
  priceCents: Cents;
  currency: CurrencyCode;
  imageUrl: string | null;
  /** Dérivé de `inventory.stock > 0` — booléen seul, jamais le compte. */
  inStock: boolean;
};

// ── EC2 — Panier ─────────────────────────────────────────────────────────────

/**
 * Ligne de panier — CONTRAT MINIMAL (P2) : un `productId` + une `qty`, RIEN
 * d'autre. Aucun prix : le serveur le recalcule au checkout depuis le catalogue.
 */
export type CartItem = {
  productId: Uuid;
  qty: number;
};

/**
 * Panier, scopé par `cartToken` (invité, cookie httpOnly) OU `userId` (connecté) —
 * exactement l'un des deux identifie le porteur. Donnée de CONFORT, non fiable :
 * au checkout le serveur ré-hydrate produits + prix et IGNORE tout ce que le
 * navigateur prétend (P2).
 */
export type Cart = {
  id: Uuid;
  cartToken: string | null;
  userId: Uuid | null;
  items: CartItem[];
};

// ── EC4 — Commandes + boucle fermée ──────────────────────────────────────────

/** Cycle de vie d'une commande (miroir du CHECK SQL). */
export type OrderStatus = "paid" | "fulfilled" | "cancelled" | "refunded";

/**
 * Commande — créée UNIQUEMENT par le webhook (service-role) via la RPC
 * `fulfill_paid_order`, jamais par le client. `stripeSessionId` porte l'unicité
 * (P3 : une session Stripe = au plus une commande). `totalCents` est RECALCULÉ
 * serveur (P2), jamais un total transmis par le navigateur.
 */
export type Order = {
  id: Uuid;
  stripeSessionId: string;
  /** `null` pour un achat INVITÉ (checkout guest — le défaut e-commerce). */
  userId: Uuid | null;
  customerEmail: string;
  status: OrderStatus;
  totalCents: Cents;
  currency: CurrencyCode;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
};

/**
 * Ligne de commande — SNAPSHOT du prix réellement payé (P2). `unitPriceCents` et
 * `productName` sont FIGÉS au paiement : jamais une FK vive vers `products.price`
 * (le prix courant peut changer après la vente). `productId` peut devenir `null`
 * si le produit est supprimé plus tard — la ligne d'historique, elle, survit.
 */
export type OrderItem = {
  productId: Uuid | null;
  productName: string;
  unitPriceCents: Cents;
  qty: number;
};

// ── Contrat de la RPC fulfill_paid_order (P1 + P2 + P3 en une transaction) ────

/**
 * Article transmis à la RPC : `productId` + `qty` SEULEMENT (P2 — pas de prix
 * client). Le serveur lit `products.price_cents` pour chaque ligne. Miroir du
 * `p_items jsonb` de `migrations/0003_fulfill_paid_order.sql`.
 */
export type FulfillItem = {
  productId: Uuid;
  qty: number;
};

/**
 * Retour de la RPC (`returns table (order_id, already_processed)`). `alreadyProcessed`
 * = true signale une REDELIVERY Stripe idempotente (P3) : la commande existait déjà,
 * aucun effet rejoué (ni stock, ni e-mail à ré-émettre).
 */
export type FulfillResult = {
  orderId: Uuid;
  alreadyProcessed: boolean;
};
