import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MESSAGES_DIR = path.join(process.cwd(), "src", "messages");
const TURKEY_TERMS =
  /turkey|turkiye|türkei|turquie|turquía|turchia|turkije|турц|تركيا|ترکیه/i;

function readLocale(fileName: string) {
  const raw = fs.readFileSync(path.join(MESSAGES_DIR, fileName), "utf8");
  const content = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  return JSON.parse(content) as { landing: Record<string, string> };
}

describe("landing localization regression", () => {
  it("keeps Turkey-only landing signals in TR locale", () => {
    const tr = readLocale("tr.json");
    expect(tr.landing.statSupportValue).toBe("81");
  });

  it("removes Turkey-only landing copy from non-TR locales", () => {
    const nonTrFiles = [
      "en.json",
      "it.json",
      "de.json",
      "fr.json",
      "es.json",
      "nl.json",
      "ru.json",
      "fa.json",
      "ar.json",
    ];

    for (const fileName of nonTrFiles) {
      const locale = readLocale(fileName);
      expect(locale.landing.statSupportValue).not.toBe("81");
      expect(locale.landing.heroBadge).not.toMatch(TURKEY_TERMS);
      expect(locale.landing.statSupport).not.toMatch(TURKEY_TERMS);
      expect(locale.landing.f3Title).not.toMatch(TURKEY_TERMS);
      expect(locale.landing.f3Desc).not.toMatch(TURKEY_TERMS);
    }
  });
});
