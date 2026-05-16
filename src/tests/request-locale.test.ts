import { describe, expect, it } from "vitest";
import { getCountryCodeFromHeaders, resolveRequestLocale } from "@/i18n/request-locale";

describe("resolveRequestLocale", () => {
  it("prefers route locale", () => {
    const resolved = resolveRequestLocale({
      routeLocale: "de",
      cookieLocale: "tr",
      countryCode: "GB",
      acceptLanguage: "es-ES,es;q=0.9",
    });
    expect(resolved).toEqual({ locale: "de", source: "route" });
  });

  it("prefers cookie locale over user/country", () => {
    const resolved = resolveRequestLocale({
      cookieLocale: "tr",
      userPreferredLocale: "es",
      countryCode: "GB",
      acceptLanguage: "de-DE,de;q=0.9",
    });
    expect(resolved).toEqual({ locale: "tr", source: "cookie" });
  });

  it("uses user locale when cookie and route are absent", () => {
    const resolved = resolveRequestLocale({
      userPreferredLocale: "fr",
      countryCode: "DE",
    });
    expect(resolved).toEqual({ locale: "fr", source: "user" });
  });

  it("maps country codes to supported locales", () => {
    expect(resolveRequestLocale({ countryCode: "GB" })).toEqual({
      locale: "en",
      source: "country",
    });
    expect(resolveRequestLocale({ countryCode: "ES" })).toEqual({
      locale: "es",
      source: "country",
    });
    expect(resolveRequestLocale({ countryCode: "DE" })).toEqual({
      locale: "de",
      source: "country",
    });
    expect(resolveRequestLocale({ countryCode: "IR" })).toEqual({
      locale: "fa",
      source: "country",
    });
    expect(resolveRequestLocale({ countryCode: "SA" })).toEqual({
      locale: "ar",
      source: "country",
    });
  });

  it("falls back to accept-language when country is unknown", () => {
    const resolved = resolveRequestLocale({
      countryCode: "ZZ",
      acceptLanguage: "nl-NL,nl;q=0.9,en;q=0.8",
    });
    expect(resolved).toEqual({ locale: "nl", source: "accept-language" });
  });

  it("falls back to tr for unknown inputs (TR is platform default)", () => {
    const resolved = resolveRequestLocale({
      countryCode: "ZZ",
      acceptLanguage: "pl-PL,pl;q=0.9",
    });
    expect(resolved).toEqual({ locale: "tr", source: "fallback" });
  });
});

describe("getCountryCodeFromHeaders", () => {
  it("reads first available country header", () => {
    const headers = new Headers({
      "cf-ipcountry": "FR",
      "x-vercel-ip-country": "GB",
    });
    expect(getCountryCodeFromHeaders(headers)).toBe("GB");
  });
});

