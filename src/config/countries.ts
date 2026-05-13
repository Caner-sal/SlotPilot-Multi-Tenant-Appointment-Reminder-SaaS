export type CountryCode = "TR" | "IT" | "US" | "DE" | "FR" | "ES" | "GB" | "NL";

export type AddressMode = "structured-local" | "provider";

export interface CountryConfig {
  code: CountryCode;
  name: string;
  nativeName: string;
  locale: string;
  currency: string;
  addressMode: AddressMode;
  cityLabelKey: string;
  allCitiesLabelKey: string;
}

export const COUNTRIES: readonly CountryConfig[] = [
  {
    code: "TR",
    name: "Turkey",
    nativeName: "Turkiye",
    locale: "tr-TR",
    currency: "TRY",
    addressMode: "structured-local",
    cityLabelKey: "address.province",
    allCitiesLabelKey: "marketplace.allProvinces",
  },
  {
    code: "IT",
    name: "Italy",
    nativeName: "Italia",
    locale: "it-IT",
    currency: "EUR",
    addressMode: "provider",
    cityLabelKey: "address.locality",
    allCitiesLabelKey: "marketplace.allCities",
  },
  {
    code: "US",
    name: "United States",
    nativeName: "United States",
    locale: "en-US",
    currency: "USD",
    addressMode: "provider",
    cityLabelKey: "address.city",
    allCitiesLabelKey: "marketplace.allCities",
  },
  {
    code: "DE",
    name: "Germany",
    nativeName: "Deutschland",
    locale: "de-DE",
    currency: "EUR",
    addressMode: "provider",
    cityLabelKey: "address.city",
    allCitiesLabelKey: "marketplace.allCities",
  },
  {
    code: "FR",
    name: "France",
    nativeName: "France",
    locale: "fr-FR",
    currency: "EUR",
    addressMode: "provider",
    cityLabelKey: "address.city",
    allCitiesLabelKey: "marketplace.allCities",
  },
  {
    code: "ES",
    name: "Spain",
    nativeName: "Espana",
    locale: "es-ES",
    currency: "EUR",
    addressMode: "provider",
    cityLabelKey: "address.city",
    allCitiesLabelKey: "marketplace.allCities",
  },
  {
    code: "GB",
    name: "United Kingdom",
    nativeName: "United Kingdom",
    locale: "en-GB",
    currency: "GBP",
    addressMode: "provider",
    cityLabelKey: "address.city",
    allCitiesLabelKey: "marketplace.allCities",
  },
  {
    code: "NL",
    name: "Netherlands",
    nativeName: "Nederland",
    locale: "nl-NL",
    currency: "EUR",
    addressMode: "provider",
    cityLabelKey: "address.city",
    allCitiesLabelKey: "marketplace.allCities",
  },
];

export function getCountryConfig(countryCode: string | null | undefined): CountryConfig | null {
  if (!countryCode) return null;
  const normalized = countryCode.toUpperCase();
  return COUNTRIES.find((country) => country.code === normalized) ?? null;
}

