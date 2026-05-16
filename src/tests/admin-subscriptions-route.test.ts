import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    subscription: {
      findMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));

vi.mock("@/lib/superadmin", () => ({
  SuperAdminError: class SuperAdminError extends Error {},
  requireSuperAdmin: vi.fn(),
}));

import { GET } from "@/app/api/admin/subscriptions/route";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/superadmin";

const mockDb = db as unknown as {
  subscription: {
    findMany: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    groupBy: ReturnType<typeof vi.fn>;
  };
};

describe("GET /api/admin/subscriptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when caller is not superadmin", async () => {
    const SuperAdminErrorClass = (await import("@/lib/superadmin")).SuperAdminError;
    vi.mocked(requireSuperAdmin).mockRejectedValueOnce(new SuperAdminErrorClass("forbidden"));

    const req = new Request("http://localhost/api/admin/subscriptions", {
      headers: { "x-request-id": "req_admin_subs_403" },
    });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toBe("forbidden");
    expect(res.headers.get("x-request-id")).toBe("req_admin_subs_403");
  });

  it("returns 400 for invalid limit", async () => {
    vi.mocked(requireSuperAdmin).mockResolvedValueOnce({ userId: "superadmin_1" });

    const req = new Request("http://localhost/api/admin/subscriptions?limit=1000", {
      headers: { "x-request-id": "req_admin_subs_400" },
    });

    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns paginated subscriptions with summary", async () => {
    vi.mocked(requireSuperAdmin).mockResolvedValueOnce({ userId: "superadmin_1" });
    mockDb.subscription.findMany.mockResolvedValueOnce([
      {
        id: "sub_2",
        organizationId: "org_2",
        plan: "PRO",
        status: "ACTIVE",
        currentPeriodEnd: new Date("2026-06-01T00:00:00.000Z"),
        createdAt: new Date("2026-05-10T00:00:00.000Z"),
        updatedAt: new Date("2026-05-13T00:00:00.000Z"),
        organization: { name: "Org Two", slug: "org-two", email: "owner2@example.com" },
      },
      {
        id: "sub_1",
        organizationId: "org_1",
        plan: "STARTER",
        status: "PAST_DUE",
        currentPeriodEnd: null,
        createdAt: new Date("2026-05-09T00:00:00.000Z"),
        updatedAt: new Date("2026-05-12T00:00:00.000Z"),
        organization: { name: "Org One", slug: "org-one", email: "owner1@example.com" },
      },
    ]);
    mockDb.subscription.count
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1);
    mockDb.subscription.groupBy
      .mockResolvedValueOnce([
        { plan: "STARTER", _count: { plan: 1 } },
        { plan: "PRO", _count: { plan: 1 } },
      ])
      .mockResolvedValueOnce([
        { status: "ACTIVE", _count: { status: 1 } },
        { status: "PAST_DUE", _count: { status: 1 } },
      ]);

    const req = new Request(
      "http://localhost/api/admin/subscriptions?limit=2&status=ACTIVE&cursor=sub_3",
      { headers: { "x-request-id": "req_admin_subs_ok" } }
    );
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(res.headers.get("x-request-id")).toBe("req_admin_subs_ok");
    expect(body.data.items).toHaveLength(2);
    expect(body.data.pagination.nextCursor).toBe("sub_1");
    expect(body.data.summary.totalSubscriptions).toBe(2);
    expect(body.data.summary.activeSubscriptions).toBe(1);
    expect(body.data.summary.paymentPendingAccounts).toBe(1);
    expect(mockDb.subscription.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 2,
        skip: 1,
        cursor: { id: "sub_3" },
      })
    );
  });
});
