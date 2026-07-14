/**
 * Catalogue TYPÉ des events produit (source unique de vérité).
 *
 * Objectif : nommer les events une seule fois, avec le shape exact de leurs
 * propriétés, pour que `capture()` (lib/analytics/posthog.ts) refuse à la
 * compilation un nom d'event inconnu ou un payload mal formé.
 *
 * Convention de nommage : `objet_verbe_au_passé` en snake_case
 * (ex. `item_created`, `subscription_started`) — lisible dans PostHog.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * MOMENT MAGIQUE / ACTIVATION (référence : étape 18 du parcours)
 * ─────────────────────────────────────────────────────────────────────────
 * L'event `activation_completed` matérialise le « moment magique » : le
 * premier instant où l'utilisateur retire de la valeur du produit (l'action
 * qui corrèle le mieux à la rétention). Chaque micro-SaaS redéfinit CE qui
 * compte comme activation via `ActivationMilestone`, mais l'event lui-même
 * reste stable pour bâtir le funnel signup → activation dans PostHog.
 */

/** Jalons d'activation possibles — à spécialiser par projet. */
export type ActivationMilestone =
  | "first_item_created"
  | "first_invite_sent"
  | "first_integration_connected"
  | "onboarding_completed";

/**
 * ─────────────────────────────────────────────────────────────────────────
 * CONTRAT DE SPÉCIALISATION (étape 12-build)
 * ─────────────────────────────────────────────────────────────────────────
 * Ce registre est un SOCLE générique. À la construction (12-build), il est
 * SPÉCIALISÉ aux actions de valeur du PRD (étape 07) : on ajoute ici l'event
 * de CHAQUE action de valeur du domaine, et on pose le `capture()` correspondant
 * AU CALL-SITE — à côté du dispatch de notification de boucle fermée, exactement
 * comme les notifications. Le « moment magique » du PRD ⇒ `activation_completed`.
 * RÈGLE : un event défini sans `capture()` appelant = boucle de mesure ouverte
 * (interdit — porte grep de 12-build/integration-pass). Voir aussi 18-metrics.
 *
 * Registre event → shape des propriétés.
 * Une valeur `Record<string, never>` signifie « aucune propriété attendue ».
 */
export interface AnalyticsEventMap {
  // --- Cycle de vie du compte -------------------------------------------
  user_signed_up: {
    /** Méthode d'inscription (email OTP + mot de passe, oauth provider…). */
    method: "email" | "google" | "github";
  };
  user_logged_in: {
    method: "email" | "google" | "github";
  };
  user_signed_out: Record<string, never>;

  // --- Acquisition (archétype landing / bloc waitlist) ------------------
  /**
   * Un visiteur a rejoint la liste d'attente. Action de valeur de l'archétype
   * `landing` : c'est SON « activation » (signal de demande mesurable).
   */
  waitlist_joined: {
    /** Emplacement du formulaire (ex. "hero", "pricing") pour l'attribution. */
    source?: string;
  };

  // --- Moment magique / activation (étape 18) ---------------------------
  /**
   * L'utilisateur a atteint son moment de valeur. Event de référence pour le
   * funnel d'activation. `time_to_activate_seconds` = délai depuis le signup.
   */
  activation_completed: {
    milestone: ActivationMilestone;
    time_to_activate_seconds?: number;
  };

  // --- CRUD (entité exemple `items`, bloc crud) -------------------------
  item_created: {
    item_id: string;
  };
  item_updated: {
    item_id: string;
  };
  item_deleted: {
    item_id: string;
  };

  // --- Billing (bloc billing) -------------------------------------------
  checkout_started: {
    price_id: string;
  };
  subscription_started: {
    price_id: string;
    /** Identifiant Stripe de l'abonnement créé. */
    subscription_id: string;
  };
  subscription_canceled: {
    subscription_id: string;
  };
}

/** Nom d'event valide (union des clés du registre). */
export type AnalyticsEventName = keyof AnalyticsEventMap;

/** Propriétés attendues pour un event donné. */
export type AnalyticsEventProps<E extends AnalyticsEventName> =
  AnalyticsEventMap[E];

/**
 * Constantes de noms d'events, pour référencer un event sans typer une
 * chaîne libre côté appelant (autocomplétion + refactor sûr).
 */
export const EVENTS = {
  USER_SIGNED_UP: "user_signed_up",
  USER_LOGGED_IN: "user_logged_in",
  USER_SIGNED_OUT: "user_signed_out",
  WAITLIST_JOINED: "waitlist_joined",
  ACTIVATION_COMPLETED: "activation_completed",
  ITEM_CREATED: "item_created",
  ITEM_UPDATED: "item_updated",
  ITEM_DELETED: "item_deleted",
  CHECKOUT_STARTED: "checkout_started",
  SUBSCRIPTION_STARTED: "subscription_started",
  SUBSCRIPTION_CANCELED: "subscription_canceled",
} as const satisfies Record<string, AnalyticsEventName>;
