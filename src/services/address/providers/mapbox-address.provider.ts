import type {
  AddressAutocompleteInput,
  AddressProvider,
  AddressRetrieveInput,
  AddressSuggestion,
  NormalizedAddressResult,
} from "../address-provider.interface";

export class MapboxAddressProvider implements AddressProvider {
  readonly name = "mapbox";

  async autocomplete(_input: AddressAutocompleteInput): Promise<AddressSuggestion[]> {
    throw new Error("MapboxAddressProvider is not implemented yet.");
  }

  async retrieve(_input: AddressRetrieveInput): Promise<NormalizedAddressResult> {
    throw new Error("MapboxAddressProvider is not implemented yet.");
  }
}

