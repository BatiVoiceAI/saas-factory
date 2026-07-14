// @ts-check
/**
 * Auto-audit de COUVERTURE ARCHÉTYPE — anti-dérive du plugin (maintenance dev).
 *
 * Audite LE PLUGIN lui-même (pas les runs utilisateur) : vérifie que chaque
 * skill critique du build/après traite bien l'archétype `automation` (et pas
 * seulement `web-saas` par défaut), et que le garde-fou de mesure existe en
 * 12-build. C'est exactement l'asymétrie corrigée aux Chantiers A/B : ce script
 * la transforme en check reproductible, pour qu'elle ne re-dérive pas en silence.
 *
 * Ce qu'il aurait attrapé AVANT le Chantier B : `13-reviews`, `18-metrics`,
 * `19-retro` = 0 occurrence de « automation » → worker headless mal jugé/mesuré.
 * Depuis la demande #2 (ecommerce first-class), le même check vaut pour
 * « ecommerce » : chaque skill critique doit AUSSI le traiter (parité archétype).
 * Le châssis `_shared/blocks/ecommerce/` est encore « à bâtir » → PAS de check
 * châssis ecommerce ici tant qu'il n'existe pas (l'ajouter le ferait échouer à tort).
 *
 * Zéro dépendance (fs + regex). Exit 0 si couverture complète, 1 sinon.
 * Usage : `node scripts/audit-archetype-coverage.mjs` (à lancer à chaque vague, G6).
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (s, c) => (useColor ? `\x1b[${c}m${s}\x1b[0m` : s);
const red = (s) => paint(s, "31");
const green = (s) => paint(s, "32");
const dim = (s) => paint(s, "2");
const bold = (s) => paint(s, "1");

/** Concatène tout le markdown (.md) d'un dossier de skill (SKILL.md + references/). */
function readSkillCorpus(skillDir) {
  const abs = join(ROOT, "skills", skillDir);
  let corpus = "";
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const e of entries) {
      const p = join(dir, e);
      if (statSync(p).isDirectory()) walk(p);
      else if (e.endsWith(".md")) corpus += "\n" + readFileSync(p, "utf8");
    }
  };
  walk(abs);
  return corpus;
}

/**
 * Checks de couverture. Chaque check : un corpus + un motif requis + un libellé.
 * `automation` doit apparaître dans chaque skill critique du build/après ;
 * `capture(` (gate de mesure) doit exister en 12-build.
 */
const CRITICAL_SKILLS = ["12-build", "13-reviews", "14-qa", "18-metrics", "19-retro"];

/** @type {{skill:string, corpus:string}[]} */
const corpora = CRITICAL_SKILLS.map((s) => ({ skill: s, corpus: readSkillCorpus(s) }));

/** @type {{label:string, ok:boolean, detail:string}[]} */
const checks = [];

// 1) Conscience d'archétype `automation` dans chaque skill critique.
for (const { skill, corpus } of corpora) {
  const n = (corpus.match(/automation/gi) || []).length;
  checks.push({
    label: `archétype automation · ${skill}`,
    ok: n > 0,
    detail: n > 0 ? `${n} occurrence(s)` : "AUCUNE mention — skill non archétype-aware (dérive)",
  });
}

// 1bis) Conscience d'archétype `ecommerce` dans chaque skill critique (parité automation,
// demande #2 : ecommerce = archétype de première classe → doit être traité partout aussi).
for (const { skill, corpus } of corpora) {
  const n = (corpus.match(/ecommerce/gi) || []).length;
  checks.push({
    label: `archétype ecommerce · ${skill}`,
    ok: n > 0,
    detail: n > 0 ? `${n} occurrence(s)` : "AUCUNE mention — skill non ecommerce-aware (dérive)",
  });
}

// 2) Garde-fou de mesure (capture au call-site) présent en 12-build.
const build = corpora.find((c) => c.skill === "12-build")?.corpus ?? "";
const hasCaptureGate = /capture\(/.test(build) && /boucle de mesure/i.test(build);
checks.push({
  label: "gate de mesure · 12-build",
  ok: hasCaptureGate,
  detail: hasCaptureGate ? "gate capture() présent" : "gate capture()/« boucle de mesure » absent (régression Chantier A)",
});

// 3) Les deux châssis vivants existent (web-saas + automation).
for (const block of ["web-saas", "automation"]) {
  let exists = false;
  try {
    exists = statSync(join(ROOT, "_shared", "blocks", block)).isDirectory();
  } catch {
    exists = false;
  }
  checks.push({ label: `châssis présent · ${block}`, ok: exists, detail: exists ? "OK" : "châssis manquant" });
}

// --- Rapport ---
console.log(bold("\n═══ Audit de couverture archétype (plugin) ═══\n"));
let failed = 0;
for (const c of checks) {
  const mark = c.ok ? green("✓") : red("✗");
  if (!c.ok) failed++;
  console.log(`  ${mark}  ${c.label.padEnd(34)} ${dim(c.detail)}`);
}
if (failed === 0) {
  console.log(green(bold(`\n✓ Couverture complète — ${checks.length} checks OK.\n`)));
  process.exit(0);
}
console.error(red(bold(`\n✗ ${failed} trou(s) de couverture — un archétype/gate a dérivé. Corrige avant de taguer la vague.\n`)));
process.exit(1);
