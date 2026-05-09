import { describe, it, expect } from "vitest";
import { TURKEY_PROVINCES, TURKEY_DISTRICTS, getProvinceBySlug, getDistrictsByProvince } from "@/data/turkey-provinces";
import { normalizeTRPhone, displayTRPhone } from "@/lib/phone";

describe("TURKEY_PROVINCES", () => {
  it("has exactly 81 provinces", () => {
    expect(TURKEY_PROVINCES).toHaveLength(81);
  });

  it("plate codes run from 1 to 81", () => {
    const codes = TURKEY_PROVINCES.map((p) => p.plateCode).sort((a, b) => a - b);
    expect(codes[0]).toBe(1);
    expect(codes[80]).toBe(81);
  });

  it("all provinces have required fields", () => {
    for (const p of TURKEY_PROVINCES) {
      expect(p.plateCode).toBeGreaterThan(0);
      expect(p.name).toBeTruthy();
      expect(p.slug).toBeTruthy();
      expect(p.region).toBeTruthy();
    }
  });

  it("getProvinceBySlug finds Istanbul", () => {
    const p = getProvinceBySlug("istanbul");
    expect(p).toBeDefined();
    expect(p?.plateCode).toBe(34);
  });

  it("getProvinceBySlug returns undefined for unknown slug", () => {
    expect(getProvinceBySlug("unknown")).toBeUndefined();
  });
});

describe("TURKEY_DISTRICTS", () => {
  it("Istanbul has 39 districts", () => {
    expect(TURKEY_DISTRICTS.istanbul).toHaveLength(39);
  });

  it("Ankara has at least 8 districts", () => {
    expect(TURKEY_DISTRICTS.ankara.length).toBeGreaterThanOrEqual(8);
  });

  it("getDistrictsByProvince returns districts for izmir", () => {
    const districts = getDistrictsByProvince("izmir");
    expect(districts.length).toBeGreaterThan(0);
  });

  it("getDistrictsByProvince returns empty array for province without districts", () => {
    expect(getDistrictsByProvince("adana")).toEqual([]);
  });
});

describe("normalizeTRPhone", () => {
  it("normalizes 0532 xxx xx xx format", () => {
    expect(normalizeTRPhone("0532 123 45 67")).toBe("+905321234567");
  });

  it("normalizes 05321234567 format", () => {
    expect(normalizeTRPhone("05321234567")).toBe("+905321234567");
  });

  it("normalizes 5321234567 (no leading zero)", () => {
    expect(normalizeTRPhone("5321234567")).toBe("+905321234567");
  });

  it("normalizes +905321234567 (already normalized)", () => {
    expect(normalizeTRPhone("+905321234567")).toBe("+905321234567");
  });

  it("normalizes 905321234567 (without plus)", () => {
    expect(normalizeTRPhone("905321234567")).toBe("+905321234567");
  });

  it("throws for invalid number", () => {
    expect(() => normalizeTRPhone("123")).toThrow();
  });

  it("throws for empty string", () => {
    expect(() => normalizeTRPhone("")).toThrow();
  });
});

describe("displayTRPhone", () => {
  it("formats normalized number for display", () => {
    expect(displayTRPhone("+905321234567")).toBe("+90 532 123 45 67");
  });

  it("returns input unchanged if not matching format", () => {
    expect(displayTRPhone("invalid")).toBe("invalid");
  });
});
