import type {
  AddressAutocompleteInput,
  AddressProvider,
  AddressRetrieveInput,
  AddressSuggestion,
  NormalizedAddressResult,
} from "../address-provider.interface";

export class AppleMapKitAddressProvider implements AddressProvider {
  readonly name = "apple";

  async autocomplete(_input: AddressAutocompleteInput): Promise<AddressSuggestion[]> {
    throw new Error("AppleMapKitAddressProvider is not implemented yet.");
  }

  async retrieve(_input: AddressRetrieveInput): Promise<NormalizedAddressResult> {
    throw new Error("AppleMapKitAddressProvider is not implemented yet.");
  }
}

