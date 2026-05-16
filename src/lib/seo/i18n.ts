import { locales, type AppLocale } from "@/i18n/locales";

const FALLBACK_BASE_URL = "http://localhost:3000";

export function getBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!fromEnv) return FALLBACK_BASE_URL;
  return fromEnv.replace(/\/+$/, "");
}

export function localePath(locale: AppLocale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

export function localeUrl(locale: AppLocale, path: string): string {
  return `${getBaseUrl()}${localePath(locale, path)}`;
}

export function localeAlternates(path: string): Record<string, string> {
  const entries = locales.map((locale) => [locale, localeUrl(locale, path)]);
  return Object.fromEntries(entries);
}

export function getSitemapPaths(): string[] {
  return ["/", "/login", "/register", "/marketplace", "/booking/barber-demo"];
}
