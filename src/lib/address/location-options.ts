import { TURKEY_PROVINCES } from "@/data/turkey-provinces";

export interface LocationOption {
  value: string;
  label: string;
  type: "province";
}

export function getLocationOptionsForCountry(countryCode: string): LocationOption[] {
  if (countryCode.toUpperCase() !== "TR") {
    return [];
  }

  return TURKEY_PROVINCES.map((province) => ({
    value: province.slug,
    label: province.name,
    type: "province",
  }));
}

