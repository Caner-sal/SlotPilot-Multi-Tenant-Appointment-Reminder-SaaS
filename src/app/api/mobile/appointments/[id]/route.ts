import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { assertMobileScope, requireMobileRequestAuth } from "@/lib/mobile-request-auth";
import { getRequestId } from "@/lib/request-id";
import { TenantError } from "@/lib/tenant";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const requestId = getRequestId(req.headers);
  const route = "/api/mobile/appointments/[id]";
  try {
    const auth = await requireMobileRequestAuth(req);
    assertMobileScope(auth.scope, "appointments:read");
    const { id } = await params;

    const appointment = await db.appointment.findFirst({
      where: {
        id,
        organizationId: auth.org.id,
        ...(auth.user.appRole === "STAFF_MEMBER" ? { staff: { userId: auth.user.id } } : {}),
      },
      include: {
        service: { select: { name: true, durationMinutes: true } },
        staff: { select: { name: true } },
        customer: { select: { fullName: true, phone: true } },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Randevu bulunamadı" }, { status: 404, headers: { "x-request-id": requestId } });
    }

    return NextResponse.json({ data: appointment }, { headers: { "x-request-id": requestId } });
  } catch (err) {
    if (err instanceof TenantError) {
      logger.warn("mobile appointment detail denied", { requestId, route, outcome: "forbidden" });
      return NextResponse.json({ error: err.message }, { status: 403, headers: { "x-request-id": requestId } });
    }
    logger.error("mobile appointment detail failed", { requestId, route, outcome: "error", err });
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500, headers: { "x-request-id": requestId } });
  }
}
