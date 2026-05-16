import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/staff-invite-token", () => ({
  generateInviteTokenRaw: vi.fn(() => "raw-token-fixed"),
  hashInviteToken: vi.fn((token: string) => `hash:${token}`),
}));

vi.mock("@/lib/db", () => ({
  db: {
    staffInvite: {
      create: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { db } from "@/lib/db";
import {
  createStaffInvite,
  findInviteByRawToken,
  markInviteAccepted,
  markPendingInvitesAsRevokedByStaff,
} from "@/services/staff-invite.service";

const mockDb = vi.mocked(db);

beforeEach(() => vi.clearAllMocks());

describe("staff invite service", () => {
  it("creates invite using tokenHash and does not persist raw token", async () => {
    (mockDb.staffInvite.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ id: "inv1" });
    await createStaffInvite({
      organizationId: "org1",
      staffId: "s1",
      invitedEmail: "staff@test.com",
      expiresAt: new Date(),
    });

    expect(mockDb.staffInvite.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          token: null,
          tokenHash: "hash:raw-token-fixed",
          invitedEmail: "staff@test.com",
        }),
      })
    );
  });

  it("prefers hash match and falls back to legacy token", async () => {
    (mockDb.staffInvite.findFirst as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "legacy1" });

    const invite = await findInviteByRawToken("legacy-token");
    expect(invite).toEqual({ id: "legacy1" });
    expect(mockDb.staffInvite.findFirst).toHaveBeenCalledTimes(2);
  });

  it("revokes pending invites by staff", async () => {
    (mockDb.staffInvite.updateMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ count: 2 });
    await markPendingInvitesAsRevokedByStaff("s1");
    expect(mockDb.staffInvite.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ staffId: "s1", status: "PENDING" }),
      })
    );
  });

  it("marks invite as accepted", async () => {
    (mockDb.staffInvite.update as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ id: "inv1" });
    await markInviteAccepted("inv1");
    expect(mockDb.staffInvite.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "inv1" },
      })
    );
  });
});
