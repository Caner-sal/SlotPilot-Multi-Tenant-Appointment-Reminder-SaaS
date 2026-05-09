import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import Stripe from "stripe";

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
  try {
    const { slug } = await params;
    const body = await req.json();
    const { appointmentId } = schema.parse(body);

    const org = await db.organization.findUnique({
      where: { slug },
      select: { id: true, bookingEnabled: true, suspended: true, name: true },
    });

    if (!org || org.suspended || !org.bookingEnabled) {
      return NextResponse.json({ error: "Business not available" }, { status: 403 });
    }

    const appointment = await db.appointment.findFirst({
      where: { id: appointmentId, organizationId: org.id },
      include: { service: true, customer: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Randevu bulunamadı" }, { status: 404 });
    }

    if (!appointment.service.depositRequired) {
      return NextResponse.json({ error: "Bu hizmet için kapora gerekmiyor" }, { status: 400 });
    }

    if (appointment.paymentStatus === "PAID") {
      return NextResponse.json({ error: "Kapora zaten ödendi" }, { status: 400 });
    }

    const stripe = getStripe();
    const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    if (!stripe) {
      // Stripe not configured: return mock session for local dev
      await db.appointment.update({
        where: { id: appointmentId },
        data: { paymentStatus: "PENDING_PAYMENT", stripeCheckoutSessionId: `mock_${appointmentId}` },
      });
      return NextResponse.json({
        data: {
          sessionId: `mock_${appointmentId}`,
          url: `${appUrl}/booking/${slug}/payment-success?appointmentId=${appointmentId}&mock=1`,
          mock: true,
        },
      });
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

    return NextResponse.json({ data: { sessionId: session.id, url: session.url } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

