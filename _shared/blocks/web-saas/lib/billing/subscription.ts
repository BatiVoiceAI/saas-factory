// BLOC OPTIONNEL — inclus seulement si providers.billing = stripe (config-schema)
import "server-only";

import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

/**
 * Lecture/écriture de l'état d'abonnement d'un user.
 *
 * - Lecture "utilisateur courant" : via le client serveur RLS-scopé
 *   (`@/lib/supabase/server`) — l'utilisateur ne voit que SA ligne (policy
 *   `select` de 0003_billing.sql).
 * - Écriture (webhook Stripe) : via un client SERVICE ROLE qui bypasse la RLS.
 *   Ce client n'est JAMAIS exposé au navigateur : consommé uniquement dans des
 *   route handlers serveur (app/api/stripe/*).
 */

/** Statuts d'abonnement Stripe qu'on persiste tels quels. */
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused";

/** Forme applicative d'une ligne `public.subscriptions`. */
export interface Subscription {
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: SubscriptionStatus | null;
  priceId: string | null;
  currentPeriodEnd: string | null; // ISO 8601
}

/** Statuts considérés comme donnant accès aux fonctionnalités payantes. */
const ENTITLING_STATUSES: ReadonlySet<SubscriptionStatus> = new Set([
  "trialing",
  "active",
]);

/** Ligne brute telle que renvoyée par Supabase (snake_case). */
interface SubscriptionRow {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: SubscriptionStatus | null;
  price_id: string | null;
  current_period_end: string | null;
}

function toSubscription(row: SubscriptionRow): Subscription {
  return {
    userId: row.user_id,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    status: row.status,
    priceId: row.price_id,
    currentPeriodEnd: row.current_period_end,
  };
}

/**
 * Client SERVICE ROLE (bypass RLS) — réservé aux écritures serveur (webhook).
 * Pas de persistance de session : c'est un client machine, pas un user.
 */
function getAdminClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY manquante : requise pour écrire l'état " +
        "d'abonnement depuis le webhook Stripe.",
    );
  }
  return createSupabaseAdminClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/**
 * Abonnement de l'utilisateur actuellement authentifié, ou `null` s'il n'a
 * jamais souscrit / n'est pas connecté. Passe par la RLS (client serveur).
 */
export async function getCurrentSubscription(): Promise<Subscription | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      "user_id, stripe_customer_id, stripe_subscription_id, status, price_id, current_period_end",
    )
    .eq("user_id", user.id)
    .maybeSingle<SubscriptionRow>();

  if (error) throw error;
  return data ? toSubscription(data) : null;
}

/** `true` si l'utilisateur courant a un abonnement actif ou en essai. */
export async function hasActiveSubscription(): Promise<boolean> {
  const sub = await getCurrentSubscription();
  return Boolean(sub?.status && ENTITLING_STATUSES.has(sub.status));
}

/**
 * Retrouve l'id Stripe customer déjà associé à un user (via service role),
 * pour éviter de recréer un customer à chaque checkout. `null` si aucun.
 */
export async function getStripeCustomerId(
  userId: string,
): Promise<string | null> {
  const admin = getAdminClient();
  const { data, error } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle<{ stripe_customer_id: string | null }>();

  if (error) throw error;
  return data?.stripe_customer_id ?? null;
}

/**
 * Upsert (service role) de l'état d'abonnement d'un user. Utilisé par le
 * webhook et juste après création du customer au checkout. Clé de conflit :
 * `user_id` (un abonnement courant par user).
 */
export async function upsertSubscription(input: {
  userId: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  status?: SubscriptionStatus | null;
  priceId?: string | null;
  currentPeriodEnd?: string | null;
}): Promise<void> {
  const admin = getAdminClient();

  const row: Record<string, unknown> = { user_id: input.userId };
  if (input.stripeCustomerId !== undefined)
    row.stripe_customer_id = input.stripeCustomerId;
  if (input.stripeSubscriptionId !== undefined)
    row.stripe_subscription_id = input.stripeSubscriptionId;
  if (input.status !== undefined) row.status = input.status;
  if (input.priceId !== undefined) row.price_id = input.priceId;
  if (input.currentPeriodEnd !== undefined)
    row.current_period_end = input.currentPeriodEnd;

  const { error } = await admin
    .from("subscriptions")
    .upsert(row, { onConflict: "user_id" });

  if (error) throw error;
}

/**
 * Résout l'`user_id` propriétaire d'un customer Stripe donné (service role).
 * Sert au webhook pour les events `customer.subscription.*` qui ne portent que
 * l'id customer. `null` si aucun mapping (event pour un customer inconnu).
 */
export async function findUserIdByCustomerId(
  stripeCustomerId: string,
): Promise<string | null> {
  const admin = getAdminClient();
  const { data, error } = await admin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle<{ user_id: string }>();

  if (error) throw error;
  return data?.user_id ?? null;
}
