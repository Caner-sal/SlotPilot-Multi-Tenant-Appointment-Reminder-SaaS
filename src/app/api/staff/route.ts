import { db } from "@/lib/db";
import { requireAuth, TenantError } from "@/lib/tenant";
import { createAuditLog } from "@/services/audit.service";
import { canCreateStaff } from "@/lib/billing";
import { staffSchema } from "@/lib/validators";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  try {
    const { org } = await requireAuth();

    const staff = await db.staff.findMany({
      where: { organizationId: org.id },
      include: {
        staffServices: { include: { service: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: staff });
  } catch (err) {
    if (err instanceof TenantError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, org } = await requireAuth();
    const body = await req.json();
    const parsed = staffSchema.parse(body);

    const check = await canCreateStaff(org.id);
    if (!check.allowed) {
      return NextResponse.json({ error: check.reason }, { status: 403 });
    }

    const { serviceIds, ...staffData } = parsed;

    const staff = await db.$transaction(async (tx) => {
      const created = await tx.staff.create({
        data: { ...staffData, organizationId: org.id },
      });

      if (serviceIds && serviceIds.length > 0) {
        await tx.staffService.createMany({
          data: serviceIds.map((serviceId) => ({ staffId: created.id, serviceId })),
          skipDuplicates: true,
        });
      }

      return tx.staff.findUnique({
        where: { id: created.id },
        include: { staffServices: { include: { service: true } } },
      });
    });

    await createAuditLog({
      organizationId: org.id,
      actorUserId: user.id,
      action: "STAFF_CREATED",
      entityType: "Staff",
      entityId: staff!.id,
      metadata: { name: staff!.name },
    });

    return NextResponse.json({ data: staff }, { status: 201 });
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
