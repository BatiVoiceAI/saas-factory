/**
 * Budgets qualité web — alignés étape 17 (Core Web Vitals « good ») :
 *
 *   LCP < 2,5 s   (largest-contentful-paint  ≤ 2500 ms)
 *   CLS < 0,1     (cumulative-layout-shift   ≤ 0.1)
 *   INP < 200 ms  (interaction-to-next-paint ≤ 200 ms)
 *
 * `unlighthouse-ci` (cf. .github/workflows/lighthouse.yml) scanne le site,
 * applique ces budgets Lighthouse par métrique et fait échouer la CI si le
 * score de performance passe sous le seuil `ci.budget`.
 */
// Config plain-object (pas d'import `defineConfig` : évite un couplage de type
// à une sous-entrée du package). Unlighthouse lit cet objet tel quel.
const unlighthouseConfig = {
  // Site scanné par défaut ; surchargé en CI par `--site`.
  site: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  scanner: {
    device: "desktop",
    // Une seule passe par URL : suffisant pour un gate de budget en CI.
    samples: 1,
  },

  ci: {
    // Score de performance minimal (0-100) requis pour que la CI passe.
    budget: 90,
  },

  lighthouseOptions: {
    // Budgets Lighthouse (format budget.json) — assertions par métrique CWV.
    budgets: [
      {
        path: "/*",
        timings: [
          { metric: "largest-contentful-paint", budget: 2500 },
          { metric: "cumulative-layout-shift", budget: 0.1 },
          { metric: "interaction-to-next-paint", budget: 200 },
        ],
      },
    ],
  },
};

export default unlighthouseConfig;
