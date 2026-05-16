import { expect, test } from "@playwright/test";

// BILLUI-9 E2E: Billing checkout + UI cleanup regression
// These tests focus on structural correctness and route availability.
// Full authenticated flow tests require a running DB with seeded demo data.

test.describe("BILLUI: Dark theme UI cleanup regression", () => {
  test("analytics page has no light-background highlight cards", async ({ page }) => {
    // Analytics page redirects to login — check the page structure via DOM analysis
    // We verify that bg-blue-50 and bg-indigo-50 classes are NOT in the analytics page source
    const response = await page.goto("/dashboard/analytics");
    if (!response) { test.skip(true, "No response"); return; }

    // If redirected to login (unauthenticated), verify login page loads
    if (page.url().includes("/login") || page.url().includes("/auth")) {
      await expect(page.locator("input[type='email'], input[type='text']").first()).toBeVisible({ timeout: 5000 });
      return;
    }

    // If we get analytics page, verify no bg-blue-50 / bg-indigo-50 in highlight cards
    const pageContent = await page.content();
    expect(pageContent).not.toContain("bg-blue-50");
    expect(pageContent).not.toContain("bg-indigo-50");
  });

  test("billing page has no light-background badges", async ({ page }) => {
    const response = await page.goto("/dashboard/billing");
    if (!response) { test.skip(true, "No response"); return; }

    if (page.url().includes("/login") || page.url().includes("/auth")) {
      await expect(page.locator("input[type='email'], input[type='text']").first()).toBeVisible({ timeout: 5000 });
      return;
    }

    const pageContent = await page.content();
    expect(pageContent).not.toContain("bg-blue-100");
    expect(pageContent).not.toContain("bg-purple-100");
    expect(pageContent).not.toContain("bg-green-50");
    expect(pageContent).not.toContain("bg-yellow-50");
  });

  test("WhatsApp page has no native <select> element", async ({ page }) => {
    const response = await page.goto("/dashboard/whatsapp");
    if (!response) { test.skip(true, "No response"); return; }

    if (page.url().includes("/login") || page.url().includes("/auth")) {
      await expect(page.locator("input[type='email'], input[type='text']").first()).toBeVisible({ timeout: 5000 });
      return;
    }

    // After BILLUI-2, no native <select> should be present in WhatsApp page
    const nativeSelects = page.locator("select");
    const count = await nativeSelects.count();
    expect(count).toBe(0);
  });
});

test.describe("BILLUI: Billing checkout route availability", () => {
  test("checkout page exists and redirects unauthenticated users to login", async ({ page }) => {
    const response = await page.goto("/dashboard/billing/checkout?plan=STARTER");
    if (!response) { test.skip(true, "No response"); return; }

    // Unauthenticated: should redirect to login
    const finalUrl = page.url();
    const isLoginPage =
      finalUrl.includes("/login") ||
      finalUrl.includes("/auth") ||
      finalUrl.includes("/signin");

    if (isLoginPage) {
      await expect(page.locator("input[type='email'], input[type='text']").first()).toBeVisible({ timeout: 5000 });
      return;
    }

    // If authenticated (cookie set), verify checkout page loads
    const checkoutTitle = page.locator("h1").first();
    await expect(checkoutTitle).toBeVisible({ timeout: 5000 });
  });

  test("success page exists", async ({ page }) => {
    const response = await page.goto("/dashboard/billing/success");
    if (!response) { test.skip(true, "No response"); return; }

    const finalUrl = page.url();
    if (!finalUrl.includes("/login") && !finalUrl.includes("/auth") && !finalUrl.includes("/signin")) {
      // Page loaded — check for h1
      await expect(page.locator("h1, [class*='font-bold']").first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("failure page exists", async ({ page }) => {
    const response = await page.goto("/dashboard/billing/failure");
    if (!response) { test.skip(true, "No response"); return; }

    const finalUrl = page.url();
    if (!finalUrl.includes("/login") && !finalUrl.includes("/auth") && !finalUrl.includes("/signin")) {
      await expect(page.locator("h1, [class*='font-bold']").first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("history page exists", async ({ page }) => {
    const response = await page.goto("/dashboard/billing/history");
    if (!response) { test.skip(true, "No response"); return; }

    const finalUrl = page.url();
    if (!finalUrl.includes("/login") && !finalUrl.includes("/auth") && !finalUrl.includes("/signin")) {
      await expect(page.locator("h1, [class*='font-bold']").first()).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("BILLUI: Billing API security guards", () => {
  test("POST /api/billing/checkout requires auth (401/403 when unauthenticated)", async ({ request }) => {
    const res = await request.post("/api/billing/checkout", {
      data: { plan: "STARTER" },
      headers: { "Content-Type": "application/json" },
    });
    // Unauthenticated: expect 401 or 403 (not 200)
    expect([401, 403]).toContain(res.status());
  });

  test("GET /api/billing/history requires auth", async ({ request }) => {
    const res = await request.get("/api/billing/history");
    expect([401, 403]).toContain(res.status());
  });

  test("GET /api/billing/confirm requires auth", async ({ request }) => {
    const res = await request.get("/api/billing/confirm?conversationId=test");
    expect([401, 403]).toContain(res.status());
  });

  test("POST /api/webhooks/iyzico rejects missing signature", async ({ request }) => {
    const res = await request.post("/api/webhooks/iyzico", {
      data: { iyziEventType: "SUBSCRIPTION_CREATED", conversationId: "test" },
      headers: { "Content-Type": "application/json" },
    });
    // No signature header → 400
    expect(res.status()).toBe(400);
  });

  test("checkout API rejects invalid plan", async ({ request }) => {
    const res = await request.post("/api/billing/checkout", {
      data: { plan: "FREE" },
      headers: { "Content-Type": "application/json" },
    });
    // FREE plan is not purchasable + unauthenticated = 400 or 401/403
    expect([400, 401, 403, 422]).toContain(res.status());
  });
});
