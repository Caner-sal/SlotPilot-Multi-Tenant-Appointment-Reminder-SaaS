import { COUNTRY_PHONE_CODES } from "@/data/country-phone-codes";

/**
 * Returns the E.164 calling code for the given ISO 3166-1 alpha-2 country code.
 * Returns empty string for unknown countries — never falls back to any hardcoded prefix.
 */
export function getCallingCodeForCountry(countryCode: string): string {
  if (!countryCode) return "";
  return COUNTRY_PHONE_CODES[countryCode.toUpperCase()] ?? "";
}
