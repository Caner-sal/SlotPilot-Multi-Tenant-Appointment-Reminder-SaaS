import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { processInboundWebhook } from "@/services/whatsapp-webhook.service";

// Meta WhatsApp Cloud API webhook verification
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.META_WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken && challenge) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

type MetaWebhookEntry = {
  changes?: Array<{
    field?: string;
    value?: {
      statuses?: Array<{ id: string; status: string; recipient_id: string }>;
      messages?: unknown[];
    };
  }>;
};

// Handles both delivery status updates (existing) and inbound messages (new)
export async function POST(req: Request) {
  let body: { entry?: MetaWebhookEntry[] };
  try {
    body = (await req.json()) as { entry?: MetaWebhookEntry[] };
  } catch {
    // Unparseable body — always return 200 to Meta to avoid retries
    return NextResponse.json({ received: true });
  }

  // 1. Handle delivery status updates (existing behavior — unchanged)
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const statuses = change.value?.statuses ?? [];
      for (const s of statuses) {
        if (s.id && s.status) {
          const deliveryStatus =
            s.status === "delivered" || s.status === "read"
              ? "SENT"
              : s.status === "failed"
              ? "FAILED"
              : undefined;
          if (deliveryStatus) {
            try {
              await db.reminder.updateMany({
                where: { providerMessageId: s.id },
                data: { status: deliveryStatus as "SENT" | "FAILED" },
              });
            } catch (err) {
              console.error("WhatsApp status update error:", err);
            }
          }
        }
      }
    }
  }

  // 2. Handle inbound user messages (new — WhatsApp Auto-Link Reply)
  // processInboundWebhook is non-throwing; auto-reply fires-and-forgets internally
  try {
    await processInboundWebhook(body);
  } catch (err) {
    console.error("WhatsApp inbound webhook error:", err);
  }

  // Always return 200 to Meta — never return 500
  return NextResponse.json({ received: true });
}
