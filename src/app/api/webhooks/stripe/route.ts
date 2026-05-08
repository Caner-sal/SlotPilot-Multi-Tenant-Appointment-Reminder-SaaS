import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export const config = { api: { bodyParser: false } };

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
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

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

function resolvePlan(subscription: Stripe.Subscription): "FREE" | "STARTER" | "PRO" {
  const priceId = subscription.items.data[0]?.price?.id ?? "";
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "PRO";
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return "STARTER";
  return "FREE";
}
