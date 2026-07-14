/**
 * Identité de marque — SOURCE DE VÉRITÉ UNIQUE du produit.
 *
 * ⚠️ Les valeurs ci-dessous sont la **sentinelle du châssis** : elles doivent
 * être remplacées au **walking skeleton** (étape 12 · build), 1er geste, en même
 * temps que la charte (`app/globals.css`). Dérive-les de `research/positioning.md`
 * (nom du produit, angle/tagline) + `product/pricing.md` (proposition de valeur).
 *
 * La passe d'intégration (étape 12) **échoue** tant que `name` vaut encore
 * `"SaaS Factory Template"` — cf. `skills/12-build/references/integration-pass.md`
 * (garde-fou « métadonnées brandées »).
 *
 * Consommé par :
 * - `app/layout.tsx` — `metadata.title` (default + template) et `description` ;
 * - `app/(auth)/layout.tsx` et `components/nav/app-sidebar.tsx` — le wordmark ;
 * - **étape 16 (SEO)** — le suffixe de titre des pages marketing arrive
 *   automatiquement via `title.template = "%s · {brand.name}"` : les pages SEO
 *   ne renseignent que la partie `%s`, elles **ne re-codent jamais** le nom du
 *   produit en dur (elles importent `brand` si besoin, ex. `og:site_name`).
 */
export const brand = {
  /** Nom du produit (le wordmark). Défaut châssis = sentinelle à remplacer. */
  name: "SaaS Factory Template",
  /** Tagline courte (≤ ~60c), dérivée du positionnement. */
  tagline: "Châssis micro-SaaS",
  /** Description meta (≤ 155c) — proposition de valeur, dérivée du positionnement. */
  description: "Châssis micro-SaaS — Next.js 15, Supabase, Tailwind, shadcn/ui.",
} as const;

/**
 * Langue du LIVRABLE (code BCP-47 : `fr-FR`, `en-US`, `es-ES`, `ar`…).
 *
 * ⚠️ **Sentinelle du châssis, sœur de `brand`** : champ de 1er rang `locale`
 * (cf. `_shared/state-schema.md` §Locale du livrable — SOURCE UNIQUE), **capté à
 * l'intake, propagé, invariant**, finalisé au **walking skeleton (étape 12)** par
 * l'**écrivain unique** — exactement comme `brand.name` (cf. `CONVENTIONS.md`
 * §9 † & §12). Le défaut châssis `"fr-FR"` = **langue de travail interne**, à
 * paramétrer depuis `locale` au build ; un produit `en-US` ne doit garder aucun
 * résidu FR.
 *
 * Consommé UNIQUEMENT via `lib/i18n.ts` (qui en dérive `locale`, `dir` et le
 * dictionnaire de copy) — ne pas relire cette constante en dur ailleurs. Une env
 * `NEXT_PUBLIC_LOCALE` (cf. `lib/env.ts`) peut la **surcharger** sans toucher au
 * code (ex. prévisualisation multi-langue) ; sinon cette valeur fait foi.
 */
export const PRODUCT_LOCALE = "fr-FR";
