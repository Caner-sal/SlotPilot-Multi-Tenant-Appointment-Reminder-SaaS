import { db } from "@/lib/db";
import { assertMembership, requireAuth, TenantError } from "@/lib/tenant";
import {
  createStaffInvite,
  markPendingInvitesAsRevokedByStaff,
} from "@/services/staff-invite.service";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const inviteSchema = z.object({
  staffId: z.string().min(1),
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const { user, org } = await requireAuth();
    await assertMembership(user.id, org.id, [MemberRole.OWNER, MemberRole.ADMIN]);

    const body = await req.json();
    const { staffId, email } = inviteSchema.parse(body);

    const staff = await db.staff.findFirst({
      where: { id: staffId, organizationId: org.id },
    });
    if (!staff) {
      return NextResponse.json({ error: "Çalışan bulunamadı" }, { status: 404 });
    }

    await markPendingInvitesAsRevokedByStaff(staffId);

    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
    const { invite, rawToken } = await createStaffInvite({
      organizationId: org.id,
      staffId,
      invitedEmail: email,
      invitedName: staff.name,
      role: MemberRole.STAFF,
      createdByUserId: user.id,
      expiresAt,
    });

    const inviteUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/staff/accept-invite?token=${rawToken}`;

    console.log(`[STAFF INVITE] ${email} -> ${inviteUrl}`);

    return NextResponse.json(
      {
        data: {
          id: invite.id,
          email,
          inviteUrl,
          expiresAt,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof TenantError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
