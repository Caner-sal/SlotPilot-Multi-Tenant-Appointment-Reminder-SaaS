import type {
  AddressAutocompleteInput,
  AddressProvider,
  AddressRetrieveInput,
  AddressSuggestion,
  NormalizedAddressResult,
} from "../address-provider.interface";
import { normalizeGooglePlace } from "../provider-normalizer";

const GOOGLE_AUTOCOMPLETE_URL =
  "https://maps.googleapis.com/maps/api/place/autocomplete/json";
const GOOGLE_DETAILS_URL =
  "https://maps.googleapis.com/maps/api/place/details/json";

function getApiKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY ?? process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new Error("Google Places is not configured. Set GOOGLE_PLACES_API_KEY.");
  }
  return key;
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export class GoogleAddressProvider implements AddressProvider {
  readonly name = "google";

  async autocomplete(input: AddressAutocompleteInput): Promise<AddressSuggestion[]> {
    const apiKey = getApiKey();
    const url = new URL(GOOGLE_AUTOCOMPLETE_URL);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("input", input.query);
    if (input.locale) url.searchParams.set("language", input.locale);
    if (input.countryCode) url.searchParams.set("components", `country:${input.countryCode}`);
    if (input.sessionToken) url.searchParams.set("sessiontoken", input.sessionToken);

    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    const payload = (await safeJson(response)) as {
      status?: string;
      predictions?: Array<{
        place_id: string;
        description: string;
        structured_formatting?: {
          secondary_text?: string;
        };
        terms?: Array<{ value?: string }>;
      }>;
      error_message?: string;
    };

    if (!response.ok || payload.status === "REQUEST_DENIED" || payload.status === "INVALID_REQUEST") {
      throw new Error(payload.error_message ?? "Google autocomplete failed");
    }

    return (payload.predictions ?? []).slice(0, input.limit ?? 7).map((item) => ({
      provider: this.name,
      placeId: item.place_id,
      label: item.description,
      secondaryLabel: item.structured_formatting?.secondary_text,
      countryCode: item.terms?.at(-1)?.value,
    }));
  }

  async retrieve(input: AddressRetrieveInput): Promise<NormalizedAddressResult> {
    const apiKey = getApiKey();
    const url = new URL(GOOGLE_DETAILS_URL);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("place_id", input.placeId);
    url.searchParams.set(
      "fields",
      "place_id,formatted_address,address_component,geometry/location",
    );
    if (input.locale) url.searchParams.set("language", input.locale);
    if (input.sessionToken) url.searchParams.set("sessiontoken", input.sessionToken);

    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    const payload = (await safeJson(response)) as {
      status?: string;
      result?: {
        place_id?: string;
        formatted_address?: string;
        address_components?: Array<{
          long_name: string;
          short_name: string;
          types: string[];
        }>;
        geometry?: {
          location?: {
            lat?: number;
            lng?: number;
          };
        };
      };
      error_message?: string;
    };

    if (!response.ok || payload.status !== "OK" || !payload.result) {
      throw new Error(payload.error_message ?? "Google place details failed");
    }

    return normalizeGooglePlace(payload.result, input.locale);
  }
}

