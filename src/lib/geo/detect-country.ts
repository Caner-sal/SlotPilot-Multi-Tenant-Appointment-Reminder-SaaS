export { getCountryCodeFromHeaders } from "@/i18n/request-locale";

/**
 * Returns country code from request headers in Server Components / Route Handlers.
 * Priority: x-vercel-ip-country → cf-ipcountry → x-country-code → x-geo-country.
 * Returns the middleware-resolved value from x-app-country-code if available.
 */
export function getCountryFromRequestHeaders(headers: Pick<Headers, "get">): string | null {
  const appCountry = headers.get("x-app-country-code");
  if (appCountry) return appCountry.toUpperCase();

  const possibleHeaders = [
    "x-vercel-ip-country",
    "cf-ipcountry",
    "x-country-code",
    "x-geo-country",
  ];
  for (const name of possibleHeaders) {
    const value = headers.get(name);
    if (value && value !== "XX") return value.toUpperCase();
  }
  return null;
}
