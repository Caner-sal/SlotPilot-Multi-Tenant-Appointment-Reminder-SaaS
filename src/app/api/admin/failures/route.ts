import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { getRequestId } from "@/lib/request-id";
import { SuperAdminError, requireSuperAdmin } from "@/lib/superadmin";
import { NextResponse } from "next/server";
import { z } from "zod";

const INTERNAL_JOB_PROVIDER = "INTERNAL_JOB";

const querySchema = z.object({
  source: z.enum(["webhook", "job"]).default("webhook"),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().min(1).optional(),
});

export async function GET(req: Request) {
  const requestId = getRequestId(req.headers);
  const route = "/api/admin/failures";

  try {
    await requireSuperAdmin();
    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      source: searchParams.get("source") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      cursor: searchParams.get("cursor") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400, headers: { "x-request-id": requestId } });
    }

    const { source, limit, cursor } = parsed.data;
    const where =
      source === "job"
        ? { provider: INTERNAL_JOB_PROVIDER, status: "FAILED" as const }
        : { provider: { not: INTERNAL_JOB_PROVIDER }, status: "FAILED" as const };

    const rows = await db.webhookEvent.findMany({
      where,
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: {
        id: true,
        provider: true,
        eventType: true,
        eventId: true,
        errorMessage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const nextCursor = rows.length === limit ? rows[rows.length - 1]?.id ?? null : null;
    logger.info("admin failures queried", {
      requestId,
      route,
      outcome: "success",
      source,
      count: rows.length,
      nextCursor,
    });

    return NextResponse.json(
      {
        data: {
          source,
          items: rows,
          pagination: {
            limit,
            nextCursor,
          },
        },
      },
      { headers: { "x-request-id": requestId } }
    );
  } catch (err) {
    if (err instanceof SuperAdminError) {
      logger.warn("admin failures access denied", {
        requestId,
        route,
        outcome: "forbidden",
      });
      return NextResponse.json({ error: err.message }, { status: 403, headers: { "x-request-id": requestId } });
    }
    logger.error("admin failures query failed", { requestId, route, outcome: "error", err });
    return NextResponse.json({ error: "Failed to fetch failures" }, { status: 500, headers: { "x-request-id": requestId } });
  }
}
