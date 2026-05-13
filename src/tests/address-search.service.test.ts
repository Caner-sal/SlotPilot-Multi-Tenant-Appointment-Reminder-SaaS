import { afterEach, describe, expect, it } from "vitest";
import { autocompleteAddress, enforceAutocompleteRateLimit } from "@/services/address/address-search.service";

describe("address search service guards", () => {
  afterEach(() => {
    delete process.env.ADDRESS_PROVIDER;
    delete process.env.ADDRESS_PROVIDER_FALLBACK;
    delete process.env.GOOGLE_PLACES_API_KEY;
    delete process.env.GOOGLE_MAPS_API_KEY;
    delete process.env.ADDRESS_AUTOCOMPLETE_RATE_LIMIT_PER_MINUTE;
  });

  it("does not call providers before min chars", async () => {
    const result = await autocompleteAddress({ query: "ab" });
    expect(result).toEqual([]);
  });

  it("uses manual fallback for non-TR locality search when provider config is missing", async () => {
    process.env.ADDRESS_PROVIDER = "google";
    process.env.ADDRESS_PROVIDER_FALLBACK = "manual";

    const result = await autocompleteAddress({
      query: "Roma",
      countryCode: "IT",
    });

    expect(result[0]?.provider).toBe("manual");
    expect(result[0]?.label).toBe("Roma");
    expect(result[0]?.countryCode).toBe("IT");
  });

  it("enforces per-minute rate limit", () => {
    process.env.ADDRESS_AUTOCOMPLETE_RATE_LIMIT_PER_MINUTE = "2";
    const ip = "192.0.2.11";
    enforceAutocompleteRateLimit(ip);
    enforceAutocompleteRateLimit(ip);
    expect(() => enforceAutocompleteRateLimit(ip)).toThrow("RATE_LIMITED");
  });
});
