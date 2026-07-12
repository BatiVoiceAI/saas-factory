// BLOC OPTIONNEL — inclus seulement si providers.billing = stripe (config-schema)
import { NextResponse } from "next/server";
import { getStripe, isBillingEnabled } from "@/lib/billing/stripe";
import {
  getStripeCustomerId,
  upsertSubscription,
} from "@/lib/billing/subscription";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export const runtime = "nodejs";

/**
 * Crée une session Stripe Checkout pour l'utilisateur authentifié et renvoie
 * l'URL hébergée ({ url }). Le client n'a plus qu'à rediriger dessus.
 *
 * Body optionnel : { priceId?: string } — défaut : env.STRIPE_PRICE_ID.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!isBillingEnabled()) {
    return NextResponse.json({ error: "Billing désactivé." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  // Body facultatif — on tolère un corps vide.
  let priceId = env.STRIPE_PRICE_ID;
  try {
    const body = (await request.json()) as { priceId?: unknown };
    if (typeof body?.priceId === "string" && body.priceId.length > 0) {
      priceId = body.priceId;
    }
  } catch {
    // Pas de body JSON : on garde le prix par défaut.
  }

  if (!priceId) {
    return NextResponse.json(
      { error: "Aucun price configuré (STRIPE_PRICE_ID)." },
      { status: 400 },
    );
  }

  const stripe = getStripe();

  // Réutilise le customer existant si l'user a déjà souscrit, sinon en crée un
  // et le persiste immédiatement (le webhook complètera le reste).
  let customerId = await getStripeCustomerId(user.id);
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await upsertSubscription({
      userId: user.id,
      stripeCustomerId: customerId,
    });
  }

  const baseUrl = env.NEXT_PUBLIC_SITE_URL;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    // Filet de sécurité pour rattacher l'event au user côté webhook.
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { metadata: { supabase_user_id: user.id } },
    success_url: `${baseUrl}/dashboard?checkout=success`,
    cancel_url: `${baseUrl}/dashboard?checkout=cancelled`,
    allow_promotion_codes: true,
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Impossible de créer la session Checkout." },
      { status: 502 },
    );
  }

  return NextResponse.json({ url: session.url });
}
