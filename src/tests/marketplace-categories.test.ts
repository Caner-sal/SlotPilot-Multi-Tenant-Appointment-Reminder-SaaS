import { describe, expect, it } from "vitest";
import { getMarketplaceCategoryAliases, getMarketplaceCategoryOptions } from "@/data/marketplace-categories";

describe("marketplace categories", () => {
  it("returns locale-aware labels", () => {
    const tr = getMarketplaceCategoryOptions("tr");
    const it = getMarketplaceCategoryOptions("it");

    expect(tr.length).toBeGreaterThan(0);
    expect(it.length).toBeGreaterThan(0);
    expect(tr[0].label).not.toBe(it[0].label);
  });

  it("expands canonical slug to legacy aliases", () => {
    const aliases = getMarketplaceCategoryAliases("hair-salon");
    expect(aliases).toContain("Kuafor");
    expect(aliases).toContain("Hair Salon");
  });
});
