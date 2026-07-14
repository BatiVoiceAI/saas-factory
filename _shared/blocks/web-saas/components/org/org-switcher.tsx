"use client";

import { useRouter } from "next/navigation";
import { Building2, Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Bloc `org-tenancy` — sélecteur d'organisation active (client).
 *
 * Reçoit la liste (sérialisable) des orgs de l'utilisateur + l'org active,
 * résolues côté serveur par `lib/org/context` (`getUserOrgs` + `getActiveOrgId`).
 * À la sélection : pose le cookie `active_org` (lu ensuite par `getActiveOrgId`)
 * puis `router.refresh()` re-rend l'arbre serveur avec le nouveau tenant.
 *
 * Cookie NON httpOnly volontairement : c'est une simple préférence d'affichage,
 * pas un secret. Le contrôle d'accès réel reste la RLS PAR ORG (0006) — un cookie
 * forgé pointant une org non-membre est ignoré par `getActiveOrgId` ET bloqué par
 * la RLS. Nom du cookie = `ACTIVE_ORG_COOKIE` (lib/org/context), répété ici en dur
 * car ce module client n'importe pas le module serveur (`server-only`).
 */

const ACTIVE_ORG_COOKIE = "active_org";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export interface OrgSwitcherOrg {
  id: string;
  name: string;
  role: string;
}

export interface OrgSwitcherProps {
  orgs: OrgSwitcherOrg[];
  activeOrgId: string | null;
}

export function OrgSwitcher({ orgs, activeOrgId }: OrgSwitcherProps) {
  const router = useRouter();
  const active = orgs.find((o) => o.id === activeOrgId) ?? orgs[0] ?? null;

  function selectOrg(orgId: string) {
    if (orgId === active?.id) return;
    document.cookie = `${ACTIVE_ORG_COOKIE}=${orgId}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
    router.refresh();
  }

  // Rien à basculer si l'utilisateur n'a aucune org.
  if (orgs.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between gap-2">
          <span className="flex items-center gap-2 truncate">
            <Building2 className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{active?.name ?? "Organisation"}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56">
        <DropdownMenuLabel>Organisations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {orgs.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => selectOrg(org.id)}
            className="justify-between gap-2"
          >
            <span className="truncate">{org.name}</span>
            {org.id === active?.id ? (
              <Check className="h-4 w-4 shrink-0" aria-hidden />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
