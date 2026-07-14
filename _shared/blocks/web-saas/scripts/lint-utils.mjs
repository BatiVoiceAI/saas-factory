// @ts-check
/**
 * Helpers partagés des gates de copy (`lint-slop`, `lint-sentinelle`).
 *
 * Zéro dépendance externe : uniquement `node:fs` + `node:path` + regex. Ces
 * scripts tournent en CI (job « Copy quality ») AVANT `npm ci` réel — ils ne
 * doivent donc rien importer de `node_modules`.
 *
 * Principe de base des deux gates : on ne veut **AUCUN faux positif sur le
 * châssis propre**. Deux mécanismes garantissent ça ici :
 *   1. `stripComments` — les marqueurs ("placeholder", "sentinelle", "TODO"…)
 *      vivent massivement dans les JSDoc du châssis (commentaires FR denses).
 *      On les neutralise AVANT de matcher : un gate de « copy RENDUE » ne juge
 *      jamais un commentaire. Le remplacement préserve les sauts de ligne pour
 *      que les numéros de ligne restent exacts dans les rapports.
 *   2. `EXAMPLE_EXCLUDES` — les artefacts d'EXEMPLE « clone-me » du bloc `crud`
 *      (entité `items`, shell de démo `app/(app)/`, nav hardcodée) portent
 *      LÉGITIMEMENT « entité exemple », « bloc CRUD », « à cloner » ; ils sont
 *      **retirés au build** (BLOCKS.md `‡`, CONVENTIONS.md §10). On les exclut
 *      du scan : le vrai espace produit (ex. `app/(manager)/`, créé au build)
 *      n'est PAS exclu et reste, lui, sous surveillance.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

/** Racine du châssis (= parent de `scripts/`). */
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Extensions scannées : uniquement le code de rendu (JSX/TSX + logique). */
export const SCAN_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js", ".mjs"];

/**
 * Artefacts d'EXEMPLE « clone-me » du châssis, RETIRÉS au build (BLOCKS.md `‡`,
 * CONVENTIONS.md §10). Chemins relatifs à la racine, comparés en préfixe.
 * NE PAS étendre à la légère : tout ce qui n'est PAS ici est jugé comme du
 * produit réel. Le séparateur est normalisé en `/` avant comparaison.
 */
export const EXAMPLE_EXCLUDES = [
  "app/(app)/", // shell de démo entier (layout + dashboard + entité items)
  "components/items/", // formulaire de l'entité exemple
  "components/nav/app-sidebar.tsx", // nav hardcodée « Éléments »/« Facturation »
  "lib/schemas/item.ts", // schéma de l'entité exemple
];

/** Dossiers jamais scannés (dépendances, build, tests e2e, scripts eux-mêmes). */
const HARD_SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "e2e",
  "scripts",
  "supabase",
]);

/**
 * Parcourt récursivement `roots` (relatifs à la racine) et retourne les chemins
 * absolus des fichiers scannables, hors `EXAMPLE_EXCLUDES` et `HARD_SKIP_DIRS`.
 *
 * @param {string[]} roots - dossiers de départ, ex. `["app", "components"]`.
 * @returns {string[]} chemins absolus, triés.
 */
export function collectFiles(roots) {
  /** @type {string[]} */
  const out = [];

  /** @param {string} absDir */
  function walk(absDir) {
    let entries;
    try {
      entries = readdirSync(absDir);
    } catch {
      return; // dossier absent (bloc optionnel non câblé) : on ignore.
    }
    for (const entry of entries) {
      const abs = join(absDir, entry);
      const rel = toRel(abs);
      if (isExcluded(rel)) continue;

      const st = statSync(abs);
      if (st.isDirectory()) {
        if (HARD_SKIP_DIRS.has(entry)) continue;
        walk(abs);
      } else if (SCAN_EXTENSIONS.some((ext) => entry.endsWith(ext))) {
        out.push(abs);
      }
    }
  }

  for (const root of roots) walk(join(ROOT, root));
  return out.sort();
}

/**
 * Chemin relatif à la racine, séparateurs normalisés en `/` (stable Win/Unix).
 * @param {string} abs
 * @returns {string}
 */
export function toRel(abs) {
  return relative(ROOT, abs).split(sep).join("/");
}

/**
 * `true` si `rel` (chemin normalisé `/`) tombe dans un artefact d'exemple.
 * @param {string} rel
 * @returns {boolean}
 */
export function isExcluded(rel) {
  return EXAMPLE_EXCLUDES.some(
    (ex) => rel === ex || rel.startsWith(ex) || rel === ex.replace(/\/$/, ""),
  );
}

/**
 * Neutralise les commentaires JS/TS/JSX en préservant la structure de lignes
 * (chaque caractère retiré devient une espace ; les `\n` sont conservés) pour
 * que les numéros de ligne des rapports restent exacts.
 *
 * - Commentaires bloc `/* … *\/` : neutralisés, sauts de ligne préservés.
 * - Commentaires ligne `//…` : neutralisés, SAUF quand `//` suit un `:`
 *   (protège `https://…` et autres schémas d'URL).
 *
 * Une neutralisation ne peut que RETIRER du contenu : elle ne crée jamais de
 * faux positif, au pire un faux négatif sur une chaîne exotique (`"a//b"`) —
 * compromis assumé pour un gate dont la priorité est « zéro faux positif ».
 *
 * @param {string} src
 * @returns {string}
 */
export function stripComments(src) {
  const blanked = src.replace(/\/\*[\s\S]*?\*\//g, (m) =>
    m.replace(/[^\n]/g, " "),
  );
  return blanked.replace(/(^|[^:])\/\/[^\n]*/gm, (m, pre) =>
    pre.concat(" ".repeat(m.length - pre.length)),
  );
}

/**
 * Lit un fichier, retire les commentaires, et retourne ses lignes indexées.
 * @param {string} abs
 * @returns {{ rel: string, lines: string[] }}
 */
export function readScanned(abs) {
  const raw = readFileSync(abs, "utf8");
  return { rel: toRel(abs), lines: stripComments(raw).split("\n") };
}

// --- Rendu terminal (best-effort, dégrade proprement hors TTY / en CI) -------

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
/** @param {string} s @param {string} code */
const paint = (s, code) => (useColor ? `[${code}m${s}[0m` : s);
/** @param {string} s */ export const red = (s) => paint(s, "31");
/** @param {string} s */ export const green = (s) => paint(s, "32");
/** @param {string} s */ export const yellow = (s) => paint(s, "33");
/** @param {string} s */ export const dim = (s) => paint(s, "2");
/** @param {string} s */ export const bold = (s) => paint(s, "1");

/**
 * @typedef {Object} Hit
 * @property {string} rel   - fichier (relatif racine).
 * @property {number} line  - numéro de ligne 1-indexé.
 * @property {string} rule  - étiquette de la règle violée.
 * @property {string} match - extrait fautif.
 */

/**
 * Affiche le rapport final et sort avec le bon code (0 = clean, 1 = violations).
 * @param {string} title
 * @param {Hit[]} hits
 * @param {number} scannedCount
 * @param {string} [okHint]
 */
export function report(title, hits, scannedCount, okHint) {
  if (hits.length === 0) {
    console.log(
      green(`✓ ${title} — OK`) +
        dim(` (${scannedCount} fichier(s) scanné(s))`),
    );
    if (okHint) console.log(dim(`  ${okHint}`));
    process.exit(0);
  }

  console.error(red(bold(`✗ ${title} — ${hits.length} violation(s)`)) + "\n");
  for (const h of hits) {
    console.error(
      `  ${yellow(`${h.rel}:${h.line}`)}  ${red(`[${h.rule}]`)}  ${h.match}`,
    );
  }
  console.error(
    "\n" +
      dim(
        `${scannedCount} fichier(s) scanné(s). Corrige les lignes ci-dessus (la copy RENDUE, pas les commentaires).`,
      ),
  );
  process.exit(1);
}
