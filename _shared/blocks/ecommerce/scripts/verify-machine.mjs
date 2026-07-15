// @ts-check
/**
 * Plancher MACHINE du châssis `ecommerce` — dérivé de `verify:machine` du châssis
 * `automation` (mêmes deux gates UNIVERSELS, RÉUTILISÉS TELS QUELS), enrichi de TROIS
 * lints STRUCTURELS propres aux pièges de l'archétype (statiques, zéro réseau, zéro
 * dépendance — ils tournent AVANT `npm ci`, comme le reste du script).
 *
 * ── 2 gates universels (réutilisés VERBATIM du châssis automation) ────────────
 *   - lint:secrets — aucun SECRET réel en dur dans `src/` (safety-rails §4). Le
 *     châssis porte SUPABASE_SERVICE_ROLE_KEY / STRIPE_SECRET_KEY /
 *     STRIPE_WEBHOOK_SECRET / RESEND_API_KEY : une clé oubliée compile, tourne et
 *     fuite. Scanne le fichier BRUT (commentaires inclus — une clé en commentaire
 *     fuite autant).
 *   - lint:sql — toute fonction plpgsql RETURNS TABLE / SECURITY DEFINER des
 *     migrations porte `#variable_conflict use_column` (lesson #15, bug de classe
 *     42702 invisible au build). Cible directe ici : `fulfill_paid_order` (P1+P2+P3),
 *     RETURNS TABLE + SECURITY DEFINER → sans la directive, elle s'applique puis
 *     plante « column reference is ambiguous » au premier paiement réel.
 *
 * ── 3 lints STRUCTURELS ecommerce (les pièges DURS de l'archétype, portes 13/14) ─
 *   - lint:P1 — une migration porte le DÉCRÉMENT CONDITIONNEL ATOMIQUE du stock
 *     (`stock = stock - … WHERE stock >= …`, ou `CHECK (stock >= 0)`) ET aucun
 *     `src/*.ts` ne fait l'anti-pattern READ-THEN-WRITE (lire le stock brut puis
 *     brancher un écrit en JS — la fenêtre de course qui autorise la survente).
 *   - lint:P2 — `src/pricing.ts` existe et EXPORTE le recalcul serveur
 *     (`computeOrderTotal`), et le panier (`CartItem`) ne porte AUCUN prix : le
 *     montant vient toujours du catalogue serveur, jamais du navigateur.
 *   - lint:P3 — une migration porte l'UNICITÉ sur `orders.stripe_session_id` ET
 *     `src/webhook.ts` vérifie la SIGNATURE et honore de façon IDEMPOTENTE (une
 *     session Stripe = au plus une commande, même sur redelivery at-least-once).
 *
 * Ces trois lints sont des HEURISTIQUES STATIQUES : ils ne prouvent pas P1/P2/P3
 * (c'est le rôle des tests `node:test` sans réseau + du smoke-test RPC contre une
 * vraie base), ils EMPÊCHENT la disparition silencieuse de leur garde-fou.
 *
 * Usage : `node scripts/verify-machine.mjs` (via `npm run verify:machine`).
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

/** Racine du châssis ecommerce (= parent de `scripts/`). */
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

// ═════════════════════════════════════════════════════════════════════════════
// lint:secrets — RÉUTILISÉ VERBATIM du châssis automation
// ═════════════════════════════════════════════════════════════════════════════
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

// ═════════════════════════════════════════════════════════════════════════════
// lint:sql — RÉUTILISÉ VERBATIM du châssis automation
// ═════════════════════════════════════════════════════════════════════════════
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

/** Lit les migrations SQL triées : `[{ rel, sql }]` (vide si le dossier manque). */
function readMigrations() {
  const dir = join(ROOT, "migrations");
  let files = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  } catch {
    files = [];
  }
  return files.map((f) => ({ rel: `migrations/${f}`, sql: readFileSync(join(dir, f), "utf8") }));
}

function lintSql() {
  const migrations = readMigrations();
  const hits = [];
  for (const { rel, sql } of migrations) {
    for (const fn of scanFunctions(sql)) {
      hits.push({ rel, line: fn.line, rule: "sql-variable-conflict", match: fn.name });
    }
  }
  return report(
    "lint:sql",
    hits,
    migrations.length,
    "Toute fonction plpgsql RETURNS TABLE / SECURITY DEFINER porte `#variable_conflict use_column` (lesson #15).",
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Outillage des lints STRUCTURELS ecommerce (statiques, zéro réseau, zéro dépendance)
// ═════════════════════════════════════════════════════════════════════════════

/** Lit un fichier de `src/` (ex. `"pricing.ts"`) ou renvoie `null` s'il manque. */
function readSrc(rel) {
  try {
    return readFileSync(join(ROOT, "src", rel), "utf8");
  } catch {
    return null;
  }
}

/**
 * Retire commentaires (`/* *\/` et `//`) ET contenu des chaînes (`'…'`, `"…"`, `` `…` ``).
 * INDISPENSABLE aux lints P1/P2 : les modules DOCUMENTENT les anti-patterns en clair
 * (`select stock puis if`, `CartItem = { … price … }` en exemple) — les scanner bruts
 * lèverait des faux positifs sur la doctrine. On ne garde que le CODE exécutable.
 * @param {string} src
 * @returns {string}
 */
function stripCommentsAndStrings(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/[^\n]*/g, " ")
    .replace(/`(?:\\[\s\S]|[^`\\])*`/g, "``")
    .replace(/"(?:\\.|[^"\\\n])*"/g, '""')
    .replace(/'(?:\\.|[^'\\\n])*'/g, "''");
}

/** Fichiers `src/*.ts` hors tests (mêmes règles que lint:secrets). */
function srcTsFiles() {
  return collectFiles(["src"]).filter((abs) => !TEST_FILE_RE.test(toRel(abs)));
}

// ═════════════════════════════════════════════════════════════════════════════
// lint:P1 — survente : décrément atomique en SQL + aucun read-then-write en JS
// ═════════════════════════════════════════════════════════════════════════════
function lintP1() {
  const hits = [];
  const migrations = readMigrations();

  // (a) MIGRATION — le décrément conditionnel atomique existe quelque part.
  //     `stock = stock - …` AVEC une garde `stock >= …` (le WHERE conditionnel de la
  //     RPC) OU un `CHECK (stock >= 0)` (la borne DB). L'un OU l'autre suffit à prouver
  //     que l'anti-survente est portée par la BASE, pas par un check applicatif.
  const DEC = /stock\s*=\s*stock\s*-/i;
  const GUARD = /stock\s*>=/i;
  const CHECK = /check\s*\(\s*stock\s*>=\s*0/i;
  const atomic = migrations.some((m) => DEC.test(m.sql) && (GUARD.test(m.sql) || CHECK.test(m.sql)));
  if (!atomic) {
    hits.push({
      rel: "migrations/",
      line: 0,
      rule: "P1-atomic-decrement",
      match:
        "aucune migration ne porte le décrément conditionnel atomique du stock " +
        "(`stock = stock - … WHERE stock >= …`, ou un `CHECK (stock >= 0)`)",
    });
  }

  // (b) SRC — aucun anti-pattern READ-THEN-WRITE : lire le STOCK BRUT sur une ligne
  //     (`.stock`) PUIS BRANCHER dessus en JS (`if (stock >= qty)`) rouvre la fenêtre
  //     de course. Dans l'archétype, le décrément conditionnel vit UNIQUEMENT en SQL
  //     (RPC) et la dispo catalogue passe par le booléen dérivé `in_stock` — jamais un
  //     compte brut lu puis testé côté application.
  const READ_STOCK = /\.stock\b/;
  const BRANCH_STOCK = /\bstock\b\s*(?:>=|<=|>|<|===|==|!==|!=)|(?:>=|<=|>|<)\s*[\w.]*\bstock\b/;
  for (const abs of srcTsFiles()) {
    const code = stripCommentsAndStrings(readFileSync(abs, "utf8"));
    if (READ_STOCK.test(code) && BRANCH_STOCK.test(code)) {
      hits.push({
        rel: toRel(abs),
        line: 1,
        rule: "P1-read-then-write",
        match:
          "lecture du stock brut (`.stock`) + branche JS sur le stock (anti-pattern " +
          "read-then-write) — le décrément atomique doit vivre en SQL (RPC), la dispo via `in_stock`",
      });
    }
  }

  return report(
    "lint:P1",
    hits,
    migrations.length,
    "Décrément stock ATOMIQUE en SQL (RPC fulfill_paid_order) ; jamais un SELECT-puis-INSERT en JS ; dispo via products_public.in_stock.",
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// lint:P2 — intégrité du prix : recalcul serveur + panier sans prix de confiance
// ═════════════════════════════════════════════════════════════════════════════
function lintP2() {
  const hits = [];

  // (a) `src/pricing.ts` existe et EXPORTE la fonction de recalcul serveur.
  const pricing = readSrc("pricing.ts");
  if (pricing == null) {
    hits.push({
      rel: "src/pricing.ts",
      line: 0,
      rule: "P2-pricing-missing",
      match: "src/pricing.ts absent — le recalcul serveur du prix (computeOrderTotal) est requis",
    });
  } else if (!/export\s+(?:async\s+)?function\s+computeOrderTotal\b/.test(pricing)) {
    hits.push({
      rel: "src/pricing.ts",
      line: 1,
      rule: "P2-recompute-missing",
      match: "computeOrderTotal non exporté — le total doit être RECALCULÉ serveur depuis le catalogue",
    });
  }

  // (b) Le PANIER (structure contrôlée par le client) ne porte AUCUN prix : `CartItem`
  //     = { productId, qty } et rien d'autre. Un champ prix dans le panier = un total
  //     client susceptible de faire foi → P2 cassé. On inspecte le BLOC de type, code
  //     seul (commentaires/doctrine retirés).
  const cartSurface = stripCommentsAndStrings((readSrc("types.ts") ?? "") + "\n" + (readSrc("cart.ts") ?? ""));
  const block = /CartItem\s*=\s*\{([\s\S]*?)\}/.exec(cartSurface);
  if (block && block[1] && /\b(?:price|priceCents|unitPrice|unitPriceCents|amount|amountCents|total|totalCents)\b/i.test(block[1])) {
    hits.push({
      rel: "src/types.ts",
      line: 1,
      rule: "P2-cart-trusts-price",
      match:
        "le type CartItem porte un prix — le panier ne transmet QUE (productId, qty) ; " +
        "le montant est recalculé serveur (P2)",
    });
  }

  return report(
    "lint:P2",
    hits,
    2,
    "src/pricing.ts recalcule le total serveur (computeOrderTotal) ; le panier (CartItem) ne porte aucun prix de confiance.",
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// lint:P3 — idempotence du webhook : unique(stripe_session_id) + signature + upsert
// ═════════════════════════════════════════════════════════════════════════════
function lintP3() {
  const hits = [];
  const migrations = readMigrations();

  // (a) MIGRATION — unicité sur `orders.stripe_session_id` (une session = au plus une
  //     commande, ce qui rend l'`on conflict do nothing` de la RPC idempotent).
  const UNIQ = /unique[\s\S]{0,160}stripe_session_id|stripe_session_id[\s\S]{0,160}\bunique\b/i;
  if (!migrations.some((m) => UNIQ.test(m.sql))) {
    hits.push({
      rel: "migrations/",
      line: 0,
      rule: "P3-unique-session",
      match: "aucune contrainte UNIQUE sur orders.stripe_session_id (idempotence du webhook)",
    });
  }

  // (b) SRC — `webhook.ts` VÉRIFIE la signature (avant tout accès DB) ET honore de
  //     façon IDEMPOTENTE (RPC fulfill_paid_order / on conflict do nothing / alreadyProcessed).
  const webhook = readSrc("webhook.ts");
  if (webhook == null) {
    hits.push({
      rel: "src/webhook.ts",
      line: 0,
      rule: "P3-webhook-missing",
      match: "src/webhook.ts absent — vérification de signature + upsert idempotent requis",
    });
  } else {
    if (!/verifySignature|verifyStripeSignature/.test(webhook) && !/\bsignature\b/i.test(webhook)) {
      hits.push({
        rel: "src/webhook.ts",
        line: 1,
        rule: "P3-signature",
        match: "webhook.ts ne vérifie pas la signature Stripe (verifySignature / signature)",
      });
    }
    if (!/fulfill_paid_order|fulfillPaidOrder|upsertOrder|already_processed|alreadyProcessed|on\s+conflict|idempoten|duplicate/i.test(webhook)) {
      hits.push({
        rel: "src/webhook.ts",
        line: 1,
        rule: "P3-idempotent-upsert",
        match:
          "webhook.ts ne fait pas d'upsert idempotent " +
          "(RPC fulfill_paid_order / on conflict do nothing / alreadyProcessed)",
      });
    }
  }

  return report(
    "lint:P3",
    hits,
    migrations.length,
    "UNIQUE(orders.stripe_session_id) + webhook.ts vérifie la signature AVANT la DB et honore de façon idempotente.",
  );
}

// --- Runner ------------------------------------------------------------------
const results = [
  ["lint:secrets", lintSecrets()],
  ["lint:sql", lintSql()],
  ["lint:P1", lintP1()],
  ["lint:P2", lintP2()],
  ["lint:P3", lintP3()],
];
console.log(`\n${bold("═══ verify:machine — résumé ═══")}`);
for (const [name, ok] of results) console.log(`  ${ok ? green("PASS") : red("FAIL")}  ${name}`);
const allOk = results.every(([, ok]) => ok);
if (allOk) {
  console.log(
    green("\n✓ Porte machine OK — 5 lints passés (2 universels + 3 pièges P1/P2/P3). Le jugement d'agent peut suivre.\n"),
  );
  process.exit(0);
}
console.error(red("\n✗ Porte machine ROUGE — corrige avant tout jugement d'agent.\n"));
process.exit(1);
