import { db } from "@/lib/db";
import { getCurrentUser, TenantError } from "@/lib/tenant";
import { createAuditLog } from "@/services/audit.service";
import { organizationSchema } from "@/lib/validators";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const parsed = organizationSchema.parse(body);

    const slugTaken = await db.organization.findUnique({ where: { slug: parsed.slug } });
    if (slugTaken) {
      return NextResponse.json({ error: "Bu kısa ad zaten kullanımda" }, { status: 409 });
    }

    const org = await db.$transaction(async (tx) => {
      const created = await tx.organization.create({ data: parsed });

      await tx.organizationMember.create({
        data: { organizationId: created.id, userId: user.id, role: "OWNER" },
      });

      await tx.subscription.create({
        data: { organizationId: created.id, plan: "FREE" },
      });

      return created;
    });

    await createAuditLog({
      organizationId: org.id,
      actorUserId: user.id,
      action: "ORGANIZATION_CREATED",
      entityType: "Organization",
      entityId: org.id,
      metadata: { name: org.name, slug: org.slug },
    });

    return NextResponse.json({ data: org }, { status: 201 });
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

