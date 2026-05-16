import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("marketplace slug route contract", () => {
  it("keeps province slugs as redirects and no longer renders province listing", () => {
    const routePath = path.join(process.cwd(), "src", "app", "marketplace", "[slug]", "page.tsx");
    const content = fs.readFileSync(routePath, "utf8");

    expect(content).toContain("permanentRedirect(`/marketplace/location/tr/${province.slug}`)");
    expect(content).not.toContain("province.name} Isletmeleri");
  });
});
