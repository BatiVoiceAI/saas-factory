import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * Helpers de session côté SERVEUR (bloc `auth`).
 *
 * `getUser` est mémoïsé par requête via `cache()` : plusieurs appels au sein du
 * même rendu ne déclenchent qu'un seul aller-retour Supabase.
 *
 * On utilise TOUJOURS `auth.getUser()` (revalide le JWT côté Supabase) et jamais
 * `getSession()` côté serveur pour une décision de sécurité : `getSession` lit un
 * cookie potentiellement falsifiable.
 */

export type Profile = {
  id: string;
  role: "user" | "admin";
  full_name: string | null;
  created_at: string;
  updated_at: string;
};

/** Utilisateur authentifié courant, ou `null`. */
export const getUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** Profil applicatif (rôle inclus) de l'utilisateur courant, ou `null`. */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, role, full_name, created_at, updated_at")
    .eq("id", user.id)
    .single();

  return (data as Profile | null) ?? null;
});

/**
 * Exige une session : redirige vers /login si absent. À appeler en tête d'un
 * Server Component / layout protégé de la surface `(app)`.
 */
export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Exige un rôle admin : redirige vers /login si non authentifié, vers /dashboard
 * si authentifié sans le rôle. Base du contrôle d'accès multi-tenant.
 */
export async function requireRole(role: Profile["role"]): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== role) redirect("/dashboard");
  return profile;
}
