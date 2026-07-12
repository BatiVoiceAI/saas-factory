import { notFound, redirect } from "next/navigation";
import { accessMode } from "@/lib/auth/enrollment";

/**
 * Flux passwordless : connexion et création de compte partagent UN seul écran
 * (/login, e-mail → code/lien, `shouldCreateUser: true`).
 *
 * - `public` : /signup est conservé comme alias → /login (liens existants :
 *   marketing, e-mails, favoris).
 * - `interne` / `perso` : il n'y a PAS d'inscription ouverte (invitations ou
 *   compte seedé). La page d'inscription n'existe donc pas — 404 franc, on
 *   n'annonce aucun chemin de signup.
 */
export default function SignupPage() {
  if (accessMode() !== "public") notFound();
  redirect("/login");
}
