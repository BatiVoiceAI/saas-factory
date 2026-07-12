import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/nav/app-sidebar";
import { TopNav } from "@/components/nav/top-nav";

/**
 * Shell de la surface authentifiée (`app/(app)/*`).
 *
 * Server Component : récupère l'utilisateur via le client Supabase serveur pour
 * alimenter la top-nav. Le refresh de session est assuré par le middleware ; ce
 * garde défensif redirige vers `/login` (route fournie par le bloc `auth`) si
 * aucune session valide n'est présente.
 *
 * Disposition : sidebar (fixe, ≥ md) + top-nav + `<main>` scrollable.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav email={user.email ?? null} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
