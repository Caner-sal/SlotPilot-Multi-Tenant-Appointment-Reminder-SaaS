import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatTime,
} from "@/lib/locale/format";

describe("locale formatting helpers", () => {
  it("formats currencies per locale defaults", () => {
    expect(formatCurrency(249, "tr")).toContain("₺");
    expect(formatCurrency(249, "de")).toContain("€");
    expect(formatCurrency(249, "en", { currency: "USD" })).toContain("$");
  });

  it("formats numbers and dates without crashing on supported locales", () => {
    const iso = "2026-05-10T14:00:00.000Z";

    expect(formatNumber(1234567.89, "tr")).toBeTruthy();
    expect(formatDate(iso, "en", { weekday: "short", month: "short", day: "numeric" })).toBeTruthy();
    expect(formatDate(iso, "de", { weekday: "short", month: "short", day: "numeric" })).toBeTruthy();
    expect(formatDate(iso, "ar", { weekday: "short", month: "short", day: "numeric" })).toBeTruthy();
    expect(formatDate(iso, "ru", { weekday: "short", month: "short", day: "numeric" })).toBeTruthy();
    expect(formatDate(iso, "nl", { weekday: "short", month: "short", day: "numeric" })).toBeTruthy();
  });

  it("supports timezone-aware time rendering", () => {
    const iso = "2026-05-10T14:00:00.000Z";
    const istanbul = formatTime(iso, "tr", { timeZone: "Europe/Istanbul" });
    expect(istanbul).toBeTruthy();
    expect(formatDateTime(iso, "tr", { timeZone: "Europe/Istanbul" })).toBeTruthy();
  });
});
