import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    organizationMember: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/services/onboarding-checklist.service", () => ({
  getOnboardingChecklistSnapshot: vi.fn(),
}));

vi.mock("@/lib/tenant", () => ({
  TenantError: class TenantError extends Error {},
  requireAuth: vi.fn(),
}));

import { GET } from "@/app/api/dashboard/onboarding-checklist/route";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/tenant";
import { getOnboardingChecklistSnapshot } from "@/services/onboarding-checklist.service";

const mockDb = db as unknown as {
  organizationMember: {
    findUnique: ReturnType<typeof vi.fn>;
  };
};

describe("GET /api/dashboard/onboarding-checklist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 for non-owner users", async () => {
    vi.mocked(requireAuth).mockResolvedValueOnce({
      user: { id: "user_staff" },
      org: { id: "org_1" },
    } as never);
    mockDb.organizationMember.findUnique.mockResolvedValueOnce({ role: "STAFF" });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(String(body.error)).toContain("yoneticileri");
  });

  it("returns checklist data for owner users", async () => {
    vi.mocked(requireAuth).mockResolvedValueOnce({
      user: { id: "user_owner" },
      org: { id: "org_1" },
    } as never);
    mockDb.organizationMember.findUnique.mockResolvedValueOnce({ role: "OWNER" });
    vi.mocked(getOnboardingChecklistSnapshot).mockResolvedValueOnce({
      organizationId: "org_1",
      completedCount: 3,
      totalCount: 4,
      progressPercent: 75,
      items: [],
    });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.organizationId).toBe("org_1");
    expect(body.data.progressPercent).toBe(75);
  });

  it("returns 403 when tenant auth fails", async () => {
    const TenantErrorClass = (await import("@/lib/tenant")).TenantError;
    vi.mocked(requireAuth).mockRejectedValueOnce(new TenantErrorClass("forbidden"));

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toBe("forbidden");
  });
});
