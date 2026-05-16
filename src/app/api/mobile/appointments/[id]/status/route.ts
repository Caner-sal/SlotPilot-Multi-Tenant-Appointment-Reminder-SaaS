import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { assertMobileScope, requireMobileRequestAuth } from "@/lib/mobile-request-auth";
import { getRequestId } from "@/lib/request-id";
import { TenantError } from "@/lib/tenant";
import { appointmentStatusSchema } from "@/lib/validators";
import { createAuditLog } from "@/services/audit.service";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getRequestId(req.headers);
  const route = "/api/mobile/appointments/[id]/status";
  try {
    const auth = await requireMobileRequestAuth(req);
    assertMobileScope(auth.scope, "appointments:write");
    const { id } = await params;
    const body = await req.json();
    const parsed = appointmentStatusSchema.parse(body);

    const existing = await db.appointment.findFirst({
      where: {
        id,
        organizationId: auth.org.id,
      },
    });
    if (!existing) {
      return NextResponse.json({ error: "Randevu bulunamadı" }, { status: 404, headers: { "x-request-id": requestId } });
    }

    const updated = await db.appointment.update({
      where: { id },
      data: { status: parsed.status },
      include: {
        service: { select: { name: true, durationMinutes: true } },
        staff: { select: { name: true } },
        customer: { select: { fullName: true, phone: true } },
      },
    });

    await createAuditLog({
      organizationId: auth.org.id,
      actorUserId: auth.user.id,
      action: "APPOINTMENT_STATUS_CHANGED_MOBILE",
      entityType: "Appointment",
      entityId: id,
      metadata: { previousStatus: existing.status, newStatus: parsed.status },
    });

    return NextResponse.json({ data: updated }, { headers: { "x-request-id": requestId } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400, headers: { "x-request-id": requestId } });
    }
    if (err instanceof TenantError) {
      logger.warn("mobile appointment status denied", { requestId, route, outcome: "forbidden" });
      return NextResponse.json({ error: err.message }, { status: 403, headers: { "x-request-id": requestId } });
    }
    logger.error("mobile appointment status failed", { requestId, route, outcome: "error", err });
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500, headers: { "x-request-id": requestId } });
  }
}
