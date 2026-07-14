// ─────────────────────────────────────────────────────────────────────────────
// AU3 — Healthcheck / statut d'exécution
// ─────────────────────────────────────────────────────────────────────────────
// Un superviseur (uptime monitor, orchestrateur de conteneur, load-balancer) a
// besoin de savoir : le worker répond-il ? son dernier run a-t-il réussi ? Ce
// module expose `GET /health` → 200 avec le dernier statut de run (lu depuis
// runs.ts, AU2). Pertinent en mode LONG-RUNNING (worker/conteneur qui reste en
// vie) ; en mode one-shot (cron externe qui lance puis sort), on n'ouvre pas de
// serveur — d'où le port OPTIONNEL (HEALTHCHECK_PORT).
//
// Toujours 200 tant que le process répond (« je suis vivant ») ; le champ
// `lastRun.status` porte la santé métier (le superviseur décide de son seuil).
// ─────────────────────────────────────────────────────────────────────────────

import * as http from "node:http";
import { getLastRun } from "./runs.js";

/** Charge utile du healthcheck : liveness + résumé du dernier run (AU2). */
export function healthPayload(): {
  status: "ok";
  now: string;
  lastRun:
    | {
        id: string;
        name: string;
        status: string;
        started_at: string;
        finished_at: string | null;
      }
    | null;
} {
  const last = getLastRun();
  return {
    status: "ok",
    now: new Date().toISOString(),
    lastRun:
      last != null
        ? {
            id: last.id,
            name: last.name,
            status: last.status,
            started_at: last.started_at,
            finished_at: last.finished_at,
          }
        : null,
  };
}

/**
 * Démarre un mini serveur HTTP exposant `GET /health`. Retourne le serveur pour
 * permettre un arrêt propre (server.close()). N'ouvre AUCUNE autre route.
 */
export function startHealthServer(port: number): http.Server {
  const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(healthPayload()));
      return;
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "not_found" }));
  });
  server.listen(port, () => {
    console.log(`[health] /health en écoute sur :${port}`);
  });
  return server;
}
