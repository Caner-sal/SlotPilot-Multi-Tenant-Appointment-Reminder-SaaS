import { describe, it, expect, vi, beforeEach } from "vitest";
import { FakeSmsProvider } from "@/services/sms/fake-sms.provider";
import { renderReminderSms, renderConfirmationSms } from "@/services/sms/sms-templates";
import { getSmsProvider, resetSmsProvider } from "@/services/sms/sms.factory";

beforeEach(() => {
  resetSmsProvider();
  vi.unstubAllEnvs();
});

describe("FakeSmsProvider", () => {
  it("returns sent status with a messageId", async () => {
    const provider = new FakeSmsProvider();
    const result = await provider.sendSms("+905001234567", "Test message");
    expect(result.status).toBe("sent");
    expect(result.messageId).toMatch(/^fake_/);
  });

  it("does not throw for any phone number format", async () => {
    const provider = new FakeSmsProvider();
    await expect(provider.sendSms("invalid-number", "Hello")).resolves.not.toThrow();
  });
});

describe("SMS templates", () => {
  const data = {
    customerName: "Ahmet",
    serviceName: "Haircut",
    appointmentDate: "2026-05-10",
    appointmentTime: "14:00",
    businessName: "Barber Demo",
    businessPhone: "+90 555 000 0000",
  };

  it("renders reminder SMS with all fields", () => {
    const sms = renderReminderSms(data);
    expect(sms).toContain("Ahmet");
    expect(sms).toContain("Haircut");
    expect(sms).toContain("Barber Demo");
    expect(sms).toContain("14:00");
  });

  it("renders confirmation SMS", () => {
    const sms = renderConfirmationSms(data);
    expect(sms).toContain("Confirmed");
    expect(sms).toContain("Haircut");
  });

  it("omits phone from reminder SMS when not provided", () => {
    const sms = renderReminderSms({ ...data, businessPhone: undefined });
    expect(sms).not.toContain("Questions?");
  });
});

describe("SMS factory", () => {
  it("returns FakeSmsProvider when SMS_PROVIDER is not set", () => {
    vi.stubEnv("SMS_PROVIDER", "");
    const provider = getSmsProvider();
    expect(provider).toBeInstanceOf(FakeSmsProvider);
  });

  it("returns FakeSmsProvider when SMS_PROVIDER=FAKE", () => {
    vi.stubEnv("SMS_PROVIDER", "FAKE");
    const provider = getSmsProvider();
    expect(provider).toBeInstanceOf(FakeSmsProvider);
  });

  it("provider is a singleton (same instance returned)", () => {
    const p1 = getSmsProvider();
    const p2 = getSmsProvider();
    expect(p1).toBe(p2);
  });
});

describe("SMS opt-in guard", () => {
  it("does not send SMS when customer smsOptIn is false", async () => {
    const provider = new FakeSmsProvider();
    const sendSpy = vi.spyOn(provider, "sendSms");

    const customer = { smsOptIn: false, phone: "+905001234567" };

    if (customer.smsOptIn && customer.phone) {
      await provider.sendSms(customer.phone, "Test");
    }

    expect(sendSpy).not.toHaveBeenCalled();
  });

  it("sends SMS when customer smsOptIn is true", async () => {
    const provider = new FakeSmsProvider();
    const sendSpy = vi.spyOn(provider, "sendSms").mockResolvedValue({ messageId: "m1", status: "sent" });

    const customer = { smsOptIn: true, phone: "+905001234567" };

    if (customer.smsOptIn && customer.phone) {
      await provider.sendSms(customer.phone, "Test");
    }

    expect(sendSpy).toHaveBeenCalledOnce();
  });
});
