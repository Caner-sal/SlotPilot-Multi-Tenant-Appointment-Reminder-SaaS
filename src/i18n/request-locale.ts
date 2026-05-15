import {
  isAppLocale,
  locales,
  resolveLocale,
  type AppLocale,
} from "./locales";

export type LocaleSource =
  | "route"
  | "cookie"
  | "user"
  | "country"
  | "accept-language"
  | "fallback";

export interface ResolveRequestLocaleContext {
  routeLocale?: string | null;
  cookieLocale?: string | null;
  userPreferredLocale?: string | null;
  countryCode?: string | null;
  acceptLanguage?: string | null;
  fallbackLocale?: string | null;
}

export interface ResolvedRequestLocale {
  locale: AppLocale;
  source: LocaleSource;
}

const countryLocaleMap: Record<string, AppLocale> = {
  TR: "tr",
  GB: "en",
  US: "en",
  CA: "en",
  AU: "en",
  IE: "en",
  NZ: "en",
  IN: "en",
  PH: "en",
  ZA: "en",
  DE: "de",
  AT: "de",
  CH: "de",
  LI: "de",
  SA: "ar",
  AE: "ar",
  QA: "ar",
  KW: "ar",
  BH: "ar",
  OM: "ar",
  JO: "ar",
  LB: "ar",
  IQ: "ar",
  EG: "ar",
  MA: "ar",
  DZ: "ar",
  TN: "ar",
  ES: "es",
  MX: "es",
  AR: "es",
  CO: "es",
  CL: "es",
  PE: "es",
  VE: "es",
  UY: "es",
  BO: "es",
  PY: "es",
  CR: "es",
  PA: "es",
  DO: "es",
  GT: "es",
  HN: "es",
  NI: "es",
  SV: "es",
  FR: "fr",
  BE: "fr",
  MC: "fr",
  IT: "it",
  SM: "it",
  VA: "it",
  IR: "fa",
  AF: "fa",
  RU: "ru",
  BY: "ru",
  KZ: "ru",
  NL: "nl",
  BE_nl: "nl",
};

const arabicCountries = new Set([
  "SA",
  "AE",
  "QA",
  "KW",
  "BH",
  "OM",
  "JO",
  "LB",
  "IQ",
  "EG",
  "MA",
  "DZ",
  "TN",
  "LY",
  "SD",
  "SY",
  "YE",
  "PS",
  "MR",
  "SO",
  "DJ",
  "KM",
]);

function parseAcceptLanguage(headerValue: string | null | undefined): AppLocale | null {
  if (!headerValue) return null;
  const values = headerValue
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);

  for (const value of values) {
    const base = value.split(";")[0];
    const parts = base.split("-");
    const language = parts[0];
    if (isAppLocale(language)) return language;
  }

  return null;
}

function mapCountryToLocale(countryCode: string | null | undefined): AppLocale | null {
  if (!countryCode) return null;
  const normalizedCountryCode = countryCode.toUpperCase();
  if (arabicCountries.has(normalizedCountryCode)) return "ar";
  const mapped = countryLocaleMap[normalizedCountryCode];
  return mapped ?? null;
}

function resolveFallback(fallbackLocale?: string | null): AppLocale {
  if (fallbackLocale && isAppLocale(fallbackLocale)) return fallbackLocale;
  return "tr";
}

export function getCountryCodeFromHeaders(
  headers: Pick<Headers, "get">,
): string | null {
  const possibleHeaders = [
    "x-vercel-ip-country",
    "cf-ipcountry",
    "x-country-code",
    "x-geo-country",
  ];

  for (const name of possibleHeaders) {
    const value = headers.get(name);
    if (value) return value;
  }
  return null;
}

export function resolveRequestLocale(
  context: ResolveRequestLocaleContext,
): ResolvedRequestLocale {
  const fallbackLocale =
    resolveFallback(context.fallbackLocale ?? process.env.APP_GEO_FALLBACK_LOCALE);

  if (context.routeLocale && isAppLocale(context.routeLocale)) {
    return { locale: context.routeLocale, source: "route" };
  }

  if (context.cookieLocale && isAppLocale(context.cookieLocale)) {
    return { locale: context.cookieLocale, source: "cookie" };
  }

  if (context.userPreferredLocale && isAppLocale(context.userPreferredLocale)) {
    return { locale: context.userPreferredLocale, source: "user" };
  }

  const geoEnabled = process.env.APP_ENABLE_GEO_LOCALE !== "false";
  if (geoEnabled) {
    const countryLocale = mapCountryToLocale(context.countryCode);
    if (countryLocale && locales.includes(countryLocale)) {
      return { locale: countryLocale, source: "country" };
    }
  }

  const acceptLanguageLocale = parseAcceptLanguage(context.acceptLanguage);
  if (acceptLanguageLocale) {
    return { locale: acceptLanguageLocale, source: "accept-language" };
  }

  return { locale: resolveLocale(fallbackLocale), source: "fallback" };
}
