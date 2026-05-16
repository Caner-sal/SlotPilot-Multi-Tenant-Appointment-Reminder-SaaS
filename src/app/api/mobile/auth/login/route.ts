import { logger } from "@/lib/logger";
import { consumeRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rate-limit";
import { getRequestId } from "@/lib/request-id";
import { TenantError } from "@/lib/tenant";
import { issueMobileTokenPair, validateMobileCredentials } from "@/services/mobile-auth.service";
import { trackProductEvent } from "@/services/product-event.service";
import { NextResponse } from "next/server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  deviceId: z.string().max(120).optional(),
});

export async function POST(req: Request) {
  const requestId = getRequestId(req.headers);
  const route = "/api/mobile/auth/login";
  const ip = getClientIp(req.headers);
  const limit = consumeRateLimit({
    key: `mobile-login:${ip}`,
    limit: 20,
    windowMs: 60_000,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts" },
      { status: 429, headers: { "x-request-id": requestId, ...rateLimitHeaders(limit) } }
    );
  }

  try {
    const body = await req.json();
    const parsed = loginSchema.parse(body);
    const user = await validateMobileCredentials(parsed.email, parsed.password);
    const tokenPair = await issueMobileTokenPair({
      user,
      requestMeta: {
        deviceId: parsed.deviceId,
        userAgent: req.headers.get("user-agent"),
        ipAddress: ip,
      },
    });

    logger.info("mobile login successful", {
      requestId,
      route,
      outcome: "success",
      userId: user.id,
      organizationId: user.organizationId,
    });

    await trackProductEvent({
      eventName: "signup_started",
      userId: user.id,
      organizationId: user.organizationId,
      payloadSafe: { channel: "mobile" },
    });

    return NextResponse.json(
      {
        data: {
          accessToken: tokenPair.accessToken,
          refreshToken: tokenPair.refreshToken,
          expiresIn: tokenPair.expiresIn,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            organizationId: user.organizationId,
            organizationSlug: user.organizationSlug,
            organizationName: user.organizationName,
          },
          roles: {
            appRole: user.appRole,
            platformRole: user.platformRole,
            membershipRole: user.membershipRole,
            scope: tokenPair.claims.scope,
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
      logger.warn("mobile login denied", { requestId, route, outcome: "unauthorized" });
      return NextResponse.json({ error: err.message }, { status: 401, headers: { "x-request-id": requestId, ...rateLimitHeaders(limit) } });
    }
    logger.error("mobile login failed", { requestId, route, outcome: "error", err });
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500, headers: { "x-request-id": requestId, ...rateLimitHeaders(limit) } });
  }
}
