import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const org = await db.organization.findUnique({
      where: { slug },
      select: { id: true, bookingEnabled: true },
    });

    if (!org) {
      return NextResponse.json({ error: "İşletme bulunamadı" }, { status: 404 });
    }

    if (!org.bookingEnabled) {
      return NextResponse.json({ error: "Online booking is not available for this business" }, { status: 403 });
    }

    const services = await db.service.findMany({
      where: { organizationId: org.id, isActive: true },
      include: {
        staffServices: {
          include: {
            staff: { select: { id: true, name: true, isActive: true } },
          },
          where: { staff: { isActive: true } },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: services });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

