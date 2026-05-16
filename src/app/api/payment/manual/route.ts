import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { getRequestId } from "@/lib/request-id";
import { requireAuth, TenantError } from "@/lib/tenant";
import { getPaymentProvider } from "@/services/payment/payment.factory";
import { normalizePaymentStatus } from "@/services/payment/payment-status";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const manualPaymentSchema = z.object({
  amountCents: z.number().int().positive(),
  currency: z.string().default("TRY"),
  description: z.string().min(1),
  customerEmail: z.string().email(),
  appointmentId: z.string().min(1),
});

export async function POST(req: Request) {
  const requestId = getRequestId(req.headers);
  const route = "/api/payment/manual";

  try {
    const { org } = await requireAuth();
    const body = await req.json();
    const parsed = manualPaymentSchema.parse(body);

    const appointment = await db.appointment.findFirst({
      where: { id: parsed.appointmentId, organizationId: org.id },
      select: { id: true },
    });
    if (!appointment) {
      return NextResponse.json({ error: "Randevu bulunamadı" }, { status: 404, headers: { "x-request-id": requestId } });
    }

    const provider = getPaymentProvider();
    if (!provider.isConfigured()) {
      return NextResponse.json(
        { error: "Ödeme sağlayıcısı yapılandırılmamış." },
        { status: 503, headers: { "x-request-id": requestId } }
      );
    }

    const idempotencyKey = req.headers.get("x-idempotency-key") ?? undefined;
    const result = await provider.createPayment({
      ...parsed,
      idempotencyKey,
      metadata: {
        organizationId: org.id,
        appointmentId: parsed.appointmentId,
      },
    });
    const normalizedStatus = normalizePaymentStatus(result.status);

    const payment = await db.payment.create({
      data: {
        organizationId: org.id,
        appointmentId: parsed.appointmentId,
        provider: provider.name,
        purpose: "MANUAL_COLLECTION",
        providerEventId: result.providerEventId ?? null,
        externalReference: result.providerReference ?? null,
        stripeEventId: result.providerEventId ?? `${provider.name.toLowerCase()}_${Date.now()}_${parsed.appointmentId}`,
        sessionId: result.providerReference ?? `manual_${Date.now()}_${parsed.appointmentId}`,
        amountCents: parsed.amountCents,
        currency: parsed.currency,
        status: normalizedStatus,
        metadata: {
          description: parsed.description,
          customerEmail: parsed.customerEmail,
        },
        confirmedAt: normalizedStatus === "PAID" ? new Date() : null,
        attempts: {
          create: {
            provider: provider.name,
            status: normalizedStatus,
            idempotencyKey: idempotencyKey ?? null,
            providerReference: result.providerReference ?? null,
            requestId,
            rawSafe: result.rawSafe ? (result.rawSafe as Prisma.InputJsonValue) : undefined,
          },
        },
      },
      select: { id: true },
    });

    logger.info("manual payment created", {
      requestId,
      route,
      outcome: "success",
      paymentId: payment.id,
      provider: provider.name,
      normalizedStatus,
    });

    return NextResponse.json(
      { data: { paymentId: payment.id, result, normalizedStatus } },
      { status: 200, headers: { "x-request-id": requestId } }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400, headers: { "x-request-id": requestId } });
    }
    if (err instanceof TenantError) {
      logger.warn("manual payment access denied", { requestId, route, outcome: "forbidden" });
      return NextResponse.json({ error: err.message }, { status: 403, headers: { "x-request-id": requestId } });
    }
    logger.error("manual payment create failed", { requestId, route, outcome: "error", err });
    return NextResponse.json({ error: "Ödeme oluşturulamadı." }, { status: 500, headers: { "x-request-id": requestId } });
  }
}
