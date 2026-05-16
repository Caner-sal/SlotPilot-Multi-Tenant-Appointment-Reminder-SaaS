import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MESSAGES_DIR = path.join(process.cwd(), "src", "messages");
const AUTH_KEYS = [
  "onboardingStep1",
  "onboardingStep2",
  "onboardingStep3",
  "onboardingTitle1",
  "onboardingTitle2",
  "onboardingTitle3",
  "onboardingDesc1",
  "onboardingDesc2",
  "onboardingDesc3",
  "businessName",
  "urlSlug",
  "businessEmail",
  "timezone",
  "creating2",
  "createBusiness",
  "stepOf",
  "slugTaken",
  "genericError",
] as const;

const COMMON_KEYS = ["back", "next"] as const;

function readLocale(filePath: string) {
  const raw = fs.readFileSync(filePath, "utf8");
  const content = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  return JSON.parse(content) as Record<string, Record<string, unknown>>;
}

describe("onboarding i18n key coverage", () => {
  it("contains required auth/common keys in all locale packs", () => {
    const localeFiles = fs.readdirSync(MESSAGES_DIR).filter((name) => name.endsWith(".json"));

    for (const file of localeFiles) {
      const locale = readLocale(path.join(MESSAGES_DIR, file));
      const auth = locale.auth ?? {};
      const common = locale.common ?? {};

      for (const key of AUTH_KEYS) {
        expect(auth).toHaveProperty(key);
      }
      for (const key of COMMON_KEYS) {
        expect(common).toHaveProperty(key);
      }
    }
  });

  it("contains auth.continue in Turkish locale to prevent missing message warnings", () => {
    const tr = readLocale(path.join(MESSAGES_DIR, "tr.json"));
    expect(tr.auth).toHaveProperty("continue");
  });
});
