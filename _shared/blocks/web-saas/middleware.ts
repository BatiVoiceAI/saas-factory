import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { applyAccessGate } from "@/lib/access-gate/gate";

/**
 * Middleware racine, composé de deux passes :
 *  1. Fondation (`updateSession`) : rafraîchit la session Supabase sur chaque
 *     navigation et propage les cookies mis à jour. NE PAS retirer cet appel.
 *  2. Bloc `access-gate` : quand le déploiement est privé (`type ≠ public`),
 *     ajoute `X-Robots-Tag: noindex` et renvoie tout visiteur non authentifié
 *     vers `/login`. INERTE en mode public (retourne la réponse telle quelle).
 *
 * L'enrollment (bloc `auth`) décide QUI peut obtenir un code ; ce gate décide ce
 * qu'un visiteur non authentifié peut ATTEINDRE. Les deux sont pilotés par
 * `APP_ACCESS_MODE`.
 */
export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  return applyAccessGate(request, response);
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
