import { db } from "@/lib/db";
import { requireStaffAuth, StaffAuthError } from "@/lib/staff-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { staffId, organizationId } = await requireStaffAuth();
    const { searchParams } = new URL(req.url);

    const date = searchParams.get("date");
    const limitRaw = searchParams.get("limit");
    const limit = limitRaw ? Number(limitRaw) : null;

    let startFilter: { gte: Date; lte: Date } | undefined;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      startFilter = { gte: start, lte: end };
    }

    const appointments = await db.appointment.findMany({
      where: {
        organizationId,
        staffId,
        ...(startFilter ? { startTime: startFilter } : {}),
      },
      include: {
        service: { select: { name: true, durationMinutes: true } },
        customer: { select: { fullName: true, phone: true, email: true } },
      },
      orderBy: { startTime: "asc" },
      ...(limit && Number.isFinite(limit) ? { take: Math.max(1, Math.min(50, limit)) } : {}),
    });

    return NextResponse.json({ data: appointments });
  } catch (err) {
    if (err instanceof StaffAuthError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
