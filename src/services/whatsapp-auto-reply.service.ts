import { db } from "@/lib/db";
import { getWhatsAppTextProvider } from "@/services/whatsapp/whatsapp-text.factory";
import { getBookingUrl } from "@/services/booking-link.service";

export type AutoReplyOutcome =
  | { status: "SENT"; messageId: string; replyText: string; bookingUrl: string }
  | { status: "SKIPPED"; reason: string }
  | { status: "FAILED"; error: string };

const OPT_OUT_KEYWORDS = [
  "dur",
  "durdurun",
  "istemiyorum",
  "hayır",
  "hayir",
  "çık",
  "cik",
  "iptal",
  "stop",
  "unsubscribe",
];

export function buildReplyText(template: string, bookingUrl: string): string {
  return template.replace(/\{\{bookingUrl\}\}/g, bookingUrl);
}

export function isOptOutMessage(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return OPT_OUT_KEYWORDS.some((keyword) => normalized === keyword || normalized.includes(keyword));
}

export function matchesKeywords(text: string, keywords: string[]): boolean {
  if (keywords.length === 0) return true;
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

export function checkCooldown(
  lastAutoReplyAt: Date | null,
  cooldownHours: number
): boolean {
  if (!lastAutoReplyAt) return false;
  const elapsed = Date.now() - new Date(lastAutoReplyAt).getTime();
  const cooldownMs = cooldownHours * 60 * 60 * 1000;
  return elapsed < cooldownMs;
}

export async function processAutoReply(params: {
  inboundMessageId: string;
  organizationId: string;
  orgSlug: string;
  fromPhone: string;
  messageText: string | null;
}): Promise<AutoReplyOutcome> {
  const { inboundMessageId, organizationId, orgSlug, fromPhone, messageText } = params;

  try {
    // 1. Load settings
    const settings = await db.whatsAppAutoReplySettings.findUnique({
      where: { organizationId },
    });

    if (!settings || !settings.enabled || settings.replyMode === "DISABLED") {
      await createLog({ inboundMessageId, organizationId, fromPhone, status: "SKIPPED", errorMessage: "AUTO_REPLY_DISABLED" });
      return { status: "SKIPPED", reason: "AUTO_REPLY_DISABLED" };
    }

    // 2. Upsert contact preference
    const contactPref = await db.whatsAppContactPreference.upsert({
      where: { organizationId_phone: { organizationId, phone: fromPhone } },
      update: {},
      create: { organizationId, phone: fromPhone },
    });

    // 3. Check opt-out (isBlocked)
    if (contactPref.isBlocked) {
      await createLog({ inboundMessageId, organizationId, fromPhone, status: "SKIPPED", errorMessage: "CONTACT_BLOCKED" });
      return { status: "SKIPPED", reason: "CONTACT_BLOCKED" };
    }

    // 4. Check for opt-out message
    if (messageText && isOptOutMessage(messageText)) {
      await db.whatsAppContactPreference.update({
        where: { organizationId_phone: { organizationId, phone: fromPhone } },
        data: { isBlocked: true },
      });
      await createLog({ inboundMessageId, organizationId, fromPhone, status: "SKIPPED", errorMessage: "OPT_OUT" });
      return { status: "SKIPPED", reason: "OPT_OUT" };
    }

    // 5. Keyword mode check
    if (settings.replyMode === "KEYWORD_ONLY") {
      let keywords: string[] = [];
      try {
        keywords = JSON.parse(settings.triggerKeywords) as string[];
      } catch {
        keywords = [];
      }
      if (!matchesKeywords(messageText ?? "", keywords)) {
        await createLog({ inboundMessageId, organizationId, fromPhone, status: "SKIPPED", errorMessage: "KEYWORD_NOT_MATCHED" });
        return { status: "SKIPPED", reason: "KEYWORD_NOT_MATCHED" };
      }
    }

    // 6. Cooldown check
    if (checkCooldown(contactPref.lastAutoReplyAt, settings.cooldownHours)) {
      await createLog({ inboundMessageId, organizationId, fromPhone, status: "SKIPPED", errorMessage: "COOLDOWN_ACTIVE" });
      return { status: "SKIPPED", reason: "COOLDOWN_ACTIVE" };
    }

    // 7. Build booking URL and reply text
    const bookingUrl = getBookingUrl(orgSlug);
    const replyText = buildReplyText(settings.messageTemplate, bookingUrl);

    // 8. Send via provider
    const provider = getWhatsAppTextProvider();
    const sendResult = await provider.sendTextMessage(
      fromPhone,
      replyText,
      settings.phoneNumberId ?? ""
    );

    if (!sendResult.success) {
      await createLog({ inboundMessageId, organizationId, fromPhone, replyText, bookingUrl, status: "FAILED", errorMessage: sendResult.error });
      return { status: "FAILED", error: sendResult.error ?? "Provider error" };
    }

    // 9. Update lastAutoReplyAt
    await db.whatsAppContactPreference.update({
      where: { organizationId_phone: { organizationId, phone: fromPhone } },
      data: { lastAutoReplyAt: new Date() },
    });

    // 10. Create SENT log
    await createLog({
      inboundMessageId,
      organizationId,
      fromPhone,
      replyText,
      bookingUrl,
      status: "SENT",
      sentAt: new Date(),
    });

    return { status: "SENT", messageId: sendResult.messageId ?? "", replyText, bookingUrl };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[WA Auto-Reply] Unexpected error:", err);
    try {
      await createLog({ inboundMessageId, organizationId, fromPhone, status: "FAILED", errorMessage: message });
    } catch {
      // log creation failed — don't propagate
    }
    return { status: "FAILED", error: message };
  }
}

async function createLog(params: {
  inboundMessageId: string;
  organizationId: string;
  fromPhone: string;
  replyText?: string;
  bookingUrl?: string;
  status: string;
  errorMessage?: string | null;
  sentAt?: Date;
}): Promise<void> {
  await db.whatsAppAutoReplyLog.create({
    data: {
      inboundMessageId: params.inboundMessageId,
      organizationId: params.organizationId,
      customerPhone: params.fromPhone,
      replyText: params.replyText,
      bookingUrl: params.bookingUrl,
      status: params.status,
      errorMessage: params.errorMessage,
      sentAt: params.sentAt,
    },
  });
}
