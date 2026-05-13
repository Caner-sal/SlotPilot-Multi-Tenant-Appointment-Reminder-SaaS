import { expect, test } from "@playwright/test";

test.describe("Marketplace localization regression", () => {
  test("shows TR provinces only for Turkey and uses locality search for Italy", async ({ page }) => {
    await page.goto("/tr/marketplace");

    const countrySelect = page.locator("select").nth(1);
    await countrySelect.selectOption("TR");

    const provinceSelect = page.locator("select").nth(2);
    await expect(provinceSelect).toBeVisible();
    await expect(provinceSelect.locator("option", { hasText: "Adana" })).toHaveCount(1);

    await countrySelect.selectOption("IT");
    await expect(page.getByRole("option", { name: "Adana" })).toHaveCount(0);

    const localityInput = page.getByPlaceholder(/locality/i);
    await expect(localityInput).toBeVisible();
    await localityInput.fill("Roma");

    const romaSuggestion = page.getByRole("button", { name: /Roma/i }).first();
    await expect(romaSuggestion).toBeVisible({ timeout: 10000 });
    await romaSuggestion.click();
    await expect(localityInput).toHaveValue(/Roma/i);
  });

  test("does not show Turkey-only landing copy in non-TR locale", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("body")).not.toContainText(/Türkiye MVP/i);
    await expect(page.locator("body")).not.toContainText(/81\s*Türkiye Desteği/i);
  });
});
