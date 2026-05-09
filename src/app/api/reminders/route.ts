import { db } from "@/lib/db";
import { requireAuth, TenantError } from "@/lib/tenant";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { org } = await requireAuth();
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

    const [reminders, total] = await Promise.all([
      db.reminder.findMany({
        where: { organizationId: org.id },
        include: {
          appointment: {
            include: { customer: true, service: true },
          },
        },
        orderBy: { scheduledAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.reminder.count({ where: { organizationId: org.id } }),
    ]);

    return NextResponse.json({
      data: reminders,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    if (err instanceof TenantError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

