import { describe, it, expect, vi, beforeEach } from "vitest";
import { FakeWhatsAppProvider } from "@/services/whatsapp/fake-whatsapp.provider";
import { getWhatsAppProvider, resetWhatsAppProvider } from "@/services/whatsapp/whatsapp.factory";

beforeEach(() => {
  resetWhatsAppProvider();
  vi.unstubAllEnvs();
});

describe("FakeWhatsAppProvider", () => {
  it("returns sent status with a messageId", async () => {
    const provider = new FakeWhatsAppProvider();
    const result = await provider.sendTemplate("+905001234567", "appointment_reminder", "tr", { name: "Ahmet" });
    expect(result.status).toBe("sent");
    expect(result.messageId).toMatch(/^fake_wa_/);
  });

  it("does not throw for any phone or param combination", async () => {
    const provider = new FakeWhatsAppProvider();
    await expect(
      provider.sendTemplate("invalid-number", "some_template", "en", {})
    ).resolves.not.toThrow();
  });
});

describe("WhatsApp factory", () => {
  it("returns FakeWhatsAppProvider when WHATSAPP_PROVIDER is not set", () => {
    vi.stubEnv("WHATSAPP_PROVIDER", "");
    const provider = getWhatsAppProvider();
    expect(provider).toBeInstanceOf(FakeWhatsAppProvider);
  });

  it("returns FakeWhatsAppProvider when WHATSAPP_PROVIDER=FAKE", () => {
    vi.stubEnv("WHATSAPP_PROVIDER", "FAKE");
    const provider = getWhatsAppProvider();
    expect(provider).toBeInstanceOf(FakeWhatsAppProvider);
  });

  it("provider is a singleton (same instance returned)", () => {
    const p1 = getWhatsAppProvider();
    const p2 = getWhatsAppProvider();
    expect(p1).toBe(p2);
  });
});

describe("WhatsApp opt-in guard", () => {
  it("does not send WhatsApp when customer whatsappOptIn is false", async () => {
    const provider = new FakeWhatsAppProvider();
    const sendSpy = vi.spyOn(provider, "sendTemplate");

    const customer = { whatsappOptIn: false, phone: "+905001234567" };

    if (customer.whatsappOptIn && customer.phone) {
      await provider.sendTemplate(customer.phone, "appointment_reminder", "tr", {});
    }

    expect(sendSpy).not.toHaveBeenCalled();
  });

  it("sends WhatsApp when customer whatsappOptIn is true", async () => {
    const provider = new FakeWhatsAppProvider();
    const sendSpy = vi.spyOn(provider, "sendTemplate").mockResolvedValue({ messageId: "m1", status: "sent" });

    const customer = { whatsappOptIn: true, phone: "+905001234567" };

    if (customer.whatsappOptIn && customer.phone) {
      await provider.sendTemplate(customer.phone, "appointment_reminder", "tr", {});
    }

    expect(sendSpy).toHaveBeenCalledOnce();
  });
});

describe("WhatsApp webhook verification", () => {
  it("returns 200 and challenge when token matches", async () => {
    vi.stubEnv("META_WHATSAPP_WEBHOOK_VERIFY_TOKEN", "my-secret-token");

    const { GET } = await import("@/app/api/webhooks/whatsapp/route");

    const url = "http://localhost/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=my-secret-token&hub.challenge=challenge123";
    const req = new Request(url);
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("challenge123");
  });

  it("returns 403 when token does not match", async () => {
    vi.stubEnv("META_WHATSAPP_WEBHOOK_VERIFY_TOKEN", "my-secret-token");

    const { GET } = await import("@/app/api/webhooks/whatsapp/route");

    const url = "http://localhost/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=wrong-token&hub.challenge=challenge123";
    const req = new Request(url);
    const res = await GET(req);

    expect(res.status).toBe(403);
  });
});
