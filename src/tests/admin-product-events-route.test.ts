import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    productEvent: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/superadmin", () => ({
  SuperAdminError: class SuperAdminError extends Error {},
  requireSuperAdmin: vi.fn(),
}));

import { GET } from "@/app/api/admin/product-events/route";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/superadmin";

const mockDb = db as unknown as {
  productEvent: {
    findMany: ReturnType<typeof vi.fn>;
  };
};

describe("GET /api/admin/product-events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when caller is not superadmin", async () => {
    const SuperAdminErrorClass = (await import("@/lib/superadmin")).SuperAdminError;
    vi.mocked(requireSuperAdmin).mockRejectedValueOnce(
      new SuperAdminErrorClass("forbidden")
    );

    const req = new Request("http://localhost/api/admin/product-events", {
      headers: { "x-request-id": "req_admin_events_403" },
    });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toBe("forbidden");
    expect(res.headers.get("x-request-id")).toBe("req_admin_events_403");
  });

  it("returns 400 for invalid query parameters", async () => {
    vi.mocked(requireSuperAdmin).mockResolvedValueOnce({ userId: "superadmin_1" });

    const req = new Request("http://localhost/api/admin/product-events?limit=999", {
      headers: { "x-request-id": "req_admin_events_400" },
    });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(Array.isArray(body.error)).toBe(true);
    expect(res.headers.get("x-request-id")).toBe("req_admin_events_400");
  });

  it("returns filtered events with cursor pagination", async () => {
    vi.mocked(requireSuperAdmin).mockResolvedValueOnce({ userId: "superadmin_1" });
    mockDb.productEvent.findMany.mockResolvedValueOnce([
      {
        id: "evt_row_2",
        eventName: "service_created",
        userId: "user_2",
        organizationId: "org_2",
        payloadSafe: { via: "dashboard" },
        createdAt: new Date("2026-05-13T09:30:00.000Z"),
        user: { email: "owner2@example.com", name: "Owner 2" },
        organization: { slug: "org-two", name: "Org Two" },
      },
      {
        id: "evt_row_1",
        eventName: "service_created",
        userId: "user_2",
        organizationId: "org_2",
        payloadSafe: { via: "wizard" },
        createdAt: new Date("2026-05-13T09:00:00.000Z"),
        user: { email: "owner2@example.com", name: "Owner 2" },
        organization: { slug: "org-two", name: "Org Two" },
      },
    ]);

    const req = new Request(
      "http://localhost/api/admin/product-events?eventName=service_created&organizationId=org_2&limit=2&cursor=evt_cursor_3",
      {
        headers: { "x-request-id": "req_admin_events_ok" },
      }
    );
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(res.headers.get("x-request-id")).toBe("req_admin_events_ok");
    expect(body.data.items).toHaveLength(2);
    expect(body.data.pagination.limit).toBe(2);
    expect(body.data.pagination.nextCursor).toBe("evt_row_1");
    expect(mockDb.productEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { eventName: "service_created", organizationId: "org_2" },
        take: 2,
        skip: 1,
        cursor: { id: "evt_cursor_3" },
      })
    );
  });
});
