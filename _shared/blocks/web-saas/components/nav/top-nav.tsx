"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { ui } from "@/lib/i18n";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";

type TopNavProps = {
  /** Email de l'utilisateur authentifié (fourni par le layout serveur). */
  email: string | null;
};

/** Deux premières lettres de l'email → initiales du fallback d'avatar. */
function initialsFromEmail(email: string | null): string {
  if (!email) return "?";
  return email.slice(0, 2).toUpperCase();
}

/**
 * Barre supérieure de la surface authentifiée : bascule de thème + menu
 * utilisateur (avatar, email, déconnexion). Client component car interactif.
 */
export function TopNav({ email }: TopNavProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    // La protection de route (bloc `auth`, middleware) redirige vers /login.
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-end gap-2 border-b bg-background px-4 md:px-6">
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label={ui.nav.userMenu}
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback>{initialsFromEmail(email)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="truncate font-normal">
            {email ?? ui.nav.account}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => void handleSignOut()}>
            <LogOut className="h-4 w-4" />
            {ui.actions.signOut}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
