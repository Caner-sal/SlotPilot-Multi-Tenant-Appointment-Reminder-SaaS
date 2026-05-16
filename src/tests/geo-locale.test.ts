import { describe, it, expect, vi, afterEach } from "vitest";
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

  it("FR → global variant with fr locale", () => {
    const cfg = getMarketConfig("FR");
    expect(cfg.landingVariant).toBe("global");
    expect(cfg.defaultLocale).toBe("fr");
  });

  it("ES → global variant with es locale", () => {
    const cfg = getMarketConfig("ES");
    expect(cfg.landingVariant).toBe("global");
    expect(cfg.defaultLocale).toBe("es");
  });

  it("AT → global variant with de locale", () => {
    const cfg = getMarketConfig("AT");
    expect(cfg.landingVariant).toBe("global");
    expect(cfg.defaultLocale).toBe("de");
  });
});

// ─── resolveRequestLocale — source priority chain ───────────────────────────

describe("resolveRequestLocale — source priority chain", () => {
  it("route takes precedence over cookie", () => {
    expect(
      resolveRequestLocale({ routeLocale: "en", cookieLocale: "tr" })
    ).toEqual({ locale: "en", source: "route" });
  });

  it("route takes precedence over country code", () => {
    expect(
      resolveRequestLocale({ routeLocale: "fr", countryCode: "TR" })
    ).toEqual({ locale: "fr", source: "route" });
  });

  it("cookie takes precedence over user preferred locale", () => {
    expect(
      resolveRequestLocale({ cookieLocale: "de", userPreferredLocale: "en" })
    ).toEqual({ locale: "de", source: "cookie" });
  });

  it("user preferred locale takes precedence over country", () => {
    expect(
      resolveRequestLocale({ userPreferredLocale: "fr", countryCode: "TR" })
    ).toEqual({ locale: "fr", source: "user" });
  });

  it("user preferred locale takes precedence over accept-language", () => {
    expect(
      resolveRequestLocale({ userPreferredLocale: "it", acceptLanguage: "de-DE" })
    ).toEqual({ locale: "it", source: "user" });
  });

  it("country takes precedence over accept-language", () => {
    expect(
      resolveRequestLocale({ countryCode: "TR", acceptLanguage: "de-DE,de;q=0.9" })
    ).toEqual({ locale: "tr", source: "country" });
  });

  it("accept-language is used when no higher priority context", () => {
    expect(
      resolveRequestLocale({ acceptLanguage: "nl-NL,nl;q=0.9" })
    ).toEqual({ locale: "nl", source: "accept-language" });
  });

  it("accept-language respects first matching locale in priority list", () => {
    expect(
      resolveRequestLocale({ acceptLanguage: "fr-FR,de;q=0.8,en;q=0.6" })
    ).toEqual({ locale: "fr", source: "accept-language" });
  });

  it("fallback is returned when nothing matches", () => {
    expect(
      resolveRequestLocale({ acceptLanguage: "zh-TW,zh;q=0.9" })
    ).toEqual({ locale: "tr", source: "fallback" });
  });
});

// ─── Arabic and multi-region country codes ──────────────────────────────────

describe("Arabic and multi-region country codes", () => {
  it("SA → ar locale", () => {
    expect(resolveRequestLocale({ countryCode: "SA" })).toEqual({
      locale: "ar",
      source: "country",
    });
  });

  it("AE → ar locale", () => {
    expect(resolveRequestLocale({ countryCode: "AE" })).toEqual({
      locale: "ar",
      source: "country",
    });
  });

  it("EG → ar locale", () => {
    expect(resolveRequestLocale({ countryCode: "EG" })).toEqual({
      locale: "ar",
      source: "country",
    });
  });

  it("AT → de locale (German-speaking Austria)", () => {
    expect(resolveRequestLocale({ countryCode: "AT" })).toEqual({
      locale: "de",
      source: "country",
    });
  });

  it("CH → de locale (German-speaking Switzerland)", () => {
    expect(resolveRequestLocale({ countryCode: "CH" })).toEqual({
      locale: "de",
      source: "country",
    });
  });

  it("RU → ru locale", () => {
    expect(resolveRequestLocale({ countryCode: "RU" })).toEqual({
      locale: "ru",
      source: "country",
    });
  });
});

// ─── getCountryCodeFromHeaders — header precedence ──────────────────────────

describe("getCountryCodeFromHeaders — extended header precedence", () => {
  function makeHeaders(entries: Record<string, string>): Pick<Headers, "get"> {
    return { get: (name: string) => entries[name] ?? null };
  }

  it("reads x-country-code", () => {
    expect(getCountryCodeFromHeaders(makeHeaders({ "x-country-code": "IT" }))).toBe("IT");
  });

  it("reads x-geo-country", () => {
    expect(getCountryCodeFromHeaders(makeHeaders({ "x-geo-country": "ES" }))).toBe("ES");
  });

  it("x-vercel-ip-country wins over cf-ipcountry, x-country-code, x-geo-country", () => {
    expect(
      getCountryCodeFromHeaders(
        makeHeaders({
          "x-vercel-ip-country": "FR",
          "cf-ipcountry": "DE",
          "x-country-code": "IT",
          "x-geo-country": "ES",
        })
      )
    ).toBe("FR");
  });

  it("cf-ipcountry wins over x-country-code when vercel header absent", () => {
    expect(
      getCountryCodeFromHeaders(
        makeHeaders({
          "cf-ipcountry": "NL",
          "x-country-code": "TR",
        })
      )
    ).toBe("NL");
  });
});

// ─── APP_ENABLE_GEO_LOCALE env flag ─────────────────────────────────────────

describe("APP_ENABLE_GEO_LOCALE env flag", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("when APP_ENABLE_GEO_LOCALE=false, country code is ignored and falls back", () => {
    vi.stubEnv("APP_ENABLE_GEO_LOCALE", "false");
    const result = resolveRequestLocale({ countryCode: "DE" });
    expect(result.source).not.toBe("country");
    expect(result).toEqual({ locale: "tr", source: "fallback" });
  });

  it("when APP_GEO_FALLBACK_LOCALE=en, fallback returns en", () => {
    vi.stubEnv("APP_GEO_FALLBACK_LOCALE", "en");
    const result = resolveRequestLocale({});
    expect(result).toEqual({ locale: "en", source: "fallback" });
  });
});
