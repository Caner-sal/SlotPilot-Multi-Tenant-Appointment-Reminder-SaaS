import { expect, test } from "@playwright/test";

const slug = "barber-demo";

function parseDateParts(value: string) {
  const [year, month, day] = value.split("-").map((item) => Number(item));
  return { year, month, day };
}

test.describe("CALUI booking and i18n regressions", () => {
  test("supports next-month navigation and date-based slot fetch", async ({ page, request }) => {
    const servicesRes = await request.get(`/api/booking/${slug}/services`);
    if (!servicesRes.ok()) {
      test.skip(true, "Public booking services are not available in this environment");
    }
    const servicesBody = (await servicesRes.json()) as {
      data?: Array<{ name?: string; staffServices?: Array<{ staff?: { id?: string } }> }>;
    };
    const bookableService = (servicesBody.data ?? []).find((service) =>
      (service.staffServices ?? []).some((item) => !!item.staff?.id)
    );
    test.skip(!bookableService?.name, "No bookable service is available in this environment");

    await page.goto(`/tr/booking/${slug}`);

    await page.waitForLoadState("networkidle");
    const serviceCard = page.getByTestId("booking-service-option").first();
    const serviceVisible = await serviceCard.isVisible({ timeout: 5000 }).catch(() => false);
    test.skip(!serviceVisible, "Booking service cards are not rendered in this environment");
    await serviceCard.click();

    const staffOptions = page.getByTestId("booking-staff-option");
    if (await staffOptions.count()) {
      await staffOptions.first().click();
    }

    const datePicker = page.getByTestId("booking-date-picker");
    await expect(datePicker).toBeVisible();

    const nextMonthButton = page.locator(
      "button[aria-label*='next' i], button[aria-label*='sonraki' i]"
    ).first();
    await expect(nextMonthButton).toBeVisible();
    await nextMonthButton.click();

    const selectableDays = datePicker.locator("button.rdp-day_button:not([disabled])");
    const selectableCount = await selectableDays.count();
    test.skip(selectableCount === 0, "No selectable calendar day in this environment");
    await selectableDays.first().click();

    const slotsRequestPromise = page.waitForRequest((request) => {
      if (request.method() !== "GET") return false;
      return request.url().includes(`/api/booking/${slug}/slots?`);
    });

    await page.getByTestId("booking-view-slots").click();

    const slotsRequest = await slotsRequestPromise;
    const requestedUrl = new URL(slotsRequest.url());
    const requestedDate = requestedUrl.searchParams.get("date");

    expect(requestedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const now = new Date();
    const todayParts = { year: now.getFullYear(), month: now.getMonth() + 1 };
    const selectedParts = parseDateParts(requestedDate!);

    expect(
      selectedParts.year > todayParts.year || selectedParts.month !== todayParts.month
    ).toBeTruthy();
  });

  test("keeps business service names stable while UI locale changes", async ({ page, request }) => {
    const servicesRes = await request.get(`/api/booking/${slug}/services`);
    expect(servicesRes.ok()).toBeTruthy();

    const servicesBody = (await servicesRes.json()) as {
      data?: Array<{ name?: string }>;
    };
    const serviceName = servicesBody.data?.[0]?.name;
    expect(serviceName).toBeTruthy();

    await page.goto(`/tr/booking/${slug}`);
    const trHeading = (await page.locator("h2").first().textContent())?.trim();
    await expect(page.getByText(serviceName!, { exact: false })).toBeVisible();

    await page.goto(`/en/booking/${slug}`);
    const enHeading = (await page.locator("h2").first().textContent())?.trim();
    await expect(page.getByText(serviceName!, { exact: false })).toBeVisible();

    expect(enHeading).toBeTruthy();
    expect(trHeading).toBeTruthy();
    expect(enHeading).not.toBe(trHeading);
  });

  test("dashboard services route theme smoke", async ({ page }) => {
    await page.goto("/tr/dashboard/services");

    if (page.url().includes("/login")) {
      await expect(page).toHaveURL(/\/tr\/login$/);
      return;
    }

    const html = await page.content();
    expect(html.includes("bg-white")).toBeFalsy();
    expect(/text-gray-[0-9]{2,3}/.test(html)).toBeFalsy();
    expect(/border-gray-[0-9]{2,3}/.test(html)).toBeFalsy();
  });
});
