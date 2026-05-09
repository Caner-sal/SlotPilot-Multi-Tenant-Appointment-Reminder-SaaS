import { describe, it, expect } from "vitest";
import {
  ALL_TURKEY_HOLIDAYS,
  TURKEY_HOLIDAYS_2025,
  TURKEY_HOLIDAYS_2026,
  TURKEY_HOLIDAYS_2027,
  isTurkeyHoliday,
  getTurkeyHoliday,
} from "@/data/turkey-holidays";

describe("ALL_TURKEY_HOLIDAYS", () => {
  it("contains all three years of holidays", () => {
    expect(ALL_TURKEY_HOLIDAYS.length).toBe(
      TURKEY_HOLIDAYS_2025.length + TURKEY_HOLIDAYS_2026.length + TURKEY_HOLIDAYS_2027.length
    );
  });

  it("all holidays have valid YYYY-MM-DD date format", () => {
    for (const h of ALL_TURKEY_HOLIDAYS) {
      expect(h.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(h.name).toBeTruthy();
      expect(["national", "religious"]).toContain(h.type);
    }
  });

  it("each year has at least 10 holiday entries", () => {
    expect(TURKEY_HOLIDAYS_2025.length).toBeGreaterThanOrEqual(10);
    expect(TURKEY_HOLIDAYS_2026.length).toBeGreaterThanOrEqual(10);
    expect(TURKEY_HOLIDAYS_2027.length).toBeGreaterThanOrEqual(10);
  });
});

describe("isTurkeyHoliday", () => {
  it("returns true for Cumhuriyet Bayramı 2025", () => {
    expect(isTurkeyHoliday("2025-10-29")).toBe(true);
  });

  it("returns true for Yılbaşı 2026", () => {
    expect(isTurkeyHoliday("2026-01-01")).toBe(true);
  });

  it("returns false for a regular workday", () => {
    expect(isTurkeyHoliday("2026-02-10")).toBe(false);
  });

  it("returns false for unknown date", () => {
    expect(isTurkeyHoliday("2028-10-29")).toBe(false);
  });

  it("returns true for national holidays", () => {
    expect(isTurkeyHoliday("2026-04-23")).toBe(true);
    expect(isTurkeyHoliday("2026-05-01")).toBe(true);
    expect(isTurkeyHoliday("2026-08-30")).toBe(true);
  });
});

describe("getTurkeyHoliday", () => {
  it("returns holiday object for known date", () => {
    const h = getTurkeyHoliday("2025-10-29");
    expect(h).toBeDefined();
    expect(h?.name).toBe("Cumhuriyet Bayramı");
    expect(h?.type).toBe("national");
  });

  it("returns undefined for non-holiday date", () => {
    expect(getTurkeyHoliday("2026-03-01")).toBeUndefined();
  });
});
