import { db } from "@/lib/db";
import { generateAvailableSlots } from "@/services/booking.service";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);

    const serviceId = searchParams.get("serviceId");
    const staffId = searchParams.get("staffId");
    const dateParam = searchParams.get("date");

    if (!serviceId || !staffId || !dateParam) {
      return NextResponse.json(
        { error: "serviceId, staffId ve date alanları zorunludur" },
        { status: 400 }
      );
    }

    const date = new Date(dateParam);
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

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

    const slots = await generateAvailableSlots({
      organizationId: org.id,
      serviceId,
      staffId,
      date,
    });

    return NextResponse.json({ data: slots });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

