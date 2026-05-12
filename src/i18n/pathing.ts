import { isAppLocale, type AppLocale } from "./locales";

export function extractLocale(pathname: string): { locale: AppLocale | null; internalPath: string } {
  const parts = pathname.split("/").filter(Boolean);
  const maybeLocale = parts[0];

  if (!maybeLocale || !isAppLocale(maybeLocale)) {
    return { locale: null, internalPath: pathname };
  }

  const rest = parts.slice(1);
  return {
    locale: maybeLocale,
    internalPath: rest.length > 0 ? `/${rest.join("/")}` : "/",
  };
}

export function withLocale(pathname: string, locale: AppLocale): string {
  if (pathname === "/") return `/${locale}`;
  return `/${locale}${pathname}`;
}

export function getLocaleFromPath(pathname: string): AppLocale | null {
  const first = pathname.split("/").filter(Boolean)[0];
  return isAppLocale(first) ? first : null;
}

export function replacePathLocale(pathname: string, locale: AppLocale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return `/${locale}`;
  if (isAppLocale(segments[0])) {
    segments[0] = locale;
    return `/${segments.join("/")}`;
  }
  return `/${locale}/${segments.join("/")}`;
}
