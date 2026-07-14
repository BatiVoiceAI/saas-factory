// ─────────────────────────────────────────────────────────────────────────────
// Point d'entrée du worker AUTOMATION — orchestre UN run de bout en bout.
// ─────────────────────────────────────────────────────────────────────────────
// Enchaînement canonique (socle AU1-AU5) :
//   1. loadConfig()                         → AU1 (config/secrets validés, fail-fast)
//   2. startHealthServer() [si port]        → AU3 (statut, mode long-running)
//   3. startRun()                           → AU2 (ouverture de la trace)
//   4. withIdempotency(key, job)            → AU5 (re-run sûr, pas de double effet)
//   5. finishRun('success')                 → AU2 (clôture, TOUJOURS journalisée)
//   6. régime de notif (AU4)                → cf. « TROIS RÉGIMES » ci-dessous
//   try/catch global :
//   7. finishRun('failure') + notifyOwner(ok:false) + exit 1  → AU4 (alerte immédiate)
//
// ── AU4 — LES TROIS RÉGIMES DE NOTIFICATION (P2-G) ───────────────────────────
// La boucle fermée N'EST PAS « un email par succès ». Notifier CHAQUE succès à
// cadence sub-quotidienne (N=4 h ⇒ ~6 mails « run réussi »/jour) est du SPAM, à
// rebours de `_shared/boucles-fermees.md`. Un worker réel combine trois régimes :
//
//   1. SUCCÈS NOMINAL SILENCIEUX (défaut) — le run réussit « pour rien à signaler »
//      (0 entité créée, rien d'actionnable) : on JOURNALISE (AU2, `finishRun` +
//      `log`) et on N'ENVOIE RIEN. La trace suffit ; le propriétaire n'est pas
//      dérangé. ⇦ c'est le comportement par défaut de ce stub.
//   2. RAPPORT PÉRIODIQUE PLANIFIÉ — une cadence dédiée (ex. digest quotidien)
//      envoie UN récapitulatif, même sans incident. C'est LUI le « succès notifié ».
//      → route via RUN_MODE (voir dispatch commenté plus bas) : une 2ᵉ entrée cron.
//   3. ALERTE IMMÉDIATE — quelque chose d'ACTIONNABLE survient (échec de run ;
//      OU, côté métier, une entité créée / un seuil franchi) : on notifie TOUT DE
//      SUITE, sans attendre le rapport périodique. L'échec (catch global) est le
//      cas garanti ; les alertes métier se déclenchent au site du run (voir TODO).
//
// Le « job métier » est ici un STUB générique clairement marqué : chaque projet
// le remplace par sa logique ET choisit, au site du run, ce qui relève de l'alerte
// immédiate (régime 3) vs du simple journal (régime 1).
// ─────────────────────────────────────────────────────────────────────────────

import { pathToFileURL } from "node:url";
import { loadConfig, type Config } from "./config.js";
import { startRun, finishRun, log, renderRun, type RunRecord } from "./runs.js";
import { withIdempotency } from "./idempotency.js";
import { notifyOwner } from "./notify.js";
import { startHealthServer } from "./health.js";

/**
 * Le TRAVAIL MÉTIER de l'automatisation. Générique et sans effet ici.
 * Retourne un résumé humain (nombre d'éléments traités, etc.) journalisé (AU2).
 *
 * TODO: logique métier de l'automatisation — remplacer ce stub par le vrai job
 * (sync périodique, enrichissement, relances, ETL léger, bot…). Toute écriture
 * externe DOIT rester idempotente (elle tourne sous withIdempotency au grain RUN,
 * mais un job qui CRÉE DES ENTITÉS doit AUSSI se protéger au grain ENTITÉ — cf.
 * `src/store.ts` + `migrations/0002_entity_idempotency.example.sql`).
 *
 * ⚠️ RÉGIME 3 (alerte immédiate) : si le job produit quelque chose d'ACTIONNABLE
 * (entité créée, seuil franchi…), notifie ICI, au site du run — n'attends pas un
 * hypothétique rapport périodique :
 *   // if (entitesCreees.length > 0) {
 *   //   await notifyOwner(config, {
 *   //     subject: `${run.name} — ${entitesCreees.length} action(s) requise(s)`,
 *   //     body: renderRun(run), ok: true,
 *   //   });
 *   // }
 */
async function runJob(_config: Config, run: RunRecord): Promise<string> {
  log(run, "Début du travail métier (stub générique).");
  // TODO: logique métier de l'automatisation — appels REST source/cible via fetch,
  //       transformations, écritures idempotentes (grains RUN + ENTITÉ), curseurs…
  const processed = 0;
  log(run, "Travail métier terminé (stub — aucun effet).");
  return `${processed} élément(s) traité(s) (stub).`;
}

/**
 * Dérive la clé d'idempotence de CE déclenchement. Défaut : un run par JOUR (UTC).
 *
 * ⚠️ SUB-QUOTIDIEN (P0-A) : ce bucket JOUR + le défaut `IDEMPOTENCY_WINDOW_SEC`
 * (86400 s) ne conviennent QU'À un job quotidien. Pour une cadence < 24 h (sync
 * toutes les N h — la majorité des automations), bucketise sur la PÉRIODE et passe
 * la fenêtre de cadence au site d'appel, sinon tous les runs après le 1er du jour
 * sont SKIPPÉS EN SILENCE :
 *   // const periodeSec = SYNC_INTERVAL_HOURS * 3600;
 *   // const bucket = Math.floor(Date.now() / 1000 / periodeSec);
 *   // const key = `${jobName}:sync:${bucket}`;
 *   // withIdempotency(config, key, fn, { windowSec: periodeSec });
 */
function idempotencyKeyFor(jobName: string): string {
  const dayBucket = new Date().toISOString().slice(0, 10); // AAAA-MM-JJ
  return `${jobName}:${dayBucket}`;
}

/**
 * PATRON DE DISPATCH MULTI-CADENCE (RUN_MODE) — commenté, à activer par verticale.
 * ────────────────────────────────────────────────────────────────────────────
 * Un worker réel a souvent ≥ 2 cadences (ex. `sync` toutes les N h + `digest`
 * quotidien). L'ordonnanceur passe le mode par env `RUN_MODE` (une entrée cron par
 * mode). Chaque mode a SA fenêtre d'idempotence (P0-A) et SON régime de notif :
 *
 *   type RunMode = "sync" | "digest";
 *   function runMode(env: NodeJS.ProcessEnv = process.env): RunMode {
 *     return env.RUN_MODE === "digest" ? "digest" : "sync"; // défaut : sync
 *   }
 *
 *   // dans main(), après loadConfig() :
 *   switch (runMode()) {
 *     case "sync":   return runSync(config);   // régime 1 (silencieux) + régime 3 (alertes)
 *     case "digest": return runDigest(config); // régime 2 (rapport périodique notifié)
 *   }
 *
 * `runSync` = ce `main()` (succès silencieux journalisé) ; `runDigest` agrège la
 * période et appelle `notifyOwner(ok:true)` UNE fois (le digest EST le succès
 * notifié). Voir `_shared/archetypes/automation.md` (AU4) pour la doctrine.
 */

/** Orchestre un run complet (régime « sync »). Lève en cas d'échec (runner → exit 1). */
export async function main(): Promise<void> {
  // 1. AU1 — config validée (fail-fast si secret manquant / paire incohérente).
  const config = loadConfig();

  // 2. AU3 — healthcheck optionnel (mode long-running seulement).
  if (config.healthcheckPort != null) {
    startHealthServer(config.healthcheckPort);
  }

  const jobName = "automation";

  // 3. AU2 — ouverture de la trace.
  const run = await startRun(config, jobName);

  try {
    // 4. AU5 — exécution protégée contre le double effet.
    const outcome = await withIdempotency(config, idempotencyKeyFor(jobName), () =>
      runJob(config, run),
    );

    if (outcome.skipped) {
      // Doublon dans la fenêtre : run non exécuté. RÉGIME 1 (silencieux) — on
      // JOURNALISE seulement (AU2), on ne NOTIFIE PAS : un tick absorbé est un
      // non-événement pour le propriétaire (le notifier à chaque fois = spam).
      const summary = "Run ignoré (idempotence) : déjà exécuté dans la fenêtre.";
      log(run, summary);
      await finishRun(config, run, "success", summary);
      return;
    }

    // 5. AU2 — clôture en succès, TOUJOURS journalisée (la trace fait foi).
    const summary = outcome.result;
    await finishRun(config, run, "success", summary);

    // 6. AU4 — RÉGIME 1 par défaut : succès nominal SILENCIEUX (journalisé, non
    //    notifié). On ne dérange pas le propriétaire pour un « rien à signaler ».
    //    ▸ Régime 2 (rapport périodique) : géré par un mode dédié (cf. dispatch
    //      RUN_MODE ci-dessus) — PAS ici.
    //    ▸ Régime 3 (alerte immédiate) : déclenché au site du run, dans runJob(),
    //      quand quelque chose d'actionnable survient (cf. TODO de runJob).
  } catch (err) {
    // 7. AU4 — RÉGIME 3 (alerte immédiate) sur ÉCHEC : on notifie TOUJOURS le
    //    propriétaire tout de suite, puis on re-lève pour sortir en code 1.
    const message = err instanceof Error ? err.message : String(err);
    log(run, `ERREUR : ${message}`);
    await finishRun(config, run, "failure", message);
    await notifyOwner(config, {
      subject: `${jobName} — run EN ÉCHEC`,
      body: `Cause : ${message}\n\n${renderRun(run)}`,
      ok: false,
    });
    throw err;
  }
}

// ── Runner : n'exécute main() que si CE fichier est le point d'entrée ────────
// (import.meta.url == argv[1]) → permet d'importer main()/runJob en test sans
// déclencher un run. Succès : le process sort naturellement (0) — ou reste vivant
// si un serveur de health écoute (mode long-running). Échec : exit 1 (après que
// notifyOwner ait terminé, main() étant awaité).
const invokedPath = process.argv[1];
const isEntrypoint =
  invokedPath != null && import.meta.url === pathToFileURL(invokedPath).href;

if (isEntrypoint) {
  main().catch((err: unknown) => {
    // Filet ultime du runner. Deux familles d'erreurs atterrissent ici :
    //   • échec de config (AU1) survenu AVANT l'ouverture du run → main() a re-levé
    //     sans pouvoir tracer/notifier : on imprime le message pour ne pas sortir
    //     en silence (le message zod liste les variables fautives) ;
    //   • échec de run déjà tracé + notifié dans le catch de main(), re-levé pour
    //     imposer le code de sortie.
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[automation] arrêt sur erreur : ${message}`);
    process.exit(1);
  });
}
