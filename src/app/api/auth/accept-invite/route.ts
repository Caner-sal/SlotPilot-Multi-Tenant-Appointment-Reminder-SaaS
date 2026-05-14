import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createAuditLog } from "@/services/audit.service";
import {
  findInviteByRawToken,
  markInviteAccepted,
  markInviteStatus,
} from "@/services/staff-invite.service";
import { StaffInviteStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const acceptSchema = z.object({
  token: z.string().min(1),
  name: z.string().min(2),
  password: z.string().min(8),
});

function inviteInvalidResponse() {
  return NextResponse.json({ error: "Invalid or expired invite" }, { status: 400 });
}

async function markInviteExpiredWithAudit(inviteId: string, organizationId: string, invitedEmail: string) {
  await markInviteStatus(inviteId, StaffInviteStatus.EXPIRED);
  await createAuditLog({
    organizationId,
    action: "STAFF_INVITE_EXPIRED",
    entityType: "StaffInvite",
    entityId: inviteId,
    metadata: { invitedEmail },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, name, password } = acceptSchema.parse(body);

    const invite = await findInviteByRawToken(token);

    if (!invite) {
      return NextResponse.json({ error: "Invalid invite token" }, { status: 400 });
    }
    if (invite.status === StaffInviteStatus.REVOKED) {
      return NextResponse.json({ error: "Invite has been revoked" }, { status: 400 });
    }
    if (invite.status === StaffInviteStatus.ACCEPTED || invite.usedAt) {
      return NextResponse.json({ error: "Invite is already used" }, { status: 400 });
    }
    if (invite.expiresAt < new Date()) {
      if (invite.status === StaffInviteStatus.PENDING) {
        await markInviteExpiredWithAudit(invite.id, invite.organizationId, invite.invitedEmail);
      }
      return NextResponse.json({ error: "Invite has expired" }, { status: 400 });
    }
    if (!invite.staffId) {
      return NextResponse.json({ error: "Staff account is already linked" }, { status: 400 });
    }

    const staffId = invite.staffId;
    const staff = await db.staff.findUnique({
      where: { id: staffId },
      select: { id: true, userId: true, organizationId: true },
    });
    if (!staff || staff.userId) {
      return NextResponse.json({ error: "Staff account is already linked" }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { email: invite.invitedEmail },
      select: { id: true, email: true, appRole: true },
    });

    if (existingUser) {
      const session = await auth();
      if (!session?.user?.id || session.user.id !== existingUser.id) {
        return NextResponse.json(
          {
            error: "An account with this email already exists. Please login first.",
            code: "INVITE_REQUIRES_LOGIN",
          },
          { status: 409 }
        );
      }

      const linkedElsewhere = await db.staff.findFirst({
        where: { userId: existingUser.id, NOT: { id: staffId } },
        select: { id: true },
      });
      if (linkedElsewhere) {
        return NextResponse.json({ error: "This account is already linked to another staff profile" }, { status: 409 });
      }

      const result = await db.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id: existingUser.id },
          data: { appRole: "STAFF_MEMBER" },
        });

        await tx.staff.update({
          where: { id: staffId },
          data: { userId: user.id, email: invite.invitedEmail },
        });

        return user;
      });

      await markInviteAccepted(invite.id);
      await createAuditLog({
        organizationId: invite.organizationId,
        actorUserId: result.id,
        action: "STAFF_INVITE_ACCEPTED",
        entityType: "StaffInvite",
        entityId: invite.id,
        metadata: { mode: "existing_user", staffId, invitedEmail: invite.invitedEmail },
      });

      return NextResponse.json({ data: { id: result.id, email: result.email, name: result.name } }, { status: 200 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: invite.invitedEmail,
          passwordHash,
          appRole: "STAFF_MEMBER",
        },
      });

      await tx.staff.update({
        where: { id: staffId },
        data: { userId: user.id, email: invite.invitedEmail },
      });

      return user;
    });

    await markInviteAccepted(invite.id);
    await createAuditLog({
      organizationId: invite.organizationId,
      actorUserId: result.id,
      action: "STAFF_INVITE_ACCEPTED",
      entityType: "StaffInvite",
      entityId: invite.id,
      metadata: { mode: "new_user", staffId, invitedEmail: invite.invitedEmail },
    });

    return NextResponse.json(
      {
        data: { id: result.id, email: result.email, name: result.name },
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const invite = await findInviteByRawToken(token);

  if (!invite) {
    return inviteInvalidResponse();
  }

  if (
    invite.usedAt ||
    invite.status === StaffInviteStatus.ACCEPTED ||
    invite.status === StaffInviteStatus.REVOKED ||
    invite.expiresAt < new Date()
  ) {
    if (invite.expiresAt < new Date() && invite.status === StaffInviteStatus.PENDING) {
      await markInviteExpiredWithAudit(invite.id, invite.organizationId, invite.invitedEmail);
    }
    return inviteInvalidResponse();
  }

  return NextResponse.json({ data: { email: invite.invitedEmail, expiresAt: invite.expiresAt } });
}
