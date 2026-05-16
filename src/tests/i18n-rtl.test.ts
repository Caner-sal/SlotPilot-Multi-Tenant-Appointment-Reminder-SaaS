import { describe, expect, it } from "vitest";
import { localeMetadata, locales } from "@/i18n/locales";

describe("i18n RTL metadata", () => {
  it("keeps Arabic as rtl", () => {
    expect(localeMetadata.ar.direction).toBe("rtl");
  });

  it("keeps Persian as rtl", () => {
    expect(localeMetadata.fa.direction).toBe("rtl");
  });

  it("keeps non-Arabic/non-Persian locales as ltr", () => {
    const ltrLocales = locales.filter((locale) => locale !== "ar" && locale !== "fa");
    for (const locale of ltrLocales) {
      expect(localeMetadata[locale].direction).toBe("ltr");
    }
  });
});
