import { getAddressProviderWithFallback } from "./address-provider.factory";
import type {
  AddressRetrieveInput,
  AddressSuggestion,
  NormalizedAddressResult,
} from "./address-provider.interface";

const defaultRateLimit = 30;
const requestsByIp = new Map<string, { count: number; resetAt: number }>();

function getMinChars(): number {
  const parsed = Number(process.env.ADDRESS_AUTOCOMPLETE_MIN_CHARS ?? 3);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3;
}

function getRateLimitPerMinute(): number {
  const parsed = Number(process.env.ADDRESS_AUTOCOMPLETE_RATE_LIMIT_PER_MINUTE ?? defaultRateLimit);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultRateLimit;
}

export function enforceAutocompleteRateLimit(ipAddress: string): void {
  const key = ipAddress || "unknown";
  const now = Date.now();
  const limit = getRateLimitPerMinute();
  const existing = requestsByIp.get(key);

  if (!existing || existing.resetAt <= now) {
    requestsByIp.set(key, { count: 1, resetAt: now + 60_000 });
    return;
  }

  if (existing.count >= limit) {
    throw new Error("RATE_LIMITED");
  }

  existing.count += 1;
}

export async function autocompleteAddress(input: {
  query: string;
  countryCode?: string;
  locale?: string;
  sessionToken?: string;
}): Promise<AddressSuggestion[]> {
  const trimmed = input.query.trim();
  if (trimmed.length < getMinChars()) {
    return [];
  }

  const provider = getAddressProviderWithFallback();
  return provider.autocomplete({
    query: trimmed,
    countryCode: input.countryCode,
    locale: input.locale,
    sessionToken: input.sessionToken,
  });
}

export async function retrieveAddress(
  input: AddressRetrieveInput,
): Promise<NormalizedAddressResult> {
  const provider = getAddressProviderWithFallback();
  return provider.retrieve(input);
}

