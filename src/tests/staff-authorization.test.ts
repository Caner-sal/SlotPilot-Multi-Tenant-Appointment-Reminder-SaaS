import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    staff: { findFirst: vi.fn() },
    appointment: { findFirst: vi.fn() },
    subscription: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/tenant", async () => {
  const actual = await vi.importActual<typeof import("@/lib/tenant")>("@/lib/tenant");
  return {
    ...actual,
    requireAuth: vi.fn(),
    assertMembership: vi.fn(),
  };
});

import { GET as getStaffAppointment } from "@/app/api/staff/me/appointments/[id]/route";
import { PATCH as patchStaffAppointmentStatus } from "@/app/api/staff/me/appointments/[id]/status/route";
import { GET as getBillingSubscription } from "@/app/api/billing/subscription/route";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { StaffAuthError, requireStaffAuth } from "@/lib/staff-auth";
import { assertMembership, requireAuth, TenantError } from "@/lib/tenant";

const mockAuth = vi.mocked(auth);
const mockDb = vi.mocked(db);
const mockRequireAuth = vi.mocked(requireAuth);
const mockAssertMembership = vi.mocked(assertMembership);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("staff authorization guards", () => {
  it("blocks disabled staff at requireStaffAuth", async () => {
    mockAuth.mockResolvedValueOnce({
      user: {
        id: "u1",
        appRole: "STAFF_MEMBER",
        staffId: "s1",
        staffOrgId: "org1",
      },
    } as never);
    (mockDb.staff.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    await expect(requireStaffAuth()).rejects.toBeInstanceOf(StaffAuthError);
  });

  it("prevents cross-staff appointment access", async () => {
    mockAuth.mockResolvedValueOnce({
      user: {
        id: "u1",
        appRole: "STAFF_MEMBER",
        staffId: "s1",
        staffOrgId: "org1",
      },
    } as never);
    (mockDb.staff.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ id: "s1" });
    (mockDb.appointment.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    const res = await getStaffAppointment(new Request("http://localhost/api/staff/me/appointments/a2"), {
      params: Promise.resolve({ id: "a2" }),
    });

    expect(res.status).toBe(404);
  });

  it("blocks staff access to billing subscription api", async () => {
    mockRequireAuth.mockResolvedValueOnce({
      user: { id: "u-staff" },
      org: { id: "org1" },
    } as never);
    mockAssertMembership.mockRejectedValueOnce(new TenantError("Access denied"));

    const res = await getBillingSubscription();
    expect(res.status).toBe(403);
  });

  it("allows only completed/no-show transitions for staff status updates", async () => {
    mockAuth.mockResolvedValueOnce({
      user: {
        id: "u1",
        appRole: "STAFF_MEMBER",
        staffId: "s1",
        staffOrgId: "org1",
      },
    } as never);
    (mockDb.staff.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ id: "s1" });

    const res = await patchStaffAppointmentStatus(
      new Request("http://localhost/api/staff/me/appointments/a1/status", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "CONFIRMED" }),
      }),
      { params: Promise.resolve({ id: "a1" }) }
    );

    expect(res.status).toBe(400);
  });
});
