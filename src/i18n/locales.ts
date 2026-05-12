export const locales = ["tr", "en", "de", "ar"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "tr";

export const localeCookieName = "NEXT_LOCALE";

export const localeMetadata: Record<
  AppLocale,
  {
    label: string;
    nativeLabel: string;
    flag: string;
    direction: "ltr" | "rtl";
    currency: string;
    dateLocale: string;
  }
> = {
  tr: {
    label: "Turkish",
    nativeLabel: "Türkçe",
    flag: "🇹🇷",
    direction: "ltr",
    currency: "TRY",
    dateLocale: "tr-TR",
  },
  en: {
    label: "English",
    nativeLabel: "English",
    flag: "🇬🇧",
    direction: "ltr",
    currency: "USD",
    dateLocale: "en-US",
  },
  de: {
    label: "German",
    nativeLabel: "Deutsch",
    flag: "🇩🇪",
    direction: "ltr",
    currency: "EUR",
    dateLocale: "de-DE",
  },
  ar: {
    label: "Arabic",
    nativeLabel: "العربية",
    flag: "🇸🇦",
    direction: "rtl",
    currency: "USD",
    dateLocale: "ar-SA",
  },
};

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  if (!value) return false;
  return locales.includes(value as AppLocale);
}

export function resolveLocale(value: string | null | undefined): AppLocale {
  return isAppLocale(value) ? value : defaultLocale;
}
