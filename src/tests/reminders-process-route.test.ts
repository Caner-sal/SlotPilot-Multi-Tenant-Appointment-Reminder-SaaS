import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    webhookEvent: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/services/reminder.service", () => ({
  processPendingReminders: vi.fn(),
}));

vi.mock("@/lib/superadmin", () => ({
  SuperAdminError: class SuperAdminError extends Error {},
  requireSuperAdmin: vi.fn(),
}));

import { POST } from "@/app/api/reminders/process/route";
import { db } from "@/lib/db";
import { processPendingReminders } from "@/services/reminder.service";
import { resetRateLimitStore } from "@/lib/rate-limit";

const mockDb = db as unknown as {
  webhookEvent: {
    findUnique: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
};

function makeRequest(headers: Record<string, string>) {
  return new Request("http://localhost/api/reminders/process", {
    method: "POST",
    headers,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  resetRateLimitStore();
  process.env.WORKER_SECRET_KEY = "worker-secret";
});

describe("POST /api/reminders/process", () => {
  it("rejects internal worker call without idempotency key", async () => {
    const req = makeRequest({
      "x-worker-key": "worker-secret",
      "x-forwarded-for": "10.0.0.1",
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(String(body.error)).toContain("idempotency");
  });

  it("returns skipped on duplicate idempotency key", async () => {
    mockDb.webhookEvent.findUnique.mockResolvedValueOnce({ processedAt: new Date() });

    const req = makeRequest({
      "x-worker-key": "worker-secret",
      "x-idempotency-key": "abc-1",
      "x-forwarded-for": "10.0.0.2",
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.skipped).toBe(1);
    expect(body.data.skippedDuplicate).toBe(true);
  });

  it("processes reminders and marks webhook event processed", async () => {
    mockDb.webhookEvent.findUnique.mockResolvedValueOnce(null);
    mockDb.webhookEvent.upsert.mockResolvedValueOnce({});
    mockDb.webhookEvent.update.mockResolvedValue({});
    vi.mocked(processPendingReminders).mockResolvedValueOnce({
      processed: 3,
      sent: 2,
      failed: 1,
      retried: 1,
      permanentFailed: 1,
      skipped: 0,
    });

    const req = makeRequest({
      "x-worker-key": "worker-secret",
      "x-idempotency-key": "abc-2",
      "x-forwarded-for": "10.0.0.3",
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.processed).toBe(3);
    expect(body.data.retried).toBe(1);
    expect(mockDb.webhookEvent.upsert).toHaveBeenCalledOnce();
    expect(mockDb.webhookEvent.update).toHaveBeenCalled();
  });
});
