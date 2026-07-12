// BLOC OPTIONNEL — inclus seulement si providers.billing = stripe (config-schema)
import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { getStripe, isBillingEnabled } from "@/lib/billing/stripe";
import {
  findUserIdByCustomerId,
  upsertSubscription,
  type SubscriptionStatus,
} from "@/lib/billing/subscription";
import { env } from "@/lib/env";

// Runtime Node requis : vérif de signature sur le corps BRUT + client Stripe.
export const runtime = "nodejs";

/**
 * Webhook Stripe. Vérifie la signature (`STRIPE_WEBHOOK_SECRET`) sur le corps
 * brut, puis synchronise `public.subscriptions` via le client service role.
 *
 * Events gérés :
 *  - checkout.session.completed        → rattache customer+subscription au user
 *  - customer.subscription.updated     → maj statut / prix / période
 *  - customer.subscription.deleted     → statut = canceled
 *
 * Toute écriture passe par le service role (bypass RLS) : le webhook n'est pas
 * une session utilisateur.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!isBillingEnabled() || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Billing désactivé." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature absente." }, { status: 400 });
  }

  // Corps BRUT obligatoire pour la vérif de signature.
  const rawBody = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "signature invalide";
    return NextResponse.json(
      { error: `Vérification signature échouée : ${message}` },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutCompleted(
          stripe,
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await handleSubscriptionChange(
          stripe,
          event.data.object as Stripe.Subscription,
        );
        break;
      }
      default:
        // Event non pertinent pour ce bloc : accusé de réception silencieux.
        break;
    }
  } catch (err) {
    // 500 → Stripe rejouera l'event (idempotence côté upsert par user_id).
    const message = err instanceof Error ? err.message : "erreur inconnue";
    return NextResponse.json(
      { error: `Traitement échoué : ${message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}

/** Extrait un id string, que le champ Stripe soit expansé ou non. */
function idOf(
  value: string | { id: string } | null | undefined,
): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

async function handleCheckoutCompleted(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<void> {
  const userId =
    session.client_reference_id ??
    (session.metadata?.supabase_user_id as string | undefined) ??
    (await resolveUserId(idOf(session.customer)));

  if (!userId) return;

  const customerId = idOf(session.customer);
  const subscriptionId = idOf(session.subscription);

  // Récupère la subscription pour figer statut/prix/période dès le checkout.
  let status: SubscriptionStatus | null = null;
  let priceId: string | null = null;
  let currentPeriodEnd: string | null = null;

  if (subscriptionId) {
    const subscription =
      await stripe.subscriptions.retrieve(subscriptionId);
    status = subscription.status as SubscriptionStatus;
    priceId = subscription.items.data[0]?.price.id ?? null;
    currentPeriodEnd = toIso(subscription.current_period_end);
  }

  await upsertSubscription({
    userId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    status,
    priceId,
    currentPeriodEnd,
  });
}

async function handleSubscriptionChange(
  stripe: Stripe,
  eventSubscription: Stripe.Subscription,
): Promise<void> {
  // Stripe ne garantit PAS l'ordre de livraison des events : un
  // `customer.subscription.updated` (status=active) retardé/rejoué peut arriver
  // APRÈS un `customer.subscription.deleted` (status=canceled) et, si on faisait
  // confiance au payload, ré-accorderait l'accès payant à un user résilié. On ne
  // se fie donc pas au payload de l'event : on re-fetch l'état courant juste
  // avant l'upsert pour toujours persister l'état le plus récent. (La ressource
  // reste lisible après annulation, avec status=canceled.)
  const subscription = await stripe.subscriptions.retrieve(
    eventSubscription.id,
  );

  const customerId = idOf(subscription.customer);
  const userId =
    (subscription.metadata?.supabase_user_id as string | undefined) ??
    (await resolveUserId(customerId));

  if (!userId) return;

  await upsertSubscription({
    userId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    status: subscription.status as SubscriptionStatus,
    priceId: subscription.items.data[0]?.price.id ?? null,
    currentPeriodEnd: toIso(subscription.current_period_end),
  });
}

async function resolveUserId(
  customerId: string | null,
): Promise<string | null> {
  if (!customerId) return null;
  return findUserIdByCustomerId(customerId);
}

/** Unix (secondes) → ISO 8601, ou null. */
function toIso(unixSeconds: number | null | undefined): string | null {
  return typeof unixSeconds === "number"
    ? new Date(unixSeconds * 1000).toISOString()
    : null;
}
