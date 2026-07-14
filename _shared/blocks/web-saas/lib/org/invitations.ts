import "server-only";

import { randomBytes } from "crypto";

import { brand } from "@/lib/brand";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/notifications/service";
import { enqueueJob } from "@/lib/notifications/enqueue";
import { dispatchEntityJobs } from "@/lib/notifications/dispatch";
import type { OrgRole } from "@/lib/org/context";

/**
 * Bloc `org-tenancy` — invitations d'org (boucle fermée e-mail).
 *
 * Deux temps, deux clients :
 *   • `createInvitation` insère via le client RLS — la policy
 *     `org_invitations_insert_admin` (is_org_admin) porte l'AUTORISATION (seul un
 *     owner/admin de l'org insère) : pas de contrôle d'accès dupliqué en TS. Puis
 *     enfile + dispatch l'e-mail (pattern indissociable du bloc notifications).
 *   • `acceptInvitation` passe par le SERVICE ROLE (bypass RLS) : l'invité n'est
 *     pas encore membre, il ne peut donc pas s'insérer via la RLS. Le TOKEN
 *     (secret bearer envoyé à l'e-mail) fait preuve.
 *
 * L'entité de boucle est `('org_invitation', <id>, 'invitation')` :
 * `notification_jobs` reste GÉNÉRIQUE (aucune fuite métier).
 */

/** Rôle attribuable par invitation (on n'invite jamais un 'owner'). */
export type InvitationRole = Extract<OrgRole, "admin" | "member">;

export interface CreateInvitationParams {
  orgId: string;
  email: string;
  /** Défaut 'member'. */
  role?: InvitationRole;
}

export type CreateInvitationResult =
  | { ok: true; invitationId: string; token: string }
  | { ok: false; error: string };

/** Durée de validité d'une invitation (miroir du défaut SQL J+7). */
const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Crée une invitation puis envoie l'e-mail (enfile + dispatch immédiat).
 * L'insert est RLS-gardé (owner/admin only) ; l'e-mail est best-effort (ne fait
 * jamais échouer la création si Resend n'est pas configuré).
 */
export async function createInvitation(
  params: CreateInvitationParams,
): Promise<CreateInvitationResult> {
  const email = params.email.trim().toLowerCase();
  const role: InvitationRole = params.role ?? "member";
  // Token opaque URL-safe (32 octets d'entropie → 64 hexa). Sa possession = preuve.
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + INVITATION_TTL_MS).toISOString();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("org_invitations")
    .insert({
      org_id: params.orgId,
      email,
      role,
      token,
      expires_at: expiresAt,
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Invitation non créée." };
  }

  // Boucle fermée : enfiler PUIS dispatcher au call-site (sinon le job dort
  // jusqu'au cron — cf. lib/notifications/dispatch.ts). Best-effort : on n'échoue
  // pas la création si l'e-mail ne part pas.
  const acceptUrl = `${env.NEXT_PUBLIC_SITE_URL}/orgs/invitations/accept?token=${token}`;
  await enqueueJob({
    entityType: "org_invitation",
    entityId: data.id,
    type: "invitation",
    recipient: email,
    payload: buildInvitationEmail(acceptUrl),
  });
  await dispatchEntityJobs(data.id);

  return { ok: true, invitationId: data.id, token };
}

export type AcceptInvitationResult =
  | { ok: true; orgId: string; role: OrgRole; alreadyMember: boolean }
  | { ok: false; error: string };

/** Ligne brute `public.org_invitations` utile à l'acceptation. */
interface InvitationRow {
  id: string;
  org_id: string;
  email: string;
  role: OrgRole;
  status: "pending" | "accepted" | "revoked";
  expires_at: string;
}

/**
 * Accepte une invitation pour `userId`. Idempotent :
 *   • l'appartenance est upsertée ON CONFLICT (org_id,user_id) DO NOTHING (la PK
 *     de org_members) → rejouer n'ajoute jamais un doublon ;
 *   • le statut ne repasse à 'accepted' que depuis 'pending'.
 * Refuse une invitation révoquée ou expirée. Le token fait preuve (bearer).
 */
export async function acceptInvitation(
  token: string,
  userId: string,
): Promise<AcceptInvitationResult> {
  const admin = getServiceClient();

  const { data: invite, error } = await admin
    .from("org_invitations")
    .select("id, org_id, email, role, status, expires_at")
    .eq("token", token)
    .maybeSingle<InvitationRow>();

  if (error) return { ok: false, error: error.message };
  if (!invite) return { ok: false, error: "Invitation introuvable." };
  if (invite.status === "revoked") {
    return { ok: false, error: "Invitation révoquée." };
  }
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return { ok: false, error: "Invitation expirée." };
  }

  const alreadyMember = invite.status === "accepted";

  // Insère l'appartenance (service role → bypass la policy admin-only). ON
  // CONFLICT DO NOTHING via `ignoreDuplicates` : idempotent sur (org_id,user_id).
  const { error: memberErr } = await admin
    .from("org_members")
    .upsert(
      { org_id: invite.org_id, user_id: userId, role: invite.role },
      { onConflict: "org_id,user_id", ignoreDuplicates: true },
    );
  if (memberErr) return { ok: false, error: memberErr.message };

  // Marque acceptée UNIQUEMENT depuis 'pending' (garde l'idempotence).
  if (invite.status === "pending") {
    await admin
      .from("org_invitations")
      .update({ status: "accepted" })
      .eq("id", invite.id)
      .eq("status", "pending");
  }

  return { ok: true, orgId: invite.org_id, role: invite.role, alreadyMember };
}

/**
 * Contenu de l'e-mail d'invitation (payload `notification_jobs`). Copy FR =
 * SENTINELLE de langue de travail (CONVENTIONS.md §12) : le build la régénère
 * dans `locale`. Style volontairement minimal (pas de couleur en dur).
 */
function buildInvitationEmail(acceptUrl: string): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Rejoignez votre organisation sur ${brand.name}`;
  const html =
    `<p>Vous avez été invité·e à rejoindre une organisation sur ` +
    `${brand.name}.</p>` +
    `<p><a href="${acceptUrl}">Accepter l'invitation</a></p>` +
    `<p>Ce lien expire dans 7 jours. Si vous n'êtes pas concerné·e, ignorez ` +
    `cet e-mail.</p>`;
  const text =
    `Vous avez été invité·e à rejoindre une organisation sur ${brand.name}.\n\n` +
    `Accepter l'invitation : ${acceptUrl}\n\n` +
    `Ce lien expire dans 7 jours.`;
  return { subject, html, text };
}
