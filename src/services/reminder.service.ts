import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { canUseEmailReminders } from "@/lib/billing";
import {
  getAppointmentReminderTemplate,
  resolveNotificationLocale,
} from "@/lib/notification-templates";
import { localeMetadata } from "@/i18n/locales";

export type ReminderProcessStats = {
  processed: number;
  sent: number;
  failed: number;
  retried: number;
  permanentFailed: number;
  skipped: number;
};

const MAX_RETRY = 3;
const RETRY_BACKOFF_MINUTES = [5, 15, 60] as const;

function retryBackoffMinutes(retryCount: number): number {
  if (retryCount <= 0) return RETRY_BACKOFF_MINUTES[0];
  const index = Math.min(retryCount - 1, RETRY_BACKOFF_MINUTES.length - 1);
  return RETRY_BACKOFF_MINUTES[index];
}

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

export async function processPendingReminders(): Promise<ReminderProcessStats> {
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
          staff: {
            include: {
              user: true,
            },
          },
          organization: true,
        },
      },
    },
    take: 50,
  });

  let sent = 0;
  let failed = 0;
  let retried = 0;
  let permanentFailed = 0;

  for (const reminder of pending) {
    const { appointment } = reminder;

    if (!appointment.customer.email) {
      await db.reminder.update({
        where: { id: reminder.id },
        data: { status: "FAILED", errorMessage: "No customer email", sentAt: now },
      });
      failed++;
      permanentFailed++;
      continue;
    }

    const canEmail = await canUseEmailReminders(appointment.organizationId);
    if (!canEmail) {
      await db.reminder.update({
        where: { id: reminder.id },
        data: { status: "FAILED", errorMessage: "Email reminders not available on current plan", sentAt: now },
      });
      failed++;
      permanentFailed++;
      continue;
    }

    const localeContext = {
      customerPreferredLocale: appointment.customer.preferredLocale,
      organizationDefaultLocale: appointment.organization.defaultLocale,
      userPreferredLocale: appointment.staff.user?.preferredLocale,
      fallbackLocale: "tr" as const,
    };

    const resolvedLocale = resolveNotificationLocale(localeContext);

    const dateLocale =
      localeMetadata[resolvedLocale as keyof typeof localeMetadata]?.dateLocale ??
      localeMetadata.tr.dateLocale;

    const reminderTemplate = getAppointmentReminderTemplate(
      "email",
      {
        customerName: appointment.customer.fullName,
        businessName: appointment.organization.name,
        serviceName: appointment.service.name,
        date: new Date(appointment.startTime).toLocaleDateString(dateLocale, {
          day: "2-digit",
          month: "long",
          year: "numeric",
          timeZone: "Europe/Istanbul",
        }),
        time: new Date(appointment.startTime).toLocaleTimeString(dateLocale, {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/Istanbul",
        }),
        address: appointment.organization.address ?? undefined,
        phone: appointment.organization.phone ?? undefined,
      },
      localeContext
    ) as { subject: string; text: string; html: string };

    const { subject, html } = reminderTemplate;

    const result = await sendEmail({
      to: appointment.customer.email,
      subject,
      html,
    });

    if (result.success) {
      await db.reminder.update({
        where: { id: reminder.id },
        data: {
          status: "SENT",
          sentAt: now,
          errorMessage: null,
        },
      });
      sent++;
      continue;
    }

    const nextRetryCount = reminder.retryCount + 1;
    if (nextRetryCount <= MAX_RETRY) {
      const backoffMinutes = retryBackoffMinutes(nextRetryCount);
      await db.reminder.update({
        where: { id: reminder.id },
        data: {
          status: "PENDING",
          retryCount: nextRetryCount,
          scheduledAt: new Date(now.getTime() + backoffMinutes * 60 * 1000),
          sentAt: null,
          errorMessage: result.error ?? "temporary_delivery_failure",
        },
      });
      retried++;
      continue;
    }

    await db.reminder.update({
      where: { id: reminder.id },
      data: {
        status: "FAILED",
        retryCount: nextRetryCount,
        sentAt: now,
        errorMessage: result.error ?? "delivery_failed_retry_exhausted",
      },
    });
    failed++;
    permanentFailed++;
  }

  return {
    processed: pending.length,
    sent,
    failed,
    retried,
    permanentFailed,
    skipped: 0,
  };
}
