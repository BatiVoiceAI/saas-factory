import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/**
 * Client Supabase côté NAVIGATEUR (Client Components).
 * Utilise la clé anon publique — toute lecture/écriture reste bornée par la RLS.
 */
export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
