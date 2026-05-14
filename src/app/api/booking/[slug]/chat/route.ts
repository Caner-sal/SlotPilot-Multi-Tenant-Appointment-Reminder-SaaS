import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { isOrganizationSuspended } from "@/lib/organization-lifecycle";
import { getRequestId } from "@/lib/request-id";
import { consumeRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  message: string;
  conversationHistory?: ChatMessage[];
}

const MOCK_RESPONSE =
  "AI assistant is not available right now. Please call us or use the booking form to schedule an appointment.";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const requestId = getRequestId(req.headers);
  const { slug } = await params;
  const ip = getClientIp(req.headers);
  const limit = consumeRateLimit({
    key: `booking-chat:${slug}:${ip}`,
    limit: 30,
    windowMs: 60_000,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429, headers: { "x-request-id": requestId, ...rateLimitHeaders(limit) } }
    );
  }

  const baseHeaders = {
    "x-request-id": requestId,
    ...rateLimitHeaders(limit),
  };

  const org = await db.organization.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      faqText: true,
      aiChatbotEnabled: true,
      status: true,
      suspended: true,
      phone: true,
      address: true,
    },
  });

  if (!org || isOrganizationSuspended(org)) {
    return NextResponse.json({ error: "Business not available" }, { status: 403, headers: baseHeaders });
  }

  if (!org.aiChatbotEnabled) {
    return NextResponse.json({ error: "AI assistant is not enabled for this business" }, { status: 404, headers: baseHeaders });
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400, headers: baseHeaders });
  }

  if (!body.message || typeof body.message !== "string" || body.message.trim().length === 0) {
    return NextResponse.json({ error: "Message is required" }, { status: 400, headers: baseHeaders });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const aiDisabled = !apiKey || process.env.AI_PROVIDER === "DISABLED";

  if (aiDisabled) {
    return NextResponse.json({ data: { reply: MOCK_RESPONSE, mock: true } }, { headers: baseHeaders });
  }

  const systemPrompt = [
    `You are a friendly booking assistant for ${org.name}.`,
    org.description ? `About the business: ${org.description}` : null,
    org.phone ? `Contact phone: ${org.phone}` : null,
    org.address ? `Address: ${org.address}` : null,
    org.faqText ? `\nFrequently asked questions:\n${org.faqText}` : null,
    `\nYour responsibilities:`,
    `- Answer questions about services, pricing, working hours, and booking.`,
    `- Guide users to use the booking form on this page.`,
    `- If asked about availability, tell users to use the booking form to see real-time slots.`,
    `\nStrict rules you must follow:`,
    `- Never reveal private customer data or other customers' appointments.`,
    `- Never create or cancel appointments on behalf of the user without their explicit written confirmation.`,
    `- Never provide medical, legal, or financial advice.`,
    `- Do not invent availability or pricing - only use information provided above.`,
    `- If you don't know something, say so and suggest contacting the business directly.`,
  ]
    .filter(Boolean)
    .join("\n");

  const history = (body.conversationHistory ?? []).slice(-10);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system: systemPrompt,
        messages: [...history, { role: "user", content: body.message.trim() }],
      }),
    });

    if (!res.ok) {
      logger.warn("anthropic api non-ok response", { requestId, slug, status: res.status });
      return NextResponse.json({ data: { reply: MOCK_RESPONSE, mock: true } }, { headers: baseHeaders });
    }

    const data = (await res.json()) as { content?: Array<{ text?: string }> };
    const reply = data.content?.[0]?.text ?? MOCK_RESPONSE;
    return NextResponse.json({ data: { reply } }, { headers: baseHeaders });
  } catch (err) {
    logger.error("ai chatbot request failed", { requestId, slug, err });
    return NextResponse.json({ data: { reply: MOCK_RESPONSE, mock: true } }, { headers: baseHeaders });
  }
}
