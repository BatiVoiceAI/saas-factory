"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  LayoutDashboard,
  type LucideIcon,
  Package,
} from "lucide-react";

import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

/**
 * Éléments de navigation du châssis. Les routes cibles sont fournies par
 * d'autres blocs (`crud` → /items, `billing` → /billing) ; le shell les liste.
 */
const navItems: NavItem[] = [
  { title: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { title: "Éléments", href: "/items", icon: Package },
  { title: "Facturation", href: "/billing", icon: CreditCard },
];

/**
 * Barre latérale de la surface authentifiée. Masquée sous `md`, où la
 * navigation retombe sur la top-nav. Surligne l'entrée active via `usePathname`.
 */
export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card md:flex md:flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            {brand.name.charAt(0)}
          </span>
          <span>{brand.name}</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4" aria-label="Navigation principale">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
