import { db } from "@/lib/db";
import { NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  message: string;
  conversationHistory?: ChatMessage[];
}

// In-memory rate limiter: 30 req/min per slug (production should use Redis)
const rateLimitMap = new Map<string, { count: number; reset: number }>();

function checkRateLimit(slug: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(slug);

  if (!entry || now > entry.reset) {
    rateLimitMap.set(slug, { count: 1, reset: now + 60_000 });
    return true;
  }

  if (entry.count >= 30) return false;

  entry.count++;
  return true;
}

const MOCK_RESPONSE =
  "AI assistant is not available right now. Please call us or use the booking form to schedule an appointment.";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!checkRateLimit(slug)) {
    return NextResponse.json({ error: "Too many requests. Please try again in a minute." }, { status: 429 });
  }

  const org = await db.organization.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      faqText: true,
      aiChatbotEnabled: true,
      suspended: true,
      bookingEnabled: true,
      phone: true,
      address: true,
    },
  });

  if (!org || org.suspended) {
    return NextResponse.json({ error: "Business not found" }, { status: 403 });
  }

  if (!org.aiChatbotEnabled) {
    return NextResponse.json({ error: "AI assistant is not enabled for this business" }, { status: 404 });
  }

  let body: RequestBody;
  try {
    body = await req.json() as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.message || typeof body.message !== "string" || body.message.trim().length === 0) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const aiDisabled = !apiKey || process.env.AI_PROVIDER === "DISABLED";

  if (aiDisabled) {
    return NextResponse.json({ data: { reply: MOCK_RESPONSE, mock: true } });
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
    `- Do not invent availability or pricing — only use information provided above.`,
    `- If you don't know something, say so and suggest contacting the business directly.`,
  ]
    .filter(Boolean)
    .join("\n");

  const history = (body.conversationHistory ?? []).slice(-10); // keep last 10 turns

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
        messages: [
          ...history,
          { role: "user", content: body.message.trim() },
        ],
      }),
    });

    if (!res.ok) {
      console.error("Anthropic API error:", res.status, await res.text());
      return NextResponse.json({ data: { reply: MOCK_RESPONSE, mock: true } });
    }

    const data = await res.json() as { content?: Array<{ text?: string }> };
    const reply = data.content?.[0]?.text ?? MOCK_RESPONSE;

    return NextResponse.json({ data: { reply } });
  } catch (err) {
    console.error("AI chatbot error:", err);
    return NextResponse.json({ data: { reply: MOCK_RESPONSE, mock: true } });
  }
}
