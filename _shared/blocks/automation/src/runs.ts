// ─────────────────────────────────────────────────────────────────────────────
// AU2 — Historique des runs + logs (consultables)
// ─────────────────────────────────────────────────────────────────────────────
// Sans historique, un worker headless est une boîte noire : impossible de savoir
// s'il a tourné, quand, et avec quel résultat. Chaque exécution ouvre un run
// (startRun), y empile des lignes de log (log), puis le clôt (finishRun) avec un
// statut + résumé. La trace est écrite dans Supabase `automation_runs` en REST ;
// si Supabase est absent (config sans supabase), on bascule sur la CONSOLE — la
// persistance ne doit JAMAIS faire échouer le job (best-effort, cf. safe()).
//
// Le dernier run est aussi mémorisé en process (getLastRun) pour alimenter le
// healthcheck (AU3) sans aller-retour base.
// ─────────────────────────────────────────────────────────────────────────────

import { randomUUID } from "node:crypto";
import type { Config } from "./config.js";
import {
  resolveFetch,
  restHeaders,
  restUrl,
  type FetchImpl,
  type SupabaseRest,
} from "./supabase.js";

/** Surcharges optionnelles des écritures de trace (P1-D) : `fetch` injectable en test. */
export type RunsOptions = { fetchImpl?: FetchImpl };

/** Statut final d'un run (colonne persistée). 'running' = en cours (non terminé). */
export type RunStatus = "success" | "failure";

/** Enregistrement d'un run — miroir de la ligne `automation_runs`. */
export type RunRecord = {
  id: string;
  name: string;
  started_at: string;
  finished_at: string | null;
  status: RunStatus | "running";
  summary: string | null;
  logs: string[];
};

// Dernier run observé dans CE process (pour le healthcheck AU3). Mutable, volontaire.
let lastRun: RunRecord | null = null;

/** Dernier run connu du process courant (lecture seule pour health.ts). */
export function getLastRun(): RunRecord | null {
  return lastRun;
}

/**
 * Exécute une opération best-effort : toute erreur est logguée mais AVALÉE. La
 * persistance de l'historique ne doit jamais tuer le job métier (AU2 est de
 * l'observabilité, pas le cœur de valeur).
 */
async function safe(what: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[runs] persistance "${what}" ignorée (best-effort) : ${msg}`);
  }
}

/** Insère la ligne de run initiale dans Supabase (status 'running'). */
async function insertRun(
  sb: SupabaseRest,
  run: RunRecord,
  fetchImpl: FetchImpl = fetch,
): Promise<void> {
  const res = await fetchImpl(restUrl(sb, "automation_runs"), {
    method: "POST",
    headers: restHeaders(sb, { Prefer: "return=minimal" }),
    body: JSON.stringify({
      id: run.id,
      name: run.name,
      started_at: run.started_at,
      status: run.status,
      logs: run.logs,
    }),
  });
  if (!res.ok) {
    throw new Error(`insert automation_runs → ${res.status} ${await res.text()}`);
  }
}

/** Met à jour la ligne de run (clôture : finished_at, status, summary, logs). */
async function patchRun(
  sb: SupabaseRest,
  run: RunRecord,
  fetchImpl: FetchImpl = fetch,
): Promise<void> {
  const res = await fetchImpl(
    restUrl(sb, `automation_runs?id=eq.${encodeURIComponent(run.id)}`),
    {
      method: "PATCH",
      headers: restHeaders(sb, { Prefer: "return=minimal" }),
      body: JSON.stringify({
        finished_at: run.finished_at,
        status: run.status,
        summary: run.summary,
        logs: run.logs,
      }),
    },
  );
  if (!res.ok) {
    throw new Error(`patch automation_runs → ${res.status} ${await res.text()}`);
  }
}

/**
 * Ouvre un nouveau run. Génère un id, l'enregistre (Supabase ou console) et le
 * mémorise comme dernier run du process. Retourne l'objet à passer à log()/finishRun().
 */
export async function startRun(
  config: Config,
  name: string,
  opts: RunsOptions = {},
): Promise<RunRecord> {
  const run: RunRecord = {
    id: randomUUID(),
    name,
    started_at: new Date().toISOString(),
    finished_at: null,
    status: "running",
    summary: null,
    logs: [],
  };
  lastRun = run;

  if (config.supabase) {
    await safe("startRun", () => insertRun(config.supabase!, run, resolveFetch(opts.fetchImpl)));
  } else {
    console.log(`[runs] ▶ ${run.name} (${run.id}) démarré ${run.started_at}`);
  }
  return run;
}

/**
 * Empile une ligne de log horodatée sur le run (et l'écho console). Les logs sont
 * flushés en base à la clôture (finishRun) — un run court n'a pas besoin d'un
 * aller-retour par ligne.
 */
export function log(run: RunRecord, message: string): void {
  const line = `[${new Date().toISOString()}] ${message}`;
  run.logs.push(line);
  console.log(`[runs:${run.name}] ${message}`);
}

/**
 * Clôt le run avec son statut final et un résumé, puis flushe la trace complète
 * (statut + logs) en base ou en console. Idempotence de clôture : ne double pas
 * si appelé une seule fois par run (contrat d'usage : un finishRun par run).
 */
export async function finishRun(
  config: Config,
  run: RunRecord,
  status: RunStatus,
  summary: string,
  opts: RunsOptions = {},
): Promise<void> {
  run.finished_at = new Date().toISOString();
  run.status = status;
  run.summary = summary;
  lastRun = run;

  if (config.supabase) {
    await safe("finishRun", () => patchRun(config.supabase!, run, resolveFetch(opts.fetchImpl)));
  } else {
    console.log(
      `[runs] ■ ${run.name} (${run.id}) → ${status} : ${summary}\n${run.logs.join("\n")}`,
    );
  }
}

/**
 * Rendu texte d'un run pour le corps des notifications (AU4). Compact et lisible
 * par un humain non-tech : nom, statut, durée, résumé, puis les logs.
 */
export function renderRun(run: RunRecord): string {
  const durationMs =
    run.finished_at != null
      ? new Date(run.finished_at).getTime() - new Date(run.started_at).getTime()
      : null;
  const duration = durationMs != null ? `${Math.round(durationMs / 100) / 10}s` : "—";
  const header = [
    `Run       : ${run.name} (${run.id})`,
    `Statut    : ${run.status}`,
    `Démarré   : ${run.started_at}`,
    `Terminé   : ${run.finished_at ?? "—"}`,
    `Durée     : ${duration}`,
    `Résumé    : ${run.summary ?? "—"}`,
  ].join("\n");
  const logs = run.logs.length > 0 ? `\n\nLogs :\n${run.logs.join("\n")}` : "";
  return `${header}${logs}`;
}
