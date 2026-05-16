import { logger } from "@/lib/logger";
import { assertMobileScope, requireMobileRequestAuth } from "@/lib/mobile-request-auth";
import { getRequestId } from "@/lib/request-id";
import { TenantError } from "@/lib/tenant";
import { getAnalytics } from "@/services/analytics.service";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const requestId = getRequestId(req.headers);
  const route = "/api/mobile/analytics";
  try {
    const auth = await requireMobileRequestAuth(req);
    assertMobileScope(auth.scope, "analytics:read");
    const analytics = await getAnalytics(auth.org.id);
    return NextResponse.json({ data: analytics }, { headers: { "x-request-id": requestId } });
  } catch (err) {
    if (err instanceof TenantError) {
      logger.warn("mobile analytics denied", { requestId, route, outcome: "forbidden" });
      return NextResponse.json({ error: err.message }, { status: 403, headers: { "x-request-id": requestId } });
    }
    logger.error("mobile analytics failed", { requestId, route, outcome: "error", err });
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500, headers: { "x-request-id": requestId } });
  }
}
