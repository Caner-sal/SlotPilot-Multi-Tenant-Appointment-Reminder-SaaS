import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrganizationForUser } from "@/lib/tenant";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await getOrganizationForUser(session.user.id);
  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Record<string, unknown> = { organizationId: org.id };
  if (from || to) {
    where.recordedAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  const [entries, aggregate] = await Promise.all([
    db.revenueLedger.findMany({
      where,
      orderBy: { recordedAt: "desc" },
      take: 200,
    }),
    db.revenueLedger.aggregate({
      where,
      _sum: { amountCents: true },
      _count: { id: true },
    }),
  ]);

  return NextResponse.json({
    data: {
      entries,
      total: {
        amountCents: aggregate._sum.amountCents ?? 0,
        count: aggregate._count.id,
      },
    },
  });
}
