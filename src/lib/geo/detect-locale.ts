import type { AppLocale } from "@/i18n/locales";
import { resolveRequestLocale } from "@/i18n/request-locale";
import { getCountryFromRequestHeaders } from "./detect-country";

export type { LocaleSource, ResolvedRequestLocale } from "@/i18n/request-locale";

/**
 * Resolves the best locale from Server Component / Route Handler headers.
 * Respects the full priority chain: cookie → user → IP → Accept-Language → TR fallback.
 */
export function detectLocaleFromHeaders(
  headers: Pick<Headers, "get">,
  overrides?: { cookieLocale?: string; userPreferredLocale?: string },
): AppLocale {
  const countryCode = getCountryFromRequestHeaders(headers);
  const resolved = resolveRequestLocale({
    cookieLocale: overrides?.cookieLocale ?? headers.get("x-app-locale") ?? undefined,
    userPreferredLocale: overrides?.userPreferredLocale ?? undefined,
    countryCode,
    acceptLanguage: headers.get("accept-language"),
  });
  return resolved.locale;
}
