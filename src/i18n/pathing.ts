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
