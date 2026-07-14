import "server-only";

import {
  getServiceClient,
  NOTIFICATION_JOBS_TABLE,
} from "@/lib/notifications/service";

/**
 * Enfilage d'un job de boucle fermée (bloc `notifications`).
 *
 * PREMIER des deux temps INDISSOCIABLES du pattern (_shared/boucles-fermees.md) :
 *   (a) `enqueueJob(...)`  → durabilité + idempotence + retry (ICI) ;
 *   (b) `dispatchEntityJobs(entityId)` → envoi IMMÉDIAT au site de l'action.
 * Enfiler SANS appeler (b) = boucle muette : le job dort jusqu'au cron. Les deux
 * vont ensemble dans le handler de l'action de valeur.
 *
 * Idempotent par (entity_id, type) : la contrainte UNIQUE de
 * 0004_notifications.sql + l'upsert `ignoreDuplicates` garantissent qu'un même
 * dossier n'a qu'UNE ligne par nature de boucle — rejouer le call-site ou le
 * cron le même jour ne redouble jamais l'envoi.
 */

export interface EnqueueJobParams {
  /** Table métier ciblée, ex. 'reservation' | 'order' | 'request'. */
  entityType: string;
  /** Id de la ligne concernée dans SA table. */
  entityId: string;
  /** Nature de la boucle, ex. 'confirmation' | 'notify_owner' | 'reminder'. */
  type: string;
  /** Destinataire résolu (email pour le canal 'email'). */
  recipient?: string | null;
  /** Canal de livraison. Défaut 'email' (bloc notifications / Resend). */
  channel?: string;
  /**
   * Contenu prêt-à-livrer, sérialisable en jsonb. Pour le canal 'email' :
   * `{ subject, html?, text?, replyTo? }` (au moins subject + html|text).
   */
  payload?: Record<string, unknown>;
  /**
   * Échéance d'envoi. Absent/`now` = immédiat (confirmation/notification) ;
   * daté dans le futur = rappel planifié (J-1) balayé par le cron quotidien.
   */
  scheduledFor?: string | Date;
}

export type EnqueueJobResult =
  | { ok: true; created: boolean }
  | { ok: false; error: string };

/**
 * Enfile un job (best-effort : ne throw jamais). Retourne `created: false` si un
 * job (entity_id, type) existait déjà (idempotence), `created: true` sinon.
 */
export async function enqueueJob(
  params: EnqueueJobParams,
): Promise<EnqueueJobResult> {
  try {
    const supabase = getServiceClient();

    const scheduledFor =
      params.scheduledFor instanceof Date
        ? params.scheduledFor.toISOString()
        : params.scheduledFor;

    // Upsert idempotent sur la contrainte UNIQUE (entity_id, type) :
    // `ignoreDuplicates` ⇒ ON CONFLICT DO NOTHING (aucune ligne renvoyée si le
    // job existe déjà). On ne remet donc jamais un job `sent` en `pending`.
    const { data, error } = await supabase
      .from(NOTIFICATION_JOBS_TABLE)
      .upsert(
        {
          entity_type: params.entityType,
          entity_id: params.entityId,
          type: params.type,
          channel: params.channel ?? "email",
          recipient: params.recipient ?? null,
          payload: params.payload ?? {},
          // Laisse le défaut SQL (now()) si non fourni.
          ...(scheduledFor ? { scheduled_for: scheduledFor } : {}),
        },
        { onConflict: "entity_id,type", ignoreDuplicates: true },
      )
      .select("id");

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, created: (data?.length ?? 0) > 0 };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Échec d'enfilage de job inconnu.",
    };
  }
}
