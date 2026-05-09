import { db } from "@/lib/db";
import { requireAuth, TenantError } from "@/lib/tenant";
import { createAuditLog } from "@/services/audit.service";
import { staffSchema } from "@/lib/validators";
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
    const parsed = staffSchema.partial().parse(body);

    const existing = await db.staff.findFirst({
      where: { id, organizationId: org.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Çalışan bulunamadı" }, { status: 404 });
    }

    const { serviceIds, ...staffData } = parsed;

    const updated = await db.$transaction(async (tx) => {
      const staff = await tx.staff.update({ where: { id }, data: staffData });

      if (serviceIds !== undefined) {
        await tx.staffService.deleteMany({ where: { staffId: id } });
        if (serviceIds.length > 0) {
          await tx.staffService.createMany({
            data: serviceIds.map((serviceId) => ({ staffId: id, serviceId })),
          });
        }
      }

      return tx.staff.findUnique({
        where: { id: staff.id },
        include: { staffServices: { include: { service: true } } },
      });
    });

    await createAuditLog({
      organizationId: org.id,
      actorUserId: user.id,
      action: "STAFF_UPDATED",
      entityType: "Staff",
      entityId: id,
      metadata: staffData,
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
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, org } = await requireAuth();
    const { id } = await params;

    const existing = await db.staff.findFirst({
      where: { id, organizationId: org.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Çalışan bulunamadı" }, { status: 404 });
    }

    const updated = await db.staff.update({
      where: { id },
      data: { isActive: false },
    });

    await createAuditLog({
      organizationId: org.id,
      actorUserId: user.id,
      action: "STAFF_DELETED",
      entityType: "Staff",
      entityId: id,
      metadata: { name: existing.name },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    if (err instanceof TenantError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

