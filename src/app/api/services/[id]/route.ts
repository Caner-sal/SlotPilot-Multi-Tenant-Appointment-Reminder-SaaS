import { db } from "@/lib/db";
import { requireAuth, TenantError } from "@/lib/tenant";
import { createAuditLog } from "@/services/audit.service";
import { serviceSchema } from "@/lib/validators";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, org } = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const parsed = serviceSchema.partial().parse(body);

    const existing = await db.service.findFirst({
      where: { id, organizationId: org.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const updated = await db.service.update({ where: { id }, data: parsed });

    await createAuditLog({
      organizationId: org.id,
      actorUserId: user.id,
      action: "SERVICE_UPDATED",
      entityType: "Service",
      entityId: id,
      metadata: parsed,
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    if (err instanceof TenantError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, org } = await requireAuth();
    const { id } = await params;

    const existing = await db.service.findFirst({
      where: { id, organizationId: org.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const updated = await db.service.update({
      where: { id },
      data: { isActive: false },
    });

    await createAuditLog({
      organizationId: org.id,
      actorUserId: user.id,
      action: "SERVICE_DELETED",
      entityType: "Service",
      entityId: id,
      metadata: { name: existing.name },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    if (err instanceof TenantError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
