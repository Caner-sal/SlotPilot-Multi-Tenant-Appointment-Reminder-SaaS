import { describe, expect, it } from "vitest";
import { generateInviteTokenRaw, hashInviteToken } from "@/lib/staff-invite-token";

describe("staff invite token helper", () => {
  it("generates non-empty raw token", () => {
    const token = generateInviteTokenRaw();
    expect(token.length).toBeGreaterThan(20);
  });

  it("hashes token deterministically", () => {
    const raw = "abc123";
    const h1 = hashInviteToken(raw);
    const h2 = hashInviteToken(raw);
    expect(h1).toBe(h2);
    expect(h1).not.toBe(raw);
  });
});
