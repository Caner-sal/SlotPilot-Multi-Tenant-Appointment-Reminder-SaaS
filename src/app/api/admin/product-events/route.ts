import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { getRequestId } from "@/lib/request-id";
import { requireSuperAdmin, SuperAdminError } from "@/lib/superadmin";
import { NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  eventName: z.string().min(1).optional(),
  organizationId: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().min(1).optional(),
});

export async function GET(req: Request) {
  const requestId = getRequestId(req.headers);
  const route = "/api/admin/product-events";

  try {
    await requireSuperAdmin();
    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      eventName: searchParams.get("eventName") ?? undefined,
      organizationId: searchParams.get("organizationId") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      cursor: searchParams.get("cursor") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues },
        { status: 400, headers: { "x-request-id": requestId } }
      );
    }

    const { eventName, organizationId, limit, cursor } = parsed.data;
    const where = {
      ...(eventName ? { eventName } : {}),
      ...(organizationId ? { organizationId } : {}),
    };

    const rows = await db.productEvent.findMany({
      where,
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: {
        id: true,
        eventName: true,
        userId: true,
        organizationId: true,
        payloadSafe: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        organization: {
          select: {
            slug: true,
            name: true,
          },
        },
      },
    });

    const nextCursor = rows.length === limit ? rows[rows.length - 1]?.id ?? null : null;
    logger.info("admin product events queried", {
      requestId,
      route,
      outcome: "success",
      eventName: eventName ?? null,
      organizationId: organizationId ?? null,
      count: rows.length,
      nextCursor,
    });

    return NextResponse.json(
      {
        data: {
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
      logger.warn("admin product events access denied", {
        requestId,
        route,
        outcome: "forbidden",
      });
      return NextResponse.json(
        { error: err.message },
        { status: 403, headers: { "x-request-id": requestId } }
      );
    }
    logger.error("admin product events query failed", {
      requestId,
      route,
      outcome: "error",
      err,
    });
    return NextResponse.json(
      { error: "Failed to fetch product events" },
      { status: 500, headers: { "x-request-id": requestId } }
    );
  }
}
