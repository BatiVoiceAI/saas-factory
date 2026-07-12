import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getUser } from "@/lib/auth/get-user";

export const metadata: Metadata = {
  title: "Connexion",
};

/**
 * L'ÉCRAN d'auth du châssis (flux passwordless) : connexion ET création de
 * compte partagent ce parcours e-mail → code/lien. /signup y redirige.
 * Bannières contextuelles pilotées par `?status=` (callback magic link).
 */
const STATUS_MESSAGES: Record<string, string> = {
  "auth-error":
    "Le lien de connexion est invalide ou a expiré. Saisissez votre e-mail pour en recevoir un nouveau.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  // Déjà authentifié -> pas de raison de rester sur /login.
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
      <AuthForm />
    </>
  );
}
