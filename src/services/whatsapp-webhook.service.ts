import { db } from "@/lib/db";

export interface MetaInboundMessage {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: { body: string };
}

export interface ParsedInboundWebhook {
  phoneNumberId: string;
  messages: MetaInboundMessage[];
}

type MetaWebhookBody = {
  entry?: Array<{
    changes?: Array<{
      field?: string;
      value?: {
        messaging_product?: string;
        metadata?: {
          phone_number_id?: string;
          display_phone_number?: string;
        };
        messages?: MetaInboundMessage[];
        statuses?: Array<{ id: string; status: string; recipient_id: string }>;
      };
    }>;
  }>;
};

export function parseMetaInboundPayload(rawBody: unknown): ParsedInboundWebhook[] {
  try {
    const body = rawBody as MetaWebhookBody;
    if (!Array.isArray(body?.entry)) return [];

    const result: ParsedInboundWebhook[] = [];

    for (const entry of body.entry) {
      if (!Array.isArray(entry?.changes)) continue;
      for (const change of entry.changes) {
        if (change.field !== "messages") continue;
        const messages = change.value?.messages;
        if (!Array.isArray(messages) || messages.length === 0) continue;
        const phoneNumberId = change.value?.metadata?.phone_number_id ?? "";
        result.push({ phoneNumberId, messages });
      }
    }

    return result;
  } catch {
    return [];
  }
}

export async function findOrganizationByPhoneNumberId(
  phoneNumberId: string
): Promise<{ id: string; slug: string; name: string } | null> {
  if (!phoneNumberId) return null;

  const settings = await db.whatsAppAutoReplySettings.findFirst({
    where: { phoneNumberId, enabled: true },
    include: { organization: true },
  });

  if (!settings) return null;
  return {
    id: settings.organization.id,
    slug: settings.organization.slug,
    name: settings.organization.name,
  };
}

export async function storeInboundMessage(params: {
  organizationId: string;
  providerMessageId: string;
  fromPhone: string;
  toPhone: string;
  messageText: string | null;
  rawPayload: string;
}): Promise<{ isNew: boolean; messageId: string }> {
  try {
    const record = await db.whatsAppInboundMessage.create({
      data: {
        organizationId: params.organizationId,
        providerMessageId: params.providerMessageId,
        fromPhone: params.fromPhone,
        toPhone: params.toPhone,
        messageText: params.messageText,
        rawPayload: params.rawPayload,
      },
    });
    return { isNew: true, messageId: record.id };
  } catch (err: unknown) {
    // Prisma unique constraint violation (P2002) = duplicate message
    if (
      err instanceof Error &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      const existing = await db.whatsAppInboundMessage.findFirst({
        where: { providerMessageId: params.providerMessageId },
        select: { id: true },
      });
      return { isNew: false, messageId: existing?.id ?? "" };
    }
    throw err;
  }
}

export async function processInboundWebhook(rawBody: unknown): Promise<void> {
  const batches = parseMetaInboundPayload(rawBody);

  for (const batch of batches) {
    let org: { id: string; slug: string; name: string } | null = null;

    try {
      org = await findOrganizationByPhoneNumberId(batch.phoneNumberId);
    } catch (err) {
      console.error("[WA Webhook] Failed to find org for phoneNumberId:", batch.phoneNumberId, err);
      continue;
    }

    if (!org) {
      // No org configured for this phone number ID — safe no-op
      continue;
    }

    for (const msg of batch.messages) {
      try {
        const { isNew, messageId } = await storeInboundMessage({
          organizationId: org.id,
          providerMessageId: msg.id,
          fromPhone: msg.from,
          toPhone: batch.phoneNumberId,
          messageText: msg.text?.body ?? null,
          rawPayload: JSON.stringify(rawBody),
        });

        if (isNew) {
          // Fire-and-forget: do not await (webhook must return fast to Meta)
          import("@/services/whatsapp-auto-reply.service")
            .then((m) =>
              m.processAutoReply({
                inboundMessageId: messageId,
                organizationId: org!.id,
                orgSlug: org!.slug,
                fromPhone: msg.from,
                messageText: msg.text?.body ?? null,
              })
            )
            .catch((err) =>
              console.error("[WA Webhook] Auto-reply error:", err)
            );
        }
      } catch (err) {
        console.error("[WA Webhook] Failed to store inbound message:", msg.id, err);
      }
    }
  }
}
