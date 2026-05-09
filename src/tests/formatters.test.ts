import { describe, it, expect } from "vitest";
import {
  formatCurrencyTRY,
  formatDateTR,
  formatTimeTR,
  formatDateTimeTR,
  formatDurationTR,
} from "@/lib/formatters";

describe("formatCurrencyTRY", () => {
  it("formats cents to TRY currency string", () => {
    const result = formatCurrencyTRY(4000);
    expect(result).toContain("40");
    expect(result).toMatch(/₺|TRY/);
  });

  it("formats zero correctly", () => {
    const result = formatCurrencyTRY(0);
    expect(result).toContain("0");
  });

  it("formats large amounts correctly", () => {
    const result = formatCurrencyTRY(24900);
    expect(result).toContain("249");
  });
});

describe("formatDateTR", () => {
  it("returns a Turkish-locale date string", () => {
    const date = new Date("2026-01-15T12:00:00Z");
    const result = formatDateTR(date);
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
    // Should contain the year
    expect(result).toContain("2026");
  });

  it("accepts string input", () => {
    const result = formatDateTR("2026-06-01T10:00:00Z");
    expect(result).toContain("2026");
  });
});

describe("formatTimeTR", () => {
  it("returns a 24-hour time string", () => {
    const date = new Date("2026-01-15T09:30:00Z");
    const result = formatTimeTR(date);
    expect(result).toBeTruthy();
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});

describe("formatDateTimeTR", () => {
  it("returns a combined date and time string in Turkish locale", () => {
    const date = new Date("2026-06-15T14:30:00Z");
    const result = formatDateTimeTR(date);
    expect(result).toBeTruthy();
    expect(result).toContain("2026");
  });
});

describe("formatDurationTR", () => {
  it("formats minutes under 60", () => {
    expect(formatDurationTR(30)).toBe("30 dk");
    expect(formatDurationTR(45)).toBe("45 dk");
  });

  it("formats exactly 60 minutes as 1 hour", () => {
    expect(formatDurationTR(60)).toBe("1 sa");
  });

  it("formats 90 minutes as 1 sa 30 dk", () => {
    expect(formatDurationTR(90)).toBe("1 sa 30 dk");
  });
});
