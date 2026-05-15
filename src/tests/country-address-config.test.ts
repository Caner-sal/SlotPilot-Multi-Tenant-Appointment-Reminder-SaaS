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

  it("default config has empty phoneCountryCode — no +90 hardcode for unknown countries", () => {
    const config = getCountryAddressConfig("ZZ");
    expect(config.phoneCountryCode).toBe("");
  });

  it("returns +31 for NL", () => {
    expect(getCountryAddressConfig("NL").phoneCountryCode).toBe("+31");
  });

  it("returns +44 for GB", () => {
    expect(getCountryAddressConfig("GB").phoneCountryCode).toBe("+44");
  });

  it("returns +1 for CA", () => {
    expect(getCountryAddressConfig("CA").phoneCountryCode).toBe("+1");
  });

  it("returns +61 for AU", () => {
    expect(getCountryAddressConfig("AU").phoneCountryCode).toBe("+61");
  });

  it("returns +90 for TR", () => {
    expect(getCountryAddressConfig("TR").phoneCountryCode).toBe("+90");
  });
});

