import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/mobile-auth.service", () => ({
  validateMobileCredentials: vi.fn(),
  issueMobileTokenPair: vi.fn(),
  rotateMobileRefreshToken: vi.fn(),
  revokeMobileRefreshToken: vi.fn(),
}));

vi.mock("@/services/product-event.service", () => ({
  trackProductEvent: vi.fn(),
}));

vi.mock("@/lib/tenant", () => ({
  TenantError: class TenantError extends Error {},
}));

import { POST as loginRoute } from "@/app/api/mobile/auth/login/route";
import { POST as refreshRoute } from "@/app/api/mobile/auth/refresh/route";
import { POST as logoutRoute } from "@/app/api/mobile/auth/logout/route";
import { TenantError } from "@/lib/tenant";
import {
  issueMobileTokenPair,
  revokeMobileRefreshToken,
  rotateMobileRefreshToken,
  validateMobileCredentials,
} from "@/services/mobile-auth.service";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("mobile auth routes", () => {
  it("returns 401 for invalid credentials", async () => {
    vi.mocked(validateMobileCredentials).mockRejectedValueOnce(new TenantError("Geçersiz giriş bilgileri"));
    const req = new Request("http://localhost/api/mobile/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "invalid@example.com", password: "bad-pass" }),
    });
    const res = await loginRoute(req);
    expect(res.status).toBe(401);
  });

  it("returns rotated tokens on refresh", async () => {
    vi.mocked(rotateMobileRefreshToken).mockResolvedValueOnce({
      user: {
        id: "u1",
        email: "owner@example.com",
        name: "Owner",
        appRole: "OWNER",
        platformRole: "USER",
        organizationId: "org_1",
        organizationSlug: "org-one",
        organizationName: "Org One",
        membershipRole: "OWNER",
      },
      accessToken: "new-access",
      refreshToken: "new-refresh",
      expiresIn: 900,
      claims: {
        sub: "u1",
        organizationId: "org_1",
        role: "OWNER",
        scope: ["appointments:read", "appointments:write"],
        exp: 1,
        jti: "jti_1",
        email: "owner@example.com",
        platformRole: "USER",
      },
    });

    const req = new Request("http://localhost/api/mobile/auth/refresh", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken: "old-refresh-token-value" }),
    });
    const res = await refreshRoute(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.accessToken).toBe("new-access");
    expect(body.data.refreshToken).toBe("new-refresh");
  });

  it("rejects revoked refresh tokens", async () => {
    vi.mocked(rotateMobileRefreshToken).mockRejectedValueOnce(new TenantError("Refresh token geçersiz veya iptal edilmiş"));
    const req = new Request("http://localhost/api/mobile/auth/refresh", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken: "revoked-refresh-token-value-123" }),
    });
    const res = await refreshRoute(req);
    expect(res.status).toBe(401);
  });

  it("returns revoke result on logout", async () => {
    vi.mocked(revokeMobileRefreshToken).mockResolvedValueOnce(true);
    const req = new Request("http://localhost/api/mobile/auth/logout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken: "sample-refresh-token" }),
    });
    const res = await logoutRoute(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.revoked).toBe(true);
  });

  it("returns token pair on successful login", async () => {
    vi.mocked(validateMobileCredentials).mockResolvedValueOnce({
      id: "u1",
      email: "owner@example.com",
      name: "Owner",
      appRole: "OWNER",
      platformRole: "USER",
      organizationId: "org_1",
      organizationSlug: "org-one",
      organizationName: "Org One",
      membershipRole: "OWNER",
    });
    vi.mocked(issueMobileTokenPair).mockResolvedValueOnce({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      expiresIn: 900,
      claims: {
        sub: "u1",
        organizationId: "org_1",
        role: "OWNER",
        scope: ["appointments:read", "appointments:write"],
        exp: 1,
        jti: "jti_1",
        email: "owner@example.com",
        platformRole: "USER",
      },
    });

    const req = new Request("http://localhost/api/mobile/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "owner@example.com", password: "Strong123!" }),
    });
    const res = await loginRoute(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.accessToken).toBe("access-token");
    expect(body.data.user.email).toBe("owner@example.com");
  });
});
