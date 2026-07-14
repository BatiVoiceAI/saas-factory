// @ts-check
/**
 * Ajoute une table des matières (`## Sommaire`) en tête de chaque fichier de
 * référence LONG (> 100 lignes) qui n'en a pas — best-practice officielle Claude
 * Code : « For reference files longer than 100 lines, include a table of contents
 * at the top. This ensures Claude can see the full scope even when previewing with
 * partial reads. » Mitige le risque de la lecture partielle (`head -100`) sur les
 * références imbriquées.
 *
 * IDEMPOTENT : saute un fichier qui a déjà un sommaire. Ne touche QUE les `## `
 * (niveau 2), hors blocs de code. Insère la ToC juste avant la 1re section `## `.
 * Zéro dépendance.  Usage : node scripts/add-reference-toc.mjs [--apply]
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const APPLY = process.argv.includes("--apply");
const TOC_RE = /^##\s+(Sommaire|Contenu|Contents|Table des mati|Plan)\b/im;

/** Collecte récursive de .md sous `roots`, hors dossiers gelés/gros. */
function collect(roots) {
  const out = [];
  const SKIP = new Set(["node_modules", ".next", "vendor", ".git", "evals"]);
  const walk = (dir) => {
    let entries;
    try { entries = readdirSync(dir); } catch { return; }
    for (const e of entries) {
      const p = join(dir, e);
      let st; try { st = statSync(p); } catch { continue; }
      if (st.isDirectory()) { if (!SKIP.has(e)) walk(p); }
      else if (e.endsWith(".md")) out.push(p);
    }
  };
  for (const r of roots) walk(join(ROOT, r));
  return out.sort();
}

/** Titres `## ` hors blocs ``` ; renvoie {titles:[], firstIdx} (index de ligne de la 1re section). */
function scan(lines) {
  const titles = [];
  let firstIdx = -1, inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^\s*```/.test(l)) { inFence = !inFence; continue; }
    if (inFence) continue;
    const m = /^##\s+(.+?)\s*$/.exec(l);
    if (m && !/^###/.test(l)) {
      titles.push(m[1].replace(/\s*\{#.*\}\s*$/, "").trim());
      if (firstIdx === -1) firstIdx = i;
    }
  }
  return { titles, firstIdx };
}

const files = collect(["skills", "_shared"]).filter((p) => !p.includes("/blocks/"));
let changed = 0, skipped = 0;
for (const abs of files) {
  const raw = readFileSync(abs, "utf8");
  const lines = raw.split("\n");
  const rel = abs.slice(ROOT.length + 1);
  if (lines.length <= 100) { skipped++; continue; }
  if (TOC_RE.test(raw)) { skipped++; continue; }
  const { titles, firstIdx } = scan(lines);
  if (titles.length < 3 || firstIdx < 1) { skipped++; continue; } // pas assez structuré
  const toc = ["## Sommaire", "", ...titles.map((t) => `- ${t}`), ""];
  const next = [...lines.slice(0, firstIdx), ...toc, ...lines.slice(firstIdx)];
  console.log(`${APPLY ? "✎" : "·"} ${rel}  (${lines.length} l., ${titles.length} sections)`);
  if (APPLY) writeFileSync(abs, next.join("\n"));
  changed++;
}
console.log(`\n${changed} fichier(s) ${APPLY ? "dotés d'une ToC" : "à doter (dry-run)"} · ${skipped} sautés (courts / déjà une ToC / peu structurés).`);
if (!APPLY) console.log("→ relance avec --apply pour écrire.");
