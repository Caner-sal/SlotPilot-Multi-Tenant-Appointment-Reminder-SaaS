import crypto from "crypto";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { getRequestId } from "@/lib/request-id";
import { TURKEY_PLANS } from "@/config/pricing.tr";
import { NextResponse } from "next/server";

export const config = { api: { bodyParser: false } };

// iyzico sends webhook as form-encoded POST with iyziEventType and token
// Signature: HMAC-SHA256(secret + token) base64 — verify before processing
async function verifyIyzicoWebhook(
  body: string,
  signatureHeader: string | null
): Promise<boolean> {
  const secret = process.env.IYZICO_WEBHOOK_SECRET ?? process.env.IYZICO_SECRET_KEY ?? "";
  if (!secret || !signatureHeader) return false;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64");
  return expected === signatureHeader;
}

export async function POST(req: Request) {
  const requestId = getRequestId(req.headers);
  const route = "/api/webhooks/iyzico";

  const body = await req.text();
  const signatureHeader = req.headers.get("x-iyzi-signature");

  // Signature verification
  const isValid = await verifyIyzicoWebhook(body, signatureHeader);
  if (!isValid) {
    logger.warn("iyzico webhook invalid signature", { requestId, route });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Parse form-encoded or JSON payload
  let payload: Record<string, string>;
  try {
    if (body.startsWith("{")) {
      payload = JSON.parse(body) as Record<string, string>;
    } else {
      payload = Object.fromEntries(new URLSearchParams(body));
    }
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const eventType = payload["iyziEventType"] ?? payload["eventType"] ?? "";
  const conversationId = payload["conversationId"] ?? "";
  const paymentId = payload["paymentId"] ?? "";
  const status = payload["status"] ?? "";

  // Build idempotency key from payload
  const payloadHash = crypto.createHash("sha256").update(body).digest("hex");

  // Idempotency check — skip if already processed
  const existing = await db.webhookEvent.findFirst({
    where: { provider: "IYZICO", eventId: payloadHash },
    select: { processedAt: true },
  });
  if (existing?.processedAt) {
    logger.info("iyzico webhook duplicate skipped", { requestId, route, conversationId });
    return NextResponse.json({ received: true });
  }

  // Record webhook event
  const webhookEvent = await db.webhookEvent.create({
    data: {
      provider: "IYZICO",
      eventType,
      eventId: payloadHash,
      payloadSafe: payload as unknown as import("@prisma/client").Prisma.InputJsonValue,
      signatureValid: true,
      status: "RECEIVED",
    },
  });

  try {
    // Find the SubscriptionPaymentTransaction by conversationId
    const transaction = conversationId
      ? await db.subscriptionPaymentTransaction.findUnique({
          where: { conversationId },
        })
      : null;

    if (!transaction) {
      logger.warn("iyzico webhook: transaction not found", { requestId, route, conversationId });
      await db.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { status: "SKIPPED", errorMessage: "Transaction not found", processedAt: new Date() },
      });
      return NextResponse.json({ received: true });
    }

    // Verify amount and currency from server config — never trust webhook values
    const planConfig = TURKEY_PLANS[transaction.planId as keyof typeof TURKEY_PLANS];
    const expectedAmountCents = planConfig?.priceCentsMonthly ?? 0;

    const webhookAmountCents = payload["price"]
      ? Math.round(parseFloat(payload["price"]) * 100)
      : null;

    if (webhookAmountCents !== null && webhookAmountCents !== expectedAmountCents) {
      logger.warn("iyzico webhook: amount mismatch", {
        requestId,
        route,
        expected: expectedAmountCents,
        received: webhookAmountCents,
      });
      await db.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { status: "REJECTED", errorMessage: "Amount mismatch", processedAt: new Date() },
      });
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    const isSuccess = status === "SUCCESS" || eventType === "SUBSCRIPTION_CREATED";
    const isFailed = status === "FAILURE" || eventType === "SUBSCRIPTION_FAILED";

    if (isSuccess) {
      // Activate subscription
      await db.subscriptionPaymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: "PAID",
          providerPaymentId: paymentId || null,
          paidAt: new Date(),
          rawProviderPayload: JSON.stringify(payload),
        },
      });

      // Update organization subscription
      const planId = transaction.planId as "FREE" | "STARTER" | "PRO";
      await db.subscription.upsert({
        where: { organizationId: transaction.organizationId },
        create: {
          organizationId: transaction.organizationId,
          plan: planId,
          status: "ACTIVE",
        },
        update: {
          plan: planId,
          status: "ACTIVE",
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      await db.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { organizationId: transaction.organizationId, status: "PROCESSED", processedAt: new Date() },
      });

      logger.info("iyzico webhook: subscription activated", {
        requestId,
        route,
        organizationId: transaction.organizationId,
        plan: planId,
      });
    } else if (isFailed) {
      await db.subscriptionPaymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: "FAILED",
          failedAt: new Date(),
          failureReason: payload["errorMessage"] ?? "Payment failed",
          rawProviderPayload: JSON.stringify(payload),
        },
      });

      await db.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { status: "PROCESSED", processedAt: new Date() },
      });

      logger.info("iyzico webhook: payment failed", { requestId, route, conversationId });
    } else {
      // Unknown event — mark as skipped
      await db.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { status: "SKIPPED", errorMessage: `Unhandled event type: ${eventType}`, processedAt: new Date() },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    logger.error("iyzico webhook processing error", { requestId, route, err });
    await db.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: { status: "ERROR", errorMessage: String(err) },
    });
    return NextResponse.json({ error: "Processing error" }, { status: 500 });
  }
}
