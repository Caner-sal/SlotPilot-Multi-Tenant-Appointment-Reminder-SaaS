import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { FakeWhatsAppTextProvider } from "@/services/whatsapp/fake-whatsapp-text.provider";
import {
  getWhatsAppTextProvider,
  resetWhatsAppTextProvider,
} from "@/services/whatsapp/whatsapp-text.factory";

describe("FakeWhatsAppTextProvider", () => {
  it("returns success with a messageId starting with fake_txt_", async () => {
    const provider = new FakeWhatsAppTextProvider();
    const result = await provider.sendTextMessage(
      "+905001234567",
      "Merhaba test mesajı",
      "123456789"
    );
    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
    expect(result.messageId).toMatch(/^fake_txt_/);
  });

  it("does not throw for any phone number format", async () => {
    const provider = new FakeWhatsAppTextProvider();
    await expect(
      provider.sendTextMessage("invalid-number", "test", "")
    ).resolves.toMatchObject({ success: true });
  });

  it("returns unique messageIds for each call", async () => {
    const provider = new FakeWhatsAppTextProvider();
    const r1 = await provider.sendTextMessage("+905001234567", "msg1", "phone1");
    const r2 = await provider.sendTextMessage("+905001234567", "msg2", "phone1");
    expect(r1.messageId).not.toBe(r2.messageId);
  });
});

describe("WhatsApp text factory", () => {
  beforeEach(() => {
    resetWhatsAppTextProvider();
    delete process.env.WHATSAPP_TEXT_PROVIDER;
  });

  afterEach(() => {
    resetWhatsAppTextProvider();
    delete process.env.WHATSAPP_TEXT_PROVIDER;
  });

  it("returns FakeWhatsAppTextProvider when WHATSAPP_TEXT_PROVIDER is not set", () => {
    const provider = getWhatsAppTextProvider();
    expect(provider).toBeInstanceOf(FakeWhatsAppTextProvider);
  });

  it("returns FakeWhatsAppTextProvider when WHATSAPP_TEXT_PROVIDER=FAKE", () => {
    process.env.WHATSAPP_TEXT_PROVIDER = "FAKE";
    const provider = getWhatsAppTextProvider();
    expect(provider).toBeInstanceOf(FakeWhatsAppTextProvider);
  });

  it("returns the same singleton instance on repeated calls", () => {
    const p1 = getWhatsAppTextProvider();
    const p2 = getWhatsAppTextProvider();
    expect(p1).toBe(p2);
  });

  it("returns a new instance after resetWhatsAppTextProvider", () => {
    const p1 = getWhatsAppTextProvider();
    resetWhatsAppTextProvider();
    const p2 = getWhatsAppTextProvider();
    expect(p1).not.toBe(p2);
  });
});

describe("MetaWhatsAppTextProvider constructor", () => {
  beforeEach(() => {
    delete process.env.META_WHATSAPP_ACCESS_TOKEN;
  });

  it("throws when META_WHATSAPP_ACCESS_TOKEN is not set", async () => {
    const { MetaWhatsAppTextProvider } = await import(
      "@/services/whatsapp/meta-whatsapp-text.provider"
    );
    expect(() => new MetaWhatsAppTextProvider()).toThrow(
      "META_WHATSAPP_ACCESS_TOKEN is required"
    );
  });

  it("does not throw when META_WHATSAPP_ACCESS_TOKEN is set", async () => {
    process.env.META_WHATSAPP_ACCESS_TOKEN = "test-token";
    const { MetaWhatsAppTextProvider } = await import(
      "@/services/whatsapp/meta-whatsapp-text.provider"
    );
    expect(() => new MetaWhatsAppTextProvider()).not.toThrow();
    delete process.env.META_WHATSAPP_ACCESS_TOKEN;
  });
});

describe("TwilioWhatsAppTextProvider constructor", () => {
  beforeEach(() => {
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
  });

  it("throws when Twilio credentials are not set", async () => {
    const { TwilioWhatsAppTextProvider } = await import(
      "@/services/whatsapp/twilio-whatsapp-text.provider"
    );
    expect(() => new TwilioWhatsAppTextProvider()).toThrow(
      "TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required"
    );
  });
});
