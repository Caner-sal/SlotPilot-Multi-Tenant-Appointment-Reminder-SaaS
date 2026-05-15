import { describe, expect, it } from "vitest";
import { COUNTRY_PHONE_CODES } from "@/data/country-phone-codes";
import { getCallingCodeForCountry } from "@/lib/phone/country-calling-code";

describe("COUNTRY_PHONE_CODES", () => {
  it("all COUNTRY_OPTIONS tier-1 countries have a dial code", () => {
    const tier1 = ["TR", "US", "GB", "DE", "FR", "IT", "ES", "NL", "CA", "AU"];
    for (const code of tier1) {
      expect(COUNTRY_PHONE_CODES[code], `Missing dial code for ${code}`).toMatch(/^\+\d/);
    }
  });

  it("all dial codes start with +", () => {
    for (const [iso, code] of Object.entries(COUNTRY_PHONE_CODES)) {
      expect(code, `${iso} dial code must start with +`).toMatch(/^\+/);
    }
  });

  it("all ISO codes are uppercase 2-letter strings", () => {
    for (const iso of Object.keys(COUNTRY_PHONE_CODES)) {
      expect(iso).toMatch(/^[A-Z]{2}$/);
    }
  });

  it("TR maps to +90", () => expect(COUNTRY_PHONE_CODES["TR"]).toBe("+90"));
  it("DE maps to +49", () => expect(COUNTRY_PHONE_CODES["DE"]).toBe("+49"));
  it("NL maps to +31", () => expect(COUNTRY_PHONE_CODES["NL"]).toBe("+31"));
  it("ES maps to +34", () => expect(COUNTRY_PHONE_CODES["ES"]).toBe("+34"));
  it("GB maps to +44", () => expect(COUNTRY_PHONE_CODES["GB"]).toBe("+44"));
  it("FR maps to +33", () => expect(COUNTRY_PHONE_CODES["FR"]).toBe("+33"));
  it("AU maps to +61", () => expect(COUNTRY_PHONE_CODES["AU"]).toBe("+61"));
  it("CA maps to +1",  () => expect(COUNTRY_PHONE_CODES["CA"]).toBe("+1"));
  it("US maps to +1",  () => expect(COUNTRY_PHONE_CODES["US"]).toBe("+1"));
  it("JP maps to +81", () => expect(COUNTRY_PHONE_CODES["JP"]).toBe("+81"));
  it("BR maps to +55", () => expect(COUNTRY_PHONE_CODES["BR"]).toBe("+55"));
  it("IN maps to +91", () => expect(COUNTRY_PHONE_CODES["IN"]).toBe("+91"));
});

describe("getCallingCodeForCountry", () => {
  it("returns +90 for TR", () => expect(getCallingCodeForCountry("TR")).toBe("+90"));
  it("returns +49 for DE", () => expect(getCallingCodeForCountry("DE")).toBe("+49"));
  it("returns +31 for NL", () => expect(getCallingCodeForCountry("NL")).toBe("+31"));
  it("returns +34 for ES", () => expect(getCallingCodeForCountry("ES")).toBe("+34"));
  it("returns +44 for GB", () => expect(getCallingCodeForCountry("GB")).toBe("+44"));
  it("returns +1 for CA",  () => expect(getCallingCodeForCountry("CA")).toBe("+1"));
  it("returns +61 for AU", () => expect(getCallingCodeForCountry("AU")).toBe("+61"));

  it("accepts lowercase input", () => expect(getCallingCodeForCountry("tr")).toBe("+90"));
  it("returns empty string for unknown country — no +90 fallback", () => {
    expect(getCallingCodeForCountry("ZZ")).toBe("");
  });
  it("returns empty string for empty input", () => {
    expect(getCallingCodeForCountry("")).toBe("");
  });
});
