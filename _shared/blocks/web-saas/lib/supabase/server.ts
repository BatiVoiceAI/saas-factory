import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * Client Supabase côté SERVEUR (Server Components, Route Handlers, Server
 * Actions). Sur Next 15, `cookies()` est asynchrone — d'où le `await`.
 *
 * L'écriture de cookies via `set` peut échouer si elle est appelée depuis un
 * Server Component (contexte en lecture seule) : on l'ignore alors, le refresh
 * de session étant assuré par le middleware (lib/supabase/middleware.ts).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[],
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Appelé depuis un Server Component : ignorable, le middleware
            // rafraîchit la session.
          }
        },
      },
    },
  );
}
