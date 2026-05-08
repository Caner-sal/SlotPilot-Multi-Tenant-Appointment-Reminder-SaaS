import { db } from "@/lib/db";
import { requireAuth, TenantError } from "@/lib/tenant";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { org } = await requireAuth();
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where: { organizationId: org.id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.auditLog.count({ where: { organizationId: org.id } }),
    ]);

    return NextResponse.json({
      data: logs,
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
