// @ts-check
/**
 * Gate SENTINELLE — symétrique du garde-fou `lib/brand.ts`.
 *
 * `brand.ts` échoue au build tant que le NOM produit vaut encore la sentinelle
 * châssis. Ce gate fait le pendant sur la COPY RENDUE : il échoue (exit 1) si
 * la surface publique livre encore des restes de dev/exemple OU des restes
 * booking génériques quand le projet n'est PAS booking.
 *
 * Scanne `app/` + `components/` (commentaires neutralisés, artefacts d'exemple
 * `‡` exclus — cf. `lint-utils.mjs`) et cherche :
 *
 *   A. SENTINELLES DE DEV/EXEMPLE (toujours actives) — phrases qui ne doivent
 *      JAMAIS atteindre un utilisateur : « à cloner », « entité exemple »,
 *      « bloc CRUD », « lorem », « placeholder » (hors attribut/variant),
 *      « TODO »/« FIXME », « clone-me »… Ce sont des marqueurs de scaffolding
 *      oublié dans la copy rendue.
 *
 *   B. RESTES BOOKING GÉNÉRIQUES (OPT-IN) — le châssis est livré avec l'exemple
 *      canonique « réservation salon de coiffure » dans `app/page.tsx`
 *      (`SITE_CONTENT`, sentinelle du landing-playbook). Ce vocabulaire est donc
 *      LÉGITIME par défaut : la détection booking est DÉSACTIVÉE tant que
 *      `SENTINELLE_FORBID_BOOKING` n'est pas armé (`1`/`true`/`yes`). Le build
 *      (étape 12/16) l'arme pour un produit NON-booking : tout « rendez-vous »,
 *      « salon », « créneau »… résiduel devient alors une violation. Un produit
 *      booking le laisse désarmé.
 *
 * Le NOM de marque sentinelle (`SaaS Factory Template`) N'EST PAS vérifié ici :
 * c'est le job de `lib/brand.ts` au build (division du travail, zéro doublon,
 * et le châssis propre reste vert).
 *
 * Motifs EN TÊTE, ajustables. 0 faux positif sur le châssis propre.
 *
 * Usage : `node scripts/lint-sentinelle.mjs` (via `npm run lint:sentinelle`).
 */

import { collectFiles, dim, readScanned, report, yellow } from "./lint-utils.mjs";

/** Dossiers scannés (surface de rendu du produit). */
const SCAN_ROOTS = ["app", "components"];

/**
 * A. Sentinelles de dev/exemple — toujours interdites dans la copy rendue.
 * `placeholder` a un traitement spécial (voir `PLACEHOLDER_RE`) pour épargner
 * l'attribut JSX `placeholder="…"` et le variant Tailwind `placeholder:`.
 */
const DEV_SENTINELS = [
  { rule: "dev-lorem", re: /\blorem\b/gi },
  { rule: "dev-clone", re: /à\s+cloner/gi },
  { rule: "dev-clone", re: /clone-me/gi },
  { rule: "dev-example-entity", re: /entités?\s+exemple/gi },
  { rule: "dev-crud", re: /bloc\s+crud/gi },
  { rule: "dev-todo", re: /\b(?:TODO|FIXME)\b/g },
  { rule: "dev-todo", re: /\bà\s+(?:compléter|remplacer)\b/gi },
  { rule: "dev-filler", re: /votre\s+texte\s+ici/gi },
];

/**
 * `placeholder` en tant que MOT rendu (copy oubliée), en excluant tous les
 * usages LÉGITIMES présents dans le châssis :
 * - attribut JSX `placeholder="…"` et variant Tailwind `placeholder:text-…`
 *   → lookahead `(?![=:\w])` ;
 * - attribut `data-placeholder=` → lookbehind exclut `-` (et `=` ci-dessus) ;
 * - composant React `Placeholder` (défini/importé/rendu par le gabarit légal
 *   `app/legal/_components/placeholder.tsx`, qui rend un token `{{ … }}` à
 *   substituer au build) → la règle est CASSE-SENSIBLE minuscule, donc le
 *   symbole PascalCase `Placeholder` (`<Placeholder>`, `export function
 *   Placeholder`, `import { Placeholder }`) n'est JAMAIS pris pour du slop ;
 * - chemins de module (`.../placeholder`) → `/` exclu par le lookbehind + lignes
 *   `import/export … from` ignorées (cf. boucle de scan).
 * Ce qui RESTE capté : le mot « placeholder » minuscule en PROSE rendue (le vrai
 * slop, ex. « texte placeholder à remplacer »).
 */
const PLACEHOLDER_RE = /(?<![<\/{.\-\w])placeholder\b(?![=:\w])/g;

/**
 * B. Restes booking génériques — OPT-IN via `SENTINELLE_FORBID_BOOKING`.
 * Vocabulaire neutre de prise de rendez-vous, à bannir hors projet booking.
 * Ajustable : ajoute ici le vocabulaire propre à ta niche si besoin.
 */
const BOOKING_TERMS = [
  { rule: "booking-leftover", re: /rendez-vous/gi },
  { rule: "booking-leftover", re: /réservations?/gi },
  { rule: "booking-leftover", re: /réserver/gi },
  { rule: "booking-leftover", re: /créneaux?/gi },
  { rule: "booking-leftover", re: /no-?show/gi },
  { rule: "booking-leftover", re: /\bsalons?\b/gi },
  { rule: "booking-leftover", re: /coiffeu(?:r|se|rs|ses)/gi },
  { rule: "booking-leftover", re: /\bbooking\b/gi },
  { rule: "booking-leftover", re: /\bappointments?\b/gi },
];

const FORBID_BOOKING = /^(1|true|yes)$/i.test(
  process.env.SENTINELLE_FORBID_BOOKING ?? "",
);

/** @type {import("./lint-utils.mjs").Hit[]} */
const hits = [];
const files = collectFiles(SCAN_ROOTS);

/** @type {{ rule: string, re: RegExp }[]} */
const activeRules = [
  ...DEV_SENTINELS,
  { rule: "dev-placeholder", re: PLACEHOLDER_RE },
  ...(FORBID_BOOKING ? BOOKING_TERMS : []),
];

/** Lignes de module (`import …` / `export … from …`) : structure de code, pas
 * de la copy rendue. On y ignore la règle `dev-placeholder` (le chemin
 * `.../placeholder` et le symbole importé `Placeholder` n'y sont pas du slop). */
const MODULE_LINE_RE = /^\s*(?:import\b|export\b[^=]*\bfrom\b)/;

for (const abs of files) {
  const { rel, lines } = readScanned(abs);
  lines.forEach((line, i) => {
    const isModuleLine = MODULE_LINE_RE.test(line);
    for (const { rule, re } of activeRules) {
      if (rule === "dev-placeholder" && isModuleLine) continue;
      for (const m of line.matchAll(re)) {
        hits.push({ rel, line: i + 1, rule, match: m[0].trim() });
      }
    }
  });
}

if (!FORBID_BOOKING) {
  console.log(
    dim(
      `  ${yellow("i")} détection booking DÉSACTIVÉE (SENTINELLE_FORBID_BOOKING non armé) — normal pour le châssis / un produit booking.`,
    ),
  );
}

report(
  "lint:sentinelle",
  hits,
  files.length,
  "Zéro copy de dev/exemple ; NOM de marque vérifié séparément par lib/brand.ts.",
);
