import { db } from "@/lib/db";
import { canCreateAppointment } from "@/lib/billing";
import { createAuditLog } from "@/services/audit.service";
import { createBooking } from "@/services/booking.service";
import { scheduleReminder } from "@/services/reminder.service";
import { sendEmail, buildBookingConfirmationEmail } from "@/lib/email";
import { generateBookingToken, getBookingManageUrl } from "@/lib/booking-token";
import { bookingSchema } from "@/lib/validators";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(
  req: Request,
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

    const check = await canCreateAppointment(org.id);
    if (!check.allowed) {
      return NextResponse.json({ error: check.reason }, { status: 403 });
    }

    const body = await req.json();
    const parsed = bookingSchema.parse(body);

    const appointment = await createBooking({
      organizationId: org.id,
      serviceId: parsed.serviceId,
      staffId: parsed.staffId,
      startTime: new Date(parsed.startTime),
      customerName: parsed.customerName,
      customerEmail: parsed.customerEmail,
      customerPhone: parsed.customerPhone,
      customerProvince: parsed.customerProvince,
      customerDistrict: parsed.customerDistrict,
      notes: parsed.notes,
    });

    await scheduleReminder(appointment.id, org.id, appointment.startTime);

    // Record KVKK consent
    await db.consentLog.create({
      data: {
        organizationId: org.id,
        customerId: appointment.customerId,
        privacyNoticeAcknowledged: parsed.privacyNoticeAcknowledged,
        explicitConsentGiven: parsed.privacyNoticeAcknowledged,
        appointmentNotificationConsent: parsed.appointmentNotificationConsent ?? true,
        marketingConsent: parsed.marketingConsent ?? false,
        consentVersion: process.env.KVKK_NOTICE_VERSION ?? "2026-01",
        consentIp: req.headers.get("x-forwarded-for") ?? undefined,
        consentUserAgent: req.headers.get("user-agent") ?? undefined,
      },
    });

    await createAuditLog({
      organizationId: org.id,
      action: "APPOINTMENT_BOOKED",
      entityType: "Appointment",
      entityId: appointment.id,
      metadata: {
        customerEmail: parsed.customerEmail,
        serviceId: parsed.serviceId,
        staffId: parsed.staffId,
        startTime: appointment.startTime,
      },
    });

    // Send booking confirmation email (non-blocking)
    generateBookingToken(appointment.id)
      .then((token) => {
        const manageUrl = getBookingManageUrl(token);
        const { subject, html } = buildBookingConfirmationEmail({
          customerName: appointment.customer.fullName,
          businessName: appointment.organization.name,
          serviceName: appointment.service.name,
          staffName: appointment.staff.name,
          startTime: appointment.startTime,
          priceCents: appointment.service.priceCents,
          currency: appointment.service.currency,
          manageUrl,
        });
        return sendEmail({ to: appointment.customer.email!, subject, html });
      })
      .then((result) => {
        if (!result.success) {
          console.error("[BOOKING CONFIRMATION EMAIL] Failed:", result.error);
        }
      })
      .catch((err) => {
        console.error("[BOOKING CONFIRMATION EMAIL] Error:", err);
      });

    return NextResponse.json({ data: appointment }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    if (err instanceof Error && err.message === "This time slot is no longer available") {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

