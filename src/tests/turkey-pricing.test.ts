import { describe, it, expect } from "vitest";
import { TURKEY_PLANS, getPlanTR, formatPlanPriceTR } from "@/config/pricing.tr";

describe("TURKEY_PLANS", () => {
  it("FREE plan has 0 monthly cost", () => {
    expect(TURKEY_PLANS.FREE.priceCentsMonthly).toBe(0);
  });

  it("STARTER plan costs 40 TRY per month (4000 cents)", () => {
    expect(TURKEY_PLANS.STARTER.priceCentsMonthly).toBe(4000);
  });

  it("PRO plan costs 249 TRY per month (24900 cents)", () => {
    expect(TURKEY_PLANS.PRO.priceCentsMonthly).toBe(24900);
  });

  it("ENTERPRISE plan has null price (custom pricing)", () => {
    expect(TURKEY_PLANS.ENTERPRISE.priceCentsMonthly).toBeNull();
  });

  it("PRO plan allows 2000 appointments per month", () => {
    expect(TURKEY_PLANS.PRO.maxApptsPerMonth).toBe(2000);
  });

  it("PRO plan allows unlimited staff", () => {
    expect(TURKEY_PLANS.PRO.maxStaff).toBe(Infinity);
  });

  it("FREE plan limits to 1 staff", () => {
    expect(TURKEY_PLANS.FREE.maxStaff).toBe(1);
  });

  it("STARTER plan limits to 3 staff", () => {
    expect(TURKEY_PLANS.STARTER.maxStaff).toBe(3);
  });

  it("FREE plan limits to 20 appointments per month", () => {
    expect(TURKEY_PLANS.FREE.maxApptsPerMonth).toBe(20);
  });

  it("all plans have Turkish names", () => {
    for (const plan of Object.values(TURKEY_PLANS)) {
      expect(plan.nameTR).toBeTruthy();
    }
  });
});

describe("getPlanTR", () => {
  it("returns FREE plan for FREE id", () => {
    expect(getPlanTR("FREE").nameTR).toBe("Ücretsiz");
  });

  it("returns STARTER plan for STARTER id", () => {
    expect(getPlanTR("STARTER").nameTR).toBe("Başlangıç");
  });

  it("returns FREE plan for unknown id (fallback)", () => {
    expect(getPlanTR("UNKNOWN").id).toBe("FREE");
  });
});

describe("formatPlanPriceTR", () => {
  it("formats FREE plan as Ücretsiz", () => {
    expect(formatPlanPriceTR(TURKEY_PLANS.FREE)).toBe("Ücretsiz");
  });

  it("formats STARTER with TRY and /ay suffix", () => {
    const result = formatPlanPriceTR(TURKEY_PLANS.STARTER);
    expect(result).toContain("40");
    expect(result).toContain("/ay");
  });

  it("formats ENTERPRISE as contact prompt", () => {
    expect(formatPlanPriceTR(TURKEY_PLANS.ENTERPRISE)).toBe("İletişime Geçin");
  });
});
