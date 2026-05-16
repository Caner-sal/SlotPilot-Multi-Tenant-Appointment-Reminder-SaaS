import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { getRequestId } from "@/lib/request-id";
import { SuperAdminError, requireSuperAdmin } from "@/lib/superadmin";
import { NextResponse } from "next/server";

const INTERNAL_JOB_PROVIDER = "INTERNAL_JOB";

type HealthCounts = {
  pendingReminders: number;
  failedReminders: number;
  paymentsPendingReview: number;
  failedWebhookEvents: number;
  failedInternalJobs: number;
  failedPaymentAttempts: number;
};

type HealthWindow = {
  failedWebhookEvents: number;
  failedInternalJobs: number;
  failedPaymentAttempts: number;
  failedReminders: number;
};

const zeroCounts: HealthCounts = {
  pendingReminders: 0,
  failedReminders: 0,
  paymentsPendingReview: 0,
  failedWebhookEvents: 0,
  failedInternalJobs: 0,
  failedPaymentAttempts: 0,
};

const zeroWindow: HealthWindow = {
  failedWebhookEvents: 0,
  failedInternalJobs: 0,
  failedPaymentAttempts: 0,
  failedReminders: 0,
};

export async function GET(req: Request) {
  const requestId = getRequestId(req.headers);
  const route = "/api/admin/health";

  try {
    await requireSuperAdmin();

    let databaseOk = true;
    try {
      await db.$queryRaw`SELECT 1`;
    } catch {
      databaseOk = false;
    }

    let counts = zeroCounts;
    let windows = {
      last24h: zeroWindow,
      last7d: zeroWindow,
    };
    let recentWebhookFailures: Array<{ id: string; provider: string; eventType: string; eventId: string; errorMessage: string | null; createdAt: Date }> = [];
    let recentJobFailures: Array<{ id: string; eventType: string; eventId: string; errorMessage: string | null; createdAt: Date }> = [];

    try {
      const now = Date.now();
      const since24h = new Date(now - 24 * 60 * 60 * 1000);
      const since7d = new Date(now - 7 * 24 * 60 * 60 * 1000);

      const [
        pendingReminders,
        failedReminders,
        paymentsPendingReview,
        failedWebhookEvents,
        failedInternalJobs,
        failedPaymentAttempts,
        failedWebhookEvents24h,
        failedInternalJobs24h,
        failedPaymentAttempts24h,
        failedReminders24h,
        failedWebhookEvents7d,
        failedInternalJobs7d,
        failedPaymentAttempts7d,
        failedReminders7d,
        webhookRows,
        jobRows,
      ] = await Promise.all([
        db.reminder.count({ where: { status: "PENDING" } }),
        db.reminder.count({ where: { status: "FAILED" } }),
        db.payment.count({
          where: {
            status: {
              in: ["PENDING", "REQUIRES_ACTION", "MANUAL_REVIEW", "pending", "manual_review"],
            },
          },
        }),
        db.webhookEvent.count({ where: { status: "FAILED" } }),
        db.webhookEvent.count({ where: { provider: INTERNAL_JOB_PROVIDER, status: "FAILED" } }),
        db.paymentAttempt.count({ where: { status: { in: ["FAILED", "failed"] } } }),
        db.webhookEvent.count({
          where: {
            status: "FAILED",
            provider: { not: INTERNAL_JOB_PROVIDER },
            createdAt: { gte: since24h },
          },
        }),
        db.webhookEvent.count({
          where: {
            provider: INTERNAL_JOB_PROVIDER,
            status: "FAILED",
            createdAt: { gte: since24h },
          },
        }),
        db.paymentAttempt.count({ where: { status: { in: ["FAILED", "failed"] }, createdAt: { gte: since24h } } }),
        db.reminder.count({
          where: {
            status: "FAILED",
            OR: [{ sentAt: { gte: since24h } }, { sentAt: null, createdAt: { gte: since24h } }],
          },
        }),
        db.webhookEvent.count({
          where: {
            status: "FAILED",
            provider: { not: INTERNAL_JOB_PROVIDER },
            createdAt: { gte: since7d },
          },
        }),
        db.webhookEvent.count({
          where: {
            provider: INTERNAL_JOB_PROVIDER,
            status: "FAILED",
            createdAt: { gte: since7d },
          },
        }),
        db.paymentAttempt.count({ where: { status: { in: ["FAILED", "failed"] }, createdAt: { gte: since7d } } }),
        db.reminder.count({
          where: {
            status: "FAILED",
            OR: [{ sentAt: { gte: since7d } }, { sentAt: null, createdAt: { gte: since7d } }],
          },
        }),
        db.webhookEvent.findMany({
          where: { status: "FAILED" },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            provider: true,
            eventType: true,
            eventId: true,
            errorMessage: true,
            createdAt: true,
          },
        }),
        db.webhookEvent.findMany({
          where: { provider: INTERNAL_JOB_PROVIDER, status: "FAILED" },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            eventType: true,
            eventId: true,
            errorMessage: true,
            createdAt: true,
          },
        }),
      ]);

      counts = {
        pendingReminders,
        failedReminders,
        paymentsPendingReview,
        failedWebhookEvents,
        failedInternalJobs,
        failedPaymentAttempts,
      };
      windows = {
        last24h: {
          failedWebhookEvents: failedWebhookEvents24h,
          failedInternalJobs: failedInternalJobs24h,
          failedPaymentAttempts: failedPaymentAttempts24h,
          failedReminders: failedReminders24h,
        },
        last7d: {
          failedWebhookEvents: failedWebhookEvents7d,
          failedInternalJobs: failedInternalJobs7d,
          failedPaymentAttempts: failedPaymentAttempts7d,
          failedReminders: failedReminders7d,
        },
      };
      recentWebhookFailures = webhookRows;
      recentJobFailures = jobRows;
    } catch (err) {
      logger.warn("admin health metrics query fallback", {
        requestId,
        route,
        outcome: "metrics_query_fallback",
        err,
      });
      databaseOk = false;
    }

    const status = databaseOk ? "ok" : "degraded";
    logger.info("admin health snapshot served", {
      requestId,
      route,
      outcome: status,
      checks: counts,
    });

    return NextResponse.json(
      {
        data: {
          status,
          requestId,
          checks: {
            database: databaseOk ? "ok" : "failed",
            ...counts,
          },
          windows,
          recentFailures: {
            webhooks: recentWebhookFailures,
            jobs: recentJobFailures,
          },
        },
      },
      { headers: { "x-request-id": requestId } }
    );
  } catch (err) {
    if (err instanceof SuperAdminError) {
      logger.warn("admin health access denied", {
        requestId,
        route,
        outcome: "forbidden",
      });
      return NextResponse.json({ error: err.message }, { status: 403, headers: { "x-request-id": requestId } });
    }
    logger.error("admin health check failed", { requestId, route, outcome: "error", err });
    return NextResponse.json({ error: "Health check failed" }, { status: 500, headers: { "x-request-id": requestId } });
  }
}
