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
  const primary = process.env.ADDRESS_PROVIDER ?? "manual";
  const fallback = process.env.ADDRESS_PROVIDER_FALLBACK ?? "manual";
  try {
    return getAddressProvider(primary);
  } catch (error) {
    console.warn(
      `[address] Provider "${primary}" unavailable. Falling back to "${fallback}".`,
      error,
    );
    return getAddressProvider(fallback);
  }
}

