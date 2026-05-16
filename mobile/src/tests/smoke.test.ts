import { describe, expect, it } from "vitest";
import { fallbackLocale, supportedLocales, translations } from "../i18n/config";

describe("mobile smoke", () => {
  it("keeps expected supported locales", () => {
    expect(supportedLocales).toEqual(["tr", "en", "de", "ar", "es", "fr", "it", "fa", "ru", "nl"]);
  });

  it("ensures fallback locale is part of supported locales", () => {
    expect(supportedLocales.includes(fallbackLocale)).toBe(true);
  });

  it("contains a basic translation key in Turkish dictionary", () => {
    expect(translations.tr.login_title).toBeTruthy();
  });
});
