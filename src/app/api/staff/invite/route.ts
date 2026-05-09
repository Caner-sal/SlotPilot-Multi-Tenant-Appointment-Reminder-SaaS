import { db } from "@/lib/db";
import { requireAuth, TenantError } from "@/lib/tenant";
import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";

const inviteSchema = z.object({
  staffId: z.string().min(1),
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const { org } = await requireAuth();
    const body = await req.json();
    const { staffId, email } = inviteSchema.parse(body);

    const staff = await db.staff.findFirst({
      where: { id: staffId, organizationId: org.id },
    });
    if (!staff) {
      return NextResponse.json({ error: "Çalışan bulunamadı" }, { status: 404 });
    }

    // Mark any previous unused invites as used (invalidate old invites)
    await db.staffInvite.updateMany({
      where: { staffId, usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

    const invite = await db.staffInvite.create({
      data: { organizationId: org.id, staffId, token, email, expiresAt },
    });

    const inviteUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/staff/accept-invite?token=${token}`;

    // In production: send via email. For now: return in response (and log)
    console.log(`[STAFF INVITE] ${email} -> ${inviteUrl}`);

    return NextResponse.json({ data: { id: invite.id, email, inviteUrl, expiresAt } }, { status: 201 });
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

