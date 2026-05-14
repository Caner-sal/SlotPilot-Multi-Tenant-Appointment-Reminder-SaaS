import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { isOrganizationPubliclyAvailable } from "@/lib/organization-lifecycle";
import { getRequestId } from "@/lib/request-id";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

const schema = z.object({
  appointmentId: z.string().min(1),
});

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "sk_test_placeholder") return null;
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const requestId = getRequestId(req.headers);

  try {
    const { slug } = await params;
    const body = await req.json();
    const { appointmentId } = schema.parse(body);

    const org = await db.organization.findUnique({
      where: { slug },
      select: { id: true, bookingEnabled: true, suspended: true, name: true },
    });

    if (!org || !isOrganizationPubliclyAvailable(org)) {
      return NextResponse.json({ error: "Business not available" }, { status: 403, headers: { "x-request-id": requestId } });
    }

    const appointment = await db.appointment.findFirst({
      where: { id: appointmentId, organizationId: org.id },
      include: { service: true, customer: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Randevu bulunamadi" }, { status: 404, headers: { "x-request-id": requestId } });
    }

    if (!appointment.service.depositRequired) {
      return NextResponse.json({ error: "Bu hizmet icin kapora gerekmiyor" }, { status: 400, headers: { "x-request-id": requestId } });
    }

    if (appointment.paymentStatus === "PAID") {
      return NextResponse.json({ error: "Deposit already paid" }, { status: 400, headers: { "x-request-id": requestId } });
    }

    const stripe = getStripe();
    const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    if (!stripe) {
      const mockSessionId = `mock_${appointmentId}`;
      await db.appointment.update({
        where: { id: appointmentId },
        data: { paymentStatus: "PENDING_PAYMENT", stripeCheckoutSessionId: mockSessionId },
      });

      await db.payment.create({
        data: {
          organizationId: org.id,
          appointmentId,
          provider: "STRIPE",
          purpose: "APPOINTMENT_DEPOSIT",
          externalReference: mockSessionId,
          providerEventId: `mock_event_${appointmentId}_${Date.now()}`,
          stripeEventId: `mock_event_${appointmentId}_${Date.now()}`,
          sessionId: mockSessionId,
          amountCents: appointment.service.depositAmountCents,
          currency: appointment.service.currency.toUpperCase(),
          status: "REQUIRES_ACTION",
          metadata: { mock: true },
          attempts: {
            create: {
              provider: "STRIPE",
              status: "REQUIRES_ACTION",
              providerReference: mockSessionId,
              requestId,
              rawSafe: { mock: true },
            },
          },
        },
      });

      return NextResponse.json(
        {
          data: {
            sessionId: mockSessionId,
            url: `${appUrl}/booking/${slug}/payment-success?appointmentId=${appointmentId}&mock=1`,
            mock: true,
          },
        },
        { headers: { "x-request-id": requestId } }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: appointment.customer.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: appointment.service.currency.toLowerCase(),
            product_data: {
              name: `Deposit - ${appointment.service.name}`,
              description: `${org.name} appointment deposit`,
            },
            unit_amount: appointment.service.depositAmountCents,
          },
          quantity: 1,
        },
      ],
      metadata: { appointmentId, organizationId: org.id },
      success_url: `${appUrl}/booking/${slug}/payment-success?appointmentId=${appointmentId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/booking/${slug}?cancelled=1`,
    });

    await db.appointment.update({
      where: { id: appointmentId },
      data: { paymentStatus: "PENDING_PAYMENT", stripeCheckoutSessionId: session.id },
    });

    await db.payment.create({
      data: {
        organizationId: org.id,
        appointmentId,
        provider: "STRIPE",
        purpose: "APPOINTMENT_DEPOSIT",
        externalReference: session.id,
        stripeEventId: `pending_${session.id}`,
        sessionId: session.id,
        amountCents: appointment.service.depositAmountCents,
        currency: appointment.service.currency.toUpperCase(),
        status: "REQUIRES_ACTION",
        metadata: { checkout: true },
        attempts: {
          create: {
            provider: "STRIPE",
            status: "REQUIRES_ACTION",
            providerReference: session.id,
            requestId,
            rawSafe: { checkoutUrl: session.url ?? null },
          },
        },
      },
    });

    return NextResponse.json({ data: { sessionId: session.id, url: session.url } }, { headers: { "x-request-id": requestId } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400, headers: { "x-request-id": requestId } });
    }
    logger.error("checkout session failed", { requestId, err });
    return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500, headers: { "x-request-id": requestId } });
  }
}

