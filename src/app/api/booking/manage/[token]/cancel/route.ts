import { db } from "@/lib/db";
import { verifyBookingToken } from "@/lib/booking-token";
import { createAuditLog } from "@/services/audit.service";
import { NextResponse } from "next/server";

/**
 * POST /api/booking/manage/[token]/cancel
 * Allows a customer to cancel their appointment using a management token.
 * No auth required — the token itself is the auth.
 */
export async function POST(
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
      select: {
        id: true,
        status: true,
        organizationId: true,
        startTime: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Randevu bulunamadı." },
        { status: 404 }
      );
    }

    // Only allow cancellation of PENDING or CONFIRMED appointments
    if (!["PENDING", "CONFIRMED"].includes(appointment.status)) {
      return NextResponse.json(
        { error: "Bu randevu zaten iptal edilmiş veya tamamlanmış." },
        { status: 400 }
      );
    }

    // Don't allow cancellation of past appointments
    if (appointment.startTime < new Date()) {
      return NextResponse.json(
        { error: "Geçmiş randevular iptal edilemez." },
        { status: 400 }
      );
    }

    // Cancel the appointment
    const updated = await db.appointment.update({
      where: { id: appointmentId },
      data: { status: "CANCELLED" },
      include: {
        service: { select: { name: true } },
        staff: { select: { name: true } },
        customer: { select: { fullName: true, email: true } },
        organization: { select: { name: true } },
      },
    });

    // Audit log
    await createAuditLog({
      organizationId: appointment.organizationId,
      action: "APPOINTMENT_CANCELLED_BY_CUSTOMER",
      entityType: "Appointment",
      entityId: appointmentId,
      metadata: {
        customerEmail: updated.customer.email,
        cancelledAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      data: { message: "Randevunuz başarıyla iptal edildi.", appointment: updated },
    });
  } catch (err) {
    console.error("[BOOKING MANAGE CANCEL]", err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
