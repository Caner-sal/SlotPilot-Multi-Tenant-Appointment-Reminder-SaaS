import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { getRequestId } from "@/lib/request-id";
import { requireSuperAdmin, SuperAdminError } from "@/lib/superadmin";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

const querySchema = z.object({
  plan: z.enum(["FREE", "STARTER", "PRO"]).optional(),
  status: z.enum(["ACTIVE", "CANCELLED", "PAST_DUE", "TRIALING", "INCOMPLETE"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().min(1).optional(),
});

type PlanSummary = {
  FREE: number;
  STARTER: number;
  PRO: number;
};

type StatusSummary = {
  ACTIVE: number;
  TRIALING: number;
  PAST_DUE: number;
  INCOMPLETE: number;
  CANCELLED: number;
};

function summarizePlans(rows: Array<{ plan: "FREE" | "STARTER" | "PRO"; _count: { plan: number } }>): PlanSummary {
  const summary: PlanSummary = { FREE: 0, STARTER: 0, PRO: 0 };
  for (const row of rows) {
    summary[row.plan] = row._count.plan;
  }
  return summary;
}

function summarizeStatuses(
  rows: Array<{ status: "ACTIVE" | "TRIALING" | "PAST_DUE" | "INCOMPLETE" | "CANCELLED"; _count: { status: number } }>
): StatusSummary {
  const summary: StatusSummary = {
    ACTIVE: 0,
    TRIALING: 0,
    PAST_DUE: 0,
    INCOMPLETE: 0,
    CANCELLED: 0,
  };
  for (const row of rows) {
    summary[row.status] = row._count.status;
  }
  return summary;
}

export async function GET(req: Request) {
  const requestId = getRequestId(req.headers);
  const route = "/api/admin/subscriptions";

  try {
    await requireSuperAdmin();

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      plan: searchParams.get("plan") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      cursor: searchParams.get("cursor") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues },
        { status: 400, headers: { "x-request-id": requestId } }
      );
    }

    const { plan, status, limit, cursor } = parsed.data;
    const where: Prisma.SubscriptionWhereInput = {
      ...(plan ? { plan } : {}),
      ...(status ? { status } : {}),
    };

    const [items, totalSubscriptions, activeSubscriptions, paymentPendingAccounts, planRows, statusRows] = await Promise.all([
      db.subscription.findMany({
        where,
        take: limit,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: {
          id: true,
          organizationId: true,
          plan: true,
          status: true,
          currentPeriodEnd: true,
          createdAt: true,
          updatedAt: true,
          organization: {
            select: {
              name: true,
              slug: true,
              email: true,
            },
          },
        },
      }),
      db.subscription.count({ where }),
      db.subscription.count({ where: { ...where, status: { in: ["ACTIVE", "TRIALING"] } } }),
      db.subscription.count({ where: { ...where, status: { in: ["PAST_DUE", "INCOMPLETE"] } } }),
      db.subscription.groupBy({ by: ["plan"], where, _count: { plan: true } }),
      db.subscription.groupBy({ by: ["status"], where, _count: { status: true } }),
    ]);

    const nextCursor = items.length === limit ? items[items.length - 1]?.id ?? null : null;

    logger.info("admin subscriptions queried", {
      requestId,
      route,
      outcome: "success",
      count: items.length,
      limit,
      nextCursor,
      plan: plan ?? null,
      status: status ?? null,
    });

    return NextResponse.json(
      {
        data: {
          items,
          pagination: {
            limit,
            nextCursor,
          },
          summary: {
            totalSubscriptions,
            activeSubscriptions,
            paymentPendingAccounts,
            planDistribution: summarizePlans(planRows),
            statusDistribution: summarizeStatuses(statusRows),
          },
        },
      },
      { headers: { "x-request-id": requestId } }
    );
  } catch (err) {
    if (err instanceof SuperAdminError) {
      logger.warn("admin subscriptions access denied", {
        requestId,
        route,
        outcome: "forbidden",
      });
      return NextResponse.json(
        { error: err.message },
        { status: 403, headers: { "x-request-id": requestId } }
      );
    }

    logger.error("admin subscriptions query failed", {
      requestId,
      route,
      outcome: "error",
      err,
    });

    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500, headers: { "x-request-id": requestId } }
    );
  }
}
