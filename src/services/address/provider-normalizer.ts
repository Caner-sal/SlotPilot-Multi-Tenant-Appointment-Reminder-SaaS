import type { NormalizedAddressResult } from "./address-provider.interface";

interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GooglePlaceDetailLike {
  place_id?: string;
  formatted_address?: string;
  address_components?: GoogleAddressComponent[];
  geometry?: {
    location?: {
      lat?: number;
      lng?: number;
    };
  };
}

function pickComponent(
  components: GoogleAddressComponent[] | undefined,
  type: string,
  mode: "long" | "short" = "long",
): string | undefined {
  const component = components?.find((item) => item.types.includes(type));
  if (!component) return undefined;
  return mode === "short" ? component.short_name : component.long_name;
}

export function normalizeGooglePlace(
  place: GooglePlaceDetailLike,
  locale?: string,
): NormalizedAddressResult {
  const components = place.address_components ?? [];
  return {
    countryCode: pickComponent(components, "country", "short"),
    countryName: pickComponent(components, "country", "long"),
    adminLevel1: pickComponent(components, "administrative_area_level_1", "long"),
    adminLevel2: pickComponent(components, "administrative_area_level_2", "long"),
    adminLevel3: pickComponent(components, "administrative_area_level_3", "long"),
    locality:
      pickComponent(components, "locality", "long") ??
      pickComponent(components, "postal_town", "long"),
    subLocality:
      pickComponent(components, "sublocality_level_1", "long") ??
      pickComponent(components, "sublocality", "long"),
    postalCode: pickComponent(components, "postal_code", "long"),
    street: pickComponent(components, "route", "long"),
    streetNumber: pickComponent(components, "street_number", "long"),
    formattedAddress: place.formatted_address ?? "",
    latitude: place.geometry?.location?.lat,
    longitude: place.geometry?.location?.lng,
    provider: "google",
    providerPlaceId: place.place_id ?? "",
    language: locale,
    rawProviderPayloadSafe: {
      place_id: place.place_id,
      formatted_address: place.formatted_address,
      address_components: components,
      geometry: place.geometry,
    },
  };
}

