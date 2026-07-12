import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback magic link / OAuth (bloc `auth`).
 *
 * Supabase redirige ici avec un `?code=...` (PKCE) après un clic sur le magic
 * link du flux passwordless (l'alternative au code à 6 chiffres, cf.
 * `lib/auth/actions.ts`) ou une connexion OAuth. On échange ce code contre
 * une session (les cookies sont posés par le client serveur) puis on redirige
 * vers `next` (surface authentifiée par défaut).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Anti open-redirect : on n'accepte qu'un chemin interne (pas d'URL absolue).
  const redirectTo = next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/dashboard";

  // On construit toujours la redirection sur l'origine PUBLIQUE de confiance
  // (`NEXT_PUBLIC_SITE_URL`) et jamais sur l'origine de `request.url` : derrière
  // un reverse-proxy / load balancer, cette dernière reflète l'hôte interne
  // (localhost, IP conteneur) et casserait le flux auth en production. Cohérent
  // avec app/auth/signout/route.ts.
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(redirectTo, env.NEXT_PUBLIC_SITE_URL));
    }
  }

  // Code absent ou échange échoué -> retour login avec indicateur d'erreur.
  return NextResponse.redirect(
    new URL("/login?status=auth-error", env.NEXT_PUBLIC_SITE_URL),
  );
}
