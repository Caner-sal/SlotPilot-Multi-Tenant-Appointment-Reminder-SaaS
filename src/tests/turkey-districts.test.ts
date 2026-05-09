import { describe, it, expect } from "vitest";
import { TURKEY_PROVINCES, TURKEY_DISTRICTS } from "@/data/turkey-provinces";

const ASCII_SLUG_RE = /^[a-z0-9-]+$/;

describe("TURKEY_PROVINCES completeness", () => {
  it("has exactly 81 provinces", () => {
    expect(TURKEY_PROVINCES).toHaveLength(81);
  });
});

describe("TURKEY_DISTRICTS coverage", () => {
  it("every province has at least 1 district", () => {
    const missing: string[] = [];
    for (const province of TURKEY_PROVINCES) {
      const districts = TURKEY_DISTRICTS[province.slug];
      if (!districts || districts.length === 0) {
        missing.push(province.slug);
      }
    }
    expect(missing).toEqual([]);
  });

  it("all 81 provinces are represented in TURKEY_DISTRICTS", () => {
    const districtKeys = Object.keys(TURKEY_DISTRICTS);
    for (const province of TURKEY_PROVINCES) {
      expect(districtKeys).toContain(province.slug);
    }
  });
});

describe("TURKEY_DISTRICTS slug integrity", () => {
  it("all district slugs are ASCII-only (no Turkish characters)", () => {
    const violations: string[] = [];
    for (const [provinceSlug, districts] of Object.entries(TURKEY_DISTRICTS)) {
      for (const district of districts) {
        if (!ASCII_SLUG_RE.test(district.slug)) {
          violations.push(`${provinceSlug}/${district.name} → "${district.slug}"`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("no duplicate district slugs within any single province", () => {
    const duplicates: string[] = [];
    for (const [provinceSlug, districts] of Object.entries(TURKEY_DISTRICTS)) {
      const seen = new Set<string>();
      for (const district of districts) {
        if (seen.has(district.slug)) {
          duplicates.push(`${provinceSlug}: duplicate slug "${district.slug}"`);
        }
        seen.add(district.slug);
      }
    }
    expect(duplicates).toEqual([]);
  });
});

describe("TURKEY_DISTRICTS display name integrity", () => {
  it("no district display name is empty", () => {
    const empty: string[] = [];
    for (const [provinceSlug, districts] of Object.entries(TURKEY_DISTRICTS)) {
      for (const district of districts) {
        if (!district.name || district.name.trim().length === 0) {
          empty.push(`${provinceSlug} has empty district name`);
        }
      }
    }
    expect(empty).toEqual([]);
  });

  it("no district display name contains encoding corruption markers", () => {
    const corrupted: string[] = [];
    for (const [provinceSlug, districts] of Object.entries(TURKEY_DISTRICTS)) {
      for (const district of districts) {
        if (district.name.includes("?") || district.name.includes("�")) {
          corrupted.push(`${provinceSlug}/${district.slug}: "${district.name}"`);
        }
      }
    }
    expect(corrupted).toEqual([]);
  });
});

describe("TURKEY_DISTRICTS spot checks", () => {
  it("istanbul has 39 districts", () => {
    expect(TURKEY_DISTRICTS.istanbul).toHaveLength(39);
  });

  it("ankara has 8 districts", () => {
    expect(TURKEY_DISTRICTS.ankara).toHaveLength(8);
  });

  it("adana has 15 districts including Seyhan and Ceyhan", () => {
    const districts = TURKEY_DISTRICTS.adana;
    expect(districts).toHaveLength(15);
    const slugs = districts.map((d) => d.slug);
    expect(slugs).toContain("seyhan");
    expect(slugs).toContain("ceyhan");
  });

  it("duzce has the expected 8 districts", () => {
    expect(TURKEY_DISTRICTS.duzce).toHaveLength(8);
  });

  it("bayburt has 3 districts", () => {
    expect(TURKEY_DISTRICTS.bayburt).toHaveLength(3);
  });

  it("hatay contains Antakya and Iskenderun", () => {
    const slugs = TURKEY_DISTRICTS.hatay.map((d) => d.slug);
    expect(slugs).toContain("antakya");
    expect(slugs).toContain("iskenderun");
  });

  it("mugla contains Bodrum, Fethiye, Marmaris", () => {
    const slugs = TURKEY_DISTRICTS.mugla.map((d) => d.slug);
    expect(slugs).toContain("bodrum");
    expect(slugs).toContain("fethiye");
    expect(slugs).toContain("marmaris");
  });

  it("sanliurfa contains Halfeti and Harran", () => {
    const slugs = TURKEY_DISTRICTS.sanliurfa.map((d) => d.slug);
    expect(slugs).toContain("halfeti");
    expect(slugs).toContain("harran");
  });
});
