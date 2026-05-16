import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    organization: {
      findUnique: vi.fn(),
    },
    customer: {
      findFirst: vi.fn(),
    },
    dataExportRequest: {
      create: vi.fn(),
    },
  },
}));

import { POST } from "@/app/api/gdpr/export-request/route";
import { db } from "@/lib/db";

const mockDb = db as unknown as {
  organization: { findUnique: ReturnType<typeof vi.fn> };
  customer: { findFirst: ReturnType<typeof vi.fn> };
  dataExportRequest: { create: ReturnType<typeof vi.fn> };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/gdpr/export-request", () => {
  it("creates export request", async () => {
    mockDb.organization.findUnique.mockResolvedValueOnce({ id: "org_1" });
    mockDb.customer.findFirst.mockResolvedValueOnce({ id: "cust_1" });
    mockDb.dataExportRequest.create.mockResolvedValueOnce({
      id: "exp_1",
      status: "pending",
      format: "json",
    });

    const req = new Request("http://localhost/api/gdpr/export-request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        organizationSlug: "org-one",
        email: "customer@example.com",
        reason: "data portability",
        format: "json",
      }),
    });

    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.data.id).toBe("exp_1");
    expect(mockDb.dataExportRequest.create).toHaveBeenCalled();
  });

  it("returns 404 when organization does not exist", async () => {
    mockDb.organization.findUnique.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/gdpr/export-request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        organizationSlug: "unknown",
        email: "customer@example.com",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
  });
});
