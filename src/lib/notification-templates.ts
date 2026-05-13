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
  buildAppointmentReminderSMSES,
  buildAppointmentReminderEmailES
} from "@/services/notifications/templates/es/appointment-reminder";
import {
  buildAppointmentReminderSMSFR,
  buildAppointmentReminderEmailFR
} from "@/services/notifications/templates/fr/appointment-reminder";
import {
  buildAppointmentReminderSMSIT,
  buildAppointmentReminderEmailIT
} from "@/services/notifications/templates/it/appointment-reminder";
import {
  buildAppointmentReminderSMSFA,
  buildAppointmentReminderEmailFA
} from "@/services/notifications/templates/fa/appointment-reminder";
import {
  buildAppointmentReminderSMSRU,
  buildAppointmentReminderEmailRU
} from "@/services/notifications/templates/ru/appointment-reminder";
import {
  buildAppointmentReminderSMSNL,
  buildAppointmentReminderEmailNL
} from "@/services/notifications/templates/nl/appointment-reminder";
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
import {
  buildAppointmentConfirmationSMSES,
  buildAppointmentConfirmationEmailES
} from "@/services/notifications/templates/es/appointment-confirmation";
import {
  buildAppointmentConfirmationSMSFR,
  buildAppointmentConfirmationEmailFR
} from "@/services/notifications/templates/fr/appointment-confirmation";
import {
  buildAppointmentConfirmationSMSIT,
  buildAppointmentConfirmationEmailIT
} from "@/services/notifications/templates/it/appointment-confirmation";
import {
  buildAppointmentConfirmationSMSFA,
  buildAppointmentConfirmationEmailFA
} from "@/services/notifications/templates/fa/appointment-confirmation";
import {
  buildAppointmentConfirmationSMSRU,
  buildAppointmentConfirmationEmailRU
} from "@/services/notifications/templates/ru/appointment-confirmation";
import {
  buildAppointmentConfirmationSMSNL,
  buildAppointmentConfirmationEmailNL
} from "@/services/notifications/templates/nl/appointment-confirmation";
import { buildMarketingSMSEN, buildMarketingEmailEN } from "@/services/notifications/templates/en/marketing";
import { buildMarketingSMSDE, buildMarketingEmailDE } from "@/services/notifications/templates/de/marketing";
import { buildMarketingSMSAR, buildMarketingEmailAR } from "@/services/notifications/templates/ar/marketing";
import { buildMarketingSMSES, buildMarketingEmailES } from "@/services/notifications/templates/es/marketing";
import { buildMarketingSMSFR, buildMarketingEmailFR } from "@/services/notifications/templates/fr/marketing";
import { buildMarketingSMSIT, buildMarketingEmailIT } from "@/services/notifications/templates/it/marketing";
import { buildMarketingSMSFA, buildMarketingEmailFA } from "@/services/notifications/templates/fa/marketing";
import { buildMarketingSMSRU, buildMarketingEmailRU } from "@/services/notifications/templates/ru/marketing";
import { buildMarketingSMSNL, buildMarketingEmailNL } from "@/services/notifications/templates/nl/marketing";

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
  ar: buildAppointmentReminderSMSAR,
  es: buildAppointmentReminderSMSES,
  fr: buildAppointmentReminderSMSFR,
  it: buildAppointmentReminderSMSIT,
  fa: buildAppointmentReminderSMSFA,
  ru: buildAppointmentReminderSMSRU,
  nl: buildAppointmentReminderSMSNL
};

const reminderEmailByLocale: Record<NotificationLocale, (data: AppointmentReminderData) => EmailTemplate> = {
  tr: buildAppointmentReminderEmailTR,
  en: buildAppointmentReminderEmailEN,
  de: buildAppointmentReminderEmailDE,
  ar: buildAppointmentReminderEmailAR,
  es: buildAppointmentReminderEmailES,
  fr: buildAppointmentReminderEmailFR,
  it: buildAppointmentReminderEmailIT,
  fa: buildAppointmentReminderEmailFA,
  ru: buildAppointmentReminderEmailRU,
  nl: buildAppointmentReminderEmailNL
};

const confirmationSmsByLocale: Record<NotificationLocale, (data: AppointmentConfirmationData) => string> = {
  tr: buildAppointmentConfirmationSMSTR,
  en: buildAppointmentConfirmationSMSEN,
  de: buildAppointmentConfirmationSMSDE,
  ar: buildAppointmentConfirmationSMSAR,
  es: buildAppointmentConfirmationSMSES,
  fr: buildAppointmentConfirmationSMSFR,
  it: buildAppointmentConfirmationSMSIT,
  fa: buildAppointmentConfirmationSMSFA,
  ru: buildAppointmentConfirmationSMSRU,
  nl: buildAppointmentConfirmationSMSNL
};

const confirmationEmailByLocale: Record<NotificationLocale, (data: AppointmentConfirmationData) => EmailTemplate> = {
  tr: buildAppointmentConfirmationEmailTR,
  en: buildAppointmentConfirmationEmailEN,
  de: buildAppointmentConfirmationEmailDE,
  ar: buildAppointmentConfirmationEmailAR,
  es: buildAppointmentConfirmationEmailES,
  fr: buildAppointmentConfirmationEmailFR,
  it: buildAppointmentConfirmationEmailIT,
  fa: buildAppointmentConfirmationEmailFA,
  ru: buildAppointmentConfirmationEmailRU,
  nl: buildAppointmentConfirmationEmailNL
};

const marketingSmsByLocale: Record<NotificationLocale, (data: MarketingData) => string> = {
  tr: buildMarketingSMSTR,
  en: buildMarketingSMSEN,
  de: buildMarketingSMSDE,
  ar: buildMarketingSMSAR,
  es: buildMarketingSMSES,
  fr: buildMarketingSMSFR,
  it: buildMarketingSMSIT,
  fa: buildMarketingSMSFA,
  ru: buildMarketingSMSRU,
  nl: buildMarketingSMSNL
};

const marketingEmailByLocale: Record<NotificationLocale, (data: MarketingData) => EmailTemplate> = {
  tr: buildMarketingEmailTR,
  en: buildMarketingEmailEN,
  de: buildMarketingEmailDE,
  ar: buildMarketingEmailAR,
  es: buildMarketingEmailES,
  fr: buildMarketingEmailFR,
  it: buildMarketingEmailIT,
  fa: buildMarketingEmailFA,
  ru: buildMarketingEmailRU,
  nl: buildMarketingEmailNL
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
