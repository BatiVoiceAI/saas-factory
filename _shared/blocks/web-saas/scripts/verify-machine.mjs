// @ts-check
/**
 * verify-machine — LA PORTE MACHINE UNIQUE de la QA du châssis.
 *
 * Doctrine (audit reco #1) : trop de portes reposent sur le JUGEMENT d'un LLM qui
 * coche une checklist — un agent peut se convaincre que ça passe. Cette couche
 * MACHINE est le PLANCHER, grep-able et déterministe : elle doit passer AVANT
 * tout jugement d'agent. L'agent juge ensuite ce que la machine ne SAIT pas
 * juger (goût, cohérence métier), jamais l'inverse.
 *
 * Lance en séquence les 5 lints machine (chacun = process natif Node, zéro
 * dépendance externe), laisse défiler leur sortie, puis imprime un RÉSUMÉ
 * PASS/FAIL par lint. Sort 1 si UN SEUL échoue (0 sinon). Sur le châssis propre :
 * sortie 0.
 *
 * NB — `audit:ci` (npm audit) n'est PAS ici : il dépend du réseau/lockfile et ne
 * doit pas rendre la porte machine non-déterministe/offline-fragile. Il tourne à
 * part (script `audit:ci`, step CI non bloquant). Cette porte reste hermétique.
 *
 * Usage : `node scripts/verify-machine.mjs` (via `npm run verify:machine`).
 */

import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { bold, dim, green, red } from "./lint-utils.mjs";

const SCRIPTS_DIR = dirname(fileURLToPath(import.meta.url));

/** Séquence des lints machine (ordre = du plus général au plus ciblé). */
const LINTS = [
  { name: "slop", file: "lint-slop.mjs" },
  { name: "sentinelle", file: "lint-sentinelle.mjs" },
  { name: "secrets", file: "lint-secrets.mjs" },
  { name: "sql", file: "lint-sql.mjs" },
  { name: "i18n", file: "lint-i18n.mjs" },
];

const results = [];

for (const lint of LINTS) {
  console.log(bold(`\n▶ verify:machine — lint:${lint.name}`));
  const res = spawnSync(process.execPath, [join(SCRIPTS_DIR, lint.file)], {
    stdio: "inherit",
    env: process.env,
  });
  // `status` null si le process a été tué par un signal → traité comme échec.
  const ok = res.status === 0;
  results.push({ name: lint.name, ok });
}

// ─── Résumé ──────────────────────────────────────────────────────────────────
console.log(bold("\n═══ verify:machine — résumé ═══"));
for (const r of results) {
  const tag = r.ok ? green("PASS") : red("FAIL");
  console.log(`  ${tag}  lint:${r.name}`);
}

const failed = results.filter((r) => !r.ok);
if (failed.length === 0) {
  console.log(
    green(bold("\n✓ Porte machine OK")) +
      dim(` — ${results.length} lints passés. Le jugement d'agent peut suivre.`),
  );
  process.exit(0);
}

console.error(
  red(bold(`\n✗ Porte machine ÉCHOUÉE`)) +
    dim(` — ${failed.length}/${results.length} lint(s) en échec : `) +
    failed.map((r) => `lint:${r.name}`).join(", "),
);
process.exit(1);
