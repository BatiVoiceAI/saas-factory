import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware racine : rafraîchit la session Supabase sur chaque navigation.
 * Le bloc `auth` pourra étendre cette fonction pour protéger des routes
 * (redirections) — sans changer la signature ni retirer le refresh.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Toutes les routes SAUF :
     * - _next/static, _next/image (assets build)
     * - favicon.ico et fichiers d'images statiques
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
