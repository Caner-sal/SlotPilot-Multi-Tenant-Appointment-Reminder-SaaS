import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrganizationForUser } from "@/lib/tenant";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const org = await getOrganizationForUser(session.user.id);
  if (!org) {
    return NextResponse.json({ error: "İşletme bulunamadı" }, { status: 404 });
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

  const [entries, invoiceProfile] = await Promise.all([
    db.revenueLedger.findMany({ where, orderBy: { recordedAt: "asc" } }),
    db.invoiceProfile.findUnique({ where: { organizationId: org.id } }),
  ]);

  const format = searchParams.get("format") ?? "csv";

  if (format === "json") {
    return NextResponse.json({
      data: entries,
      invoiceProfile: invoiceProfile ?? null,
      organization: { id: org.id, name: org.name },
      exportedAt: new Date().toISOString(),
    });
  }

  // CSV export with invoice profile columns
  const invoiceType = invoiceProfile?.invoiceType ?? "";
  const companyTitle = invoiceProfile?.companyTitle ?? "";
  const taxOffice = invoiceProfile?.taxOffice ?? "";
  const taxNumber = invoiceProfile?.taxNumber ?? "";

  const lines = [
    "id,type,amountCents,currency,appointmentId,paymentId,recordedAt,invoiceType,companyTitle,taxOffice,taxNumber",
    ...entries.map((e) =>
      [
        e.id, e.type, e.amountCents, e.currency,
        e.appointmentId ?? "", e.paymentId ?? "",
        e.recordedAt.toISOString(),
        invoiceType, `"${companyTitle}"`, `"${taxOffice}"`, `"${taxNumber}"`,
      ].join(",")
    ),
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="revenue-${org.id}.csv"`,
    },
  });
}

