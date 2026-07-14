import "server-only";

/**
 * Bloc `org-tenancy` — extension LÉGÈRE du bloc `billing` en multi-org.
 *
 * ┌───────────────────────────────────────────────────────────────────────────┐
 * │ CONTRAT (CONVENTIONS.md §13) : en `tenancy = multi-org`, ce qui est FACTURÉ │
 * │ PAR UTILISATEUR en `single` devient FACTURÉ PAR ORG. Le client Stripe       │
 * │ s'attache à l'ORG (org_id), pas au user : un abonnement = une org.          │
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * ⚠️ Ce fichier NE RÉÉCRIT PAS le bloc `billing` existant (par user :
 * `lib/billing/subscription.ts`, table `subscriptions(user_id, …)`). Il DOCUMENTE
 * l'extension et fournit des helpers purs + un stub typé, pour que le passage
 * par-org soit une évolution ADDITIVE claire, pas une refonte silencieuse.
 *
 * ─── Plan d'intégration (à appliquer si l'org-billing est activé) ────────────
 * 1. MIGRATION additive : ajouter `org_id uuid references public.orgs(id)` à
 *    `public.subscriptions` (ou une table `org_subscriptions` parallèle), UNIQUE
 *    par org, RLS PAR ORG (is_org_member pour lire, service role pour écrire —
 *    miroir de 0003_billing.sql mais scopé org). Prend le n° de migration suivant.
 * 2. CHECKOUT (`app/api/stripe/checkout`) : résoudre l'org active
 *    (`getActiveOrgId`, lib/org/context), vérifier que l'appelant est owner/admin,
 *    puis créer/réutiliser le customer Stripe de l'ORG en posant
 *    `stripeCustomerRefForOrg(orgId).metadata` sur le customer (traçabilité).
 * 3. WEBHOOK (`app/api/stripe/webhook`) : sur `customer.*`/`checkout.session.*`,
 *    retrouver l'org via `orgIdFromCustomerMetadata(customer.metadata)` (au lieu
 *    de `findUserIdByCustomerId`) et upserter l'état d'abonnement PAR org.
 * 4. ENTITLEMENT : remplacer `hasActiveSubscription()` (par user) par un
 *    `orgHasActiveSubscription(orgId)` (même logique de statuts, clé = org_id).
 *
 * Tant que ces étapes ne sont pas câblées, `billing` reste PAR USER : ce module
 * n'altère aucun comportement, il balise l'extension.
 */

/**
 * Référence stable d'un customer Stripe rattaché à une ORG. Le champ `metadata`
 * est posé tel quel sur le customer Stripe (`customer.metadata`) pour retrouver
 * l'org depuis un event webhook — voir `orgIdFromCustomerMetadata`.
 */
export interface OrgStripeCustomerRef {
  orgId: string;
  metadata: { org_id: string };
}

/**
 * Construit la référence de customer Stripe pour une org. À poser à la création
 * du customer (checkout) : `stripe.customers.create({ metadata: ref.metadata })`.
 */
export function stripeCustomerRefForOrg(orgId: string): OrgStripeCustomerRef {
  return { orgId, metadata: { org_id: orgId } };
}

/**
 * Extrait l'`org_id` de la metadata d'un customer Stripe (chemin inverse, côté
 * webhook). `null` si absent (customer non rattaché à une org — ex. legacy user).
 */
export function orgIdFromCustomerMetadata(
  metadata: Record<string, string | undefined> | null | undefined,
): string | null {
  const value = metadata?.org_id;
  return typeof value === "string" && value.length > 0 ? value : null;
}

/**
 * STUB TYPÉ (extension documentée, NON branchée). Retournera l'id customer
 * Stripe rattaché à une org une fois la colonne `org_id` posée sur les
 * abonnements (étape 1 ci-dessus) — pendant par-org de
 * `lib/billing/subscription.getStripeCustomerId(userId)`. Retourne `null` tant
 * que l'org-billing n'est pas câblé : ne branche RIEN au hasard.
 */
export async function getOrgStripeCustomerId(
  orgId: string,
): Promise<string | null> {
  // Intentionnellement non branché tant que la colonne `org_id` n'existe pas sur
  // les abonnements (étape 1 ci-dessus). `void` marque le paramètre du contrat
  // futur comme sciemment inutilisé (pas un oubli).
  void orgId;
  return null;
}
