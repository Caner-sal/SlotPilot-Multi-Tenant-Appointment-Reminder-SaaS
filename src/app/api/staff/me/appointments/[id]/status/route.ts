import { db } from "@/lib/db";
import { requireStaffAuth, StaffAuthError } from "@/lib/staff-auth";
import { createAuditLog } from "@/services/audit.service";
import { NextResponse } from "next/server";
import { z } from "zod";

const staffStatusSchema = z.object({
  status: z.enum(["COMPLETED", "NO_SHOW"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { organizationId, staffId, userId } = await requireStaffAuth();
    const body = await req.json();
    const parsed = staffStatusSchema.parse(body);

    const existing = await db.appointment.findFirst({
      where: { id, organizationId, staffId },
      select: { id: true, status: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const updated = await db.appointment.update({
      where: { id },
      data: { status: parsed.status },
      include: {
        service: { select: { name: true } },
        customer: { select: { fullName: true } },
      },
    });

    await createAuditLog({
      organizationId,
      actorUserId: userId,
      action: "STAFF_APPOINTMENT_STATUS_CHANGED",
      entityType: "Appointment",
      entityId: id,
      metadata: { previousStatus: existing.status, newStatus: parsed.status },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    if (err instanceof StaffAuthError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
