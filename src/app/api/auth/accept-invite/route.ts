import { db } from "@/lib/db";
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, name, password } = acceptSchema.parse(body);

    const invite = await findInviteByRawToken(token);

    if (!invite) {
      return NextResponse.json({ error: "Invalid invite token" }, { status: 400 });
    }
    if (invite.status === StaffInviteStatus.REVOKED) {
      return NextResponse.json({ error: "Davet iptal edilmiş" }, { status: 400 });
    }
    if (invite.status === StaffInviteStatus.ACCEPTED || invite.usedAt) {
      return NextResponse.json({ error: "Davet daha önce kullanılmış" }, { status: 400 });
    }
    if (invite.expiresAt < new Date()) {
      if (invite.status === StaffInviteStatus.PENDING) {
        await markInviteStatus(invite.id, StaffInviteStatus.EXPIRED);
      }
      return NextResponse.json({ error: "Davetin süresi dolmuş" }, { status: 400 });
    }
    if (!invite.staffId) {
      return NextResponse.json({ error: "Çalışan hesabı zaten bağlanmış" }, { status: 400 });
    }
    const staffId = invite.staffId;

    const staff = await db.staff.findUnique({
      where: { id: staffId },
      select: { id: true, userId: true },
    });
    if (!staff || staff.userId) {
      return NextResponse.json({ error: "Çalışan hesabı zaten bağlanmış" }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { email: invite.invitedEmail } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Bu e-posta ile kayıtlı bir hesap zaten var" },
        { status: 409 }
      );
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
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token gerekli" }, { status: 400 });
  }

  const invite = await findInviteByRawToken(token);

  if (!invite) {
    return NextResponse.json({ error: "Geçersiz veya süresi dolmuş davet" }, { status: 400 });
  }

  if (
    invite.usedAt ||
    invite.status === StaffInviteStatus.ACCEPTED ||
    invite.status === StaffInviteStatus.REVOKED ||
    invite.expiresAt < new Date()
  ) {
    if (invite.expiresAt < new Date() && invite.status === StaffInviteStatus.PENDING) {
      await markInviteStatus(invite.id, StaffInviteStatus.EXPIRED);
    }
    return NextResponse.json({ error: "Geçersiz veya süresi dolmuş davet" }, { status: 400 });
  }

  return NextResponse.json({ data: { email: invite.invitedEmail, expiresAt: invite.expiresAt } });
}
