import { expect, test } from "@playwright/test";

/**
 * Smoke E2E du châssis : le strict minimum qui doit toujours être vert.
 *   1. La landing (`/`) se charge et rend son titre principal.
 *   2. La page de login (`/login`, bloc `auth`) s'affiche avec son champ email.
 * Les sélecteurs sont structurels (rôle / type) pour rester robustes aux
 * variations de contenu d'un projet à l'autre.
 */
test.describe("smoke", () => {
  test("la landing se charge", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("la page de login s'affiche", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login\/?$/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});
