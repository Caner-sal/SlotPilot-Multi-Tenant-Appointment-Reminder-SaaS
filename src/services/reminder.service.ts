import { db } from "@/lib/db";
import { sendEmail, buildReminderEmail } from "@/lib/email";
import { canUseEmailReminders } from "@/lib/billing";

export async function scheduleReminder(appointmentId: string, organizationId: string, startTime: Date): Promise<void> {
  const scheduledAt = new Date(startTime.getTime() - 24 * 60 * 60 * 1000);

  await db.reminder.create({
    data: {
      organizationId,
      appointmentId,
      type: "EMAIL",
      scheduledAt,
      status: "PENDING",
    },
  });
}

export async function processPendingReminders(): Promise<{ processed: number; sent: number; failed: number }> {
  const now = new Date();

  const pending = await db.reminder.findMany({
    where: {
      status: "PENDING",
      scheduledAt: { lte: now },
    },
    include: {
      appointment: {
        include: {
          customer: true,
          service: true,
          staff: true,
          organization: true,
        },
      },
    },
    take: 50,
  });

  let sent = 0;
  let failed = 0;

  for (const reminder of pending) {
    const { appointment } = reminder;

    if (!appointment.customer.email) {
      await db.reminder.update({
        where: { id: reminder.id },
        data: { status: "FAILED", errorMessage: "No customer email", sentAt: now },
      });
      failed++;
      continue;
    }

    const canEmail = await canUseEmailReminders(appointment.organizationId);
    if (!canEmail) {
      await db.reminder.update({
        where: { id: reminder.id },
        data: { status: "FAILED", errorMessage: "Email reminders not available on current plan", sentAt: now },
      });
      failed++;
      continue;
    }

    const { subject, html } = buildReminderEmail({
      customerName: appointment.customer.fullName,
      businessName: appointment.organization.name,
      serviceName: appointment.service.name,
      staffName: appointment.staff.name,
      startTime: appointment.startTime,
      bookingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/booking/${appointment.organization.slug}`,
    });

    const result = await sendEmail({
      to: appointment.customer.email,
      subject,
      html,
    });

    await db.reminder.update({
      where: { id: reminder.id },
      data: {
        status: result.success ? "SENT" : "FAILED",
        sentAt: now,
        errorMessage: result.error,
      },
    });

    if (result.success) sent++;
    else failed++;
  }

  return { processed: pending.length, sent, failed };
}
