import type { Metadata } from "next";
import Link from "next/link";

import { getUser } from "@/lib/auth/get-user";

/**
 * Tableau de bord — landing authentifié de la surface `(app)`.
 *
 * C'est la cible de TOUTES les redirections post-succès du flux d'auth
 * (`AFTER_LOGIN`, callback OAuth/confirmation, retours Stripe) ainsi que du
 * lien « Tableau de bord » de la sidebar. La session est déjà garantie par le
 * garde de `app/(app)/layout.tsx` ; `getUser()` (mémoïsé) sert ici uniquement à
 * personnaliser l'accueil. Page à enrichir par la verticale métier.
 */
export const metadata: Metadata = {
  title: "Tableau de bord",
};

export default async function DashboardPage() {
  const user = await getUser();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Tableau de bord
        </h1>
        <p className="text-sm text-muted-foreground">
          {user?.email
            ? `Connecté en tant que ${user.email}.`
            : "Bienvenue."}{" "}
          Point de départ de votre surface applicative.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/items"
          className="flex flex-col gap-1 rounded-lg border border-border p-6 transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <span className="font-medium">Éléments</span>
          <span className="text-sm text-muted-foreground">
            Gérer vos entités (bloc CRUD).
          </span>
        </Link>
        <Link
          href="/billing"
          className="flex flex-col gap-1 rounded-lg border border-border p-6 transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <span className="font-medium">Facturation</span>
          <span className="text-sm text-muted-foreground">
            Abonnement et moyens de paiement (bloc billing).
          </span>
        </Link>
      </div>
    </div>
  );
}
