import { describe, expect, it } from "vitest";
import { getLocationOptionsForCountry } from "@/lib/address/location-options";

describe("getLocationOptionsForCountry", () => {
  it("returns Turkey province options for TR", () => {
    const options = getLocationOptionsForCountry("TR");
    expect(options.length).toBeGreaterThan(0);
    expect(options.some((option) => option.value === "adana")).toBe(true);
  });

  it("does not return Turkey provinces for IT", () => {
    const options = getLocationOptionsForCountry("IT");
    expect(options).toEqual([]);
  });

  it("returns empty list for unknown countries", () => {
    const options = getLocationOptionsForCountry("ZZ");
    expect(options).toEqual([]);
  });
});

