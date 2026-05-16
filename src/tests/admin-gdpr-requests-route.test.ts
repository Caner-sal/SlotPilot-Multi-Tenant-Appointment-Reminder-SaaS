import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    dataDeletionRequest: {
      findMany: vi.fn(),
    },
    dataExportRequest: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/superadmin", () => ({
  SuperAdminError: class SuperAdminError extends Error {},
  requireSuperAdmin: vi.fn(),
}));

import { GET } from "@/app/api/admin/gdpr/requests/route";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/superadmin";

const mockDb = db as unknown as {
  dataDeletionRequest: { findMany: ReturnType<typeof vi.fn> };
  dataExportRequest: { findMany: ReturnType<typeof vi.fn> };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/admin/gdpr/requests", () => {
  it("returns 403 for non-superadmin", async () => {
    const SuperAdminErrorClass = (await import("@/lib/superadmin")).SuperAdminError;
    vi.mocked(requireSuperAdmin).mockRejectedValueOnce(new SuperAdminErrorClass("forbidden"));
    const req = new Request("http://localhost/api/admin/gdpr/requests");
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it("returns merged deletion/export requests", async () => {
    vi.mocked(requireSuperAdmin).mockResolvedValueOnce({ userId: "superadmin_1" });
    mockDb.dataDeletionRequest.findMany.mockResolvedValueOnce([
      {
        id: "del_1",
        organizationId: "org_1",
        customerId: "cust_1",
        email: "customer@example.com",
        reason: "cleanup",
        status: "pending",
        createdAt: new Date("2026-05-13T00:00:00.000Z"),
      },
    ]);
    mockDb.dataExportRequest.findMany.mockResolvedValueOnce([
      {
        id: "exp_1",
        organizationId: "org_1",
        customerId: "cust_1",
        email: "customer@example.com",
        reason: "portability",
        status: "processing",
        format: "json",
        downloadUrl: null,
        createdAt: new Date("2026-05-13T01:00:00.000Z"),
        updatedAt: new Date("2026-05-13T01:10:00.000Z"),
      },
    ]);

    const req = new Request("http://localhost/api/admin/gdpr/requests?type=all&page=1&limit=10", {
      headers: { "x-request-id": "req_gdpr_admin" },
    });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.items).toHaveLength(2);
    expect(body.data.items[0].type).toBe("export");
    expect(body.data.items[1].type).toBe("deletion");
    expect(body.data.meta.total).toBe(2);
  });
});
