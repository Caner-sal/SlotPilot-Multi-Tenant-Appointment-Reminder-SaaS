import { describe, it, expect } from "vitest";
import {
  buildAppointmentReminderSMSTR,
  buildAppointmentReminderEmailTR,
} from "@/services/notifications/templates/tr/appointment-reminder";
import {
  buildAppointmentConfirmationSMSTR,
  buildAppointmentConfirmationEmailTR,
} from "@/services/notifications/templates/tr/appointment-confirmation";
import { buildMarketingSMSTR, requiresMarketingConsent } from "@/services/notifications/templates/tr/marketing";
import { getMarketingTemplate } from "@/lib/notification-templates";

const reminderData = {
  customerName: "Ayşe Yılmaz",
  businessName: "Güzellik Salonu",
  date: "15 Haziran 2026",
  time: "14:00",
  serviceName: "Saç Kesimi",
  address: "Kadıköy, İstanbul",
};

describe("appointment-reminder SMS template", () => {
  it("includes customer name", () => {
    const sms = buildAppointmentReminderSMSTR(reminderData);
    expect(sms).toContain("Ayşe Yılmaz");
  });

  it("includes business name and date", () => {
    const sms = buildAppointmentReminderSMSTR(reminderData);
    expect(sms).toContain("Güzellik Salonu");
    expect(sms).toContain("15 Haziran 2026");
  });

  it("includes service name", () => {
    const sms = buildAppointmentReminderSMSTR(reminderData);
    expect(sms).toContain("Saç Kesimi");
  });

  it("includes address when provided", () => {
    const sms = buildAppointmentReminderSMSTR(reminderData);
    expect(sms).toContain("Kadıköy");
  });

  it("omits address when not provided", () => {
    const sms = buildAppointmentReminderSMSTR({ ...reminderData, address: undefined });
    expect(sms).not.toContain("Adres");
  });
});

describe("appointment-reminder email template", () => {
  it("has Turkish subject", () => {
    const email = buildAppointmentReminderEmailTR(reminderData);
    expect(email.subject).toContain("Hatırlatma");
  });

  it("html contains customer name", () => {
    const email = buildAppointmentReminderEmailTR(reminderData);
    expect(email.html).toContain("Ayşe Yılmaz");
  });
});

describe("appointment-confirmation template", () => {
  const confirmData = {
    ...reminderData,
    staffName: "Merve Hanım",
  };

  it("SMS includes confirmation message", () => {
    const sms = buildAppointmentConfirmationSMSTR(confirmData);
    expect(sms).toContain("onaylandı");
  });

  it("email has correct subject", () => {
    const email = buildAppointmentConfirmationEmailTR(confirmData);
    expect(email.subject).toContain("Onaylandı");
  });

  it("includes staff name", () => {
    const email = buildAppointmentConfirmationEmailTR(confirmData);
    expect(email.text).toContain("Merve Hanım");
  });
});

describe("marketing template consent gate", () => {
  const marketingData = {
    customerName: "Mehmet",
    businessName: "Salon",
    message: "Bu ay %20 indirim!",
  };

  it("returns null when marketingConsent is false", () => {
    const result = getMarketingTemplate("sms", marketingData, false);
    expect(result).toBeNull();
  });

  it("returns template when marketingConsent is true", () => {
    const result = getMarketingTemplate("sms", marketingData, true);
    expect(result).not.toBeNull();
    expect(result as string).toContain("%20 indirim");
  });

  it("requiresMarketingConsent always returns true", () => {
    expect(requiresMarketingConsent()).toBe(true);
  });

  it("SMS template includes business name", () => {
    const sms = buildMarketingSMSTR(marketingData);
    expect(sms).toContain("Salon");
  });
});
