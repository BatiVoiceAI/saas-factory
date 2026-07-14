// @ts-check
/**
 * Gate SECRETS — plancher MACHINE de safety-rails §4 (« aucun secret réel n'est
 * commité »).
 *
 * Le build ne voit PAS une clé en dur : elle compile, tourne, et fuite. Ce
 * script échoue (exit 1, `fichier:ligne`) dès qu'un SECRET en clair apparaît
 * dans le code de rendu/logique (`app/` + `components/` + `lib/`). Il scanne le
 * fichier BRUT (commentaires INCLUS) : une clé oubliée dans un commentaire fuite
 * autant qu'une clé dans le code.
 *
 * Ce qu'il attrape (préfixes de clés réelles) :
 *   - `sk_live_…` / `sk_test_…`  (Stripe secret)
 *   - `re_…`                      (Resend — QUOTÉ uniquement, cf. plus bas)
 *   - `vcp_…`                     (jeton plateforme — QUOTÉ uniquement)
 *   - `ghp_…`                     (GitHub personal access token)
 *   - `AIza…`                     (Google API key)
 *   - `eyJ…`                      (JWT — en-tête base64 `{"…`, ex. service_role)
 *   - `-----BEGIN … PRIVATE KEY-----`
 *   - `SUPABASE_SERVICE_ROLE…= "<littéral>"` (clé service role en dur, hors env)
 *
 * Ce qu'il IGNORE volontairement (zéro faux positif sur le châssis) :
 *   - les références `process.env.X` (légitimes) — elles ne portent AUCUNE valeur
 *     de clé, donc aucun motif ne les matche ;
 *   - `.env` / `.env.example` / `.env.local` — non scannés (extensions de code
 *     uniquement), et de toute façon `.env*` réel est gitignore ;
 *   - les fichiers de TEST (`*.test.*`, `*.spec.*`, `__tests__/`, `fixtures/`)
 *     et le dossier `e2e/` — ils portent LÉGITIMEMENT des `sk_test_…` factices ;
 *   - `re_` / `vcp_` ne matchent QUE collés à un guillemet (littéral de chaîne),
 *     pour ne pas confondre un identifiant anglais (`re_render…`) avec une clé.
 *
 * Motifs EN TÊTE, ajustables. Le secret affiché est TRONQUÉ (jamais ré-imprimé
 * en entier dans les logs CI).
 *
 * Usage : `node scripts/lint-secrets.mjs` (via `npm run lint:secrets`).
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { collectFiles, report, toRel } from "./lint-utils.mjs";

/** Dossiers scannés : rendu + logique + lib (là où vivent env/clients/clés). */
const SCAN_ROOTS = ["app", "components", "lib"];

/**
 * Fichiers de CONFIG racine — endroit typique de fuite (client Sentry, middleware,
 * instrumentation) que les dossiers ci-dessus ne couvrent pas. Scannés s'ils existent.
 */
const ROOT_CONFIG_FILES = [
  "middleware.ts",
  "next.config.ts",
  "instrumentation.ts",
  "sentry.client.config.ts",
  "sentry.server.config.ts",
  "sentry.edge.config.ts",
];

/**
 * Fichiers de test/fixtures : exclus (ils portent des clés FACTICES légitimes).
 * `e2e/` est déjà écarté en amont par `HARD_SKIP_DIRS` (lint-utils.mjs).
 */
const TEST_FILE_RE = /(?:\.(?:test|spec)\.[cm]?[jt]sx?$|(?:^|\/)(?:__tests__|__mocks__|fixtures|__fixtures__)\/)/;

/**
 * Motifs de secrets. `re` DOIT capturer la valeur en groupe 1 (pour la tronquer
 * à l'affichage). `quotedOnly` = le motif n'est pris QUE précédé d'un guillemet
 * (`'` `"` ou backtick) → évite de confondre un identifiant qui commence par le
 * même préfixe avec une vraie clé (pertinent surtout pour `re_` et `vcp_`).
 */
const SECRET_PATTERNS = [
  { rule: "stripe-secret", quotedOnly: false, re: /(sk_live_[A-Za-z0-9]{10,})/g },
  { rule: "stripe-secret", quotedOnly: false, re: /(sk_test_[A-Za-z0-9]{10,})/g },
  { rule: "resend-key", quotedOnly: true, re: /["'`](re_[A-Za-z0-9]{20,})/g },
  { rule: "platform-token", quotedOnly: true, re: /["'`](vcp_[A-Za-z0-9]{10,})/g },
  { rule: "github-pat", quotedOnly: false, re: /(ghp_[A-Za-z0-9]{20,})/g },
  { rule: "google-api-key", quotedOnly: false, re: /(AIza[0-9A-Za-z_-]{30,})/g },
  { rule: "jwt", quotedOnly: false, re: /(eyJ[A-Za-z0-9._-]{30,})/g },
  {
    rule: "private-key",
    quotedOnly: false,
    re: /(-----BEGIN (?:[A-Z]+ )*PRIVATE KEY-----)/g,
  },
  {
    // Clé service role en dur : `SUPABASE_SERVICE_ROLE… = "<valeur>"`. Le
    // guillemet après `=`/`:` prouve un LITTÉRAL (donc PAS `process.env.…`, qui
    // n'a jamais de guillemet à cet endroit). Le châssis fait `z.string()` /
    // `process.env.…` → aucun match.
    rule: "supabase-service-role",
    quotedOnly: false,
    re: /SUPABASE_SERVICE_ROLE[A-Z_]*\s*[:=]\s*["'`]([^"'`\s]{8,})["'`]/g,
  },
];

/** Tronque un secret pour l'affichage (jamais ré-imprimé en entier). */
function redact(secret) {
  const head = secret.slice(0, Math.min(10, secret.length));
  return `${head}…[tronqué]`;
}

/** @type {import("./lint-utils.mjs").Hit[]} */
const hits = [];
const rootConfigFiles = ROOT_CONFIG_FILES.map((f) => resolve(process.cwd(), f)).filter((abs) =>
  existsSync(abs),
);
const files = [...collectFiles(SCAN_ROOTS), ...rootConfigFiles].filter(
  (abs) => !TEST_FILE_RE.test(toRel(abs)),
);

for (const abs of files) {
  const rel = toRel(abs);
  const lines = readFileSync(abs, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const { rule, re } of SECRET_PATTERNS) {
      re.lastIndex = 0;
      for (const m of line.matchAll(re)) {
        hits.push({ rel, line: i + 1, rule, match: redact(m[1]) });
      }
    }
  });
}

report(
  "lint:secrets",
  hits,
  files.length,
  "Zéro secret en dur ; les clés passent TOUJOURS par process.env (cf. lib/env.ts).",
);
