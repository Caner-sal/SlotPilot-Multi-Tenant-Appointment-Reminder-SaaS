import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  buildReplyText,
  isOptOutMessage,
  matchesKeywords,
  checkCooldown,
  processAutoReply,
} from "@/services/whatsapp-auto-reply.service";
import { db } from "@/lib/db";
import { resetWhatsAppTextProvider } from "@/services/whatsapp/whatsapp-text.factory";

// ── Pure function tests ─────────────────────────────────────────────────────

describe("buildReplyText", () => {
  it("replaces {{bookingUrl}} with the booking URL", () => {
    const template = "Merhaba 👋\nLink: {{bookingUrl}}\nİyi günler.";
    expect(buildReplyText(template, "https://randevo.com/booking/demo")).toBe(
      "Merhaba 👋\nLink: https://randevo.com/booking/demo\nİyi günler."
    );
  });

  it("leaves other template content intact", () => {
    const result = buildReplyText("Sabit metin {{bookingUrl}} sabit", "https://url.com");
    expect(result).toBe("Sabit metin https://url.com sabit");
  });

  it("replaces multiple occurrences", () => {
    const result = buildReplyText("{{bookingUrl}} ve {{bookingUrl}}", "https://x.com");
    expect(result).toBe("https://x.com ve https://x.com");
  });
});

describe("isOptOutMessage", () => {
  it("returns true for Turkish opt-out words", () => {
    expect(isOptOutMessage("dur")).toBe(true);
    expect(isOptOutMessage("DURDURUN")).toBe(true);
    expect(isOptOutMessage("istemiyorum")).toBe(true);
    expect(isOptOutMessage("iptal")).toBe(true);
    expect(isOptOutMessage("hayır")).toBe(true);
  });

  it("returns true for English opt-out words", () => {
    expect(isOptOutMessage("stop")).toBe(true);
    expect(isOptOutMessage("STOP")).toBe(true);
    expect(isOptOutMessage("unsubscribe")).toBe(true);
  });

  it("returns false for normal messages", () => {
    expect(isOptOutMessage("merhaba")).toBe(false);
    expect(isOptOutMessage("randevu almak istiyorum")).toBe(false);
    expect(isOptOutMessage("fiyatlar nedir")).toBe(false);
  });

  it("handles empty string", () => {
    expect(isOptOutMessage("")).toBe(false);
  });
});

describe("matchesKeywords", () => {
  it("returns true when keywords array is empty (ALWAYS mode)", () => {
    expect(matchesKeywords("herhangi bir mesaj", [])).toBe(true);
  });

  it("returns true when message contains a keyword", () => {
    expect(matchesKeywords("randevu almak istiyorum", ["randevu", "fiyat"])).toBe(true);
  });

  it("returns false when message does not contain any keyword", () => {
    expect(matchesKeywords("merhaba nasılsın", ["randevu", "fiyat"])).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(matchesKeywords("RANDEVU almak istiyorum", ["randevu"])).toBe(true);
  });
});

describe("checkCooldown", () => {
  it("returns true (in cooldown) when lastAutoReplyAt was 1 hour ago and cooldown is 24h", () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    expect(checkCooldown(oneHourAgo, 24)).toBe(true);
  });

  it("returns false (cooldown passed) when lastAutoReplyAt was 25 hours ago with 24h cooldown", () => {
    const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
    expect(checkCooldown(twentyFiveHoursAgo, 24)).toBe(false);
  });

  it("returns false when lastAutoReplyAt is null", () => {
    expect(checkCooldown(null, 24)).toBe(false);
  });

  it("returns false when cooldown is 1h and last reply was 2 hours ago", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(checkCooldown(twoHoursAgo, 1)).toBe(false);
  });
});

// ── processAutoReply integration tests (mocked DB) ────────────────────────

const BASE_PARAMS = {
  inboundMessageId: "inbound-1",
  organizationId: "org-1",
  orgSlug: "barber-demo",
  fromPhone: "+905001234567",
  messageText: "Merhaba randevu almak istiyorum",
};

const DEFAULT_SETTINGS = {
  id: "settings-1",
  organizationId: "org-1",
  enabled: true,
  provider: "FAKE",
  phoneNumberId: "phone-id-1",
  replyMode: "ALWAYS",
  cooldownHours: 24,
  triggerKeywords: "[]",
  messageTemplate: "Merhaba! Link: {{bookingUrl}}",
  includeBookingLink: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const DEFAULT_CONTACT_PREF = {
  id: "pref-1",
  organizationId: "org-1",
  phone: "+905001234567",
  isBlocked: false,
  lastAutoReplyAt: null,
  marketingConsent: false,
  appointmentNotificationConsent: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("processAutoReply", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_BOOKING_BASE_URL = "http://localhost:3000/booking";
    resetWhatsAppTextProvider();
    delete process.env.WHATSAPP_TEXT_PROVIDER;
  });

  it("returns SKIPPED when settings not found", async () => {
    vi.mocked(db.whatsAppAutoReplySettings.findUnique).mockResolvedValueOnce(null);
    vi.mocked(db.whatsAppAutoReplyLog.create).mockResolvedValueOnce({} as never);

    const result = await processAutoReply(BASE_PARAMS);
    expect(result.status).toBe("SKIPPED");
    if (result.status === "SKIPPED") {
      expect(result.reason).toBe("AUTO_REPLY_DISABLED");
    }
  });

  it("returns SKIPPED when enabled=false", async () => {
    vi.mocked(db.whatsAppAutoReplySettings.findUnique).mockResolvedValueOnce({
      ...DEFAULT_SETTINGS,
      enabled: false,
    } as never);
    vi.mocked(db.whatsAppAutoReplyLog.create).mockResolvedValueOnce({} as never);

    const result = await processAutoReply(BASE_PARAMS);
    expect(result.status).toBe("SKIPPED");
  });

  it("returns SKIPPED when replyMode=DISABLED", async () => {
    vi.mocked(db.whatsAppAutoReplySettings.findUnique).mockResolvedValueOnce({
      ...DEFAULT_SETTINGS,
      replyMode: "DISABLED",
    } as never);
    vi.mocked(db.whatsAppAutoReplyLog.create).mockResolvedValueOnce({} as never);

    const result = await processAutoReply(BASE_PARAMS);
    expect(result.status).toBe("SKIPPED");
  });

  it("returns SKIPPED when contact isBlocked", async () => {
    vi.mocked(db.whatsAppAutoReplySettings.findUnique).mockResolvedValueOnce(DEFAULT_SETTINGS as never);
    vi.mocked(db.whatsAppContactPreference.upsert).mockResolvedValueOnce({
      ...DEFAULT_CONTACT_PREF,
      isBlocked: true,
    } as never);
    vi.mocked(db.whatsAppAutoReplyLog.create).mockResolvedValueOnce({} as never);

    const result = await processAutoReply(BASE_PARAMS);
    expect(result.status).toBe("SKIPPED");
    if (result.status === "SKIPPED") {
      expect(result.reason).toBe("CONTACT_BLOCKED");
    }
  });

  it("returns SKIPPED and updates isBlocked when opt-out message received", async () => {
    vi.mocked(db.whatsAppAutoReplySettings.findUnique).mockResolvedValueOnce(DEFAULT_SETTINGS as never);
    vi.mocked(db.whatsAppContactPreference.upsert).mockResolvedValueOnce(DEFAULT_CONTACT_PREF as never);
    vi.mocked(db.whatsAppContactPreference.update).mockResolvedValueOnce({} as never);
    vi.mocked(db.whatsAppAutoReplyLog.create).mockResolvedValueOnce({} as never);

    const result = await processAutoReply({ ...BASE_PARAMS, messageText: "dur" });
    expect(result.status).toBe("SKIPPED");
    if (result.status === "SKIPPED") {
      expect(result.reason).toBe("OPT_OUT");
    }
    expect(db.whatsAppContactPreference.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isBlocked: true } })
    );
  });

  it("returns SKIPPED when cooldown is active", async () => {
    vi.mocked(db.whatsAppAutoReplySettings.findUnique).mockResolvedValueOnce(DEFAULT_SETTINGS as never);
    vi.mocked(db.whatsAppContactPreference.upsert).mockResolvedValueOnce({
      ...DEFAULT_CONTACT_PREF,
      lastAutoReplyAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    } as never);
    vi.mocked(db.whatsAppAutoReplyLog.create).mockResolvedValueOnce({} as never);

    const result = await processAutoReply(BASE_PARAMS);
    expect(result.status).toBe("SKIPPED");
    if (result.status === "SKIPPED") {
      expect(result.reason).toBe("COOLDOWN_ACTIVE");
    }
  });

  it("returns SKIPPED when keyword mode has no match", async () => {
    vi.mocked(db.whatsAppAutoReplySettings.findUnique).mockResolvedValueOnce({
      ...DEFAULT_SETTINGS,
      replyMode: "KEYWORD_ONLY",
      triggerKeywords: JSON.stringify(["randevu", "fiyat"]),
    } as never);
    vi.mocked(db.whatsAppContactPreference.upsert).mockResolvedValueOnce(DEFAULT_CONTACT_PREF as never);
    vi.mocked(db.whatsAppAutoReplyLog.create).mockResolvedValueOnce({} as never);

    const result = await processAutoReply({ ...BASE_PARAMS, messageText: "merhaba nasılsın" });
    expect(result.status).toBe("SKIPPED");
    if (result.status === "SKIPPED") {
      expect(result.reason).toBe("KEYWORD_NOT_MATCHED");
    }
  });

  it("returns SENT on successful send and creates log", async () => {
    vi.mocked(db.whatsAppAutoReplySettings.findUnique).mockResolvedValueOnce(DEFAULT_SETTINGS as never);
    vi.mocked(db.whatsAppContactPreference.upsert).mockResolvedValueOnce(DEFAULT_CONTACT_PREF as never);
    vi.mocked(db.whatsAppContactPreference.update).mockResolvedValueOnce({} as never);
    vi.mocked(db.whatsAppAutoReplyLog.create).mockResolvedValueOnce({} as never);

    const result = await processAutoReply(BASE_PARAMS);
    expect(result.status).toBe("SENT");
    if (result.status === "SENT") {
      expect(result.bookingUrl).toContain("barber-demo");
      expect(result.replyText).toContain("barber-demo");
    }
    expect(db.whatsAppAutoReplyLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "SENT" }) })
    );
  });

  it("updates lastAutoReplyAt on SENT", async () => {
    vi.mocked(db.whatsAppAutoReplySettings.findUnique).mockResolvedValueOnce(DEFAULT_SETTINGS as never);
    vi.mocked(db.whatsAppContactPreference.upsert).mockResolvedValueOnce(DEFAULT_CONTACT_PREF as never);
    vi.mocked(db.whatsAppContactPreference.update).mockResolvedValueOnce({} as never);
    vi.mocked(db.whatsAppAutoReplyLog.create).mockResolvedValueOnce({} as never);

    await processAutoReply(BASE_PARAMS);
    expect(db.whatsAppContactPreference.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ lastAutoReplyAt: expect.any(Date) }) })
    );
  });

  it("returns FAILED and creates log when provider returns error", async () => {
    vi.mocked(db.whatsAppAutoReplySettings.findUnique).mockResolvedValueOnce(DEFAULT_SETTINGS as never);
    vi.mocked(db.whatsAppContactPreference.upsert).mockResolvedValueOnce(DEFAULT_CONTACT_PREF as never);
    vi.mocked(db.whatsAppAutoReplyLog.create).mockResolvedValueOnce({} as never);

    // Spy on FakeWhatsAppTextProvider to return failure
    const fakeMod = await import("@/services/whatsapp/fake-whatsapp-text.provider");
    vi.spyOn(fakeMod.FakeWhatsAppTextProvider.prototype, "sendTextMessage").mockResolvedValueOnce({
      success: false,
      error: "Simulated provider failure",
    });

    const result = await processAutoReply(BASE_PARAMS);
    expect(result.status).toBe("FAILED");
    expect(db.whatsAppAutoReplyLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "FAILED" }) })
    );
  });
});
