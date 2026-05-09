import {
  buildAppointmentReminderSMSTR,
  buildAppointmentReminderEmailTR,
  type AppointmentReminderData,
} from "@/services/notifications/templates/tr/appointment-reminder";
import {
  buildAppointmentConfirmationSMSTR,
  buildAppointmentConfirmationEmailTR,
  type AppointmentConfirmationData,
} from "@/services/notifications/templates/tr/appointment-confirmation";
import {
  buildMarketingSMSTR,
  buildMarketingEmailTR,
  requiresMarketingConsent,
  type MarketingData,
} from "@/services/notifications/templates/tr/marketing";

export type NotificationChannel = "sms" | "email" | "whatsapp";
export type NotificationCategory = "appointment_reminder" | "appointment_confirmation" | "marketing";

export function getAppointmentReminderTemplate(
  channel: NotificationChannel,
  data: AppointmentReminderData
): string | { subject: string; text: string; html: string } {
  if (channel === "email") return buildAppointmentReminderEmailTR(data);
  return buildAppointmentReminderSMSTR(data);
}

export function getAppointmentConfirmationTemplate(
  channel: NotificationChannel,
  data: AppointmentConfirmationData
): string | { subject: string; text: string; html: string } {
  if (channel === "email") return buildAppointmentConfirmationEmailTR(data);
  return buildAppointmentConfirmationSMSTR(data);
}

export function getMarketingTemplate(
  channel: NotificationChannel,
  data: MarketingData,
  hasMarketingConsent: boolean
): string | { subject: string; text: string; html: string } | null {
  if (!hasMarketingConsent) return null;
  if (channel === "email") return buildMarketingEmailTR(data);
  return buildMarketingSMSTR(data);
}

export { requiresMarketingConsent };
