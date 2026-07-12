import { redirect } from "next/navigation";

/**
 * Flux passwordless : connexion et création de compte partagent UN seul écran
 * (/login, e-mail → code/lien, `shouldCreateUser: true`). /signup est conservé
 * comme alias pour les liens existants (marketing, e-mails, favoris).
 */
export default function SignupPage() {
  redirect("/login");
}
