export interface CountryAddressConfig {
  countryCode: string;
  phoneCountryCode: string;
  labels: {
    adminLevel1: string;
    adminLevel2: string;
    postalCode: string;
  };
  fields: {
    adminLevel1: boolean;
    adminLevel2: boolean;
    postalCode: boolean;
  };
}

const defaultConfig: CountryAddressConfig = {
  countryCode: "TR",
  phoneCountryCode: "+90",
  labels: {
    adminLevel1: "province",
    adminLevel2: "district",
    postalCode: "postalCode",
  },
  fields: {
    adminLevel1: true,
    adminLevel2: true,
    postalCode: false,
  },
};

const countryAddressConfigs: Record<string, CountryAddressConfig> = {
  TR: {
    countryCode: "TR",
    phoneCountryCode: "+90",
    labels: {
      adminLevel1: "province",
      adminLevel2: "district",
      postalCode: "postalCode",
    },
    fields: { adminLevel1: true, adminLevel2: true, postalCode: false },
  },
  US: {
    countryCode: "US",
    phoneCountryCode: "+1",
    labels: {
      adminLevel1: "state",
      adminLevel2: "city",
      postalCode: "zipCode",
    },
    fields: { adminLevel1: true, adminLevel2: true, postalCode: true },
  },
  DE: {
    countryCode: "DE",
    phoneCountryCode: "+49",
    labels: {
      adminLevel1: "state",
      adminLevel2: "city",
      postalCode: "postalCode",
    },
    fields: { adminLevel1: true, adminLevel2: true, postalCode: true },
  },
  FR: {
    countryCode: "FR",
    phoneCountryCode: "+33",
    labels: {
      adminLevel1: "region",
      adminLevel2: "city",
      postalCode: "postalCode",
    },
    fields: { adminLevel1: true, adminLevel2: true, postalCode: true },
  },
  IT: {
    countryCode: "IT",
    phoneCountryCode: "+39",
    labels: {
      adminLevel1: "region",
      adminLevel2: "city",
      postalCode: "postalCode",
    },
    fields: { adminLevel1: true, adminLevel2: true, postalCode: true },
  },
  ES: {
    countryCode: "ES",
    phoneCountryCode: "+34",
    labels: {
      adminLevel1: "region",
      adminLevel2: "city",
      postalCode: "postalCode",
    },
    fields: { adminLevel1: true, adminLevel2: true, postalCode: true },
  },
};

export function getCountryAddressConfig(countryCode: string | null | undefined): CountryAddressConfig {
  if (!countryCode) return defaultConfig;
  return countryAddressConfigs[countryCode.toUpperCase()] ?? defaultConfig;
}

export const tier1CountryCodes = ["TR", "US", "GB", "DE", "FR", "IT", "ES", "NL", "CA", "AU"] as const;

