import type {
  AddressAutocompleteInput,
  AddressProvider,
  AddressRetrieveInput,
  AddressSuggestion,
  NormalizedAddressResult,
} from "../address-provider.interface";

export class OsmAddressProvider implements AddressProvider {
  readonly name = "osm";

  async autocomplete(_input: AddressAutocompleteInput): Promise<AddressSuggestion[]> {
    throw new Error("OsmAddressProvider is not implemented yet.");
  }

  async retrieve(_input: AddressRetrieveInput): Promise<NormalizedAddressResult> {
    throw new Error("OsmAddressProvider is not implemented yet.");
  }
}

