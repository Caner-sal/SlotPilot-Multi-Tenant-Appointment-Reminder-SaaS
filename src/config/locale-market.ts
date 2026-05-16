import type { AppLocale } from "@/i18n/locales";

export type LandingVariant = "turkey" | "global";

export interface MarketConfig {
  countryCode: string;
  defaultLocale: AppLocale;
  currency: string;
  landingVariant: LandingVariant;
  phoneCode: string;
}

export const MARKET_DEFAULTS: Record<string, MarketConfig> = {
  TR: { countryCode: "TR", defaultLocale: "tr", currency: "TRY", landingVariant: "turkey", phoneCode: "+90" },
  DE: { countryCode: "DE", defaultLocale: "de", currency: "EUR", landingVariant: "global", phoneCode: "+49" },
  AT: { countryCode: "AT", defaultLocale: "de", currency: "EUR", landingVariant: "global", phoneCode: "+43" },
  CH: { countryCode: "CH", defaultLocale: "de", currency: "CHF", landingVariant: "global", phoneCode: "+41" },
  IT: { countryCode: "IT", defaultLocale: "it", currency: "EUR", landingVariant: "global", phoneCode: "+39" },
  US: { countryCode: "US", defaultLocale: "en", currency: "USD", landingVariant: "global", phoneCode: "+1" },
  GB: { countryCode: "GB", defaultLocale: "en", currency: "GBP", landingVariant: "global", phoneCode: "+44" },
  FR: { countryCode: "FR", defaultLocale: "fr", currency: "EUR", landingVariant: "global", phoneCode: "+33" },
  ES: { countryCode: "ES", defaultLocale: "es", currency: "EUR", landingVariant: "global", phoneCode: "+34" },
  NL: { countryCode: "NL", defaultLocale: "nl", currency: "EUR", landingVariant: "global", phoneCode: "+31" },
  RU: { countryCode: "RU", defaultLocale: "ru", currency: "RUB", landingVariant: "global", phoneCode: "+7" },
  SA: { countryCode: "SA", defaultLocale: "ar", currency: "SAR", landingVariant: "global", phoneCode: "+966" },
  AE: { countryCode: "AE", defaultLocale: "ar", currency: "AED", landingVariant: "global", phoneCode: "+971" },
  IR: { countryCode: "IR", defaultLocale: "fa", currency: "IRR", landingVariant: "global", phoneCode: "+98" },
};

export const DEFAULT_COUNTRY = "TR";
export const DEFAULT_LOCALE: AppLocale = "tr";

const GLOBAL_FALLBACK: MarketConfig = {
  countryCode: "XX",
  defaultLocale: "en",
  currency: "USD",
  landingVariant: "global",
  phoneCode: "",
};

export function getMarketConfig(countryCode: string | null | undefined): MarketConfig {
  if (!countryCode) return { ...MARKET_DEFAULTS.TR };
  const normalized = countryCode.toUpperCase();
  return MARKET_DEFAULTS[normalized] ?? { ...GLOBAL_FALLBACK, countryCode: normalized };
}
