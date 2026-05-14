import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    organization: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    appointment: {
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    subscription: {
      count: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));

vi.mock("@/lib/superadmin", () => ({
  SuperAdminError: class SuperAdminError extends Error {},
  requireSuperAdmin: vi.fn(),
}));

import { GET } from "@/app/api/admin/usage/route";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/superadmin";

const mockDb = db as unknown as {
  organization: {
    findMany: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
  };
  appointment: {
    count: ReturnType<typeof vi.fn>;
    groupBy: ReturnType<typeof vi.fn>;
  };
  subscription: {
    count: ReturnType<typeof vi.fn>;
    groupBy: ReturnType<typeof vi.fn>;
  };
};

describe("GET /api/admin/usage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when caller is not superadmin", async () => {
    const SuperAdminErrorClass = (await import("@/lib/superadmin")).SuperAdminError;
    vi.mocked(requireSuperAdmin).mockRejectedValueOnce(new SuperAdminErrorClass("forbidden"));

    const req = new Request("http://localhost/api/admin/usage", {
      headers: { "x-request-id": "req_admin_usage_403" },
    });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toBe("forbidden");
    expect(res.headers.get("x-request-id")).toBe("req_admin_usage_403");
  });

  it("returns 400 for invalid limit", async () => {
    vi.mocked(requireSuperAdmin).mockResolvedValueOnce({ userId: "superadmin_1" });

    const req = new Request("http://localhost/api/admin/usage?limit=0", {
      headers: { "x-request-id": "req_admin_usage_400" },
    });
    const res = await GET(req);

    expect(res.status).toBe(400);
  });

  it("returns usage list and summary", async () => {
    vi.mocked(requireSuperAdmin).mockResolvedValueOnce({ userId: "superadmin_1" });

    mockDb.organization.findMany.mockResolvedValueOnce([
      {
        id: "org_2",
        name: "Org Two",
        slug: "org-two",
        createdAt: new Date("2026-05-01T00:00:00.000Z"),
        bookingEnabled: true,
        suspended: false,
        subscription: {
          plan: "PRO",
          status: "ACTIVE",
          currentPeriodEnd: new Date("2026-06-01T00:00:00.000Z"),
        },
        _count: { appointments: 44, staff: 4, services: 8, members: 3 },
      },
      {
        id: "org_1",
        name: "Org One",
        slug: "org-one",
        createdAt: new Date("2026-04-01T00:00:00.000Z"),
        bookingEnabled: true,
        suspended: true,
        subscription: {
          plan: "STARTER",
          status: "PAST_DUE",
          currentPeriodEnd: null,
        },
        _count: { appointments: 12, staff: 2, services: 4, members: 2 },
      },
    ]);

    mockDb.organization.count
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1);

    mockDb.appointment.count.mockResolvedValueOnce(24);
    mockDb.subscription.count
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1);

    mockDb.subscription.groupBy.mockResolvedValueOnce([
      { plan: "STARTER", _count: { plan: 1 } },
      { plan: "PRO", _count: { plan: 1 } },
    ]);

    mockDb.appointment.groupBy.mockResolvedValueOnce([
      { organizationId: "org_2", _count: { _all: 18 } },
      { organizationId: "org_1", _count: { _all: 6 } },
    ]);

    const req = new Request("http://localhost/api/admin/usage?limit=2&cursor=org_3", {
      headers: { "x-request-id": "req_admin_usage_ok" },
    });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(res.headers.get("x-request-id")).toBe("req_admin_usage_ok");
    expect(body.data.items).toHaveLength(2);
    expect(body.data.items[0].monthlyAppointments).toBe(18);
    expect(body.data.items[1].isPubliclyAvailable).toBe(false);
    expect(body.data.summary.totalOrganizations).toBe(2);
    expect(body.data.summary.activeOrganizations).toBe(1);
    expect(body.data.summary.suspendedOrganizations).toBe(1);
    expect(body.data.summary.monthlyAppointments).toBe(24);
    expect(body.data.summary.paymentPendingAccounts).toBe(1);
    expect(body.data.pagination.nextCursor).toBe("org_1");

    expect(mockDb.organization.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 2,
        skip: 1,
        cursor: { id: "org_3" },
      })
    );
  });
});
