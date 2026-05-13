import { describe, expect, it } from "vitest";
import { getCountryAddressConfig } from "@/config/country-address-config";

describe("country address config", () => {
  it("keeps turkey shape for TR", () => {
    const config = getCountryAddressConfig("TR");
    expect(config.labels.adminLevel1).toBe("province");
    expect(config.labels.adminLevel2).toBe("district");
    expect(config.fields.postalCode).toBe(false);
  });

  it("uses state/zip for US", () => {
    const config = getCountryAddressConfig("US");
    expect(config.labels.adminLevel1).toBe("state");
    expect(config.labels.postalCode).toBe("zipCode");
    expect(config.fields.postalCode).toBe(true);
  });

  it("falls back to default config for unknown country", () => {
    const config = getCountryAddressConfig("ZZ");
    expect(config.countryCode).toBe("TR");
  });
});

