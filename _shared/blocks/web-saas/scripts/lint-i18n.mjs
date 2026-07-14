// @ts-check
/**
 * Gate I18N — plancher MACHINE de CONVENTIONS.md §12 (« le produit se génère
 * dans la langue `locale` »).
 *
 * Le châssis est livré FR mais i18n-ready : quand le build cible une AUTRE langue
 * (`PRODUCT_LOCALE` ≠ fr-* ou surcharge `NEXT_PUBLIC_LOCALE`), plus aucune copy
 * FR ne doit subsister dans la surface rendue. Ce script échoue (exit 1) s'il
 * reste des LEFTOVERS FR à haute signature dans `app/` + `components/` ALORS QUE
 * le marqueur de locale est NON-FR. Sur le châssis (défaut `fr-FR`) → NO-OP : il
 * ne crie jamais (c'est la langue attendue).
 *
 * Résolution de la locale (ordre de priorité, comme lib/i18n.ts) :
 *   1. env `NEXT_PUBLIC_LOCALE` (surcharge de prévisualisation),
 *   2. `NEXT_PUBLIC_LOCALE=` dans `.env.local` / `.env`,
 *   3. `PRODUCT_LOCALE` dans `lib/brand.ts` (écrivain unique, étape 12),
 *   4. défaut `fr-FR`.
 * Sous-tag `fr` (ou indéterminé) ⇒ NO-OP.
 *
 * HEURISTIQUE — VOLONTAIREMENT CONSERVATRICE (« mieux vaut rater que crier
 * faux ») : on NE fait PAS de détection d'accents génériques. Raison : un produit
 * NON-FR peut être ES/PT/DE/IT… qui portent LÉGITIMEMENT é/á/ç/ü/è. Un scan
 * d'accents crierait faux sur eux. On se limite donc à une LISTE BLANCHE de
 * phrases distinctement françaises (mentions légales, UI cœur) — surtout des
 * multi-mots sans ambiguïté inter-langues. Commentaires neutralisés (readScanned)
 * ⇒ la JSDoc FR dense du châssis n'entre jamais en compte.
 *
 * LIMITE assumée : un leftover FR hors liste (ex. un mot isolé accentué) passe.
 * C'est le prix du zéro-faux-positif. Le jugement d'agent couvre le reste ; cette
 * porte MACHINE n'attrape que le certain. Étendre `FR_MARKERS` avec prudence.
 *
 * Usage : `node scripts/lint-i18n.mjs` (via `npm run lint:i18n`).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ROOT,
  collectFiles,
  dim,
  green,
  readScanned,
  report,
  yellow,
} from "./lint-utils.mjs";

/** Dossiers scannés (surface de rendu du produit). */
const SCAN_ROOTS = ["app", "components"];

/**
 * Leftovers FR à haute signature — liste blanche conservatrice. Multi-mots
 * d'abord (aucune ambiguïté inter-langues) ; quelques mots UI distinctement FR.
 * Insensible à la casse et à la variante d'apostrophe (`'` droite / `’` courbe).
 */
const FR_MARKERS = [
  "mentions légales",
  "politique de confidentialité",
  "conditions générales",
  "conditions d'utilisation",
  "mot de passe",
  "s'inscrire",
  "se connecter",
  "se déconnecter",
  "mot de passe oublié",
  "tableau de bord",
  "veuillez réessayer",
];

/** Compile un marqueur en regex tolérante aux apostrophes et aux espaces. */
function markerToRe(marker) {
  const escaped = marker
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/['’]/g, "['’]") // apostrophe droite OU courbe
    .replace(/\s+/g, "\\s+"); // espace(s) souple(s)
  return new RegExp(escaped, "gi");
}
const MARKER_RES = FR_MARKERS.map((m) => ({ marker: m, re: markerToRe(m) }));

/** Lit une valeur `KEY=value` dans un fichier `.env*` (ou "" si absent). */
function readEnvValue(file, key) {
  const abs = join(ROOT, file);
  if (!existsSync(abs)) return "";
  const m = readFileSync(abs, "utf8").match(
    new RegExp(`^\\s*${key}\\s*=\\s*(.*)\\s*$`, "m"),
  );
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
}

/** Résout la locale du produit selon l'ordre de priorité documenté. */
function resolveLocale() {
  const fromEnv = process.env.NEXT_PUBLIC_LOCALE?.trim();
  if (fromEnv) return fromEnv;
  for (const f of [".env.local", ".env"]) {
    const v = readEnvValue(f, "NEXT_PUBLIC_LOCALE");
    if (v) return v;
  }
  const brand = join(ROOT, "lib", "brand.ts");
  if (existsSync(brand)) {
    const m = readFileSync(brand, "utf8").match(
      /PRODUCT_LOCALE\s*=\s*["']([^"']+)["']/,
    );
    if (m && m[1].trim()) return m[1].trim();
  }
  return "fr-FR";
}

const locale = resolveLocale();
const language = locale.toLowerCase().split(/[-_]/)[0] || "fr";

// NO-OP sur le châssis (fr) ou locale indéterminée : la copy FR est ATTENDUE.
if (language === "fr") {
  console.log(
    green("✓ lint:i18n — OK") +
      dim(` (produit FR : locale=${locale} — détection FR désactivée, normal)`),
  );
  process.exit(0);
}

/** @type {import("./lint-utils.mjs").Hit[]} */
const hits = [];
const files = collectFiles(SCAN_ROOTS);

for (const abs of files) {
  const { rel, lines } = readScanned(abs);
  lines.forEach((line, i) => {
    for (const { marker, re } of MARKER_RES) {
      re.lastIndex = 0;
      if (re.test(line)) {
        hits.push({ rel, line: i + 1, rule: "i18n-fr-leftover", match: marker });
      }
    }
  });
}

console.log(
  dim(
    `  ${yellow("i")} produit NON-FR (locale=${locale}) — recherche de leftovers FR (liste blanche conservatrice).`,
  ),
);

report(
  "lint:i18n",
  hits,
  files.length,
  `Zéro copy FR résiduelle quand le produit cible ${locale} (traduire dans lib/i18n.ts + pages).`,
);
