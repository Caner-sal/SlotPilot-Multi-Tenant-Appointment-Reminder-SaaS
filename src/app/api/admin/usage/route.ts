import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { getRequestId } from "@/lib/request-id";
import { requireSuperAdmin, SuperAdminError } from "@/lib/superadmin";
import { NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().min(1).optional(),
});

type UsageItem = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  bookingEnabled: boolean;
  suspended: boolean;
  subscription: {
    plan: "FREE" | "STARTER" | "PRO";
    status: "ACTIVE" | "TRIALING" | "PAST_DUE" | "INCOMPLETE" | "CANCELLED";
    currentPeriodEnd: Date | null;
  } | null;
  _count: {
    appointments: number;
    staff: number;
    services: number;
    members: number;
  };
};

export async function GET(req: Request) {
  const requestId = getRequestId(req.headers);
  const route = "/api/admin/usage";

  try {
    await requireSuperAdmin();

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      limit: searchParams.get("limit") ?? undefined,
      cursor: searchParams.get("cursor") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues },
        { status: 400, headers: { "x-request-id": requestId } }
      );
    }

    const { limit, cursor } = parsed.data;
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [organizations, totals, planRows] = await Promise.all([
      db.organization.findMany({
        take: limit,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          bookingEnabled: true,
          suspended: true,
          subscription: {
            select: {
              plan: true,
              status: true,
              currentPeriodEnd: true,
            },
          },
          _count: {
            select: {
              appointments: true,
              staff: true,
              services: true,
              members: true,
            },
          },
        },
      }),
      Promise.all([
        db.organization.count(),
        db.organization.count({ where: { suspended: false } }),
        db.organization.count({ where: { suspended: true } }),
        db.appointment.count({ where: { startTime: { gte: monthStart } } }),
        db.subscription.count({ where: { status: { in: ["ACTIVE", "TRIALING"] } } }),
        db.subscription.count({ where: { status: { in: ["PAST_DUE", "INCOMPLETE"] } } }),
      ]),
      db.subscription.groupBy({ by: ["plan"], _count: { plan: true } }),
    ]);

    const orgIds = organizations.map((org) => org.id);
    const monthlyRows = orgIds.length
      ? await db.appointment.groupBy({
          by: ["organizationId"],
          where: {
            organizationId: { in: orgIds },
            startTime: { gte: monthStart },
          },
          _count: { _all: true },
        })
      : [];

    const monthlyByOrg = new Map(monthlyRows.map((row) => [row.organizationId, row._count._all]));

    const items = organizations.map((org): UsageItem & { monthlyAppointments: number; isPubliclyAvailable: boolean } => ({
      ...org,
      monthlyAppointments: monthlyByOrg.get(org.id) ?? 0,
      isPubliclyAvailable: org.bookingEnabled && !org.suspended,
    }));

    const [totalOrganizations, activeOrganizations, suspendedOrganizations, monthlyAppointments, activeSubscriptions, paymentPendingAccounts] = totals;

    const planDistribution = { FREE: 0, STARTER: 0, PRO: 0 };
    for (const row of planRows) {
      planDistribution[row.plan] = row._count.plan;
    }

    const nextCursor = organizations.length === limit ? organizations[organizations.length - 1]?.id ?? null : null;

    logger.info("admin usage queried", {
      requestId,
      route,
      outcome: "success",
      count: organizations.length,
      limit,
      nextCursor,
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
            totalOrganizations,
            activeOrganizations,
            suspendedOrganizations,
            monthlyAppointments,
            activeSubscriptions,
            paymentPendingAccounts,
            planDistribution,
          },
        },
      },
      { headers: { "x-request-id": requestId } }
    );
  } catch (err) {
    if (err instanceof SuperAdminError) {
      logger.warn("admin usage access denied", {
        requestId,
        route,
        outcome: "forbidden",
      });
      return NextResponse.json(
        { error: err.message },
        { status: 403, headers: { "x-request-id": requestId } }
      );
    }

    logger.error("admin usage query failed", {
      requestId,
      route,
      outcome: "error",
      err,
    });

    return NextResponse.json(
      { error: "Failed to fetch usage" },
      { status: 500, headers: { "x-request-id": requestId } }
    );
  }
}
