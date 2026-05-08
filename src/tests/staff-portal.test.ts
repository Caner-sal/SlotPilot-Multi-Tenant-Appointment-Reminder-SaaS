import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/staff-auth", () => ({
  requireStaffAuth: vi.fn(),
  StaffAuthError: class StaffAuthError extends Error {
    constructor(message = "Staff access required") {
      super(message);
      this.name = "StaffAuthError";
    }
  },
}));

vi.mock("@/lib/tenant", () => ({
  requireAuth: vi.fn(),
  TenantError: class TenantError extends Error {
    constructor(msg = "Unauthorized") { super(msg); this.name = "TenantError"; }
  },
}));

vi.mock("@/lib/db", () => ({
  db: {
    appointment: { findMany: vi.fn(), count: vi.fn() },
    availabilityRule: { findMany: vi.fn(), deleteMany: vi.fn(), createMany: vi.fn() },
    staffInvite: { findUnique: vi.fn(), create: vi.fn(), updateMany: vi.fn() },
    staff: { findFirst: vi.fn(), update: vi.fn() },
    user: { findUnique: vi.fn(), create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { requireStaffAuth, StaffAuthError } from "@/lib/staff-auth";
import { requireAuth, TenantError } from "@/lib/tenant";
import { db } from "@/lib/db";
import { GET as getStaffAppts } from "@/app/api/staff-portal/appointments/route";
import { GET as getStaffAvail } from "@/app/api/staff-portal/availability/route";
import { POST as postInvite } from "@/app/api/staff/invite/route";
import { GET as getAcceptInvite, POST as postAcceptInvite } from "@/app/api/auth/accept-invite/route";

const mockRequireStaffAuth = vi.mocked(requireStaffAuth);
const mockRequireAuth = vi.mocked(requireAuth);
const mockDb = vi.mocked(db);

beforeEach(() => vi.clearAllMocks());

describe("Staff portal — appointments", () => {
  it("returns 403 for non-staff user", async () => {
    mockRequireStaffAuth.mockRejectedValueOnce(new StaffAuthError());
    const req = new Request("http://localhost/api/staff-portal/appointments");
    const res = await getStaffAppts(req);
    expect(res.status).toBe(403);
  });

  it("returns only this staff member's appointments", async () => {
    mockRequireStaffAuth.mockResolvedValueOnce({ userId: "u1", staffId: "s1", organizationId: "org1" });
    (mockDb.appointment.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { id: "a1", staffId: "s1", status: "CONFIRMED" },
    ]);
    const req = new Request("http://localhost/api/staff-portal/appointments");
    const res = await getStaffAppts(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    // Verify staffId scoping was applied (findMany was called with staffId)
    expect(mockDb.appointment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ staffId: "s1" }) })
    );
  });
});

describe("Staff portal — availability", () => {
  it("returns 403 for non-staff", async () => {
    mockRequireStaffAuth.mockRejectedValueOnce(new StaffAuthError());
    const res = await getStaffAvail();
    expect(res.status).toBe(403);
  });

  it("returns this staff member's availability rules", async () => {
    mockRequireStaffAuth.mockResolvedValueOnce({ userId: "u1", staffId: "s1", organizationId: "org1" });
    (mockDb.availabilityRule.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { dayOfWeek: "MONDAY", startTime: "09:00", endTime: "17:00" },
    ]);
    const res = await getStaffAvail();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(mockDb.availabilityRule.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { staffId: "s1" } })
    );
  });
});

describe("Staff invite", () => {
  it("returns 404 when staff not found in org", async () => {
    mockRequireAuth.mockResolvedValueOnce({ user: { id: "u1" }, org: { id: "org1" } } as never);
    (mockDb.staff.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/staff/invite", {
      method: "POST",
      body: JSON.stringify({ staffId: "s999", email: "test@test.com" }),
    });
    const res = await postInvite(req);
    expect(res.status).toBe(404);
  });

  it("returns 403 for non-owner user", async () => {
    mockRequireAuth.mockRejectedValueOnce(new TenantError("Unauthorized"));
    const req = new Request("http://localhost/api/staff/invite", {
      method: "POST",
      body: JSON.stringify({ staffId: "s1", email: "test@test.com" }),
    });
    const res = await postInvite(req);
    expect(res.status).toBe(403);
  });
});

describe("Accept invite", () => {
  it("returns 400 for invalid token", async () => {
    (mockDb.staffInvite.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/auth/accept-invite?token=invalid");
    const res = await getAcceptInvite(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for expired invite via POST", async () => {
    (mockDb.staffInvite.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: "inv1",
      token: "tok",
      email: "staff@test.com",
      usedAt: null,
      expiresAt: new Date(Date.now() - 1000),
      staff: { userId: null },
    });
    const req = new Request("http://localhost/api/auth/accept-invite", {
      method: "POST",
      body: JSON.stringify({ token: "tok", name: "Staff User", password: "password123" }),
    });
    const res = await postAcceptInvite(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("expired");
  });
});
