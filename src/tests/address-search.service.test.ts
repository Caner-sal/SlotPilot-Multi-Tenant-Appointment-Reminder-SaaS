import { describe, expect, it } from "vitest";
import { autocompleteAddress, enforceAutocompleteRateLimit } from "@/services/address/address-search.service";

describe("address search service guards", () => {
  it("does not call providers before min chars", async () => {
    const result = await autocompleteAddress({ query: "ab" });
    expect(result).toEqual([]);
  });

  it("enforces per-minute rate limit", () => {
    process.env.ADDRESS_AUTOCOMPLETE_RATE_LIMIT_PER_MINUTE = "2";
    const ip = "192.0.2.11";
    enforceAutocompleteRateLimit(ip);
    enforceAutocompleteRateLimit(ip);
    expect(() => enforceAutocompleteRateLimit(ip)).toThrow("RATE_LIMITED");
    delete process.env.ADDRESS_AUTOCOMPLETE_RATE_LIMIT_PER_MINUTE;
  });
});

