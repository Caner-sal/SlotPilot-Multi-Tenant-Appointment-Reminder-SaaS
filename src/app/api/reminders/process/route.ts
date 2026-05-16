import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { consumeRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rate-limit";
import { getRequestId } from "@/lib/request-id";
import { SuperAdminError, requireSuperAdmin } from "@/lib/superadmin";
import { processPendingReminders } from "@/services/reminder.service";
import { NextResponse } from "next/server";

const INTERNAL_JOB_PROVIDER = "INTERNAL_JOB";
const REMINDER_EVENT_TYPE = "REMINDER_PROCESS";

export async function POST(req: Request) {
  const requestId = getRequestId(req.headers);
  const route = "/api/reminders/process";
  const ip = getClientIp(req.headers);
  const limit = consumeRateLimit({
    key: `reminder-process:${ip}`,
    limit: 60,
    windowMs: 60_000,
  });

  if (!limit.allowed) {
    logger.warn("rate limit rejected reminder process request", {
      requestId,
      route,
      outcome: "rate_limited",
      ip,
    });
    return NextResponse.json(
      { error: "Too many reminder process requests" },
      { status: 429, headers: { "x-request-id": requestId, ...rateLimitHeaders(limit) } }
    );
  }

  const baseHeaders = {
    "x-request-id": requestId,
    ...rateLimitHeaders(limit),
  };

  try {
    const workerKey = req.headers.get("x-worker-key");
    const validWorkerKey = process.env.WORKER_SECRET_KEY;
    const idempotencyKey = req.headers.get("x-idempotency-key");

    const isInternalWorker = !!workerKey && !!validWorkerKey && workerKey === validWorkerKey;

    if (isInternalWorker) {
      if (!idempotencyKey) {
        return NextResponse.json(
          { error: "Missing x-idempotency-key for internal worker call" },
          { status: 400, headers: baseHeaders }
        );
      }

      const eventId = `${REMINDER_EVENT_TYPE}:${idempotencyKey}`;
      const existing = await db.webhookEvent.findUnique({
        where: { provider_eventId: { provider: INTERNAL_JOB_PROVIDER, eventId } },
        select: { processedAt: true },
      });

      if (existing?.processedAt) {
        const stats = {
          processed: 0,
          sent: 0,
          failed: 0,
          retried: 0,
          permanentFailed: 0,
          skipped: 1,
        };
        logger.info("reminder process duplicate idempotency key skipped", {
          requestId,
          route,
          outcome: "duplicate_skipped",
          eventId,
        });
        return NextResponse.json(
          { data: { ...stats, reason: "duplicate_idempotency_key", skippedDuplicate: true } },
          { headers: baseHeaders }
        );
      }

      await db.webhookEvent.upsert({
        where: { provider_eventId: { provider: INTERNAL_JOB_PROVIDER, eventId } },
        update: { status: "PROCESSING", signatureValid: true, eventType: REMINDER_EVENT_TYPE },
        create: {
          provider: INTERNAL_JOB_PROVIDER,
          eventType: REMINDER_EVENT_TYPE,
          eventId,
          signatureValid: true,
          status: "PROCESSING",
        },
      });

      try {
        const stats = await processPendingReminders();
        await db.webhookEvent.update({
          where: { provider_eventId: { provider: INTERNAL_JOB_PROVIDER, eventId } },
          data: { status: "PROCESSED", processedAt: new Date(), payloadSafe: { stats } },
        });
        logger.info("reminder process completed", {
          requestId,
          route,
          outcome: "success",
          eventId,
          stats,
        });
        return NextResponse.json({ data: stats }, { headers: baseHeaders });
      } catch (err) {
        await db.webhookEvent.update({
          where: { provider_eventId: { provider: INTERNAL_JOB_PROVIDER, eventId } },
          data: { status: "FAILED", errorMessage: err instanceof Error ? err.message : "job_failed" },
        });
        throw err;
      }
    }

    await requireSuperAdmin();
    const stats = await processPendingReminders();
    logger.info("reminder process completed by admin", {
      requestId,
      route,
      outcome: "success",
      stats,
    });
    return NextResponse.json({ data: stats }, { headers: baseHeaders });
  } catch (err) {
    if (err instanceof SuperAdminError) {
      logger.warn("reminder process access denied", {
        requestId,
        route,
        outcome: "forbidden",
      });
      return NextResponse.json({ error: err.message }, { status: 403, headers: baseHeaders });
    }
    logger.error("reminder process route failed", { requestId, route, outcome: "error", err });
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500, headers: baseHeaders });
  }
}
