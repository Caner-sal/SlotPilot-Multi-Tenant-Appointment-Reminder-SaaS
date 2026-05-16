import type { Page } from "@playwright/test";

export async function fillOnboardingStep0(
  page: Page,
  opts?: { name?: string; slug?: string },
): Promise<void> {
  const name = opts?.name ?? "Test Salon";

  // Fill businessName (required field — placeholder: "Bella Hair Studio")
  const nameInput = page.locator('input[placeholder="Bella Hair Studio"]').first();
  await nameInput.fill(name);

  // Slug auto-fills via useEffect, but fill explicitly for stability
  if (opts?.slug) {
    const slugInput = page.locator('input[placeholder="bella-hair-studio"]').first();
    await slugInput.fill(opts.slug);
  }

  // Advance step
  await page.locator("button[type='submit']").click();
}

export async function fillOnboardingStep1(page: Page): Promise<void> {
  // Step 1 has no required fields (phone and email are optional)
  await page.locator("button[type='submit']").click();
}

export async function fillOnboardingStep2(page: Page): Promise<void> {
  // Step 2 has no required fields (country/timezone default to TR/Europe-Istanbul)
  await page.locator("button[type='submit']").click();
}
