import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Config des tests unitaires / composants (bloc repo-ci).
 *
 * - `environment: jsdom` pour tester les composants React.
 * - Les tests vivent dans `tests/` (cf. CONVENTIONS.md §1) ; les tests E2E
 *   Playwright (`e2e/`) sont exclus — ils tournent via `npm run test:e2e`.
 * - L'alias `@/*` reflète tsconfig.json (racine du projet).
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
    css: false,
  },
});
