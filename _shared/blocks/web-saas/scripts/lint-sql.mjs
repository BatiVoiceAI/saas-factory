// @ts-check
/**
 * Gate SQL — plancher MACHINE de la lesson #15 (bug de CLASSE 42702,
 * « column reference … is ambiguous »).
 *
 * Le bug, invisible au build (une migration ne compile pas — elle s'applique) :
 * une fonction `plpgsql` dont les colonnes de sortie / variables portent le même
 * nom qu'une colonne d'une table interrogée dans le corps déclenche 42702 à
 * l'EXÉCUTION. La parade canonique (cf. en-tête de `0006_org_tenancy.sql`) est la
 * directive `#variable_conflict use_column` en tête de corps. Ce script échoue
 * (exit 1) si une fonction VULNÉRABLE l'omet, en affichant `fichier + fonction`.
 *
 * DÉFINITION de « vulnérable » — calibrée pour 0 faux positif sur les migrations
 * actuelles (0001→0006 + toute migration `automation`) :
 *   fonction `language plpgsql`
 *   ET NON `returns trigger`            (un trigger renvoie NEW/OLD — pas de
 *                                        colonnes de sortie nommées, hors classe)
 *   ET (`returns table (…)`  OU  `security definer`)   (surface exposée au 42702)
 *   ET SANS `#variable_conflict use_column` dans le corps.
 *
 * Pourquoi ce périmètre EXACT (vérifié sur le châssis) :
 *   - triggers `set_updated_at` / `handle_new_user` / `*_set_updated_at` /
 *     `org_tenancy_add_owner_membership` → `returns trigger` ⇒ ÉCARTÉS (sinon
 *     faux positifs : ils n'ont légitimement pas la directive… ou l'ont par
 *     prudence, on ne l'exige pas) ;
 *   - `current_user_role` → `language sql` (pas plpgsql) ⇒ ÉCARTÉ (la directive
 *     est une syntaxe plpgsql, inapplicable) ;
 *   - `current_org_ids` / `is_org_member` / `is_org_admin` → plpgsql + security
 *     definer + NON-trigger ⇒ DANS le périmètre, et portent déjà la directive
 *     ⇒ PASSENT. Une future fonction de ce profil qui l'oublie ÉCHOUE. ✓
 *
 * LIMITE assumée (conservateur) : une fonction plpgsql NON-security-definer et
 * SANS `returns table` (ex. simple `returns boolean` lisant une table avec
 * collision de noms) n'est PAS couverte. C'est le profil rare ; on préfère RATER
 * que CRIER FAUX. La lesson #15 vise précisément les helpers exposés ci-dessus.
 *
 * Zéro dépendance externe (fs + regex). Usage : `node scripts/lint-sql.mjs`
 * (via `npm run lint:sql`).
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, report } from "./lint-utils.mjs";

/** Répertoire des migrations Supabase (relatif racine, pour l'affichage). */
const MIGRATIONS_REL = "supabase/migrations";
const MIGRATIONS_DIR = join(ROOT, "supabase", "migrations");

/** Retire commentaires SQL (`-- …` et `/* … *\/`) d'un fragment, pour les tests. */
function stripSqlComments(sql) {
  return sql.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/--[^\n]*/g, " ");
}

/** Numéro de ligne (1-indexé) de l'index `idx` dans `src`. */
function lineOf(src, idx) {
  let n = 1;
  for (let i = 0; i < idx && i < src.length; i++) if (src[i] === "\n") n++;
  return n;
}

/**
 * Découpe le fichier en fonctions et retourne les vulnérables.
 * @param {string} src
 * @returns {{ name: string, line: number }[]}
 */
function scanFunctions(src) {
  const out = [];
  // En-tête de fonction : `create [or replace] function <nom>(`.
  const headerRe = /create\s+(?:or\s+replace\s+)?function\s+([A-Za-z0-9_."]+)\s*\(/gi;
  // Ouverture de corps dollar-quoté : `$$` ou `$tag$`.
  const dollarRe = /\$([A-Za-z0-9_]*)\$/g;

  for (const h of src.matchAll(headerRe)) {
    const name = h[1];
    const start = h.index ?? 0;

    // Localise l'ouverture du corps dollar-quoté après l'en-tête.
    dollarRe.lastIndex = start;
    const open = dollarRe.exec(src);
    if (!open) continue; // pas de corps analysable → on ignore (conservateur).

    const openTag = open[0]; // ex. `$$` ou `$function$`
    const bodyStart = open.index + openTag.length;
    const closeIdx = src.indexOf(openTag, bodyStart);
    if (closeIdx === -1) continue; // corps non refermé → on ignore.

    const signature = stripSqlComments(src.slice(start, open.index)).toLowerCase();
    const body = stripSqlComments(src.slice(bodyStart, closeIdx));

    const isPlpgsql = /\blanguage\s+plpgsql\b/.test(signature);
    const returnsTrigger = /\breturns\s+trigger\b/.test(signature);
    const returnsTable = /\breturns\s+table\b/.test(signature);
    const securityDefiner = /\bsecurity\s+definer\b/.test(signature);
    const hasPragma = /#variable_conflict\s+use_column/i.test(body);

    const vulnerable =
      isPlpgsql &&
      !returnsTrigger &&
      (returnsTable || securityDefiner) &&
      !hasPragma;

    if (vulnerable) {
      const kind = returnsTable ? "RETURNS TABLE" : "SECURITY DEFINER";
      out.push({
        name: `${name}() [${kind} plpgsql sans #variable_conflict use_column]`,
        line: lineOf(src, start),
      });
    }
  }
  return out;
}

/** @type {import("./lint-utils.mjs").Hit[]} */
const hits = [];

let files = [];
try {
  files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
} catch {
  files = []; // pas de migrations (bloc DB non câblé) : rien à vérifier.
}

for (const file of files) {
  const src = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
  for (const fn of scanFunctions(src)) {
    hits.push({
      rel: `${MIGRATIONS_REL}/${file}`,
      line: fn.line,
      rule: "sql-variable-conflict",
      match: fn.name,
    });
  }
}

report(
  "lint:sql",
  hits,
  files.length,
  "Toute fonction plpgsql RETURNS TABLE / SECURITY DEFINER porte `#variable_conflict use_column` (lesson #15).",
);
