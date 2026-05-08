import { db } from "@/lib/db";
import { requireAuth, TenantError } from "@/lib/tenant";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { org } = await requireAuth();
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");
    const staffId = searchParams.get("staffId");
    const serviceId = searchParams.get("serviceId");
    const date = searchParams.get("date");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

    const where: Record<string, unknown> = { organizationId: org.id };
    if (status) where.status = status;
    if (staffId) where.staffId = staffId;
    if (serviceId) where.serviceId = serviceId;
    if (date) {
      const day = new Date(date);
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      where.startTime = { gte: day, lt: nextDay };
    }

    const [appointments, total] = await Promise.all([
      db.appointment.findMany({
        where,
        include: {
          service: true,
          staff: true,
          customer: true,
        },
        orderBy: { startTime: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.appointment.count({ where }),
    ]);

    return NextResponse.json({
      data: appointments,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    if (err instanceof TenantError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
