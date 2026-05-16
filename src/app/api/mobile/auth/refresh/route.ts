import { logger } from "@/lib/logger";
import { consumeRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rate-limit";
import { getRequestId } from "@/lib/request-id";
import { TenantError } from "@/lib/tenant";
import { rotateMobileRefreshToken } from "@/services/mobile-auth.service";
import { NextResponse } from "next/server";
import { z } from "zod";

const refreshSchema = z.object({
  refreshToken: z.string().min(20),
  deviceId: z.string().max(120).optional(),
});

export async function POST(req: Request) {
  const requestId = getRequestId(req.headers);
  const route = "/api/mobile/auth/refresh";
  const ip = getClientIp(req.headers);
  const limit = consumeRateLimit({
    key: `mobile-refresh:${ip}`,
    limit: 40,
    windowMs: 60_000,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many refresh attempts" },
      { status: 429, headers: { "x-request-id": requestId, ...rateLimitHeaders(limit) } }
    );
  }

  try {
    const body = await req.json();
    const parsed = refreshSchema.parse(body);
    const rotated = await rotateMobileRefreshToken({
      refreshToken: parsed.refreshToken,
      requestMeta: {
        deviceId: parsed.deviceId,
        userAgent: req.headers.get("user-agent"),
        ipAddress: ip,
      },
    });

    logger.info("mobile refresh successful", {
      requestId,
      route,
      outcome: "success",
      userId: rotated.user.id,
      organizationId: rotated.user.organizationId,
    });

    return NextResponse.json(
      {
        data: {
          accessToken: rotated.accessToken,
          refreshToken: rotated.refreshToken,
          expiresIn: rotated.expiresIn,
          user: {
            id: rotated.user.id,
            email: rotated.user.email,
            name: rotated.user.name,
            organizationId: rotated.user.organizationId,
            organizationSlug: rotated.user.organizationSlug,
            organizationName: rotated.user.organizationName,
          },
          roles: {
            appRole: rotated.user.appRole,
            platformRole: rotated.user.platformRole,
            membershipRole: rotated.user.membershipRole,
            scope: rotated.claims.scope,
          },
        },
      },
      { headers: { "x-request-id": requestId, ...rateLimitHeaders(limit) } }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400, headers: { "x-request-id": requestId, ...rateLimitHeaders(limit) } });
    }
    if (err instanceof TenantError) {
      return NextResponse.json({ error: err.message }, { status: 401, headers: { "x-request-id": requestId, ...rateLimitHeaders(limit) } });
    }
    logger.error("mobile refresh failed", { requestId, route, outcome: "error", err });
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500, headers: { "x-request-id": requestId, ...rateLimitHeaders(limit) } });
  }
}
