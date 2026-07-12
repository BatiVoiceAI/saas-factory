import { defineConfig, devices } from "@playwright/test";

/**
 * Config E2E (bloc repo-ci). Les specs vivent dans `e2e/`.
 *
 * En local, Playwright démarre lui-même le serveur de prod (build + start) et
 * le réutilise s'il tourne déjà. En CI, il exige un serveur frais.
 * `PLAYWRIGHT_BASE_URL` permet de cibler un déploiement distant (preview).
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run build && npm run start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
