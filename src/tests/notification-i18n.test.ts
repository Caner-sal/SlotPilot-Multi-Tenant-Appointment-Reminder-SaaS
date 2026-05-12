import { describe, expect, it } from "vitest";
import {
  getAppointmentReminderTemplate,
  getMarketingTemplate,
  resolveNotificationLocale
} from "@/lib/notification-templates";

const reminderData = {
  customerName: "Ayse",
  businessName: "Randevo Salon",
  date: "15 June 2026",
  time: "14:00",
  serviceName: "Haircut"
};

describe("notification locale resolver", () => {
  it("uses customer locale first", () => {
    const locale = resolveNotificationLocale({
      customerPreferredLocale: "en",
      organizationDefaultLocale: "de",
      userPreferredLocale: "ar"
    });
    expect(locale).toBe("en");
  });

  it("falls back to organization then user then tr", () => {
    expect(
      resolveNotificationLocale({
        customerPreferredLocale: null,
        organizationDefaultLocale: "de",
        userPreferredLocale: "ar"
      })
    ).toBe("de");

    expect(
      resolveNotificationLocale({
        customerPreferredLocale: null,
        organizationDefaultLocale: "xx",
        userPreferredLocale: "ar"
      })
    ).toBe("ar");

    expect(
      resolveNotificationLocale({
        customerPreferredLocale: null,
        organizationDefaultLocale: "xx",
        userPreferredLocale: "yy"
      })
    ).toBe("tr");
  });
});

describe("notification templates by locale", () => {
  it("renders english reminder text when locale resolves to en", () => {
    const sms = getAppointmentReminderTemplate("sms", reminderData, {
      customerPreferredLocale: "en"
    }) as string;

    expect(sms).toContain("Your");
    expect(sms).toContain("appointment");
  });

  it("keeps consent gate for marketing templates", () => {
    const result = getMarketingTemplate(
      "sms",
      {
        customerName: "Mehmet",
        businessName: "Salon",
        message: "Campaign"
      },
      false,
      { customerPreferredLocale: "en" }
    );

    expect(result).toBeNull();
  });
});
