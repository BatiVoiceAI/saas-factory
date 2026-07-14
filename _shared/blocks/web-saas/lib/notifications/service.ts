import "server-only";

import {
  createClient as createSupabaseAdminClient,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Accès SERVICE ROLE à la file `notification_jobs` (bloc `notifications`).
 *
 * La table est RLS-only-service-role (0004_notifications.sql, aucune policy) :
 * seul ce client — qui bypasse la RLS — peut l'enfiler/la dépiler. Il est
 * consommé UNIQUEMENT côté serveur (call-sites d'actions, route de cron), jamais
 * exposé au navigateur (`server-only`). On mémoïse le singleton comme ailleurs
 * dans le châssis (cf. lib/email/client.ts).
 */

/** Nom de la table (une seule source de vérité pour éviter les fautes de frappe). */
export const NOTIFICATION_JOBS_TABLE = "notification_jobs" as const;

/** Statuts persistés (miroir du check SQL de 0004_notifications.sql). */
export type NotificationJobStatus = "pending" | "sent" | "failed";

/** Ligne brute `public.notification_jobs` telle que renvoyée par Supabase. */
export interface NotificationJobRow {
  id: string;
  entity_type: string;
  entity_id: string;
  type: string;
  channel: string;
  recipient: string | null;
  payload: Record<string, unknown> | null;
  status: NotificationJobStatus;
  scheduled_for: string;
  attempts: number;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

let adminSingleton: SupabaseClient | null = null;

/**
 * Retourne le client service role, en le mémoïsant. Throw si la clé n'est pas
 * configurée — les appelants best-effort (`enqueueJob`, `dispatch*Jobs`)
 * enveloppent l'appel dans un try/catch et ne cassent jamais l'action métier.
 */
export function getServiceClient(): SupabaseClient {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY manquante : requise pour la file " +
        "notification_jobs (bloc notifications).",
    );
  }

  adminSingleton ??= createSupabaseAdminClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  return adminSingleton;
}
