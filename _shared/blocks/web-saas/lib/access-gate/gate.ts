import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { accessMode } from "@/lib/auth/enrollment";

/**
 * Bloc `access-gate` — rend le « déploiement privé » RÉEL pour un outil
 * `interne`/`perso`. Sélectionné par l'étape 9 quand `type ≠ public`
 * (cf. routing.md) ; INERTE en mode `public` (il ne fait rien).
 *
 * Deux effets, uniquement hors `public` :
 *  1. `X-Robots-Tag: noindex, nofollow` sur chaque réponse — aucun moteur ne
 *     référence un outil interne/perso.
 *  2. Gate de bord : un visiteur NON authentifié qui vise une surface
 *     applicative est renvoyé vers `/login` AVANT tout rendu. Sans ce gate, un
 *     inconnu qui a l'URL atteint le shell de l'app (le problème d'origine :
 *     « signup public ouvert = outil interne accessible à quiconque a l'URL »).
 *
 * FRONTIÈRE DE CONFIANCE — ce gate est une DÉFENSE EN PROFONDEUR, pas l'autorité.
 * L'autorité côté données reste `requireUser()` (Server Components/layouts, qui
 * revalide le JWT côté Supabase) et la RLS ; l'autorité côté enrollment reste
 * `disable_signup` Supabase. Ici on lit la simple PRÉSENCE du cookie de session
 * (test de bord, sans aller-retour réseau) : un cookie périmé laisse passer la
 * requête, mais elle bute alors sur le garde serveur — jamais l'inverse.
 */

/**
 * Chemins toujours accessibles sans session, même en mode privé : l'écran d'auth
 * et ses routes techniques. Sinon on ne pourrait jamais se connecter.
 */
const PUBLIC_PREFIXES = ["/login", "/signup", "/auth"] as const;

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Présence d'un cookie de session Supabase SSR (`sb-<ref>-auth-token`, parfois
 * découpé en `.0`, `.1`). On teste l'EXISTENCE, pas la validité (voir en-tête :
 * défense en profondeur, l'autorité est serveur).
 */
function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some(
      (cookie) =>
        /^sb-.+-auth-token(\.\d+)?$/.test(cookie.name) &&
        cookie.value.length > 0,
    );
}

/**
 * Applique le gate d'accès sur la réponse déjà produite par `updateSession`
 * (refresh de session). Retourne soit cette réponse (annotée `noindex`), soit une
 * redirection vers `/login` — en préservant les cookies de session rafraîchis.
 */
export function applyAccessGate(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  // Mode public : surface ouverte + indexable → aucun gate.
  if (accessMode() === "public") return response;

  // 1) Non-indexation systématique.
  response.headers.set("X-Robots-Tag", "noindex, nofollow");

  // 2) Gate de bord pour les surfaces applicatives.
  const { pathname } = request.nextUrl;
  if (isPublicPath(pathname) || hasSessionCookie(request)) {
    return response;
  }

  // Non authentifié sur une surface protégée → redirection vers l'écran d'auth.
  // On construit sur l'origine PUBLIQUE de confiance (`NEXT_PUBLIC_SITE_URL`),
  // jamais sur l'origine de la requête (hôte interne derrière un proxy) —
  // cohérent avec app/auth/callback/route.ts et app/auth/signout/route.ts.
  const redirect = NextResponse.redirect(
    new URL("/login", env.NEXT_PUBLIC_SITE_URL),
  );
  redirect.headers.set("X-Robots-Tag", "noindex, nofollow");
  // Reporter les cookies de session posés par `updateSession` pour ne pas perdre
  // le refresh en cours (sinon boucle de reconnexion).
  for (const cookie of response.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }
  return redirect;
}
