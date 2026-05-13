import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    webhookEvent: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/superadmin", () => ({
  SuperAdminError: class SuperAdminError extends Error {},
  requireSuperAdmin: vi.fn(),
}));

import { GET } from "@/app/api/admin/failures/route";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/superadmin";

const mockDb = db as unknown as {
  webhookEvent: {
    findMany: ReturnType<typeof vi.fn>;
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/admin/failures", () => {
  it("returns 403 when caller is not superadmin", async () => {
    const SuperAdminErrorClass = (await import("@/lib/superadmin")).SuperAdminError;
    vi.mocked(requireSuperAdmin).mockRejectedValueOnce(new SuperAdminErrorClass("forbidden"));

    const req = new Request("http://localhost/api/admin/failures?source=webhook", {
      headers: { "x-request-id": "req_fail_403" },
    });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toBe("forbidden");
    expect(res.headers.get("x-request-id")).toBe("req_fail_403");
  });

  it("filters failures by source and returns pagination cursor", async () => {
    vi.mocked(requireSuperAdmin).mockResolvedValueOnce({ userId: "superadmin_1" });
    mockDb.webhookEvent.findMany.mockResolvedValueOnce([
      {
        id: "wh_2",
        provider: "STRIPE",
        eventType: "checkout.session.completed",
        eventId: "evt_2",
        errorMessage: "temporary failure",
        createdAt: new Date("2026-05-13T00:02:00.000Z"),
        updatedAt: new Date("2026-05-13T00:03:00.000Z"),
      },
      {
        id: "wh_1",
        provider: "STRIPE",
        eventType: "payment.failed",
        eventId: "evt_1",
        errorMessage: "signature mismatch",
        createdAt: new Date("2026-05-13T00:01:00.000Z"),
        updatedAt: new Date("2026-05-13T00:01:30.000Z"),
      },
    ]);

    const req = new Request("http://localhost/api/admin/failures?source=webhook&limit=2", {
      headers: { "x-request-id": "req_fail_ok" },
    });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(res.headers.get("x-request-id")).toBe("req_fail_ok");
    expect(body.data.source).toBe("webhook");
    expect(body.data.items).toHaveLength(2);
    expect(body.data.pagination.limit).toBe(2);
    expect(body.data.pagination.nextCursor).toBe("wh_1");
    expect(mockDb.webhookEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { provider: { not: "INTERNAL_JOB" }, status: "FAILED" },
        take: 2,
      })
    );
  });

  it("uses cursor pagination for job failure source", async () => {
    vi.mocked(requireSuperAdmin).mockResolvedValueOnce({ userId: "superadmin_1" });
    mockDb.webhookEvent.findMany.mockResolvedValueOnce([]);

    const req = new Request("http://localhost/api/admin/failures?source=job&limit=10&cursor=job_9", {
      headers: { "x-request-id": "req_fail_cursor" },
    });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.pagination.nextCursor).toBeNull();
    expect(mockDb.webhookEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { provider: "INTERNAL_JOB", status: "FAILED" },
        take: 10,
        skip: 1,
        cursor: { id: "job_9" },
      })
    );
  });
});
