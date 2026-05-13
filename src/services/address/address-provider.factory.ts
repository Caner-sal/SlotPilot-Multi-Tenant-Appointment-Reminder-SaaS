import type { AddressProvider } from "./address-provider.interface";
import { AppleMapKitAddressProvider } from "./providers/apple-mapkit-address.provider";
import { GoogleAddressProvider } from "./providers/google-address.provider";
import { ManualAddressProvider } from "./providers/manual-address.provider";
import { MapboxAddressProvider } from "./providers/mapbox-address.provider";
import { OsmAddressProvider } from "./providers/osm-address.provider";

const manualProvider = new ManualAddressProvider();

export function getAddressProvider(providerName = process.env.ADDRESS_PROVIDER): AddressProvider {
  switch ((providerName ?? "manual").toLowerCase()) {
    case "google":
      return new GoogleAddressProvider();
    case "mapbox":
      return new MapboxAddressProvider();
    case "apple":
    case "apple_mapkit":
      return new AppleMapKitAddressProvider();
    case "osm":
      return new OsmAddressProvider();
    case "manual":
    default:
      return manualProvider;
  }
}

export function getAddressProviderWithFallback(): AddressProvider {
  const primaryName = (process.env.ADDRESS_PROVIDER ?? "manual").toLowerCase();
  const fallbackName = (process.env.ADDRESS_PROVIDER_FALLBACK ?? "manual").toLowerCase();
  const primary = getAddressProvider(primaryName);
  const fallback = getAddressProvider(fallbackName);

  if (primaryName === fallbackName) {
    return primary;
  }

  return {
    name: primary.name,
    async autocomplete(input) {
      try {
        return await primary.autocomplete(input);
      } catch (error) {
        console.warn(
          `[address] Provider "${primaryName}" autocomplete failed. Falling back to "${fallbackName}".`,
          error,
        );
        return fallback.autocomplete(input);
      }
    },
    async retrieve(input) {
      try {
        return await primary.retrieve(input);
      } catch (error) {
        console.warn(
          `[address] Provider "${primaryName}" retrieve failed. Falling back to "${fallbackName}".`,
          error,
        );
        return fallback.retrieve(input);
      }
    },
    async reverseGeocode(input) {
      if (!primary.reverseGeocode && !fallback.reverseGeocode) {
        throw new Error("Reverse geocode is not supported by configured address providers.");
      }
      try {
        if (!primary.reverseGeocode) {
          throw new Error(`Provider "${primaryName}" does not support reverse geocode.`);
        }
        return await primary.reverseGeocode(input);
      } catch (error) {
        if (!fallback.reverseGeocode) {
          throw error;
        }
        console.warn(
          `[address] Provider "${primaryName}" reverse geocode failed. Falling back to "${fallbackName}".`,
          error,
        );
        return fallback.reverseGeocode(input);
      }
    },
  };
}
