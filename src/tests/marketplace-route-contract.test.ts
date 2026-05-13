import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("marketplace route contract", () => {
  it("keeps canonical location route and blocks legacy path regressions", () => {
    const root = process.cwd();
    const canonicalRoute = path.join(
      root,
      "src",
      "app",
      "marketplace",
      "location",
      "[country]",
      "[city]",
      "page.tsx"
    );
    const legacyRoute = path.join(
      root,
      "src",
      "app",
      "marketplace",
      "[country]",
      "[city]",
      "page.tsx"
    );

    expect(fs.existsSync(canonicalRoute)).toBe(true);
    expect(fs.existsSync(legacyRoute)).toBe(false);
  });
});
