import Link from "next/link";
import type { ReactNode } from "react";

import { brand } from "@/lib/brand";

/**
 * Layout des pages d'auth (route group `(auth)`) : centre le formulaire, sans
 * la nav applicative. Les parenthèses ne créent pas de segment d'URL — les
 * pages restent /login, /signup.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <Link
        href="/"
        className="mb-8 text-lg font-semibold tracking-tight text-foreground"
      >
        {brand.name}
      </Link>
      <main className="w-full max-w-sm rounded-xl border bg-background p-6 shadow-sm sm:p-8">
        {children}
      </main>
    </div>
  );
}
