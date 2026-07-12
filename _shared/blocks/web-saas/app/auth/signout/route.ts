import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Déconnexion via POST (bloc `auth`).
 *
 * Endpoint idempotent utilisable par un `<form action="/auth/signout" method="post">`
 * (ex. bouton de déconnexion dans la nav du bloc `ui-shell`). Pour une
 * déconnexion depuis une Server Action, préférer `signout()` de
 * `@/lib/auth/actions`. Statut 303 : force le navigateur à suivre en GET.
 */
export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/login", env.NEXT_PUBLIC_SITE_URL), {
    status: 303,
  });
}
