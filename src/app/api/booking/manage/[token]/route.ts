import { db } from "@/lib/db";
import { verifyBookingToken } from "@/lib/booking-token";
import { NextResponse } from "next/server";

/**
 * GET /api/booking/manage/[token]
 * Returns appointment details for the given management token.
 * No auth required — the token itself is the auth.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const appointmentId = await verifyBookingToken(token);

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Geçersiz veya süresi dolmuş bağlantı." },
        { status: 401 }
      );
    }

    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        service: { select: { name: true, durationMinutes: true, priceCents: true, currency: true } },
        staff: { select: { name: true } },
        customer: { select: { fullName: true, email: true, phone: true } },
        organization: { select: { name: true, phone: true, address: true, slug: true } },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Randevu bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: appointment });
  } catch (err) {
    console.error("[BOOKING MANAGE GET]", err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
