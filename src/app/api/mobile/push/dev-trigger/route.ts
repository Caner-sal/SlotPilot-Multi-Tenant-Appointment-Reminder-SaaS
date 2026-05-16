import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { assertMobileScope, requireMobileRequestAuth } from "@/lib/mobile-request-auth";
import { getRequestId } from "@/lib/request-id";
import { TenantError } from "@/lib/tenant";
import { NextResponse } from "next/server";
import { z } from "zod";

const devTriggerSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(500),
});

export async function POST(req: Request) {
  const requestId = getRequestId(req.headers);
  const route = "/api/mobile/push/dev-trigger";
  try {
    const auth = await requireMobileRequestAuth(req);
    assertMobileScope(auth.scope, "push:write");

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Dev trigger production ortamında kapalı" },
        { status: 403, headers: { "x-request-id": requestId } }
      );
    }

    const body = await req.json();
    const parsed = devTriggerSchema.parse(body);
    const tokens = await db.mobilePushToken.findMany({
      where: {
        organizationId: auth.org.id,
        isActive: true,
      },
      select: {
        id: true,
        expoPushToken: true,
      },
      take: 20,
    });

    logger.info("mobile push dev trigger", {
      requestId,
      route,
      outcome: "queued",
      organizationId: auth.org.id,
      title: parsed.title,
      queuedTokens: tokens.length,
    });

    return NextResponse.json(
      {
        data: {
          queued: tokens.length,
          preview: {
            title: parsed.title,
            body: parsed.body,
          },
        },
      },
      { headers: { "x-request-id": requestId } }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400, headers: { "x-request-id": requestId } });
    }
    if (err instanceof TenantError) {
      return NextResponse.json({ error: err.message }, { status: 403, headers: { "x-request-id": requestId } });
    }
    logger.error("mobile push dev trigger failed", { requestId, route, outcome: "error", err });
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500, headers: { "x-request-id": requestId } });
  }
}
