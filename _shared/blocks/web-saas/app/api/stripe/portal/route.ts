// BLOC OPTIONNEL — inclus seulement si providers.billing = stripe (config-schema)
import { NextResponse } from "next/server";
import { getStripe, isBillingEnabled } from "@/lib/billing/stripe";
import { getStripeCustomerId } from "@/lib/billing/subscription";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export const runtime = "nodejs";

/**
 * Ouvre le portail de facturation Stripe (gestion abo, moyens de paiement,
 * factures) pour l'utilisateur authentifié. Renvoie l'URL hébergée ({ url }).
 */
export async function POST(): Promise<NextResponse> {
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

  const customerId = await getStripeCustomerId(user.id);
  if (!customerId) {
    return NextResponse.json(
      { error: "Aucun client Stripe pour cet utilisateur." },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.NEXT_PUBLIC_SITE_URL}/dashboard`,
  });

  return NextResponse.json({ url: session.url });
}
