import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// ─────────────────────────────────────────────────────────────────────────────
// FIXERR Regression Tests
// Checkout auth guard + Discover Prisma error fix
// ─────────────────────────────────────────────────────────────────────────────

const root = process.cwd();

// ── FIXERR-1: Checkout page guard ────────────────────────────────────────────

describe("checkout page — session guards (FIXERR-1+2)", () => {
  const checkoutPage = fs.readFileSync(
    path.join(root, "src/app/dashboard/billing/checkout/page.tsx"),
    "utf-8"
  );

  it("has loading state guard for sessionStatus === 'loading'", () => {
    expect(checkoutPage).toContain('sessionStatus === "loading"');
  });

  it("has unauthenticated redirect to login with callbackUrl", () => {
    expect(checkoutPage).toContain('sessionStatus === "unauthenticated"');
    expect(checkoutPage).toContain("callbackUrl");
    expect(checkoutPage).toContain("/login");
  });

  it("handles 401 response with login redirect", () => {
    expect(checkoutPage).toContain("res.status === 401");
    expect(checkoutPage).toContain("router.replace");
  });

  it("handles 403 response with checkoutForbidden message", () => {
    expect(checkoutPage).toContain("res.status === 403");
    expect(checkoutPage).toContain('t("checkoutForbidden")');
  });

  it("handles 404 org-required response with checkoutOrgRequired message", () => {
    expect(checkoutPage).toContain("ACTIVE_ORGANIZATION_REQUIRED");
    expect(checkoutPage).toContain('t("checkoutOrgRequired")');
  });

  it("does not show raw server error messages (no json.error direct display without status check)", () => {
    // After status checks, only then uses json.error as last fallback
    const lines = checkoutPage.split("\n");
    const rawErrorLine = lines.find(
      (l) => l.includes("setError(json.error") && !l.includes("??")
    );
    expect(rawErrorLine).toBeUndefined();
  });
});

// ── FIXERR-1: Checkout API route ──────────────────────────────────────────────

describe("checkout API route — TenantError status codes (FIXERR-1)", () => {
  const checkoutRoute = fs.readFileSync(
    path.join(root, "src/app/api/billing/checkout/route.ts"),
    "utf-8"
  );

  it("returns 401 for session missing (AUTH_REQUIRED)", () => {
    expect(checkoutRoute).toContain("AUTH_REQUIRED");
    expect(checkoutRoute).toContain("status: 401");
  });

  it("returns 404 for missing organization (ACTIVE_ORGANIZATION_REQUIRED)", () => {
    expect(checkoutRoute).toContain("ACTIVE_ORGANIZATION_REQUIRED");
    expect(checkoutRoute).toContain("status: 404");
  });

  it("returns 403 for insufficient role (FORBIDDEN)", () => {
    expect(checkoutRoute).toContain("FORBIDDEN");
    expect(checkoutRoute).toContain("status: 403");
  });

  it("branches TenantError handling by message content", () => {
    // New pattern separates by message — not a single catch-all 403
    expect(checkoutRoute).toContain("Oturum doğrulanamadı");
  });
});

// ── FIXERR-3: DATABASE_URL validation ────────────────────────────────────────

describe("DATABASE_URL protocol validation (FIXERR-3)", () => {
  const envCheckScript = fs.readFileSync(
    path.join(root, "scripts/check-production-env.ts"),
    "utf-8"
  );

  it("validates DATABASE_URL starts with postgresql:// or postgres://", () => {
    expect(envCheckScript).toContain("postgresql://");
    expect(envCheckScript).toContain("postgres://");
  });

  it("marks invalid protocol as FAIL", () => {
    expect(envCheckScript).toContain("geçersiz protokol");
    expect(envCheckScript).toContain("failed = true");
  });

  it("env.example uses postgresql:// format by default", () => {
    const envExample = fs.readFileSync(
      path.join(root, ".env.example"),
      "utf-8"
    );
    expect(envExample).toContain("postgresql://");
    expect(envExample).not.toContain('DATABASE_URL="file:');
  });
});

// ── FIXERR-4: addressProviderLog non-blocking ─────────────────────────────────

describe("addressProviderLog — non-blocking logging (FIXERR-4)", () => {
  const autocompleteRoute = fs.readFileSync(
    path.join(root, "src/app/api/address/autocomplete/route.ts"),
    "utf-8"
  );
  const retrieveRoute = fs.readFileSync(
    path.join(root, "src/app/api/address/retrieve/route.ts"),
    "utf-8"
  );

  it("autocomplete: log write does not block response (fire-and-forget)", () => {
    // Non-blocking: db.addressProviderLog.create().catch() not awaited
    expect(autocompleteRoute).toContain(".catch((logErr");
    // Should NOT have blocking await for the success log
    const lines = autocompleteRoute.split("\n");
    const awaitLogLine = lines.find(
      (l) => l.includes("await db.addressProviderLog.create") && l.includes("status: \"SUCCESS\"")
    );
    expect(awaitLogLine).toBeUndefined();
  });

  it("retrieve: log write does not block response (fire-and-forget)", () => {
    expect(retrieveRoute).toContain(".catch((logErr");
    const lines = retrieveRoute.split("\n");
    const awaitLogLine = lines.find(
      (l) => l.includes("await db.addressProviderLog.create") && l.includes("RETRIEVE_SUCCESS")
    );
    expect(awaitLogLine).toBeUndefined();
  });

  it("autocomplete: error response does not expose raw Prisma error", () => {
    // Old: error.message directly in response
    // New: user-friendly Turkish message
    expect(autocompleteRoute).toContain("Konum önerileri şu anda alınamadı");
    expect(autocompleteRoute).not.toMatch(/error: error instanceof Error \? error\.message/);
  });

  it("retrieve: error response does not expose raw Prisma error", () => {
    expect(retrieveRoute).toContain("Adres bilgisi şu anda alınamadı");
    expect(retrieveRoute).not.toMatch(/error: error instanceof Error \? error\.message/);
  });
});

// ── FIXERR-5: discover/search error handling ──────────────────────────────────

describe("discover/search — try-catch and structured errors (FIXERR-5)", () => {
  const discoverRoute = fs.readFileSync(
    path.join(root, "src/app/api/discover/search/route.ts"),
    "utf-8"
  );
  const discoverPage = fs.readFileSync(
    path.join(root, "src/app/discover/page.tsx"),
    "utf-8"
  );

  it("API route has try-catch wrapping all DB calls", () => {
    expect(discoverRoute).toContain("try {");
    expect(discoverRoute).toContain("} catch (err) {");
  });

  it("API route returns structured error (not raw Prisma message)", () => {
    expect(discoverRoute).toContain("DISCOVER_SEARCH_FAILED");
    expect(discoverRoute).toContain("Arama yapılırken bir sorun oluştu");
    expect(discoverRoute).toContain("status: 500");
  });

  it("API route does not expose err.message directly in response", () => {
    expect(discoverRoute).not.toContain("err.message");
  });

  it("discover page has retry button in error state", () => {
    expect(discoverPage).toContain("Tekrar Dene");
    expect(discoverPage).toContain("handleSearch");
  });
});

// ── Translation keys presence ─────────────────────────────────────────────────

describe("billing translation keys — all required keys present (FIXERR-2)", () => {
  const REQUIRED_KEYS = [
    "checkoutSessionRequired",
    "checkoutForbidden",
    "checkoutOrgRequired",
  ];

  const locales = ["tr", "en", "de", "fr", "nl", "it", "es", "ru", "ar", "fa"];

  for (const locale of locales) {
    it(`${locale}.json has all new checkout error keys`, () => {
      const msgFile = fs.readFileSync(
        path.join(root, `src/messages/${locale}.json`),
        "utf-8"
      );
      for (const key of REQUIRED_KEYS) {
        expect(msgFile, `Missing key "${key}" in ${locale}.json`).toContain(`"${key}"`);
      }
    });
  }
});
