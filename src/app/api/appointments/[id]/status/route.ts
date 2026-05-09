import { db } from "@/lib/db";
import { requireAuth, TenantError } from "@/lib/tenant";
import { createAuditLog } from "@/services/audit.service";
import { appointmentStatusSchema } from "@/lib/validators";
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
    const parsed = appointmentStatusSchema.parse(body);

    const existing = await db.appointment.findFirst({
      where: { id, organizationId: org.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Randevu bulunamadı" }, { status: 404 });
    }

    const updated = await db.appointment.update({
      where: { id },
      data: { status: parsed.status },
      include: { service: true, staff: true, customer: true },
    });

    await createAuditLog({
      organizationId: org.id,
      actorUserId: user.id,
      action: "APPOINTMENT_STATUS_CHANGED",
      entityType: "Appointment",
      entityId: id,
      metadata: { previousStatus: existing.status, newStatus: parsed.status },
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

