import { describe, expect, it } from "vitest";
import { defaultLocale, resolveLocale } from "@/i18n/locales";
import { extractLocale, withLocale } from "@/i18n/pathing";

describe("i18n locale routing helpers", () => {
  it("extracts locale from prefixed paths", () => {
    expect(extractLocale("/tr/dashboard")).toEqual({
      locale: "tr",
      internalPath: "/dashboard",
    });
    expect(extractLocale("/en")).toEqual({
      locale: "en",
      internalPath: "/",
    });
  });

  it("returns null locale for non-prefixed paths", () => {
    expect(extractLocale("/dashboard")).toEqual({
      locale: null,
      internalPath: "/dashboard",
    });
  });

  it("builds locale-prefixed paths", () => {
    expect(withLocale("/dashboard/services", "de")).toBe("/de/dashboard/services");
    expect(withLocale("/", "ar")).toBe("/ar");
  });

  it("falls back to default locale for invalid values", () => {
    expect(resolveLocale("tr")).toBe("tr");
    expect(resolveLocale("unknown")).toBe(defaultLocale);
    expect(resolveLocale(undefined)).toBe(defaultLocale);
  });
});
