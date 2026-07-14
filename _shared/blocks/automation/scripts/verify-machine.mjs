// @ts-check
/**
 * Plancher MACHINE du châssis `automation` — l'équivalent de `verify:machine`
 * de web-saas, adapté au headless (pas d'UI → pas de lint slop/sentinelle/i18n ;
 * ne restent que les deux gates UNIVERSELLEMENT pertinents, ceux qui protègent
 * un worker qui manipule des secrets et du SQL) :
 *
 *   - lint:secrets — aucun SECRET réel en dur dans `src/` (safety-rails §4). Le
 *     worker porte SUPABASE_SERVICE_ROLE_KEY / RESEND_API_KEY / WEBHOOK_URL : une
 *     clé oubliée compile, tourne et fuite. Scanne le fichier BRUT (commentaires
 *     inclus — une clé en commentaire fuite autant).
 *   - lint:sql — toute fonction plpgsql RETURNS TABLE / SECURITY DEFINER des
 *     migrations porte `#variable_conflict use_column` (lesson #15, bug de classe
 *     42702 invisible au build : une migration ne compile pas, elle s'applique).
 *
 * Auto-contenu (zéro dépendance externe, zéro import du châssis web-saas) : ce
 * script tourne AVANT tout jugement d'agent (`skills/12-build/references/
 * integration-pass.md` §Porte MACHINE), y compris avant `npm ci`.
 *
 * Usage : `node scripts/verify-machine.mjs` (via `npm run verify:machine`).
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

/** Racine du châssis automation (= parent de `scripts/`). */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// --- Rendu terminal (best-effort, dégrade hors TTY / en CI) ------------------
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (s, code) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);
const red = (s) => paint(s, "31");
const green = (s) => paint(s, "32");
const yellow = (s) => paint(s, "33");
const dim = (s) => paint(s, "2");
const bold = (s) => paint(s, "1");

/** @param {string} abs @returns {string} chemin relatif racine, séparateurs `/`. */
const toRel = (abs) => relative(ROOT, abs).split(sep).join("/");

/**
 * Rapporte un gate : liste les hits, retourne true si clean.
 * @param {string} title
 * @param {{rel:string,line:number,rule:string,match:string}[]} hits
 * @param {number} scanned
 * @param {string} okHint
 * @returns {boolean}
 */
function report(title, hits, scanned, okHint) {
  console.log(`\n${bold(`▶ verify:machine — ${title}`)}`);
  if (hits.length === 0) {
    console.log(green(`✓ ${title} — OK`) + dim(` (${scanned} fichier(s) scanné(s))`));
    console.log(dim(`  ${okHint}`));
    return true;
  }
  console.error(red(bold(`✗ ${title} — ${hits.length} violation(s)`)) + "\n");
  for (const h of hits) {
    console.error(`  ${yellow(`${h.rel}:${h.line}`)}  ${red(`[${h.rule}]`)}  ${h.match}`);
  }
  return false;
}

// --- lint:secrets ------------------------------------------------------------
const SECRET_PATTERNS = [
  { rule: "stripe-secret", re: /(sk_live_[A-Za-z0-9]{10,})/g },
  { rule: "stripe-secret", re: /(sk_test_[A-Za-z0-9]{10,})/g },
  { rule: "resend-key", re: /["'`](re_[A-Za-z0-9]{20,})/g },
  { rule: "github-pat", re: /(ghp_[A-Za-z0-9]{20,})/g },
  { rule: "google-api-key", re: /(AIza[0-9A-Za-z_-]{30,})/g },
  { rule: "jwt", re: /(eyJ[A-Za-z0-9._-]{30,})/g },
  { rule: "private-key", re: /(-----BEGIN (?:[A-Z]+ )*PRIVATE KEY-----)/g },
  {
    rule: "supabase-service-role",
    re: /SUPABASE_SERVICE_ROLE[A-Z_]*\s*[:=]\s*["'`]([^"'`\s]{8,})["'`]/g,
  },
];
const TEST_FILE_RE = /(?:\.(?:test|spec)\.[cm]?[jt]sx?$|(?:^|\/)(?:__tests__|__mocks__|fixtures|test)\/)/;

/** @param {string} secret */
const redact = (secret) => `${secret.slice(0, Math.min(10, secret.length))}…[tronqué]`;

/** Collecte récursive des fichiers `.ts`/`.mjs`/`.js` sous `roots` (hors node_modules/dist/test). */
function collectFiles(roots) {
  const out = [];
  const SKIP = new Set(["node_modules", "dist", ".git", "test", "scripts"]);
  const walk = (absDir) => {
    let entries;
    try {
      entries = readdirSync(absDir);
    } catch {
      return;
    }
    for (const entry of entries) {
      const abs = join(absDir, entry);
      if (statSync(abs).isDirectory()) {
        if (!SKIP.has(entry)) walk(abs);
      } else if (/\.(?:ts|mjs|js)$/.test(entry)) {
        out.push(abs);
      }
    }
  };
  for (const root of roots) walk(join(ROOT, root));
  return out.sort();
}

function lintSecrets() {
  const files = collectFiles(["src"]).filter((abs) => !TEST_FILE_RE.test(toRel(abs)));
  const hits = [];
  for (const abs of files) {
    const rel = toRel(abs);
    readFileSync(abs, "utf8")
      .split("\n")
      .forEach((line, i) => {
        for (const { rule, re } of SECRET_PATTERNS) {
          re.lastIndex = 0;
          for (const m of line.matchAll(re)) {
            hits.push({ rel, line: i + 1, rule, match: redact(m[1]) });
          }
        }
      });
  }
  return report(
    "lint:secrets",
    hits,
    files.length,
    "Zéro secret en dur ; les clés passent TOUJOURS par process.env (cf. src/config.ts).",
  );
}

// --- lint:sql ----------------------------------------------------------------
const stripSqlComments = (sql) => sql.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/--[^\n]*/g, " ");
const lineOf = (src, idx) => {
  let n = 1;
  for (let i = 0; i < idx && i < src.length; i++) if (src[i] === "\n") n++;
  return n;
};

/** @param {string} src @returns {{name:string,line:number}[]} */
function scanFunctions(src) {
  const out = [];
  const headerRe = /create\s+(?:or\s+replace\s+)?function\s+([A-Za-z0-9_."]+)\s*\(/gi;
  const dollarRe = /\$([A-Za-z0-9_]*)\$/g;
  for (const h of src.matchAll(headerRe)) {
    const name = h[1];
    const start = h.index ?? 0;
    dollarRe.lastIndex = start;
    const open = dollarRe.exec(src);
    if (!open) continue;
    const openTag = open[0];
    const bodyStart = open.index + openTag.length;
    const closeIdx = src.indexOf(openTag, bodyStart);
    if (closeIdx === -1) continue;
    const signature = stripSqlComments(src.slice(start, open.index)).toLowerCase();
    const body = stripSqlComments(src.slice(bodyStart, closeIdx));
    const isPlpgsql = /\blanguage\s+plpgsql\b/.test(signature);
    const returnsTrigger = /\breturns\s+trigger\b/.test(signature);
    const returnsTable = /\breturns\s+table\b/.test(signature);
    const securityDefiner = /\bsecurity\s+definer\b/.test(signature);
    const hasPragma = /#variable_conflict\s+use_column/i.test(body);
    if (isPlpgsql && !returnsTrigger && (returnsTable || securityDefiner) && !hasPragma) {
      const kind = returnsTable ? "RETURNS TABLE" : "SECURITY DEFINER";
      out.push({
        name: `${name}() [${kind} plpgsql sans #variable_conflict use_column]`,
        line: lineOf(src, start),
      });
    }
  }
  return out;
}

function lintSql() {
  const MIGRATIONS_REL = "migrations";
  const dir = join(ROOT, "migrations");
  let files = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  } catch {
    files = [];
  }
  const hits = [];
  for (const file of files) {
    const src = readFileSync(join(dir, file), "utf8");
    for (const fn of scanFunctions(src)) {
      hits.push({ rel: `${MIGRATIONS_REL}/${file}`, line: fn.line, rule: "sql-variable-conflict", match: fn.name });
    }
  }
  return report(
    "lint:sql",
    hits,
    files.length,
    "Toute fonction plpgsql RETURNS TABLE / SECURITY DEFINER porte `#variable_conflict use_column` (lesson #15).",
  );
}

// --- Runner ------------------------------------------------------------------
const results = [
  ["lint:secrets", lintSecrets()],
  ["lint:sql", lintSql()],
];
console.log(`\n${bold("═══ verify:machine — résumé ═══")}`);
for (const [name, ok] of results) console.log(`  ${ok ? green("PASS") : red("FAIL")}  ${name}`);
const allOk = results.every(([, ok]) => ok);
if (allOk) {
  console.log(green("\n✓ Porte machine OK — 2 lints passés (headless). Le jugement d'agent peut suivre.\n"));
  process.exit(0);
}
console.error(red("\n✗ Porte machine ROUGE — corrige avant tout jugement d'agent.\n"));
process.exit(1);
