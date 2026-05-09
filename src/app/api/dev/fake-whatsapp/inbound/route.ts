import { processInboundWebhook } from "@/services/whatsapp-webhook.service";
import { NextResponse } from "next/server";

// Development-only endpoint for simulating inbound WhatsApp messages without a real webhook
export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Development only" }, { status: 403 });
  }

  const body = await req.json() as {
    fromPhone: string;
    messageText: string;
    phoneNumberId?: string;
  };

  const { fromPhone, messageText, phoneNumberId = "demo-phone-id" } = body;

  // Build synthetic Meta-format inbound payload
  const syntheticPayload = {
    entry: [
      {
        changes: [
          {
            field: "messages",
            value: {
              messaging_product: "whatsapp",
              metadata: {
                phone_number_id: phoneNumberId,
                display_phone_number: phoneNumberId,
              },
              messages: [
                {
                  id: `dev_wamid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                  from: fromPhone.replace(/^\+/, ""),
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  type: "text",
                  text: { body: messageText },
                },
              ],
            },
          },
        ],
      },
    ],
  };

  await processInboundWebhook(syntheticPayload);

  return NextResponse.json({ triggered: true, fromPhone, messageText, phoneNumberId });
}
