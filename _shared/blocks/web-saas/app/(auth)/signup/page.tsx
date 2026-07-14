import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/signup-form";
import { getUser } from "@/lib/auth/get-user";
import { ui } from "@/lib/i18n";

export const metadata: Metadata = {
  title: ui.auth.signup.emailTitle,
};

/**
 * Écran d'INSCRIPTION (flux OTP → mot de passe), DISTINCT de /login (ce n'est
 * plus un alias) : e-mail → code à 6 chiffres → création du mot de passe.
 *
 * S'applique aux TROIS types de déploiement avec la MÊME mécanique. L'enrollment
 * (`resolveEnrollment`, appliqué côté serveur dans `requestSignupOtp`) décide qui
 * obtient un code :
 *  - `public` / allowlist de domaine : compte créé à la volée ;
 *  - `interne` (invitations) / `perso` : seul un compte préexistant (invité /
 *    seedé) reçoit un code — cet écran sert alors à l'ACTIVATION (poser le mot
 *    de passe). Une adresse non enrôlée reçoit un refus honnête, jamais de code.
 * L'autorité reste `disable_signup` côté Supabase (défense en profondeur).
 */
export default async function SignupPage() {
  // Déjà authentifié → rien à créer.
  if (await getUser()) redirect("/dashboard");
  return <SignupForm />;
}
