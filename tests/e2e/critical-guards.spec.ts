import { expect, test } from "@playwright/test";

test.describe("Critical guard and entry smoke flows", () => {
  test("redirects protected pages to locale-aware login", async ({ page }) => {
    await page.goto("/tr/dashboard");
    await expect(page).toHaveURL(/\/tr\/login$/);

    await page.goto("/tr/staff/dashboard");
    await expect(page).toHaveURL(/\/tr\/login$/);

    await page.goto("/tr/admin");
    await expect(page).toHaveURL(/\/tr\/login$/);
  });

  test("registration and onboarding entry pages are reachable", async ({ page }) => {
    await page.goto("/tr/register");
    await expect(page).toHaveURL(/\/tr\/register$/);
    await expect(page.locator("input[type='email']").first()).toBeVisible();

    await page.goto("/tr/onboarding");
    await expect(page).toHaveURL(/\/tr\/onboarding$/);
  });

  test("public booking route is reachable", async ({ page }) => {
    await page.goto("/tr/booking/barber-demo");
    await expect(page).toHaveURL(/\/tr\/booking\/barber-demo$/);
    await expect(page.locator("body")).toBeVisible();
  });
});
