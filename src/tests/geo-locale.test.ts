import { describe, it, expect } from "vitest";
import {
  resolveRequestLocale,
  getCountryCodeFromHeaders,
} from "@/i18n/request-locale";
import { getMarketConfig } from "@/config/locale-market";
import { getCountryFromRequestHeaders } from "@/lib/geo/detect-country";

// ─── resolveRequestLocale ───────────────────────────────────────────────────

describe("resolveRequestLocale", () => {
  it("falls back to tr when no context is provided", () => {
    const result = resolveRequestLocale({});
    expect(result).toEqual({ locale: "tr", source: "fallback" });
  });

  it("returns cookie locale when present", () => {
    expect(resolveRequestLocale({ cookieLocale: "de" })).toEqual({
      locale: "de",
      source: "cookie",
    });
  });

  it("cookie overrides country code", () => {
    expect(
      resolveRequestLocale({ cookieLocale: "tr", countryCode: "DE" })
    ).toEqual({ locale: "tr", source: "cookie" });
  });

  it("resolves TR country to tr locale", () => {
    expect(resolveRequestLocale({ countryCode: "TR" })).toEqual({
      locale: "tr",
      source: "country",
    });
  });

  it("resolves DE country to de locale", () => {
    expect(resolveRequestLocale({ countryCode: "DE" })).toEqual({
      locale: "de",
      source: "country",
    });
  });

  it("resolves IT country to it locale", () => {
    expect(resolveRequestLocale({ countryCode: "IT" })).toEqual({
      locale: "it",
      source: "country",
    });
  });

  it("uses Accept-Language when no cookie or country", () => {
    expect(
      resolveRequestLocale({ acceptLanguage: "fr-FR,fr;q=0.9,en;q=0.8" })
    ).toEqual({ locale: "fr", source: "accept-language" });
  });

  it("falls back to tr for unknown Accept-Language", () => {
    expect(resolveRequestLocale({ acceptLanguage: "zh-CN" })).toEqual({
      locale: "tr",
      source: "fallback",
    });
  });

  it("user preferred locale overrides country", () => {
    expect(
      resolveRequestLocale({ userPreferredLocale: "en", countryCode: "TR" })
    ).toEqual({ locale: "en", source: "user" });
  });
});

// ─── getCountryCodeFromHeaders ──────────────────────────────────────────────

describe("getCountryCodeFromHeaders", () => {
  function makeHeaders(entries: Record<string, string>): Pick<Headers, "get"> {
    return { get: (name: string) => entries[name] ?? null };
  }

  it("reads x-vercel-ip-country", () => {
    expect(getCountryCodeFromHeaders(makeHeaders({ "x-vercel-ip-country": "TR" }))).toBe("TR");
  });

  it("reads cf-ipcountry", () => {
    expect(getCountryCodeFromHeaders(makeHeaders({ "cf-ipcountry": "DE" }))).toBe("DE");
  });

  it("prefers x-vercel-ip-country over cf-ipcountry", () => {
    expect(
      getCountryCodeFromHeaders(
        makeHeaders({ "x-vercel-ip-country": "TR", "cf-ipcountry": "DE" })
      )
    ).toBe("TR");
  });

  it("returns null when no geo header", () => {
    expect(getCountryCodeFromHeaders(makeHeaders({}))).toBeNull();
  });
});

// ─── getCountryFromRequestHeaders (geo lib) ─────────────────────────────────

describe("getCountryFromRequestHeaders", () => {
  function makeHeaders(entries: Record<string, string>): Pick<Headers, "get"> {
    return { get: (name: string) => entries[name] ?? null };
  }

  it("prefers x-app-country-code (middleware-resolved)", () => {
    expect(
      getCountryFromRequestHeaders(
        makeHeaders({ "x-app-country-code": "IT", "x-vercel-ip-country": "TR" })
      )
    ).toBe("IT");
  });

  it("falls back to vercel header", () => {
    expect(
      getCountryFromRequestHeaders(makeHeaders({ "x-vercel-ip-country": "FR" }))
    ).toBe("FR");
  });

  it("returns null when no headers", () => {
    expect(getCountryFromRequestHeaders(makeHeaders({}))).toBeNull();
  });
});

// ─── getMarketConfig ─────────────────────────────────────────────────────────

describe("getMarketConfig", () => {
  it("TR → turkey variant", () => {
    const cfg = getMarketConfig("TR");
    expect(cfg.landingVariant).toBe("turkey");
    expect(cfg.defaultLocale).toBe("tr");
    expect(cfg.currency).toBe("TRY");
  });

  it("DE → global variant", () => {
    const cfg = getMarketConfig("DE");
    expect(cfg.landingVariant).toBe("global");
    expect(cfg.defaultLocale).toBe("de");
  });

  it("IT → global variant", () => {
    expect(getMarketConfig("IT").landingVariant).toBe("global");
  });

  it("unknown country → global fallback", () => {
    const cfg = getMarketConfig("XX");
    expect(cfg.landingVariant).toBe("global");
  });

  it("null → defaults to TR config", () => {
    const cfg = getMarketConfig(null);
    expect(cfg.landingVariant).toBe("turkey");
  });

  it("lowercase code is normalized", () => {
    expect(getMarketConfig("tr").landingVariant).toBe("turkey");
  });
});
