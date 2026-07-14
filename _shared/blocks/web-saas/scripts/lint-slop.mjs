// @ts-check
/**
 * Gate ANTI-SLOP — backstop MACHINE de la doctrine design (`design-doctrine.md`).
 *
 * La doctrine INTERDIT en prose les marqueurs classiques d'« AI slop » ; ce
 * script les interdit en CODE. Il scanne `app/` + `components/` et ÉCHOUE
 * (exit 1) en affichant `fichier:ligne` s'il trouve :
 *
 *   1. Palette slop — classes Tailwind `indigo/violet/purple/fuchsia-<n>`
 *      (le dégradé violet générique des maquettes IA). La classe est détectée
 *      quel que soit son préfixe (`bg-`, `from-`, `to-`, `text-`, `via-`…),
 *      donc `from-purple-500` comme `bg-indigo-600` tombent.
 *   2. Couleurs HEX en dur dans le JSX/TSX — la couleur DOIT passer par les
 *      tokens (`app/globals.css`) consommés via classes sémantiques
 *      (`bg-primary`…). Les `#rrggbb` en dur (y compris arbitraires Tailwind
 *      `bg-[#1a1a1a]` ou inline `style={{ color: "#fff" }}`) sont du slop.
 *      `globals.css`/`tailwind.config` ne sont pas scannés (extensions).
 *   3. Buzzwords génériques — vocabulaire marketing creux que le
 *      `landing-playbook.md` bannit (« seamless », « supercharge »…).
 *
 * Les listes de motifs sont EN TÊTE et AJUSTABLES. Calibrées pour 0 faux
 * positif sur le châssis propre (commentaires neutralisés, artefacts d'exemple
 * `‡` exclus — cf. `lint-utils.mjs`).
 *
 * Usage : `node scripts/lint-slop.mjs` (via `npm run lint:slop`).
 */

import { collectFiles, readScanned, report } from "./lint-utils.mjs";

/** Dossiers scannés (surface de rendu du produit). */
const SCAN_ROOTS = ["app", "components"];

/**
 * Palette slop : familles de couleur Tailwind proscrites. On matche
 * `<famille>-<chiffre>` (échelle 50→950) quel que soit le préfixe utilitaire.
 * Ajuste ici si une marque légitime adopte l'une de ces familles (rare).
 */
const SLOP_COLOR_FAMILIES = ["indigo", "violet", "purple", "fuchsia"];
const SLOP_COLOR_RE = new RegExp(
  `\\b(?:${SLOP_COLOR_FAMILIES.join("|")})-(?:50|100|200|300|400|500|600|700|800|900|950)\\b`,
  "g",
);

/**
 * HEX en dur. On capture le groupe hex pour ne retenir que les longueurs de
 * VRAIE couleur (3/4/6/8), ce qui écarte les faux positifs de longueur 5/7 et
 * les fragments non-couleur. Les valeurs d'ancre (`href="#faq"`) sont retirées
 * de la ligne AVANT le match (cf. `stripAnchors`), sinon une ancre tout-hex
 * comme `#cafe` mordrait à tort.
 */
const HEX_RE = /#([0-9a-fA-F]+)\b/g;
const VALID_HEX_LEN = new Set([3, 4, 6, 8]);

/**
 * Unique exception LÉGITIME au HEX en dur : `app/global-error.tsx`. Le global
 * error boundary REMPLACE le layout racine quand `app/layout.tsx` lui-même
 * plante → `globals.css`/Tailwind ne sont PAS garantis chargés, on doit donc
 * styler en INLINE (hex) pour rester présentable en toutes circonstances (cf.
 * la JSDoc du fichier). Les règles slop-color et buzzword continuent, elles, de
 * s'y appliquer. Ajoute ici tout futur cas d'inline-style hors-tokens sanctionné.
 */
const HEX_ALLOWLIST = new Set(["app/global-error.tsx"]);

/** Retire les valeurs d'ancre/URL d'une ligne pour ne pas confondre `#slug` et couleur. */
function stripAnchors(line) {
  // `href="#..."`, `href='#...'`, `href={"#..."}`, `to="#..."`…
  return line
    .replace(/\b(?:href|to|hash|anchor)\s*=\s*(["'`{])[^"'`}]*\1?/g, " ")
    .replace(/\b(?:href|to|hash|anchor)\s*:\s*["'`][^"'`]*["'`]/g, " ");
}

/**
 * Buzzwords marketing creux (insensible à la casse). Le châssis est livré en FR ;
 * ces marqueurs EN sont surtout un garde-fou pour la copy générée. Ajustable.
 */
const BUZZWORDS = [
  "seamless",
  "seamlessly",
  "cutting-edge",
  "cutting edge",
  "bleeding-edge",
  "state-of-the-art",
  "revolutioni", // revolutionize / revolutionary / révolutionn…
  "supercharge",
  "supercharged",
  "unlock", // "unlock your potential"
  "elevate your",
  "next-gen",
  "next generation",
  "game-chang", // game-changer / game-changing
  "world-class",
  "best-in-class",
  "effortless",
  "unleash",
  "turbocharge",
  "to the next level",
  "one-stop shop",
  "empower your",
];
const BUZZWORD_RE = new RegExp(
  "(" +
    BUZZWORDS.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") +
    ")",
  "gi",
);

/** @type {import("./lint-utils.mjs").Hit[]} */
const hits = [];
const files = collectFiles(SCAN_ROOTS);

for (const abs of files) {
  const { rel, lines } = readScanned(abs);
  lines.forEach((line, i) => {
    const lineNo = i + 1;

    for (const m of line.matchAll(SLOP_COLOR_RE)) {
      hits.push({ rel, line: lineNo, rule: "slop-color", match: m[0] });
    }

    if (!HEX_ALLOWLIST.has(rel)) {
      const noAnchors = stripAnchors(line);
      for (const m of noAnchors.matchAll(HEX_RE)) {
        if (VALID_HEX_LEN.has(m[1].length)) {
          hits.push({ rel, line: lineNo, rule: "hardcoded-hex", match: m[0] });
        }
      }
    }

    for (const m of line.matchAll(BUZZWORD_RE)) {
      hits.push({ rel, line: lineNo, rule: "buzzword", match: m[0].trim() });
    }
  });
}

report(
  "lint:slop",
  hits,
  files.length,
  "Couleurs via tokens (globals.css) uniquement ; zéro dégradé violet, zéro buzzword.",
);
