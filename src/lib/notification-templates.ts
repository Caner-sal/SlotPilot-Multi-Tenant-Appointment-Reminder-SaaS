import { defaultLocale, isAppLocale, type AppLocale } from "@/i18n/locales";
import {
  buildAppointmentReminderSMSTR,
  buildAppointmentReminderEmailTR,
  type AppointmentReminderData
} from "@/services/notifications/templates/tr/appointment-reminder";
import {
  buildAppointmentConfirmationSMSTR,
  buildAppointmentConfirmationEmailTR,
  type AppointmentConfirmationData
} from "@/services/notifications/templates/tr/appointment-confirmation";
import {
  buildMarketingSMSTR,
  buildMarketingEmailTR,
  requiresMarketingConsent,
  type MarketingData
} from "@/services/notifications/templates/tr/marketing";
import {
  buildAppointmentReminderSMSEN,
  buildAppointmentReminderEmailEN
} from "@/services/notifications/templates/en/appointment-reminder";
import {
  buildAppointmentReminderSMSDE,
  buildAppointmentReminderEmailDE
} from "@/services/notifications/templates/de/appointment-reminder";
import {
  buildAppointmentReminderSMSAR,
  buildAppointmentReminderEmailAR
} from "@/services/notifications/templates/ar/appointment-reminder";
import {
  buildAppointmentConfirmationSMSEN,
  buildAppointmentConfirmationEmailEN
} from "@/services/notifications/templates/en/appointment-confirmation";
import {
  buildAppointmentConfirmationSMSDE,
  buildAppointmentConfirmationEmailDE
} from "@/services/notifications/templates/de/appointment-confirmation";
import {
  buildAppointmentConfirmationSMSAR,
  buildAppointmentConfirmationEmailAR
} from "@/services/notifications/templates/ar/appointment-confirmation";
import { buildMarketingSMSEN, buildMarketingEmailEN } from "@/services/notifications/templates/en/marketing";
import { buildMarketingSMSDE, buildMarketingEmailDE } from "@/services/notifications/templates/de/marketing";
import { buildMarketingSMSAR, buildMarketingEmailAR } from "@/services/notifications/templates/ar/marketing";

export type NotificationChannel = "sms" | "email" | "whatsapp";
export type NotificationCategory = "appointment_reminder" | "appointment_confirmation" | "marketing";
export type NotificationLocale = AppLocale;

type EmailTemplate = { subject: string; text: string; html: string };

type LocaleContext = {
  customerPreferredLocale?: string | null;
  organizationDefaultLocale?: string | null;
  userPreferredLocale?: string | null;
  fallbackLocale?: NotificationLocale;
};

export function resolveNotificationLocale(context?: LocaleContext): NotificationLocale {
  const fallback = context?.fallbackLocale ?? defaultLocale;

  if (isAppLocale(context?.customerPreferredLocale)) {
    return context.customerPreferredLocale;
  }
  if (isAppLocale(context?.organizationDefaultLocale)) {
    return context.organizationDefaultLocale;
  }
  if (isAppLocale(context?.userPreferredLocale)) {
    return context.userPreferredLocale;
  }

  return fallback;
}

const reminderSmsByLocale: Record<NotificationLocale, (data: AppointmentReminderData) => string> = {
  tr: buildAppointmentReminderSMSTR,
  en: buildAppointmentReminderSMSEN,
  de: buildAppointmentReminderSMSDE,
  ar: buildAppointmentReminderSMSAR
};

const reminderEmailByLocale: Record<NotificationLocale, (data: AppointmentReminderData) => EmailTemplate> = {
  tr: buildAppointmentReminderEmailTR,
  en: buildAppointmentReminderEmailEN,
  de: buildAppointmentReminderEmailDE,
  ar: buildAppointmentReminderEmailAR
};

const confirmationSmsByLocale: Record<NotificationLocale, (data: AppointmentConfirmationData) => string> = {
  tr: buildAppointmentConfirmationSMSTR,
  en: buildAppointmentConfirmationSMSEN,
  de: buildAppointmentConfirmationSMSDE,
  ar: buildAppointmentConfirmationSMSAR
};

const confirmationEmailByLocale: Record<NotificationLocale, (data: AppointmentConfirmationData) => EmailTemplate> = {
  tr: buildAppointmentConfirmationEmailTR,
  en: buildAppointmentConfirmationEmailEN,
  de: buildAppointmentConfirmationEmailDE,
  ar: buildAppointmentConfirmationEmailAR
};

const marketingSmsByLocale: Record<NotificationLocale, (data: MarketingData) => string> = {
  tr: buildMarketingSMSTR,
  en: buildMarketingSMSEN,
  de: buildMarketingSMSDE,
  ar: buildMarketingSMSAR
};

const marketingEmailByLocale: Record<NotificationLocale, (data: MarketingData) => EmailTemplate> = {
  tr: buildMarketingEmailTR,
  en: buildMarketingEmailEN,
  de: buildMarketingEmailDE,
  ar: buildMarketingEmailAR
};

export function getAppointmentReminderTemplate(
  channel: NotificationChannel,
  data: AppointmentReminderData,
  localeContext?: LocaleContext
): string | EmailTemplate {
  const locale = resolveNotificationLocale(localeContext);
  if (channel === "email") return reminderEmailByLocale[locale](data);
  return reminderSmsByLocale[locale](data);
}

export function getAppointmentConfirmationTemplate(
  channel: NotificationChannel,
  data: AppointmentConfirmationData,
  localeContext?: LocaleContext
): string | EmailTemplate {
  const locale = resolveNotificationLocale(localeContext);
  if (channel === "email") return confirmationEmailByLocale[locale](data);
  return confirmationSmsByLocale[locale](data);
}

export function getMarketingTemplate(
  channel: NotificationChannel,
  data: MarketingData,
  hasMarketingConsent: boolean,
  localeContext?: LocaleContext
): string | EmailTemplate | null {
  if (!hasMarketingConsent) return null;
  const locale = resolveNotificationLocale(localeContext);
  if (channel === "email") return marketingEmailByLocale[locale](data);
  return marketingSmsByLocale[locale](data);
}

export { requiresMarketingConsent };
