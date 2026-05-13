export interface AddressAutocompleteInput {
  query: string;
  countryCode?: string;
  locale?: string;
  sessionToken?: string;
  limit?: number;
}

export interface AddressSuggestion {
  provider: string;
  placeId: string;
  label: string;
  secondaryLabel?: string;
  countryCode?: string;
}

export interface AddressRetrieveInput {
  placeId: string;
  locale?: string;
  sessionToken?: string;
}

export interface ReverseGeocodeInput {
  latitude: number;
  longitude: number;
  locale?: string;
}

export interface NormalizedAddressResult {
  countryCode?: string;
  countryName?: string;
  adminLevel1?: string;
  adminLevel2?: string;
  adminLevel3?: string;
  locality?: string;
  subLocality?: string;
  postalCode?: string;
  street?: string;
  streetNumber?: string;
  formattedAddress: string;
  latitude?: number;
  longitude?: number;
  provider: string;
  providerPlaceId: string;
  language?: string;
  rawProviderPayloadSafe?: Record<string, unknown>;
}

export interface AddressProvider {
  readonly name: string;
  autocomplete(input: AddressAutocompleteInput): Promise<AddressSuggestion[]>;
  retrieve(input: AddressRetrieveInput): Promise<NormalizedAddressResult>;
  reverseGeocode?(input: ReverseGeocodeInput): Promise<NormalizedAddressResult>;
}

