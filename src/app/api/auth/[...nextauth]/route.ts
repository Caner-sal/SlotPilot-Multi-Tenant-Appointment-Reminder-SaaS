import { handlers } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { getRequestId } from "@/lib/request-id";
import { consumeRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const GET = handlers.GET;

export async function POST(req: Request) {
  const requestId = getRequestId(req.headers);
  const ip = getClientIp(req.headers);
  const limit = consumeRateLimit({
    key: `auth:login:${ip}`,
    limit: 25,
    windowMs: 60_000,
  });

  if (!limit.allowed) {
    logger.warn("auth rate limited", { requestId, ip });
    return NextResponse.json(
      { error: "Too many authentication attempts. Please try again shortly." },
      { status: 429, headers: { "x-request-id": requestId, ...rateLimitHeaders(limit) } }
    );
  }

  const response = await handlers.POST(req as unknown as NextRequest);
  response.headers.set("x-request-id", requestId);
  for (const [key, value] of Object.entries(rateLimitHeaders(limit))) {
    response.headers.set(key, value);
  }
  return response;
}
