import { expect, test } from "@playwright/test";

test.describe("Global i18n critical flow", () => {
  test("preserves booking path when language changes", async ({ page }) => {
    await page.goto("/tr/booking/barber-demo");
    await expect(page).toHaveURL(/\/tr\/booking\/barber-demo$/);

    await page.locator("button[aria-haspopup='listbox']").first().click();
    await page.getByRole("option", { name: "English" }).click();

    await expect(page).toHaveURL(/\/en\/booking\/barber-demo$/);
  });

  test("applies rtl for arabic and keeps locale on dashboard auth redirect", async ({ page }) => {
    await page.goto("/ar");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

    await page.goto("/de/dashboard");
    await expect(page).toHaveURL(/\/de\/login$/);
  });
});
