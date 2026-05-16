import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { consumeRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rate-limit";
import { getRequestId } from "@/lib/request-id";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export const config = { api: { bodyParser: false } };

export async function POST(req: Request) {
  const requestId = getRequestId(req.headers);
  const route = "/api/webhooks/stripe";
  const ip = getClientIp(req.headers);
  const limit = consumeRateLimit({
    key: `stripe-webhook:${ip}`,
    limit: 240,
    windowMs: 60_000,
  });
  if (!limit.allowed) {
    logger.warn("stripe webhook rate limited", {
      requestId,
      route,
      outcome: "rate_limited",
      ip,
    });
    return NextResponse.json(
      { error: "Too many webhook requests" },
      { status: 429, headers: { "x-request-id": requestId, ...rateLimitHeaders(limit) } }
    );
  }

  const baseHeaders = {
    "x-request-id": requestId,
    ...rateLimitHeaders(limit),
  };

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500, headers: baseHeaders });
  }

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400, headers: baseHeaders });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500, headers: baseHeaders });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    logger.warn("stripe webhook signature verification failed", {
      requestId,
      route,
      outcome: "invalid_signature",
      err,
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400, headers: baseHeaders });
  }

  const webhookRepo = (db as unknown as {
    webhookEvent?: {
      findUnique: (args: unknown) => Promise<{ processedAt: Date | null } | null>;
      upsert: (args: unknown) => Promise<unknown>;
      update: (args: unknown) => Promise<unknown>;
    };
  }).webhookEvent;

  const existing = webhookRepo
    ? await webhookRepo.findUnique({
        where: { provider_eventId: { provider: "STRIPE", eventId: event.id } },
        select: { processedAt: true },
      })
    : null;

  if (existing?.processedAt) {
    logger.info("stripe webhook duplicate skipped", {
      requestId,
      route,
      outcome: "duplicate_skipped",
      eventId: event.id,
    });
    return NextResponse.json({ received: true, duplicate: true }, { headers: baseHeaders });
  }

  if (webhookRepo) {
    await webhookRepo.upsert({
      where: { provider_eventId: { provider: "STRIPE", eventId: event.id } },
      update: {
        eventType: event.type,
        signatureValid: true,
        status: "PROCESSING",
        payloadSafe: { id: event.id, type: event.type, created: event.created },
      },
      create: {
        provider: "STRIPE",
        eventType: event.type,
        eventId: event.id,
        signatureValid: true,
        status: "PROCESSING",
        payloadSafe: { id: event.id, type: event.type, created: event.created },
      },
    });
  }

  try {
    switch (event.type) {
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const organizationId = subscription.metadata?.organizationId;
        if (!organizationId) break;

        const plan = resolvePlan(subscription);

        await db.subscription.upsert({
          where: { organizationId },
          update: {
            plan,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
          create: {
            organizationId,
            plan,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const organizationId = subscription.metadata?.organizationId;
        if (!organizationId) break;

        await db.subscription.update({
          where: { organizationId },
          data: {
            plan: "FREE",
            stripeSubscriptionId: null,
          },
        });
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const appointmentId = session.metadata?.appointmentId;
        const organizationId = session.metadata?.organizationId;
        if (!appointmentId || !organizationId) break;

        const amountCents = session.amount_total ?? 0;

        const paymentRepo = db.payment as unknown as {
          findFirst?: (args: unknown) => Promise<{ id: string } | null>;
          findUnique?: (args: unknown) => Promise<{ id: string } | null>;
        };

        const paymentAlreadyProcessed = paymentRepo.findFirst
          ? await paymentRepo.findFirst({
              where: {
                OR: [{ providerEventId: event.id }, { stripeEventId: event.id }],
              },
              select: { id: true },
            })
          : paymentRepo.findUnique
            ? await paymentRepo.findUnique({ where: { stripeEventId: event.id }, select: { id: true } })
            : null;
        if (paymentAlreadyProcessed) break;

        const pendingBySession = paymentRepo.findFirst
          ? await paymentRepo.findFirst({
              where: {
                organizationId,
                appointmentId,
                sessionId: session.id,
                provider: "STRIPE",
              },
              select: { id: true },
            })
          : null;

        await db.$transaction(async (tx) => {
          let paymentId: string;

          if (pendingBySession) {
            const updated = await tx.payment.update({
              where: { id: pendingBySession.id },
              data: {
                providerEventId: event.id,
                stripeEventId: event.id,
                externalReference: session.id,
                amountCents,
                currency: session.currency?.toUpperCase() ?? "TRY",
                status: "PAID",
                confirmedAt: new Date(),
              },
              select: { id: true },
            });
            paymentId = updated.id;
          } else {
            const created = await tx.payment.create({
              data: {
                organizationId,
                appointmentId,
                provider: "STRIPE",
                purpose: "APPOINTMENT_DEPOSIT",
                providerEventId: event.id,
                externalReference: session.id,
                stripeEventId: event.id,
                sessionId: session.id,
                amountCents,
                currency: session.currency?.toUpperCase() ?? "TRY",
                status: "PAID",
                confirmedAt: new Date(),
              },
              select: { id: true },
            });
            paymentId = created.id;
          }

          const txMaybe = tx as unknown as {
            paymentAttempt?: { create: (args: unknown) => Promise<unknown> };
          };
          if (txMaybe.paymentAttempt) {
            await txMaybe.paymentAttempt.create({
              data: {
                paymentId,
                provider: "STRIPE",
                status: "PAID",
                providerReference: session.id,
                requestId,
                rawSafe: { eventId: event.id, type: event.type },
              },
            });
          }

          await tx.appointment.update({
            where: { id: appointmentId },
            data: { paymentStatus: "PAID", status: "CONFIRMED" },
          });

          const revenueRepo = tx.revenueLedger as unknown as {
            findFirst?: (args: unknown) => Promise<{ id: string } | null>;
            create: (args: unknown) => Promise<unknown>;
          };
          const existingLedger = revenueRepo.findFirst
            ? await revenueRepo.findFirst({
                where: {
                  organizationId,
                  appointmentId,
                  paymentId,
                  type: "SERVICE_REVENUE",
                },
                select: { id: true },
              })
            : null;

          if (!existingLedger) {
            await revenueRepo.create({
              data: {
                organizationId,
                appointmentId,
                paymentId,
                type: "SERVICE_REVENUE",
                amountCents,
                currency: session.currency?.toUpperCase() ?? "TRY",
              },
            });
          }
        });
        break;
      }

      default:
        break;
    }

    if (webhookRepo) {
      await webhookRepo.update({
        where: { provider_eventId: { provider: "STRIPE", eventId: event.id } },
        data: { status: "PROCESSED", processedAt: new Date() },
      });
    }

    logger.info("stripe webhook processed", {
      requestId,
      route,
      outcome: "success",
      eventId: event.id,
      eventType: event.type,
    });

    return NextResponse.json({ received: true }, { headers: baseHeaders });
  } catch (err) {
    if (webhookRepo) {
      await webhookRepo.update({
        where: { provider_eventId: { provider: "STRIPE", eventId: event.id } },
        data: { status: "FAILED", errorMessage: err instanceof Error ? err.message : "Unknown webhook error" },
      });
    }
    logger.error("stripe webhook handler error", {
      requestId,
      route,
      outcome: "error",
      eventId: event.id,
      err,
    });
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500, headers: baseHeaders });
  }
}

function resolvePlan(subscription: Stripe.Subscription): "FREE" | "STARTER" | "PRO" {
  const priceId = subscription.items.data[0]?.price?.id ?? "";
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "PRO";
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return "STARTER";
  return "FREE";
}
