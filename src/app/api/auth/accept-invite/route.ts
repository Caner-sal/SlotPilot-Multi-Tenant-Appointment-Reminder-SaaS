import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

const acceptSchema = z.object({
  token: z.string().min(1),
  name: z.string().min(2),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, name, password } = acceptSchema.parse(body);

    const invite = await db.staffInvite.findUnique({
      where: { token },
      include: { staff: true },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invalid invite token" }, { status: 400 });
    }
    if (invite.usedAt) {
      return NextResponse.json({ error: "Davet daha önce kullanılmış" }, { status: 400 });
    }
    if (invite.expiresAt < new Date()) {
      return NextResponse.json({ error: "Davetin süresi dolmuş" }, { status: 400 });
    }
    if (invite.staff.userId) {
      return NextResponse.json({ error: "Çalışan hesabı zaten bağlanmış" }, { status: 400 });
    }

    // Check if user with this email already exists
    const existingUser = await db.user.findUnique({ where: { email: invite.email } });
    if (existingUser) {
      return NextResponse.json({ error: "Bu e-posta ile kayıtlı bir hesap zaten var" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: invite.email,
          passwordHash,
          appRole: "STAFF_MEMBER",
        },
      });

      await tx.staff.update({
        where: { id: invite.staffId },
        data: { userId: user.id, email: invite.email },
      });

      await tx.staffInvite.update({
        where: { id: invite.id },
        data: { usedAt: new Date() },
      });

      return user;
    });

    return NextResponse.json({
      data: { id: result.id, email: result.email, name: result.name },
    }, { status: 201 });
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

  const invite = await db.staffInvite.findUnique({
    where: { token },
    select: { email: true, expiresAt: true, usedAt: true, organizationId: true },
  });

  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "Geçersiz veya süresi dolmuş davet" }, { status: 400 });
  }

  return NextResponse.json({ data: { email: invite.email, expiresAt: invite.expiresAt } });
}

