import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

/**
 * Rafraîchit la session Supabase à chaque requête et propage les cookies
 * mis à jour dans la réponse. Appelé depuis le middleware racine.
 *
 * Important : ne PAS insérer de logique entre `createServerClient` et
 * `getUser()`, et toujours retourner l'objet `supabaseResponse` tel quel pour
 * ne pas désynchroniser les cookies de session.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Rafraîchit le token si nécessaire (revalide la session côté Supabase).
  await supabase.auth.getUser();

  return supabaseResponse;
}
