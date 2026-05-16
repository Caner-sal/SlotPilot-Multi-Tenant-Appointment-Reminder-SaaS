import { db } from "@/lib/db";
import { generateInviteTokenRaw, hashInviteToken } from "@/lib/staff-invite-token";
import { MemberRole, Prisma, StaffInviteStatus } from "@prisma/client";

type StaffInviteInclude = Prisma.StaffInviteInclude;

export type CreateStaffInviteInput = {
  organizationId: string;
  staffId: string;
  invitedEmail: string;
  invitedName?: string | null;
  role?: MemberRole;
  createdByUserId?: string | null;
  expiresAt: Date;
};

export async function createStaffInvite(input: CreateStaffInviteInput) {
  const rawToken = generateInviteTokenRaw();
  const tokenHash = hashInviteToken(rawToken);

  const invite = await db.staffInvite.create({
    data: {
      organizationId: input.organizationId,
      staffId: input.staffId,
      token: null,
      tokenHash,
      invitedEmail: input.invitedEmail,
      invitedName: input.invitedName ?? null,
      role: input.role ?? "STAFF",
      status: "PENDING",
      expiresAt: input.expiresAt,
      createdByUserId: input.createdByUserId ?? null,
    },
  });

  return { invite, rawToken };
}

export async function findInviteByRawToken<TInclude extends StaffInviteInclude | undefined = undefined>(
  rawToken: string,
  include?: TInclude
) {
  const tokenHash = hashInviteToken(rawToken);

  const hashMatch = await db.staffInvite.findFirst({
    where: { tokenHash },
    include,
  });
  if (hashMatch) return hashMatch;

  const legacyMatch = await db.staffInvite.findFirst({
    where: { token: rawToken },
    include,
  });
  return legacyMatch;
}

export async function markPendingInvitesAsRevokedByStaff(staffId: string) {
  return db.staffInvite.updateMany({
    where: {
      staffId,
      status: "PENDING",
      usedAt: null,
    },
    data: {
      status: "REVOKED",
      usedAt: new Date(),
    },
  });
}

export async function markInviteAccepted(inviteId: string) {
  return db.staffInvite.update({
    where: { id: inviteId },
    data: {
      status: StaffInviteStatus.ACCEPTED,
      acceptedAt: new Date(),
      usedAt: new Date(),
    },
  });
}

export async function markInviteStatus(inviteId: string, status: StaffInviteStatus) {
  return db.staffInvite.update({
    where: { id: inviteId },
    data: { status },
  });
}
