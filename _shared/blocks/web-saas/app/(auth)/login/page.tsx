import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getUser } from "@/lib/auth/get-user";
import { ui } from "@/lib/i18n";

export const metadata: Metadata = {
  title: ui.auth.login.title,
};

/**
 * Écran de CONNEXION (flux OTP → mot de passe) : e-mail + mot de passe. Distinct
 * de /signup (inscription) et /reset (mot de passe oublié). Une bannière
 * contextuelle `?status=` couvre un éventuel échec de retour OAuth
 * (app/auth/callback) — il n'y a plus de magic link.
 */
const STATUS_MESSAGES: Record<string, string> = {
  "auth-error": ui.auth.errors.oauthFailed,
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  // Déjà authentifié → pas de raison de rester sur /login.
  if (await getUser()) redirect("/dashboard");

  const { status } = await searchParams;
  const message = status ? STATUS_MESSAGES[status] : undefined;

  return (
    <>
      {message ? (
        <p className="mb-4 rounded-md bg-muted px-3 py-2 text-center text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}
      <LoginForm />
    </>
  );
}
