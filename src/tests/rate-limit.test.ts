import { describe, expect, it } from "vitest";
import { consumeRateLimit, resetRateLimitStore } from "@/lib/rate-limit";

describe("rate limit helper", () => {
  it("allows requests up to limit within window", () => {
    resetRateLimitStore();
    const now = 1_700_000_000_000;
    const a = consumeRateLimit({ key: "k1", limit: 2, windowMs: 1000, nowMs: now });
    const b = consumeRateLimit({ key: "k1", limit: 2, windowMs: 1000, nowMs: now + 1 });
    const c = consumeRateLimit({ key: "k1", limit: 2, windowMs: 1000, nowMs: now + 2 });

    expect(a.allowed).toBe(true);
    expect(b.allowed).toBe(true);
    expect(c.allowed).toBe(false);
    expect(c.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets after window expiration", () => {
    resetRateLimitStore();
    const now = 1_700_000_000_000;
    const a = consumeRateLimit({ key: "k2", limit: 1, windowMs: 1000, nowMs: now });
    const b = consumeRateLimit({ key: "k2", limit: 1, windowMs: 1000, nowMs: now + 2_000 });

    expect(a.allowed).toBe(true);
    expect(b.allowed).toBe(true);
  });
});
