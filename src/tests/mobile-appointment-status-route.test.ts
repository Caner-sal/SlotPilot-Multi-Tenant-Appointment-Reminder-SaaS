import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/mobile-request-auth", async () => {
  return {
    assertMobileScope: vi.fn(),
    requireMobileRequestAuth: vi.fn(),
  };
});

vi.mock("@/lib/tenant", () => ({
  TenantError: class TenantError extends Error {},
}));

vi.mock("@/lib/db", () => ({
  db: {
    appointment: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/services/audit.service", () => ({
  createAuditLog: vi.fn(),
}));

import { PATCH } from "@/app/api/mobile/appointments/[id]/status/route";
import { requireMobileRequestAuth } from "@/lib/mobile-request-auth";
import { TenantError } from "@/lib/tenant";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PATCH /api/mobile/appointments/[id]/status", () => {
  it("rejects staff role for owner-only status updates", async () => {
    vi.mocked(requireMobileRequestAuth).mockRejectedValueOnce(new TenantError("Bu işlem için mobil kapsam yetkisi yetersiz"));

    const req = new Request("http://localhost/api/mobile/appointments/appt_1/status", {
      method: "PATCH",
      headers: { "content-type": "application/json", authorization: "Bearer staff-token" },
      body: JSON.stringify({ status: "CONFIRMED" }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "appt_1" }) });
    expect(res.status).toBe(403);
  });
});
