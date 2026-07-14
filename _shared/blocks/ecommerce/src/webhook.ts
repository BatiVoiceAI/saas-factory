// ─────────────────────────────────────────────────────────────────────────────
// P3 — Webhook Stripe : la vente ne se matérialise QU'ICI (source de vérité)
// ─────────────────────────────────────────────────────────────────────────────
// Le webhook Stripe est le SEUL endroit où une commande naît. Le retour navigateur
// (page /merci) ne crée JAMAIS la commande : il peut ne jamais arriver, ou arriver
// avant que Stripe ait confirmé le paiement. Stripe, lui, REDÉLIVRE ses webhooks
// (at-least-once) — d'où les trois gardes DURES réunies dans ce module :
//
//   • P3 (signature) — la signature est vérifiée AVANT tout accès DB. Un POST non
//     signé / mal signé / rejoué est rejeté SANS jamais toucher la base. C'est LA
//     propriété de sécurité : `verifySignature` échoue ⇒ `upsertOrder` n'est PAS
//     appelé. (prouvé par `test/webhook.test.ts` : signature invalide ⇒ zéro écriture.)
//   • P3 (idempotence) — la création passe par un upsert idempotent sur
//     `stripe_session_id` (`on conflict do nothing` côté RPC). 3 redeliveries du
//     MÊME événement ⇒ 1 commande, 1 décrément de stock, 1 e-mail.
//   • P2 (intégrité du prix) — on n'extrait de l'événement Stripe QUE `(product_id,
//     qty)` + l'e-mail + un `user_id` optionnel. AUCUN prix / total venu du client :
//     le montant est recalculé serveur depuis le catalogue par la RPC.
//
// ── Dependency-light : ZÉRO SDK `stripe` ─────────────────────────────────────
// La vérification de signature Stripe est un HMAC-SHA256 documenté ; on l'implémente
// avec `node:crypto` (`verifyStripeSignature`), sans tirer le paquet `stripe`. Le
// module reste testable SANS réseau grâce aux dépendances INJECTÉES (`verifySignature`,
// `upsertOrder`) — exactement le patron du châssis `automation` (fetch injectable).
//
// ── Boucle fermée EC4 : c'est l'APPELANT qui envoie les e-mails ───────────────
// Ce handler ne connaît pas Resend (les deps se limitent à { verifySignature,
// upsertOrder }, comme spécifié). La route Next appelante envoie la confirmation
// CLIENT + la notification MARCHAND UNIQUEMENT si `outcome === "created"` — JAMAIS
// sur `duplicate-ignored`. Ainsi 3 redeliveries ⇒ 1 seul e-mail (P3 se propage à
// EC4). Compromis at-least-once connu : si le process meurt APRÈS `upsertOrder` mais
// AVANT l'e-mail, la redelivery ressort `duplicate-ignored` et l'e-mail manque ;
// pour une garantie stricte, piloter l'e-mail depuis un outbox/statut de commande
// plutôt que le retour du webhook (extension documentée dans BLOCKS.md).
//
// ⚠️ UN SEUL des deux événements par intégration. Écouter à la fois
// `checkout.session.completed` ET `payment_intent.succeeded` pour le MÊME achat crée
// DEUX commandes : les deux objets ont des id distincts (`cs_…` ≠ `pi_…`), donc deux
// `stripe_session_id` ⇒ l'idempotence P3 (qui dédup par id) ne peut PAS les fusionner.
// Intégration Checkout ⇒ s'abonner à `checkout.session.completed` SEULEMENT.
// Intégration Payment Intents ⇒ `payment_intent.succeeded` SEULEMENT.
// ─────────────────────────────────────────────────────────────────────────────

import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type { Config } from "./config.js";
import {
  resolveFetch,
  restHeaders,
  restUrl,
  type FetchImpl,
  type SupabaseRest,
} from "./supabase.js";
import type { FulfillItem, FulfillResult, Uuid } from "./types.js";

// ─────────────────────────────────────────────────────────────────────────────
// Forme MINIMALE d'un événement Stripe vérifié (on ne type que ce qu'on consomme)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Objet porté par `event.data.object` — surface commune à une Checkout Session et à
 * un Payment Intent, réduite aux champs que le webhook lit. Tous optionnels sauf
 * `id` : on valide leur présence à l'exécution (`extractFulfillInput`).
 */
export type StripeEventObject = {
  /** `cs_…` (checkout session) ou `pi_…` (payment intent) → clé d'idempotence P3. */
  id: string;
  object?: string;
  /** Checkout : e-mail saisi au paiement (`customer_details.email`). */
  customer_details?: { email?: string | null } | null;
  /** Checkout : e-mail alternatif. */
  customer_email?: string | null;
  /** Payment Intent : e-mail de reçu. */
  receipt_email?: string | null;
  /**
   * Métadonnées posées PAR NOUS à la création de la session (côté serveur, `lib/pricing`).
   * Convention : `cart_items` = JSON `[{ product_id, qty }]` (SANS prix — P2) et
   * `user_id` optionnel (achat connecté ; absent = invité).
   */
  metadata?: Record<string, string> | null;
};

/** Enveloppe d'un événement Stripe vérifié (réduite aux champs consommés). */
export type StripeWebhookEvent = {
  id: string;
  type: string;
  data: { object: StripeEventObject };
};

// ─────────────────────────────────────────────────────────────────────────────
// Contrat des dépendances INJECTÉES (testables sans réseau)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Vérifie la signature du webhook et rend l'événement parsé. DOIT LEVER si la
 * signature est absente / invalide / rejouée (ou le corps non-JSON) : le handler
 * traduit tout throw en `invalid-signature` SANS toucher la base. En prod :
 * `stripeVerifier(config.stripe.webhookSecret)` (HMAC `node:crypto`, zéro SDK).
 */
export type VerifySignature = (
  rawBody: string | Uint8Array,
  signature: string | null,
) => StripeWebhookEvent | Promise<StripeWebhookEvent>;

/** Entrée de l'upsert de commande — ce que le webhook extrait de l'événement (P2 : pas de prix). */
export type UpsertOrderInput = {
  /** `cs_…`/`pi_…` — porte l'unicité `orders.stripe_session_id` (P3). */
  stripeSessionId: string;
  customerEmail: string;
  /** `null` = achat INVITÉ (défaut e-commerce). */
  userId: Uuid | null;
  /** Lignes `(productId, qty)` SEULEMENT — le prix est recalculé serveur (P2). */
  items: FulfillItem[];
};

/**
 * Crée la commande de façon IDEMPOTENTE sur `stripeSessionId`. En prod :
 * `restUpsertOrder(config.supabase)` → RPC `fulfill_paid_order` (P1+P2+P3 en une
 * transaction). Retourne `{ orderId, alreadyProcessed }` : `alreadyProcessed = true`
 * signale une redelivery absorbée (aucun effet rejoué).
 */
export type UpsertOrder = (input: UpsertOrderInput) => Promise<FulfillResult>;

/** Les deux coutures du webhook — injectées en prod, remplacées par des fakes en test. */
export type WebhookDeps = {
  verifySignature: VerifySignature;
  upsertOrder: UpsertOrder;
};

// ─────────────────────────────────────────────────────────────────────────────
// Résultat du handler — union DISCRIMINÉE que la route mappe vers un statut HTTP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Issue claire d'un webhook. La route appelante mappe :
 *   • `created`           → 200 ; envoie les e-mails EC4 (confirmation + notif marchand).
 *   • `duplicate-ignored` → 200 ; N'ENVOIE RIEN (redelivery — P3).
 *   • `event-ignored`     → 200 ; type non concerné, acquitté sans effet.
 *   • `invalid-signature` → 400 ; rejet AVANT tout accès DB (zéro écriture).
 */
export type WebhookResult =
  | { outcome: "created"; eventId: string; eventType: string; orderId: Uuid }
  | { outcome: "duplicate-ignored"; eventId: string; eventType: string; orderId: Uuid }
  | { outcome: "event-ignored"; eventId: string; eventType: string }
  | { outcome: "invalid-signature" };

// ─────────────────────────────────────────────────────────────────────────────
// Erreurs typées
// ─────────────────────────────────────────────────────────────────────────────

/** Signature Stripe absente / mal formée / invalide / rejouée. Le handler ⇒ `invalid-signature`. */
export class StripeSignatureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StripeSignatureError";
  }
}

/**
 * Événement SIGNÉ (authentique) mais inexploitable : `metadata.cart_items`
 * absent/mal formé, e-mail client manquant, objet sans id. C'est un bug de NOTRE
 * création de session (le corps signé contient les métadonnées qu'on y a mises) →
 * on LÈVE (fail-loud). La route DEVRAIT alerter le marchand puis renvoyer un 2xx :
 * un événement structurellement cassé ne redeviendra pas valide en étant rejoué,
 * inutile de subir la tempête de retries Stripe.
 */
export class WebhookPayloadError extends Error {
  readonly eventId: string;
  constructor(eventId: string, message: string) {
    super(`événement ${eventId} : ${message}`);
    this.name = "WebhookPayloadError";
    this.eventId = eventId;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Événements matérialisant une vente payée
// ─────────────────────────────────────────────────────────────────────────────

/** Les DEUX seuls types d'événement qui matérialisent un paiement confirmé. */
const FULFILLABLE_EVENTS = new Set<string>([
  "checkout.session.completed",
  "payment_intent.succeeded",
]);

/** Vrai si l'événement doit déclencher la création de commande (paiement confirmé). */
export function isFulfillableEvent(type: string): boolean {
  return FULFILLABLE_EVENTS.has(type);
}

// ─────────────────────────────────────────────────────────────────────────────
// Convention de métadonnées (posées à la création de la Checkout Session)
// ─────────────────────────────────────────────────────────────────────────────

/** Clé de métadonnée portant le panier `[{ product_id, qty }]` (JSON, SANS prix — P2). */
export const CART_ITEMS_META_KEY = "cart_items";
/** Clé de métadonnée portant le `user_id` (achat connecté ; absente = invité). */
export const USER_ID_META_KEY = "user_id";

/**
 * Schéma des lignes de panier lues dans `metadata.cart_items`. On accepte la forme
 * SNAKE (`product_id`, comme le jsonb de la RPC) et on la transforme en `FulfillItem`
 * (camelCase, le type de domaine TS). `qty` entier strictement positif ; au moins
 * une ligne.
 */
const CartItemsMetaSchema = z
  .array(
    z
      .object({
        product_id: z.string().uuid(),
        qty: z.number().int().positive(),
      })
      .transform((row): FulfillItem => ({ productId: row.product_id, qty: row.qty })),
  )
  .min(1);

// ─────────────────────────────────────────────────────────────────────────────
// LE HANDLER — orchestre la matérialisation d'une vente (fonction PURE + deps)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Traite un webhook Stripe brut. Fonction pure : tout accès réseau/DB passe par les
 * deps injectées, donc P2/P3 se prouvent SANS réseau (cf. `test/webhook.test.ts`).
 *
 * @param rawBody   corps EXACT de la requête (string ou octets) — indispensable à la
 *                  vérification HMAC (un corps re-sérialisé casserait la signature).
 * @param signature en-tête `Stripe-Signature` (peut être `null` → rejet).
 * @param deps      `{ verifySignature, upsertOrder }` — injectées.
 * @returns         une `WebhookResult` (jamais de throw pour un cas d'issue normal).
 * @throws          `WebhookPayloadError` si l'événement est signé mais inexploitable
 *                  (métadonnées absentes/invalides) — voir la classe d'erreur.
 */
export async function handleStripeWebhook(
  rawBody: string | Uint8Array,
  signature: string | null,
  deps: WebhookDeps,
): Promise<WebhookResult> {
  // 1) P3 (garde 1/2) — SIGNATURE AVANT TOUT ACCÈS DB. Un throw (signature absente,
  //    invalide, en-tête malformé, rejeu, corps non-JSON) ⇒ on rejette SANS appeler
  //    `upsertOrder`. C'est la propriété de sécurité prouvée par le test.
  let event: StripeWebhookEvent;
  try {
    event = await deps.verifySignature(rawBody, signature);
  } catch {
    return { outcome: "invalid-signature" };
  }

  // 2) On ne matérialise une vente QUE sur un paiement confirmé. Tout autre type est
  //    acquitté sans effet (Stripe attend un 2xx, sinon il rejoue indéfiniment).
  if (!isFulfillableEvent(event.type)) {
    return { outcome: "event-ignored", eventId: event.id, eventType: event.type };
  }

  // 3) P2 — normaliser l'objet Stripe → entrée RPC : (product_id, qty) + email +
  //    user_id UNIQUEMENT. Aucun prix/total du navigateur n'entre ici.
  const input = extractFulfillInput(event);

  // 4) P3 (garde 2/2) — upsert IDEMPOTENT sur stripe_session_id (RPC : on conflict do
  //    nothing). 3 redeliveries ⇒ 1 commande ; `alreadyProcessed` distingue la 1re
  //    création des reprises absorbées (ni stock re-décrémenté, ni e-mail à ré-émettre).
  const { orderId, alreadyProcessed } = await deps.upsertOrder(input);

  return alreadyProcessed
    ? { outcome: "duplicate-ignored", eventId: event.id, eventType: event.type, orderId }
    : { outcome: "created", eventId: event.id, eventType: event.type, orderId };
}

// ── Normalisation de l'objet Stripe → UpsertOrderInput (P2) ──────────────────

/** Extrait `(stripeSessionId, customerEmail, userId, items)` de l'événement — zéro prix (P2). */
function extractFulfillInput(event: StripeWebhookEvent): UpsertOrderInput {
  const obj = event.data?.object;
  if (obj == null || typeof obj.id !== "string" || obj.id.length === 0) {
    throw new WebhookPayloadError(event.id, "objet Stripe sans id exploitable");
  }

  // `cs_…` (checkout) ou `pi_…` (payment intent) : porte l'unicité P3.
  const stripeSessionId = obj.id;

  // E-mail client : plusieurs emplacements selon Checkout vs Payment Intent.
  const customerEmail =
    obj.customer_details?.email ?? obj.customer_email ?? obj.receipt_email ?? null;
  if (customerEmail == null || customerEmail.length === 0) {
    throw new WebhookPayloadError(
      event.id,
      "e-mail client absent (orders.customer_email est NOT NULL)",
    );
  }

  const metadata = obj.metadata ?? {};
  return {
    stripeSessionId,
    customerEmail,
    userId: readUserId(metadata),
    items: readCartItems(event.id, metadata),
  };
}

/** Lit `metadata.user_id` (uuid) — absent/invalide ⇒ `null` (achat invité, défaut sûr). */
function readUserId(metadata: Record<string, string>): Uuid | null {
  const raw = metadata[USER_ID_META_KEY];
  if (raw == null || raw.length === 0) return null;
  const parsed = z.string().uuid().safeParse(raw);
  // Valeur non-uuid : on n'échoue PAS la commande pour ça — on la traite comme un
  // achat invité (ne jamais perdre une vente payée pour un lien utilisateur douteux).
  return parsed.success ? parsed.data : null;
}

/** Lit + valide `metadata.cart_items` → `FulfillItem[]` (SANS prix — P2). Lève si inexploitable. */
function readCartItems(eventId: string, metadata: Record<string, string>): FulfillItem[] {
  const raw = metadata[CART_ITEMS_META_KEY];
  if (raw == null) {
    throw new WebhookPayloadError(eventId, `metadata.${CART_ITEMS_META_KEY} absent`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new WebhookPayloadError(eventId, `metadata.${CART_ITEMS_META_KEY} n'est pas du JSON`);
  }
  const result = CartItemsMetaSchema.safeParse(parsed);
  if (!result.success) {
    const why = result.error.issues.map((i) => i.message).join(" ; ");
    throw new WebhookPayloadError(eventId, `metadata.${CART_ITEMS_META_KEY} invalide : ${why}`);
  }
  return result.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROD dep #1 — verifySignature : HMAC-SHA256 Stripe via node:crypto (zéro SDK)
// ─────────────────────────────────────────────────────────────────────────────
// Reproduit l'algorithme documenté de `stripe.webhooks.constructEvent` :
//   signed_payload = `${t}.${rawBody}` ; expected = HMAC_SHA256(secret, signed_payload)
//   en hex ; on compare (timing-safe) à chaque `v1` de l'en-tête, + fenêtre anti-rejeu.

/** Options de vérification (fenêtre anti-rejeu + horloge injectable pour tester). */
export type StripeVerifyOptions = {
  /** Tolérance anti-rejeu en secondes (défaut 300 = 5 min, comme le SDK). `0` désactive. */
  toleranceSec?: number;
  /** Horloge (ms) injectable — défaut `Date.now`. */
  now?: () => number;
};

/**
 * Vérifie la signature d'un webhook Stripe et rend l'événement parsé. Lève une
 * `StripeSignatureError` sur tout échec (en-tête absent/malformé, signature non
 * concordante, horodatage hors tolérance, corps non-JSON) — le handler la traduit
 * en `invalid-signature` sans toucher la base.
 */
export function verifyStripeSignature(
  rawBody: string | Uint8Array,
  signatureHeader: string | null,
  webhookSecret: string,
  opts: StripeVerifyOptions = {},
): StripeWebhookEvent {
  if (signatureHeader == null || signatureHeader.length === 0) {
    throw new StripeSignatureError("en-tête Stripe-Signature absent");
  }

  // Parse `t=...,v1=...[,v1=...]` (Stripe peut fournir plusieurs v1 lors d'un roll de secret).
  let timestamp: string | null = null;
  const v1s: string[] = [];
  for (const part of signatureHeader.split(",")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key === "t") timestamp = val;
    else if (key === "v1") v1s.push(val);
  }
  if (timestamp == null || v1s.length === 0) {
    throw new StripeSignatureError("en-tête Stripe-Signature malformé (t ou v1 manquant)");
  }

  // signed_payload = `${t}.` suivi des OCTETS EXACTS du corps (jamais re-sérialisé).
  const bodyBuf = typeof rawBody === "string" ? Buffer.from(rawBody, "utf8") : Buffer.from(rawBody);
  const signedPayload = Buffer.concat([Buffer.from(`${timestamp}.`, "utf8"), bodyBuf]);
  const expected = createHmac("sha256", webhookSecret).update(signedPayload).digest();

  // Comparaison TIMING-SAFE contre chaque v1 (longueur d'abord, sinon timingSafeEqual lève).
  const match = v1s.some((v1) => {
    const provided = Buffer.from(v1, "hex");
    return provided.length === expected.length && timingSafeEqual(provided, expected);
  });
  if (!match) {
    throw new StripeSignatureError("signature Stripe invalide");
  }

  // Anti-rejeu : un événement trop vieux/futur par rapport à l'horloge est rejeté.
  const toleranceSec = opts.toleranceSec ?? 300;
  if (toleranceSec > 0) {
    const tsSec = Number(timestamp);
    const nowSec = Math.floor((opts.now?.() ?? Date.now()) / 1000);
    if (!Number.isFinite(tsSec) || Math.abs(nowSec - tsSec) > toleranceSec) {
      throw new StripeSignatureError("horodatage Stripe hors tolérance (rejeu ?)");
    }
  }

  // Signature valide → le corps est de confiance : on le parse en événement.
  let event: unknown;
  try {
    event = JSON.parse(bodyBuf.toString("utf8"));
  } catch {
    throw new StripeSignatureError("corps du webhook non-JSON");
  }
  return event as StripeWebhookEvent;
}

/** Fabrique une `VerifySignature` liée au secret du webhook (câblage prod). */
export function stripeVerifier(webhookSecret: string, opts: StripeVerifyOptions = {}): VerifySignature {
  return (rawBody, signature) => verifyStripeSignature(rawBody, signature, webhookSecret, opts);
}

// ─────────────────────────────────────────────────────────────────────────────
// PROD dep #2 — upsertOrder : appel REST de la RPC fulfill_paid_order (service-role)
// ─────────────────────────────────────────────────────────────────────────────
// Mappe `UpsertOrderInput` (camelCase) → paramètres SNAKE de la RPC (migration 0003)
// et POST sur `/rest/v1/rpc/fulfill_paid_order`. La RPC réunit P1+P2+P3 en UNE
// transaction ; ici on ne fait que la couture réseau (fetch injectable — testable
// sans réseau, cf. patron loopback du châssis automation).

/**
 * Fabrique une `UpsertOrder` qui appelle la RPC `fulfill_paid_order` en service-role.
 * @param sb        coordonnées Supabase (service-role — bypass RLS, identité du webhook).
 * @param fetchImpl impl `fetch` injectable (défaut global) — couture de test loopback.
 */
export function restUpsertOrder(sb: SupabaseRest, fetchImpl?: FetchImpl): UpsertOrder {
  const doFetch = resolveFetch(fetchImpl);
  return async (input) => {
    // Mapping camelCase → SNAKE (contrat exact de la RPC 0003). `p_items` SANS prix (P2).
    const body = {
      p_stripe_session_id: input.stripeSessionId,
      p_customer_email: input.customerEmail,
      p_user_id: input.userId, // null = invité
      p_items: input.items.map((it) => ({ product_id: it.productId, qty: it.qty })),
    };
    const res = await doFetch(restUrl(sb, "rpc/fulfill_paid_order"), {
      method: "POST",
      headers: restHeaders(sb),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      // Inclut le cas P1 : la RPC lève « rupture de stock » ⇒ rollback total ⇒ erreur ici.
      throw new Error(`fulfill_paid_order → ${res.status} ${await res.text()}`);
    }
    // `returns table (order_id, already_processed)` → PostgREST rend un tableau de lignes.
    const rows = (await res.json()) as Array<{ order_id: string; already_processed: boolean }>;
    const row = rows[0];
    if (row == null) {
      throw new Error("fulfill_paid_order n'a renvoyé aucune ligne");
    }
    return { orderId: row.order_id, alreadyProcessed: row.already_processed };
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Câblage prod complet — construit les deux deps depuis la Config
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Assemble `{ verifySignature, upsertOrder }` prêts pour la prod depuis la `Config`.
 * La route webhook Next fait : `handleStripeWebhook(rawBody, sig, buildWebhookDeps(config))`.
 * @param fetchImpl impl `fetch` injectable (test) — sinon le `fetch` global de Node 20+.
 */
export function buildWebhookDeps(config: Config, fetchImpl?: FetchImpl): WebhookDeps {
  return {
    verifySignature: stripeVerifier(config.stripe.webhookSecret),
    upsertOrder: restUpsertOrder(config.supabase, fetchImpl),
  };
}
