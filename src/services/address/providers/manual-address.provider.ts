import type {
  AddressAutocompleteInput,
  AddressProvider,
  AddressRetrieveInput,
  AddressSuggestion,
  NormalizedAddressResult,
} from "../address-provider.interface";

export class ManualAddressProvider implements AddressProvider {
  readonly name = "manual";

  async autocomplete(input: AddressAutocompleteInput): Promise<AddressSuggestion[]> {
    if (!input.query.trim()) return [];
    return [
      {
        provider: this.name,
        placeId: `manual:${input.query}`,
        label: input.query,
        secondaryLabel: "Manual entry",
        countryCode: input.countryCode,
      },
    ];
  }

  async retrieve(input: AddressRetrieveInput): Promise<NormalizedAddressResult> {
    const formattedAddress = input.placeId.startsWith("manual:")
      ? input.placeId.slice("manual:".length)
      : input.placeId;

    return {
      formattedAddress,
      provider: this.name,
      providerPlaceId: input.placeId,
      language: input.locale,
      rawProviderPayloadSafe: {
        placeId: input.placeId,
      },
    };
  }
}

