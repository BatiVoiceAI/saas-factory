import { NextResponse } from "next/server";
import { dispatchDueJobs } from "@/lib/notifications/dispatch";
import { env } from "@/lib/env";

// Runtime Node requis : client service role Supabase + envoi Resend.
export const runtime = "nodejs";
// Jamais mis en cache : chaque hit doit dépiler les jobs dus au moment présent.
export const dynamic = "force-dynamic";

/**
 * Worker de cron des boucles fermées (bloc `notifications`).
 *
 * Déclenché par le cron Vercel quotidien (`vercel.json`, `"0 8 * * *"`, compat
 * Vercel Hobby — cf. _shared/boucles-fermees.md). Rôle STRICT : rappels
 * planifiés arrivés à échéance + retry des `pending` en échec. JAMAIS la 1ʳᵉ
 * livraison d'une confirmation — celle-ci part au call-site de l'action via
 * `dispatchEntityJobs`.
 *
 * Protégé par `CRON_SECRET` (header `Authorization: Bearer <secret>`, que Vercel
 * injecte automatiquement quand la variable est définie). Sans secret configuré
 * OU sans header valide → 401 : la route n'est jamais ouverte publiquement.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const secret = env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const result = await dispatchDueJobs(100);
  return NextResponse.json({ ok: true, ...result });
}
