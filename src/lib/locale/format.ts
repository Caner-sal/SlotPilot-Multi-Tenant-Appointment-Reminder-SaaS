import { defaultLocale, localeMetadata, resolveLocale, type AppLocale } from "@/i18n/locales";

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function normalizeLocale(locale?: string | null): AppLocale {
  return resolveLocale(locale ?? defaultLocale);
}

export function formatCurrency(
  amount: number,
  locale?: string | null,
  options?: { currency?: string; minimumFractionDigits?: number }
): string {
  const resolved = normalizeLocale(locale);
  const currency = options?.currency ?? localeMetadata[resolved].currency;
  return new Intl.NumberFormat(localeMetadata[resolved].dateLocale, {
    style: "currency",
    currency,
    minimumFractionDigits: options?.minimumFractionDigits,
  }).format(amount);
}

export function formatNumber(amount: number, locale?: string | null): string {
  const resolved = normalizeLocale(locale);
  return new Intl.NumberFormat(localeMetadata[resolved].dateLocale).format(amount);
}

export function formatDate(
  value: Date | string,
  locale?: string | null,
  options?: Intl.DateTimeFormatOptions
): string {
  const resolved = normalizeLocale(locale);
  return new Intl.DateTimeFormat(localeMetadata[resolved].dateLocale, options).format(toDate(value));
}

export function formatTime(
  value: Date | string,
  locale?: string | null,
  options?: Intl.DateTimeFormatOptions & { timeZone?: string }
): string {
  const resolved = normalizeLocale(locale);
  return new Intl.DateTimeFormat(localeMetadata[resolved].dateLocale, {
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(toDate(value));
}

export function formatDateTime(
  value: Date | string,
  locale?: string | null,
  options?: Intl.DateTimeFormatOptions & { timeZone?: string }
): string {
  const resolved = normalizeLocale(locale);
  return new Intl.DateTimeFormat(localeMetadata[resolved].dateLocale, {
    dateStyle: "medium",
    timeStyle: "short",
    ...options,
  }).format(toDate(value));
}
