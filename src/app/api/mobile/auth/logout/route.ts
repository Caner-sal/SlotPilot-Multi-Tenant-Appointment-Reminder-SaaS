import { logger } from "@/lib/logger";
import { consumeRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rate-limit";
import { getRequestId } from "@/lib/request-id";
import { revokeMobileRefreshToken } from "@/services/mobile-auth.service";
import { NextResponse } from "next/server";
import { z } from "zod";

const logoutSchema = z.object({
  refreshToken: z.string().min(20),
});

export async function POST(req: Request) {
  const requestId = getRequestId(req.headers);
  const route = "/api/mobile/auth/logout";
  const ip = getClientIp(req.headers);
  const limit = consumeRateLimit({
    key: `mobile-logout:${ip}`,
    limit: 60,
    windowMs: 60_000,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many logout attempts" },
      { status: 429, headers: { "x-request-id": requestId, ...rateLimitHeaders(limit) } }
    );
  }

  try {
    const body = await req.json();
    const parsed = logoutSchema.parse(body);
    const revoked = await revokeMobileRefreshToken(parsed.refreshToken);
    logger.info("mobile logout completed", {
      requestId,
      route,
      outcome: revoked ? "revoked" : "not_found",
    });
    return NextResponse.json({ data: { revoked } }, { headers: { "x-request-id": requestId, ...rateLimitHeaders(limit) } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400, headers: { "x-request-id": requestId, ...rateLimitHeaders(limit) } });
    }
    logger.error("mobile logout failed", { requestId, route, outcome: "error", err });
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500, headers: { "x-request-id": requestId, ...rateLimitHeaders(limit) } });
  }
}
