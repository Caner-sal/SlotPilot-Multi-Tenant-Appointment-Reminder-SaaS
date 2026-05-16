export { getMarketConfig, MARKET_DEFAULTS, DEFAULT_COUNTRY, DEFAULT_LOCALE } from "@/config/locale-market";
export type { MarketConfig, LandingVariant } from "@/config/locale-market";

import { getMarketConfig } from "@/config/locale-market";
import { getCountryFromRequestHeaders } from "./detect-country";

/**
 * Returns the market config for the current request in Server Components.
 * Falls back to TR if no country header is present (local dev behaviour).
 */
export function getMarketConfigFromHeaders(headers: Pick<Headers, "get">) {
  const country = getCountryFromRequestHeaders(headers);
  return getMarketConfig(country);
}
