import { afterEach, describe, expect, it, vi } from "vitest";
import { getAddressProvider, getAddressProviderWithFallback } from "@/services/address/address-provider.factory";
import { ManualAddressProvider } from "@/services/address/providers/manual-address.provider";
import { GoogleAddressProvider } from "@/services/address/providers/google-address.provider";
import { normalizeGooglePlace } from "@/services/address/provider-normalizer";

describe("address provider factory", () => {
  afterEach(() => {
    delete process.env.ADDRESS_PROVIDER;
    delete process.env.ADDRESS_PROVIDER_FALLBACK;
    delete process.env.GOOGLE_PLACES_API_KEY;
    vi.restoreAllMocks();
  });

  it("returns manual provider by default", () => {
    const provider = getAddressProvider();
    expect(provider).toBeInstanceOf(ManualAddressProvider);
  });

  it("returns google provider when configured", () => {
    const provider = getAddressProvider("google");
    expect(provider).toBeInstanceOf(GoogleAddressProvider);
  });

  it("selects primary provider from env", () => {
    process.env.ADDRESS_PROVIDER = "google";
    process.env.ADDRESS_PROVIDER_FALLBACK = "manual";
    const provider = getAddressProviderWithFallback();
    expect(provider).toBeInstanceOf(GoogleAddressProvider);
  });
});

describe("manual provider", () => {
  it("returns synthetic suggestion and retrieve payload", async () => {
    const provider = new ManualAddressProvider();
    const suggestions = await provider.autocomplete({ query: "Madrid, Spain", countryCode: "ES" });
    expect(suggestions[0]?.label).toBe("Madrid, Spain");
    const retrieved = await provider.retrieve({ placeId: suggestions[0].placeId, locale: "es" });
    expect(retrieved.provider).toBe("manual");
    expect(retrieved.formattedAddress).toBe("Madrid, Spain");
  });
});

describe("google normalizer", () => {
  it("normalizes core address fields", () => {
    const normalized = normalizeGooglePlace(
      {
        place_id: "abc",
        formatted_address: "Berlin, Germany",
        address_components: [
          { long_name: "Germany", short_name: "DE", types: ["country"] },
          { long_name: "Berlin", short_name: "BE", types: ["administrative_area_level_1"] },
          { long_name: "Berlin", short_name: "Berlin", types: ["locality"] },
          { long_name: "10115", short_name: "10115", types: ["postal_code"] },
        ],
        geometry: { location: { lat: 52.52, lng: 13.405 } },
      },
      "de",
    );

    expect(normalized.countryCode).toBe("DE");
    expect(normalized.locality).toBe("Berlin");
    expect(normalized.postalCode).toBe("10115");
    expect(normalized.providerPlaceId).toBe("abc");
  });
});

describe("google provider safety", () => {
  it("throws a clear error when api key is missing", async () => {
    const provider = new GoogleAddressProvider();
    await expect(
      provider.autocomplete({ query: "Berlin" }),
    ).rejects.toThrow(/GOOGLE_PLACES_API_KEY/i);
  });
});
