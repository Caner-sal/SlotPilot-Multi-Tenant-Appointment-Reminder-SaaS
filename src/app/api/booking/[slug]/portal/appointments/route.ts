import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const cookieStore = await cookies();
    const customerId = cookieStore.get(`randevo_customer_session_${slug}`)?.value;

    if (!customerId) {
      return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
    }

    const org = await db.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!org) {
      return NextResponse.json({ error: "İşletme bulunamadı." }, { status: 404 });
    }

    const appointments = await db.appointment.findMany({
      where: {
        organizationId: org.id,
        customerId: customerId,
      },
      include: {
        service: { select: { name: true, priceCents: true, currency: true } },
        staff: { select: { name: true } },
      },
      orderBy: { startTime: "desc" },
    });

    return NextResponse.json({ data: appointments });
  } catch (error) {
    console.error("[PORTAL APPOINTMENTS GET]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
