// BLOC OPTIONNEL — inclus seulement si providers.billing = stripe (config-schema)
import "server-only";

import Stripe from "stripe";
import { env } from "@/lib/env";

/**
 * Client Stripe côté SERVEUR, construit depuis l'env (jamais de clé en dur).
 *
 * Le bloc `billing` est OPTIONNEL : `STRIPE_SECRET_KEY` est `.optional()` dans
 * `lib/env.ts`. On instancie donc paresseusement et on lève une erreur claire
 * si un handler billing est appelé alors que le projet ne vend pas (clé absente).
 */

// Version d'API épinglée sur celle que fige le SDK stripe@17 (son type
// `LatestApiVersion`) — verrouille le contrat sérialisé des events. À faire
// évoluer en même temps que la version du SDK Stripe.
const STRIPE_API_VERSION = "2025-02-24.acacia" as const;

let stripeSingleton: Stripe | null = null;

/**
 * `true` si le projet est configuré pour vendre (clé secrète présente).
 * Permet aux routes/UX de dégrader proprement quand billing n'est pas activé.
 */
export function isBillingEnabled(): boolean {
  return Boolean(env.STRIPE_SECRET_KEY);
}

/**
 * Retourne le client Stripe (singleton). Lève si la clé secrète manque : un
 * appel à une route billing sans configuration est un bug de câblage, pas un
 * cas silencieux.
 */
export function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error(
      "Billing appelé sans STRIPE_SECRET_KEY. Activez le bloc billing " +
        "(providers.billing = stripe) et renseignez la clé dans .env.",
    );
  }

  if (!stripeSingleton) {
    stripeSingleton = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: STRIPE_API_VERSION,
      typescript: true,
      appInfo: { name: "saas-factory/web-saas" },
    });
  }

  return stripeSingleton;
}
