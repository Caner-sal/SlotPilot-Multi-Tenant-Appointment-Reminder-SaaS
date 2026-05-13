import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    $queryRaw: vi.fn(),
    reminder: { count: vi.fn() },
    payment: { count: vi.fn() },
    paymentAttempt: { count: vi.fn() },
    webhookEvent: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/superadmin", () => ({
  SuperAdminError: class SuperAdminError extends Error {},
  requireSuperAdmin: vi.fn(),
}));

import { GET } from "@/app/api/admin/health/route";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/superadmin";

const mockDb = db as unknown as {
  $queryRaw: ReturnType<typeof vi.fn>;
  reminder: { count: ReturnType<typeof vi.fn> };
  payment: { count: ReturnType<typeof vi.fn> };
  paymentAttempt: { count: ReturnType<typeof vi.fn> };
  webhookEvent: {
    count: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/admin/health", () => {
  it("returns 403 when caller is not superadmin", async () => {
    const SuperAdminErrorClass = (await import("@/lib/superadmin")).SuperAdminError;
    vi.mocked(requireSuperAdmin).mockRejectedValueOnce(new SuperAdminErrorClass("forbidden"));

    const req = new Request("http://localhost/api/admin/health", {
      headers: { "x-request-id": "req_health_403" },
    });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toBe("forbidden");
    expect(res.headers.get("x-request-id")).toBe("req_health_403");
  });

  it("returns stable health contract with counters and failures", async () => {
    vi.mocked(requireSuperAdmin).mockResolvedValueOnce({ userId: "superadmin_1" });
    mockDb.$queryRaw.mockResolvedValueOnce([1]);
    mockDb.reminder.count
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(6);
    mockDb.payment.count.mockResolvedValueOnce(2);
    mockDb.paymentAttempt.count
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(2);
    mockDb.webhookEvent.count
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(2);
    mockDb.webhookEvent.findMany
      .mockResolvedValueOnce([
        {
          id: "wh_1",
          provider: "STRIPE",
          eventType: "payment.succeeded",
          eventId: "evt_1",
          errorMessage: "signature mismatch",
          createdAt: new Date("2026-05-13T00:00:00.000Z"),
        },
      ])
      .mockResolvedValueOnce([
        {
          id: "job_1",
          eventType: "REMINDER_PROCESS",
          eventId: "REMINDER_PROCESS:abc-1",
          errorMessage: "job timeout",
          createdAt: new Date("2026-05-13T00:01:00.000Z"),
        },
      ]);

    const req = new Request("http://localhost/api/admin/health", {
      headers: { "x-request-id": "req_health_ok" },
    });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(res.headers.get("x-request-id")).toBe("req_health_ok");
    expect(body.data.status).toBe("ok");
    expect(body.data.requestId).toBe("req_health_ok");
    expect(body.data.checks).toMatchObject({
      database: "ok",
      pendingReminders: 4,
      failedReminders: 1,
      paymentsPendingReview: 2,
      failedWebhookEvents: 5,
      failedInternalJobs: 2,
      failedPaymentAttempts: 3,
    });
    expect(body.data.windows).toMatchObject({
      last24h: {
        failedWebhookEvents: 1,
        failedInternalJobs: 1,
        failedPaymentAttempts: 1,
        failedReminders: 2,
      },
      last7d: {
        failedWebhookEvents: 2,
        failedInternalJobs: 2,
        failedPaymentAttempts: 2,
        failedReminders: 6,
      },
    });
    expect(Array.isArray(body.data.recentFailures.webhooks)).toBe(true);
    expect(Array.isArray(body.data.recentFailures.jobs)).toBe(true);
    expect(body.data.recentFailures.webhooks[0].id).toBe("wh_1");
    expect(body.data.recentFailures.jobs[0].id).toBe("job_1");
  });
});
