import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { assertMobileScope, requireMobileRequestAuth } from "@/lib/mobile-request-auth";
import { getRequestId } from "@/lib/request-id";
import { TenantError } from "@/lib/tenant";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const requestId = getRequestId(req.headers);
  const route = "/api/mobile/appointments";
  try {
    const auth = await requireMobileRequestAuth(req);
    assertMobileScope(auth.scope, "appointments:read");

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "40", 10)));

    const where: Record<string, unknown> = {
      organizationId: auth.org.id,
    };

    if (auth.user.appRole === "STAFF_MEMBER") {
      where.staff = {
        userId: auth.user.id,
      };
    }
    if (status) {
      where.status = status;
    }
    if (dateFrom || dateTo) {
      const start = dateFrom ? new Date(dateFrom) : undefined;
      const end = dateTo ? new Date(dateTo) : undefined;
      where.startTime = {
        ...(start ? { gte: start } : {}),
        ...(end ? { lte: end } : {}),
      };
    }

    const [appointments, total] = await Promise.all([
      db.appointment.findMany({
        where,
        include: {
          service: { select: { name: true, durationMinutes: true } },
          staff: { select: { name: true } },
          customer: { select: { fullName: true, phone: true } },
        },
        orderBy: { startTime: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.appointment.count({ where }),
    ]);

    return NextResponse.json(
      {
        data: appointments,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
      { headers: { "x-request-id": requestId } }
    );
  } catch (err) {
    if (err instanceof TenantError) {
      logger.warn("mobile appointments denied", { requestId, route, outcome: "forbidden" });
      return NextResponse.json({ error: err.message }, { status: 403, headers: { "x-request-id": requestId } });
    }
    logger.error("mobile appointments failed", { requestId, route, outcome: "error", err });
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500, headers: { "x-request-id": requestId } });
  }
}
