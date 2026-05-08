import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock requireSuperAdmin
vi.mock("@/lib/superadmin", () => ({
  requireSuperAdmin: vi.fn(),
  SuperAdminError: class SuperAdminError extends Error {
    constructor(message = "Superadmin access required") {
      super(message);
      this.name = "SuperAdminError";
    }
  },
}));

// Mock db
vi.mock("@/lib/db", () => ({
  db: {
    organization: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    auditLog: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { requireSuperAdmin, SuperAdminError } from "@/lib/superadmin";
import { db } from "@/lib/db";
import { GET as getOrgs } from "@/app/api/admin/organizations/route";
import { GET as getAuditLogs } from "@/app/api/admin/audit-logs/route";

const mockRequireSuperAdmin = vi.mocked(requireSuperAdmin);
const mockDb = vi.mocked(db);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Superadmin — Organization list", () => {
  it("returns 403 for non-superadmin", async () => {
    mockRequireSuperAdmin.mockRejectedValueOnce(new SuperAdminError("Superadmin access required"));

    const res = await getOrgs();
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("Superadmin");
  });

  it("returns organization list for superadmin", async () => {
    mockRequireSuperAdmin.mockResolvedValueOnce({ userId: "admin-1" });
    (mockDb.organization.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { id: "org-1", name: "Demo Org", slug: "demo", suspended: false, _count: { appointments: 5 } },
    ]);

    const res = await getOrgs();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].name).toBe("Demo Org");
  });
});

describe("Superadmin — Audit logs", () => {
  it("returns 403 for non-superadmin", async () => {
    mockRequireSuperAdmin.mockRejectedValueOnce(new SuperAdminError());

    const req = new Request("http://localhost/api/admin/audit-logs");
    const res = await getAuditLogs(req as Parameters<typeof getAuditLogs>[0]);
    expect(res.status).toBe(403);
  });

  it("returns paginated audit logs for superadmin", async () => {
    mockRequireSuperAdmin.mockResolvedValueOnce({ userId: "admin-1" });
    (mockDb.$transaction as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      [{ id: "log-1", action: "APPOINTMENT_CREATED", createdAt: new Date() }],
      1,
    ]);

    const req = new Request("http://localhost/api/admin/audit-logs?page=1");
    const res = await getAuditLogs(req as Parameters<typeof getAuditLogs>[0]);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.total).toBe(1);
    expect(body.data).toHaveLength(1);
  });
});

describe("SuperAdminError", () => {
  it("has correct name", () => {
    const err = new SuperAdminError("test");
    expect(err.name).toBe("SuperAdminError");
    expect(err.message).toBe("test");
  });
});
