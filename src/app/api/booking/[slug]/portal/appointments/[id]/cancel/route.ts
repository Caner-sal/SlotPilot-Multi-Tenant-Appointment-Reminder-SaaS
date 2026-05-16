import { db } from "@/lib/db";
import { createAuditLog } from "@/services/audit.service";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id: appointmentId } = await params;
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

    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      select: {
        id: true,
        status: true,
        organizationId: true,
        customerId: true,
        startTime: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Randevu bulunamadı." }, { status: 404 });
    }

    if (appointment.organizationId !== org.id || appointment.customerId !== customerId) {
      return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 403 });
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
        customer: { select: { email: true } },
      },
    });

    // Audit log
    await createAuditLog({
      organizationId: appointment.organizationId,
      action: "APPOINTMENT_CANCELLED_BY_CUSTOMER_PORTAL",
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
    console.error("[PORTAL APPOINTMENT CANCEL]", err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
