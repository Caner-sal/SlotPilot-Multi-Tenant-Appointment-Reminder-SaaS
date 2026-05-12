export const locales = ["tr", "en", "de", "ar", "es", "fr", "it", "fa", "ru", "nl"] as const;

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
    nativeLabel: "Turkce",
    flag: "\uD83C\uDDF9\uD83C\uDDF7",
    direction: "ltr",
    currency: "TRY",
    dateLocale: "tr-TR"
  },
  en: {
    label: "English",
    nativeLabel: "English",
    flag: "\uD83C\uDDEC\uD83C\uDDE7",
    direction: "ltr",
    currency: "USD",
    dateLocale: "en-US"
  },
  de: {
    label: "German",
    nativeLabel: "Deutsch",
    flag: "\uD83C\uDDE9\uD83C\uDDEA",
    direction: "ltr",
    currency: "EUR",
    dateLocale: "de-DE"
  },
  ar: {
    label: "Arabic",
    nativeLabel: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629",
    flag: "\uD83C\uDDF8\uD83C\uDDE6",
    direction: "rtl",
    currency: "USD",
    dateLocale: "ar-SA"
  },
  es: {
    label: "Spanish",
    nativeLabel: "Español",
    flag: "\uD83C\uDDEA\uD83C\uDDF8",
    direction: "ltr",
    currency: "EUR",
    dateLocale: "es-ES"
  },
  fr: {
    label: "French",
    nativeLabel: "Français",
    flag: "\uD83C\uDDEB\uD83C\uDDF7",
    direction: "ltr",
    currency: "EUR",
    dateLocale: "fr-FR"
  },
  it: {
    label: "Italian",
    nativeLabel: "Italiano",
    flag: "\uD83C\uDDEE\uD83C\uDDF9",
    direction: "ltr",
    currency: "EUR",
    dateLocale: "it-IT"
  },
  fa: {
    label: "Persian",
    nativeLabel: "فارسی",
    flag: "\uD83C\uDDEE\uD83C\uDDF7",
    direction: "rtl",
    currency: "USD",
    dateLocale: "fa-IR"
  },
  ru: {
    label: "Russian",
    nativeLabel: "Русский",
    flag: "\uD83C\uDDF7\uD83C\uDDFA",
    direction: "ltr",
    currency: "RUB",
    dateLocale: "ru-RU"
  },
  nl: {
    label: "Dutch",
    nativeLabel: "Nederlands",
    flag: "\uD83C\uDDF3\uD83C\uDDF1",
    direction: "ltr",
    currency: "EUR",
    dateLocale: "nl-NL"
  }
};

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  if (!value) return false;
  return locales.includes(value as AppLocale);
}

export function resolveLocale(value: string | null | undefined): AppLocale {
  return isAppLocale(value) ? value : defaultLocale;
}
