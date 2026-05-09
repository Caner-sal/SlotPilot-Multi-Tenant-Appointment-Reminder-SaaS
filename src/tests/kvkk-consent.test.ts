import { describe, it, expect } from "vitest";
import { bookingSchema } from "@/lib/validators";

describe("bookingSchema KVKK fields", () => {
  const validBase = {
    serviceId: "svc-1",
    staffId: "staff-1",
    startTime: "2026-06-01T10:00:00.000Z",
    customerName: "Ayşe Yılmaz",
    customerEmail: "ayse@example.com",
    appointmentNotificationConsent: true,
    marketingConsent: false,
  };

  it("rejects booking without privacyNoticeAcknowledged", () => {
    const result = bookingSchema.safeParse({ ...validBase, privacyNoticeAcknowledged: false });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("privacyNoticeAcknowledged");
    }
  });

  it("rejects booking when privacyNoticeAcknowledged is missing", () => {
    const result = bookingSchema.safeParse({ ...validBase });
    expect(result.success).toBe(false);
  });

  it("accepts booking with privacyNoticeAcknowledged true", () => {
    const result = bookingSchema.safeParse({ ...validBase, privacyNoticeAcknowledged: true });
    expect(result.success).toBe(true);
  });

  it("marketingConsent false still allows booking", () => {
    const result = bookingSchema.safeParse({
      ...validBase,
      privacyNoticeAcknowledged: true,
      marketingConsent: false,
    });
    expect(result.success).toBe(true);
  });

  it("appointmentNotificationConsent defaults to true", () => {
    const result = bookingSchema.safeParse({
      ...validBase,
      privacyNoticeAcknowledged: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.appointmentNotificationConsent).toBe(true);
    }
  });

  it("marketingConsent defaults to false", () => {
    const result = bookingSchema.safeParse({
      serviceId: "svc-1",
      staffId: "staff-1",
      startTime: "2026-06-01T10:00:00.000Z",
      customerName: "Ahmet Kaya",
      customerEmail: "ahmet@example.com",
      privacyNoticeAcknowledged: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.marketingConsent).toBe(false);
    }
  });
});
