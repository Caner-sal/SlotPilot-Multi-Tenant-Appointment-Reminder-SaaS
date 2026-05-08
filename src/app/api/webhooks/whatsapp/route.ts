import { db } from "@/lib/db";
import { NextResponse } from "next/server";

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

// Delivery status webhook
export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      entry?: Array<{
        changes?: Array<{
          value?: {
            statuses?: Array<{ id: string; status: string; recipient_id: string }>;
          };
        }>;
      }>;
    };

    const statuses = body.entry?.[0]?.changes?.[0]?.value?.statuses ?? [];

    for (const s of statuses) {
      if (s.id && s.status) {
        const deliveryStatus = s.status === "delivered" || s.status === "read" ? "SENT" : s.status === "failed" ? "FAILED" : undefined;
        if (deliveryStatus) {
          await db.reminder.updateMany({
            where: { providerMessageId: s.id },
            data: { status: deliveryStatus as "SENT" | "FAILED" },
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("WhatsApp webhook error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
