import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { assertMobileScope, requireMobileRequestAuth } from "@/lib/mobile-request-auth";
import { getRequestId } from "@/lib/request-id";
import { TenantError } from "@/lib/tenant";
import { NextResponse } from "next/server";
import { z } from "zod";

const registerPushSchema = z.object({
  expoPushToken: z.string().min(8),
  deviceId: z.string().max(120).optional(),
  platform: z.enum(["ios", "android", "web"]).optional(),
  appVersion: z.string().max(40).optional(),
});

export async function POST(req: Request) {
  const requestId = getRequestId(req.headers);
  const route = "/api/mobile/push/register";
  try {
    const auth = await requireMobileRequestAuth(req);
    assertMobileScope(auth.scope, "push:write");
    const body = await req.json();
    const parsed = registerPushSchema.parse(body);

    const token = await db.mobilePushToken.upsert({
      where: {
        organizationId_expoPushToken: {
          organizationId: auth.org.id,
          expoPushToken: parsed.expoPushToken,
        },
      },
      update: {
        userId: auth.user.id,
        isActive: true,
        deviceId: parsed.deviceId ?? null,
        platform: parsed.platform ?? null,
        appVersion: parsed.appVersion ?? null,
        lastSeenAt: new Date(),
      },
      create: {
        userId: auth.user.id,
        organizationId: auth.org.id,
        expoPushToken: parsed.expoPushToken,
        deviceId: parsed.deviceId ?? null,
        platform: parsed.platform ?? null,
        appVersion: parsed.appVersion ?? null,
      },
      select: {
        id: true,
        expoPushToken: true,
        platform: true,
        appVersion: true,
        isActive: true,
        lastSeenAt: true,
      },
    });

    return NextResponse.json({ data: token }, { headers: { "x-request-id": requestId } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400, headers: { "x-request-id": requestId } });
    }
    if (err instanceof TenantError) {
      return NextResponse.json({ error: err.message }, { status: 403, headers: { "x-request-id": requestId } });
    }
    logger.error("mobile push register failed", { requestId, route, outcome: "error", err });
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500, headers: { "x-request-id": requestId } });
  }
}
