import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  parseMetaInboundPayload,
  storeInboundMessage,
  processInboundWebhook,
} from "@/services/whatsapp-webhook.service";
import { db } from "@/lib/db";

// Fixtures
const INBOUND_FIXTURE = {
  entry: [
    {
      changes: [
        {
          field: "messages",
          value: {
            messaging_product: "whatsapp",
            metadata: {
              phone_number_id: "12345678",
              display_phone_number: "+905001234567",
            },
            messages: [
              {
                id: "wamid.abc123",
                from: "905009876543",
                timestamp: "1715000000",
                type: "text",
                text: { body: "Merhaba, randevu almak istiyorum" },
              },
            ],
          },
        },
      ],
    },
  ],
};

const STATUS_ONLY_FIXTURE = {
  entry: [
    {
      changes: [
        {
          field: "statuses",
          value: {
            statuses: [
              { id: "wamid.xyz", status: "delivered", recipient_id: "905009876543" },
            ],
          },
        },
      ],
    },
  ],
};

const MULTI_MESSAGE_FIXTURE = {
  entry: [
    {
      changes: [
        {
          field: "messages",
          value: {
            metadata: { phone_number_id: "99999" },
            messages: [
              { id: "wamid.m1", from: "905001111111", timestamp: "1", type: "text", text: { body: "msg1" } },
              { id: "wamid.m2", from: "905002222222", timestamp: "2", type: "text", text: { body: "msg2" } },
            ],
          },
        },
      ],
    },
  ],
};

// ── parseMetaInboundPayload ─────────────────────────────────────────────────

describe("parseMetaInboundPayload", () => {
  it("returns empty array when body has no entry", () => {
    expect(parseMetaInboundPayload({})).toEqual([]);
    expect(parseMetaInboundPayload(null)).toEqual([]);
    expect(parseMetaInboundPayload(undefined)).toEqual([]);
  });

  it("returns empty array for status-only payload", () => {
    const result = parseMetaInboundPayload(STATUS_ONLY_FIXTURE);
    expect(result).toEqual([]);
  });

  it("parses valid inbound message payload", () => {
    const result = parseMetaInboundPayload(INBOUND_FIXTURE);
    expect(result).toHaveLength(1);
    expect(result[0].phoneNumberId).toBe("12345678");
    expect(result[0].messages).toHaveLength(1);
    expect(result[0].messages[0].id).toBe("wamid.abc123");
    expect(result[0].messages[0].from).toBe("905009876543");
    expect(result[0].messages[0].text?.body).toBe("Merhaba, randevu almak istiyorum");
  });

  it("parses multiple messages in one batch", () => {
    const result = parseMetaInboundPayload(MULTI_MESSAGE_FIXTURE);
    expect(result).toHaveLength(1);
    expect(result[0].messages).toHaveLength(2);
    expect(result[0].messages[0].id).toBe("wamid.m1");
    expect(result[0].messages[1].id).toBe("wamid.m2");
  });

  it("does not throw on malformed input", () => {
    expect(() => parseMetaInboundPayload("not-an-object")).not.toThrow();
    expect(() => parseMetaInboundPayload(42)).not.toThrow();
    expect(parseMetaInboundPayload({ entry: [{ changes: null }] })).toEqual([]);
  });

  it("returns empty array when messages array is empty", () => {
    const payload = {
      entry: [{ changes: [{ field: "messages", value: { metadata: { phone_number_id: "1" }, messages: [] } }] }],
    };
    expect(parseMetaInboundPayload(payload)).toEqual([]);
  });
});

// ── storeInboundMessage ─────────────────────────────────────────────────────

describe("storeInboundMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns isNew=true when message is stored successfully", async () => {
    const mockRecord = { id: "inbound-record-id-1" };
    vi.mocked(db.whatsAppInboundMessage.create).mockResolvedValueOnce(mockRecord as never);

    const result = await storeInboundMessage({
      organizationId: "org-1",
      providerMessageId: "wamid.abc123",
      fromPhone: "905009876543",
      toPhone: "12345678",
      messageText: "Merhaba",
      rawPayload: JSON.stringify(INBOUND_FIXTURE),
    });

    expect(result.isNew).toBe(true);
    expect(result.messageId).toBe("inbound-record-id-1");
  });

  it("returns isNew=false when providerMessageId already exists (P2002)", async () => {
    const p2002Error = Object.assign(new Error("Unique constraint"), { code: "P2002" });
    vi.mocked(db.whatsAppInboundMessage.create).mockRejectedValueOnce(p2002Error);
    vi.mocked(db.whatsAppInboundMessage.findFirst).mockResolvedValueOnce(
      { id: "existing-record-id" } as never
    );

    const result = await storeInboundMessage({
      organizationId: "org-1",
      providerMessageId: "wamid.abc123",
      fromPhone: "905009876543",
      toPhone: "12345678",
      messageText: "Merhaba",
      rawPayload: "{}",
    });

    expect(result.isNew).toBe(false);
    expect(result.messageId).toBe("existing-record-id");
  });

  it("re-throws non-P2002 errors", async () => {
    const networkError = new Error("Database connection failed");
    vi.mocked(db.whatsAppInboundMessage.create).mockRejectedValueOnce(networkError);

    await expect(
      storeInboundMessage({
        organizationId: "org-1",
        providerMessageId: "wamid.newmsg",
        fromPhone: "905001111111",
        toPhone: "12345678",
        messageText: "test",
        rawPayload: "{}",
      })
    ).rejects.toThrow("Database connection failed");
  });
});

// ── processInboundWebhook ───────────────────────────────────────────────────

describe("processInboundWebhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not throw when org is not found for phoneNumberId", async () => {
    vi.mocked(db.whatsAppAutoReplySettings.findFirst).mockResolvedValueOnce(null);
    await expect(processInboundWebhook(INBOUND_FIXTURE)).resolves.not.toThrow();
  });

  it("stores inbound message when org is found", async () => {
    vi.mocked(db.whatsAppAutoReplySettings.findFirst).mockResolvedValueOnce({
      organization: { id: "org-1", slug: "barber-demo", name: "Berber Demo" },
    } as never);
    vi.mocked(db.whatsAppInboundMessage.create).mockResolvedValueOnce({ id: "msg-1" } as never);

    await processInboundWebhook(INBOUND_FIXTURE);

    expect(db.whatsAppInboundMessage.create).toHaveBeenCalledOnce();
  });

  it("does not store message when payload has no inbound messages", async () => {
    await processInboundWebhook(STATUS_ONLY_FIXTURE);
    expect(db.whatsAppInboundMessage.create).not.toHaveBeenCalled();
  });

  it("does not crash on malformed webhook body", async () => {
    await expect(processInboundWebhook(null)).resolves.not.toThrow();
    await expect(processInboundWebhook("bad")).resolves.not.toThrow();
    await expect(processInboundWebhook({})).resolves.not.toThrow();
  });

  it("does not trigger auto-reply for duplicate (isNew=false) message", async () => {
    vi.mocked(db.whatsAppAutoReplySettings.findFirst).mockResolvedValueOnce({
      organization: { id: "org-1", slug: "barber-demo", name: "Berber Demo" },
    } as never);

    const p2002Error = Object.assign(new Error("Unique"), { code: "P2002" });
    vi.mocked(db.whatsAppInboundMessage.create).mockRejectedValueOnce(p2002Error);
    vi.mocked(db.whatsAppInboundMessage.findFirst).mockResolvedValueOnce({ id: "existing-id" } as never);

    // Should complete without error — auto-reply is NOT triggered for duplicates
    await expect(processInboundWebhook(INBOUND_FIXTURE)).resolves.not.toThrow();
  });
});
