import { beforeEach, describe, expect, it, vi } from "vitest";

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
  assertMembership: vi.fn(),
  TenantError: class TenantError extends Error {
    constructor(msg = "Unauthorized") {
      super(msg);
      this.name = "TenantError";
    }
  },
}));

vi.mock("@/services/staff-invite.service", () => ({
  createStaffInvite: vi.fn(),
  findInviteByRawToken: vi.fn(),
  markPendingInvitesAsRevokedByStaff: vi.fn(),
  markInviteAccepted: vi.fn(),
  markInviteStatus: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    appointment: { findMany: vi.fn(), count: vi.fn() },
    availabilityRule: { findMany: vi.fn(), deleteMany: vi.fn(), createMany: vi.fn() },
    staffInvite: { findUnique: vi.fn(), create: vi.fn(), updateMany: vi.fn(), update: vi.fn() },
    staff: { findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    user: { findUnique: vi.fn(), create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { db } from "@/lib/db";
import { requireStaffAuth, StaffAuthError } from "@/lib/staff-auth";
import { assertMembership, requireAuth, TenantError } from "@/lib/tenant";
import { GET as getAcceptInvite, POST as postAcceptInvite } from "@/app/api/auth/accept-invite/route";
import { POST as postInvite } from "@/app/api/staff/invite/route";
import { GET as getStaffAppts } from "@/app/api/staff-portal/appointments/route";
import { GET as getStaffAvail } from "@/app/api/staff-portal/availability/route";
import {
  createStaffInvite,
  findInviteByRawToken,
  markInviteAccepted,
  markPendingInvitesAsRevokedByStaff,
} from "@/services/staff-invite.service";

const mockRequireStaffAuth = vi.mocked(requireStaffAuth);
const mockRequireAuth = vi.mocked(requireAuth);
const mockAssertMembership = vi.mocked(assertMembership);
const mockCreateStaffInvite = vi.mocked(createStaffInvite);
const mockFindInviteByRawToken = vi.mocked(findInviteByRawToken);
const mockMarkInviteAccepted = vi.mocked(markInviteAccepted);
const mockMarkPendingInvitesAsRevokedByStaff = vi.mocked(markPendingInvitesAsRevokedByStaff);
const mockDb = vi.mocked(db);

beforeEach(() => vi.clearAllMocks());

describe("Staff portal - appointments", () => {
  it("returns 403 for non-staff user", async () => {
    mockRequireStaffAuth.mockRejectedValueOnce(new StaffAuthError());
    const req = new Request("http://localhost/api/staff-portal/appointments");
    const res = await getStaffAppts(req);
    expect(res.status).toBe(403);
  });

  it("returns only this staff member's appointments", async () => {
    mockRequireStaffAuth.mockResolvedValueOnce({
      userId: "u1",
      staffId: "s1",
      organizationId: "org1",
    });
    (mockDb.appointment.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { id: "a1", staffId: "s1", status: "CONFIRMED" },
    ]);

    const req = new Request("http://localhost/api/staff-portal/appointments");
    const res = await getStaffAppts(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(mockDb.appointment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ staffId: "s1" }) })
    );
  });
});

describe("Staff portal - availability", () => {
  it("returns 403 for non-staff", async () => {
    mockRequireStaffAuth.mockRejectedValueOnce(new StaffAuthError());
    const res = await getStaffAvail();
    expect(res.status).toBe(403);
  });

  it("returns this staff member's availability rules", async () => {
    mockRequireStaffAuth.mockResolvedValueOnce({
      userId: "u1",
      staffId: "s1",
      organizationId: "org1",
    });
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
    mockAssertMembership.mockResolvedValueOnce({ role: "OWNER" } as never);
    (mockDb.staff.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/staff/invite", {
      method: "POST",
      body: JSON.stringify({ staffId: "s999", email: "test@test.com" }),
    });
    const res = await postInvite(req);
    expect(res.status).toBe(404);
  });

  it("returns 403 when staff member tries to invite", async () => {
    mockRequireAuth.mockResolvedValueOnce({ user: { id: "u1" }, org: { id: "org1" } } as never);
    mockAssertMembership.mockRejectedValueOnce(new TenantError("Unauthorized"));
    const req = new Request("http://localhost/api/staff/invite", {
      method: "POST",
      body: JSON.stringify({ staffId: "s1", email: "test@test.com" }),
    });
    const res = await postInvite(req);
    expect(res.status).toBe(403);
  });

  it("creates invite using hash service and returns invite URL", async () => {
    mockRequireAuth.mockResolvedValueOnce({ user: { id: "u1" }, org: { id: "org1" } } as never);
    mockAssertMembership.mockResolvedValueOnce({ role: "ADMIN" } as never);
    (mockDb.staff.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: "s1",
      organizationId: "org1",
      name: "Staff Name",
    });
    mockMarkPendingInvitesAsRevokedByStaff.mockResolvedValueOnce({ count: 0 } as never);
    mockCreateStaffInvite.mockResolvedValueOnce({
      invite: { id: "inv1" },
      rawToken: "raw-token-1",
    } as never);

    const req = new Request("http://localhost/api/staff/invite", {
      method: "POST",
      body: JSON.stringify({ staffId: "s1", email: "test@test.com" }),
    });
    const res = await postInvite(req);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.inviteUrl).toContain("raw-token-1");
    expect(mockCreateStaffInvite).toHaveBeenCalled();
  });
});

describe("Accept invite", () => {
  it("returns 400 for invalid token", async () => {
    mockFindInviteByRawToken.mockResolvedValueOnce(null as never);
    const req = new Request("http://localhost/api/auth/accept-invite?token=invalid");
    const res = await getAcceptInvite(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for expired invite via POST", async () => {
    mockFindInviteByRawToken.mockResolvedValueOnce({
      id: "inv1",
      token: null,
      tokenHash: "h1",
      invitedEmail: "staff@test.com",
      status: "PENDING",
      usedAt: null,
      expiresAt: new Date(Date.now() - 1000),
      staff: { userId: null },
      staffId: "s1",
    } as never);
    const req = new Request("http://localhost/api/auth/accept-invite", {
      method: "POST",
      body: JSON.stringify({ token: "tok", name: "Staff User", password: "password123" }),
    });
    const res = await postAcceptInvite(req);
    expect(res.status).toBe(400);
  });

  it("accepts valid invite and marks accepted", async () => {
    mockFindInviteByRawToken.mockResolvedValueOnce({
      id: "inv1",
      staffId: "s1",
      invitedEmail: "staff@test.com",
      status: "PENDING",
      usedAt: null,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      staff: { id: "s1", userId: null },
    } as never);
    (mockDb.staff.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: "s1",
      userId: null,
    });
    (mockDb.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
    (
      mockDb.$transaction as ReturnType<typeof vi.fn>
    ).mockImplementationOnce(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        user: {
          create: vi.fn().mockResolvedValue({ id: "u2", email: "staff@test.com", name: "Staff" }),
        },
        staff: {
          update: vi.fn().mockResolvedValue({ id: "s1" }),
        },
      })
    );
    mockMarkInviteAccepted.mockResolvedValueOnce({ id: "inv1" } as never);

    const req = new Request("http://localhost/api/auth/accept-invite", {
      method: "POST",
      body: JSON.stringify({ token: "tok", name: "Staff", password: "password123" }),
    });
    const res = await postAcceptInvite(req);

    expect(res.status).toBe(201);
    expect(mockMarkInviteAccepted).toHaveBeenCalledWith("inv1");
  });
});
