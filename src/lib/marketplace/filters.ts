export interface MarketplaceFilterState {
  q: string;
  category: string;
  province: string;
  countryCode: string;
  locality: string;
}

export function isTurkeyCountry(countryCode: string): boolean {
  return countryCode.toUpperCase() === "TR";
}

export function buildMarketplaceQueryParams(state: MarketplaceFilterState): URLSearchParams {
  const params = new URLSearchParams();
  const trSelected = isTurkeyCountry(state.countryCode);

  if (state.q) params.set("q", state.q);
  if (state.category) params.set("category", state.category);
  if (state.countryCode) {
    params.set("country", state.countryCode);
    params.set("countryCode", state.countryCode);
  }
  if (trSelected && state.province) {
    params.set("province", state.province);
  }
  if (!trSelected && state.locality) {
    params.set("locality", state.locality);
  }

  return params;
}

