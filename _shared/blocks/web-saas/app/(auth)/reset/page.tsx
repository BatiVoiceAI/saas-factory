import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ResetForm } from "@/components/auth/reset-form";
import { getUser } from "@/lib/auth/get-user";
import { ui } from "@/lib/i18n";

export const metadata: Metadata = {
  title: ui.auth.reset.emailTitle,
};

/**
 * Écran MOT DE PASSE OUBLIÉ (flux OTP → mot de passe), distinct de /login et
 * /signup : e-mail → code à 6 chiffres → nouveau mot de passe. Aucun magic link.
 */
export default async function ResetPage() {
  // Déjà authentifié → pas de raison de réinitialiser depuis un écran public.
  if (await getUser()) redirect("/dashboard");
  return <ResetForm />;
}
