# Référence — On-page + SEO technique (mécanisme 3)

Le code SEO à générer dans le micro-SaaS. **Vendore les libs éprouvées, ne réinvente pas.**

## On-page
- **Meta** : title (≤60c) + description (≤155c) **uniques** par page, dérivés du cluster.
  - **Source de vérité du nom de marque = `lib/brand.ts`** (renseigné au build, étape 12). Le `title.template` du layout racine (`"%s · {brand.name}"`) suffixe **automatiquement** chaque page avec le nom du produit : une page SEO ne renseigne que sa **partie propre** (le `%s`, ex. `export const metadata = { title: "Guide X" }`) → rendu `Guide X · {Produit}`. **Ne jamais re-coder le nom du produit en dur** dans les meta par page ; si tu en as besoin (ex. `og:site_name`), importe `brand` depuis `@/lib/brand`. Pas de double source de vérité pour le titre.
- **Structure** : un seul **H1**, hiérarchie Hn logique.
- **URLs** : propres, courtes, avec le mot-clé.
- **Open Graph / Twitter Card** : partage social.
- **Maillage interne** : depuis le topic-cluster-map (pillar ↔ clusters).

## Technique (selon le stack généré par la Factory)
- **Structured data (JSON-LD)** : **`schema-dts`** (Google, Apache) — types type-safe (Product, FAQPage, Article…).
- **Sitemap + robots** : **natifs du framework** (Next.js App Router : `sitemap.ts` + `robots.ts` ; Astro : `@astrojs/sitemap`) ou `next-sitemap` (MIT). **Canonical** sur chaque page.
- **Core Web Vitals** : **`unlighthouse`** (MIT) en CI — audit CWV/perf/SEO sur tout le site, en **gate** (LCP / CLS / INP dans les seuils).
- **Mobile** : responsive (déjà couvert par le design system, étape 8).

## Vérification finale
Lance `unlighthouse` (ou Lighthouse) comme **check final** : perf + SEO + a11y **verts** avant de considérer l'étape 16 faite.

---

## Sous-procédures détaillées (quoi coder / critère de passage)

### 1. On-page, par page
Ordre : title → description → Hn → URL → OG → maillage.
- **Title (≤ 60c)** : mot-clé principal en tête, **unique** dans tout le site. Deux titles identiques = défaut. Ne renseigne que la **partie propre** de la page (le `%s`) — le nom du produit est ajouté par le `title.template` du layout (source unique `lib/brand.ts`, étape 12). Compte le suffixe `· {Produit}` dans le budget des 60c.
- **Description (≤ 155c)** : incitative (elle influence le CTR, pas le rank direct), **unique**, dérivée de l'intention du cluster.
- **Hn** : **un seul H1** (le sujet de la page), puis H2/H3 hiérarchisés — pas de saut de niveau, pas de H1 multiples.
- **URL** : courte, en minuscules, mots séparés par des tirets, avec le mot-clé, **sans** paramètres inutiles.
- **OG / Twitter Card** : `og:title`, `og:description`, `og:image`, `twitter:card` — pour un partage social propre.
- **Maillage interne** : conforme à `seo/topic-cluster-map.md` (pillar ↔ clusters). Anti-orphelins : chaque page est atteignable en ≥ 1 lien interne.
- **Critère de passage :** meta uniques partout, 1 H1/page, URL propre, OG présent, zéro page orpheline.

### 2. Structured data (JSON-LD via `schema-dts`)
- Choisir le **type** via M6 (`decision-matrices.md`) : `SoftwareApplication`/`Product` (landing), `Article` (guides/comparatifs), `FAQPage` (si Q/R réelles), `BreadcrumbList` (partout).
- Écrire en **`schema-dts`** (type-safe) — jamais du JSON-LD à la main approximatif.
- **Interdit : faux markup.** Pas de `aggregateRating` sans avis réels, pas de `FAQPage` sans FAQ visible sur la page. Google pénalise le structured data trompeur.
- **Critère de passage :** JSON-LD valide (testeur Rich Results), type correct, **zéro** champ inventé.

### 3. Sitemap / robots / canonical
- Router selon le stack via **M7** : natif du framework d'abord (Next.js `sitemap.ts`+`robots.ts` ; Astro `@astrojs/sitemap` ; sinon `next-sitemap`).
- **Canonical sur chaque page** (anti-duplication) — pointant vers l'URL propre choisie.
- `robots.txt` : autoriser le crawl des pages publiques, pointer le sitemap ; **bloquer** l'app authentifiée / les zones privées.
- **Critère de passage :** `sitemap.xml` liste les pages publiques, `robots.txt` cohérent + référence le sitemap, canonical partout.

### 4. Core Web Vitals — `unlighthouse` en gate
- Lancer **`unlighthouse`** (MIT) sur tout le site en CI.
- Comparer aux **seuils M8** (`decision-matrices.md`) : **LCP ≤ 2,5 s · CLS ≤ 0,1 · INP ≤ 200 ms**.
- Corriger les métriques hors seuil :
  - **LCP** élevé → image hero trop lourde (optimiser/format moderne/lazy hors-viewport), rendu bloquant.
  - **CLS** élevé → dimensions manquantes sur images/embeds, fonts sans fallback ⇒ fixer les tailles, `font-display: swap`.
  - **INP** élevé → JS bloquant ⇒ différer/scinder, alléger les handlers.
- **Critère de passage :** 3 métriques dans le vert + score SEO et a11y OK. Une landing rouge **ne se publie pas**.

## Micro-exemple — la landing d'un micro-SaaS
- Title : la landing (route `/`) laisse le **`title.default` = `{Produit}`** du layout (source `lib/brand.ts`) ; les autres pages ne posent que leur `%s` (ex. `{tâche} pour {métier}`) → rendu `{tâche} pour {métier} · {Produit}` (≤ 60c suffixe compris). Jamais `{Produit}` re-tapé en dur.
- Schema : `SoftwareApplication` (name, description, `offers` avec le prix réel du business model, étape 6) + `BreadcrumbList`. Pas de `aggregateRating` tant qu'il n'y a pas d'avis.
- Sitemap : `app/sitemap.ts` liste landing + 3-4 pages ; `app/robots.ts` bloque `/dashboard`, `/api`.
- `unlighthouse` : LCP 1,8 s / CLS 0,02 / INP 120 ms → **vert**, publiable.

## Modes d'échec fréquents
- **Faux structured data** → retirer (pénalité), ne coder que le vrai (M6).
- **Meta dupliquées** → chaque page dérive ses meta de son cluster.
- **App privée indexée** → `robots.txt` + `noindex` sur les zones authentifiées.
- **CWV ignorés** → gate `unlighthouse`, corriger avant publication (M8).
- **Framework exotique** → sitemap/robots au standard XML + documenter (M7).
