import { expect, test } from "@playwright/test";

const switches = [
  { locale: "es", optionName: /Español/, dir: "ltr" },
  { locale: "fr", optionName: /Français/, dir: "ltr" },
  { locale: "it", optionName: /Italiano/, dir: "ltr" },
  { locale: "fa", optionName: /فارسی/, dir: "rtl" },
  { locale: "ru", optionName: /Русский/, dir: "ltr" },
  { locale: "nl", optionName: /Nederlands/, dir: "ltr" }
];

test.describe("Global i18n critical flow", () => {
  test("preserves booking path while switching across expanded locales", async ({ page }) => {
    await page.goto("/tr/booking/barber-demo");
    await expect(page).toHaveURL(/\/tr\/booking\/barber-demo$/);

    for (const step of switches) {
      await page.locator("button[aria-haspopup='listbox']").first().click();
      await page.getByRole("option", { name: step.optionName }).click();
      await expect(page).toHaveURL(new RegExp(`\\/${step.locale}\\/booking\\/barber-demo$`));

      await page.reload();
      await expect(page.locator("html")).toHaveAttribute("lang", step.locale);
      await expect(page.locator("html")).toHaveAttribute("dir", step.dir);
    }
  });

  test("applies rtl for arabic and keeps locale on dashboard auth redirect", async ({ page }) => {
    await page.goto("/ar");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

    await page.goto("/de/dashboard");
    await expect(page).toHaveURL(/\/de\/login$/);
  });

  test("keeps selected locale after refresh", async ({ page }) => {
    await page.goto("/tr");
    await page.locator("button[aria-haspopup='listbox']").first().click();
    await page.getByRole("option", { name: /Nederlands/ }).click();
    await expect(page).toHaveURL(/\/nl$/);

    await page.reload();
    await expect(page).toHaveURL(/\/nl$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "nl");
  });
});
