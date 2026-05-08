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

  const entries = await db.revenueLedger.findMany({
    where,
    orderBy: { recordedAt: "asc" },
  });

  const lines = [
    "id,type,amountCents,currency,appointmentId,paymentId,recordedAt",
    ...entries.map((e) =>
      [e.id, e.type, e.amountCents, e.currency, e.appointmentId ?? "", e.paymentId ?? "", e.recordedAt.toISOString()].join(",")
    ),
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="revenue-${org.id}.csv"`,
    },
  });
}
