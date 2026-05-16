import { describe, expect, it } from "vitest";
import { buildMarketplaceQueryParams, isTurkeyCountry } from "@/lib/marketplace/filters";

describe("marketplace filters", () => {
  it("recognizes Turkey country code case-insensitively", () => {
    expect(isTurkeyCountry("TR")).toBe(true);
    expect(isTurkeyCountry("tr")).toBe(true);
    expect(isTurkeyCountry("IT")).toBe(false);
  });

  it("includes province only for Turkey", () => {
    const trParams = buildMarketplaceQueryParams({
      q: "",
      category: "",
      province: "adana",
      countryCode: "TR",
      locality: "Roma",
    });
    expect(trParams.get("province")).toBe("adana");
    expect(trParams.get("locality")).toBeNull();

    const itParams = buildMarketplaceQueryParams({
      q: "",
      category: "",
      province: "adana",
      countryCode: "IT",
      locality: "Roma",
    });
    expect(itParams.get("province")).toBeNull();
    expect(itParams.get("locality")).toBe("Roma");
  });

  it("sends country and countryCode for compatibility", () => {
    const params = buildMarketplaceQueryParams({
      q: "spa",
      category: "salon",
      province: "",
      countryCode: "DE",
      locality: "Berlin",
    });
    expect(params.get("country")).toBe("DE");
    expect(params.get("countryCode")).toBe("DE");
  });
});

