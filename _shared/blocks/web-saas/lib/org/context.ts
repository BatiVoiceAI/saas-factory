import "server-only";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/**
 * Bloc `org-tenancy` — résolution du TENANT courant (org) côté serveur.
 *
 * Inclus SEULEMENT si `tenancy = multi-org` (CONVENTIONS.md §13). En `single`,
 * le tenant est l'utilisateur et ce module n'existe pas.
 *
 * Toutes les lectures passent par le client serveur RLS-scopé
 * (`@/lib/supabase/server`) : l'utilisateur ne voit QUE les orgs dont il est
 * membre (policies de 0006_org_tenancy.sql, via les helpers `is_org_member`).
 * On ne fabrique jamais l'org_id depuis un paramètre client — il vient de la
 * session (memberships) et, pour l'org active, d'un cookie VALIDÉ contre les
 * memberships (miroir de la doctrine RLS §8/§13).
 */

/** Nom du cookie portant l'org active sélectionnée dans l'org-switcher. */
export const ACTIVE_ORG_COOKIE = "active_org" as const;

/** Rôle applicatif d'un membre dans une org (miroir du check SQL). */
export type OrgRole = "owner" | "admin" | "member";

/** Forme applicative d'une ligne `public.orgs` (camelCase). */
export interface Org {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
}

/** Forme applicative d'une ligne `public.org_members` (camelCase). */
export interface OrgMember {
  orgId: string;
  userId: string;
  role: OrgRole;
  createdAt: string;
}

/** Une org + le rôle de l'utilisateur dans cette org. */
export interface OrgMembership {
  org: Org;
  role: OrgRole;
}

/** Ligne brute renvoyée par le join `org_members → orgs` (snake_case). */
interface OrgRow {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
}
interface MembershipRow {
  role: OrgRole;
  org: OrgRow | null;
}

function toOrg(row: OrgRow): Org {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    ownerId: row.owner_id,
    createdAt: row.created_at,
  };
}

/**
 * Liste des orgs de l'utilisateur `userId` + son rôle dans chacune, triées par
 * date d'appartenance (la plus ancienne d'abord = fallback d'org active stable).
 * Passe par la RLS : ne retourne que des orgs réellement accessibles.
 */
export async function getUserOrgs(userId: string): Promise<OrgMembership[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("org_members")
    .select("role, org:orgs ( id, name, slug, owner_id, created_at )")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  // Le client Supabase n'est pas typé (pas de Database generic) : on caste vers
  // la forme attendue. L'embed to-one `org:orgs(...)` est un objet (ou null).
  const rows = data as unknown as MembershipRow[];

  return rows
    .filter((row): row is MembershipRow & { org: OrgRow } => row.org !== null)
    .map((row) => ({ org: toOrg(row.org), role: row.role }));
}

/**
 * Org active de l'utilisateur courant :
 *   1. lit le cookie `active_org` ;
 *   2. le VALIDE contre les memberships (un cookie forgé pointant une org dont
 *      l'utilisateur n'est pas membre est ignoré — la RLS le bloquerait de toute
 *      façon, mais on ne renvoie jamais un tenant non autorisé) ;
 *   3. fallback = 1re org (la plus ancienne). `null` si aucune org / pas de session.
 */
export async function getActiveOrgId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const memberships = await getUserOrgs(user.id);
  if (memberships.length === 0) return null;

  const cookieStore = await cookies();
  const cookieOrgId = cookieStore.get(ACTIVE_ORG_COOKIE)?.value ?? null;
  if (cookieOrgId && memberships.some((m) => m.org.id === cookieOrgId)) {
    return cookieOrgId;
  }

  return memberships[0]?.org.id ?? null;
}
