import { requireAuth, TenantError, assertMembership } from "@/lib/tenant";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { trackProductEvent } from "@/services/product-event.service";
import { getPaymentProvider } from "@/services/payment/payment.factory";
import { TURKEY_PLANS } from "@/config/pricing.tr";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const checkoutSchema = z.object({
  plan: z.enum(["STARTER", "PRO"]),
});

export async function POST(req: Request) {
  try {
    const { user, org } = await requireAuth();
    await assertMembership(user.id, org.id, [MemberRole.OWNER, MemberRole.ADMIN]);

    const body = await req.json() as unknown;
    const { plan } = checkoutSchema.parse(body);

    // Resolve plan config — amount/currency always from server config
    const planConfig = TURKEY_PLANS[plan];
    if (!planConfig || planConfig.priceCentsMonthly === null || planConfig.priceCentsMonthly === 0) {
      return NextResponse.json({ error: `Plan ${plan} is not purchasable` }, { status: 400 });
    }
    const amountCents = planConfig.priceCentsMonthly;
    const currency = "TRY";

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const successUrl = `${appUrl}/dashboard/billing/success`;
    const cancelUrl = `${appUrl}/dashboard/billing?cancelled=true`;

    // Determine active provider
    const paymentProvider = process.env.PAYMENT_PROVIDER?.toUpperCase() ?? "MANUAL_BANK_TRANSFER";

    // Create a SubscriptionPaymentTransaction record (INITIATED)
    const transaction = await db.subscriptionPaymentTransaction.create({
      data: {
        organizationId: org.id,
        provider: paymentProvider === "STRIPE" ? "STRIPE" : paymentProvider === "IYZICO" ? "IYZICO" : "FAKE",
        planId: plan,
        billingCycle: "MONTHLY",
        amountCents,
        currency,
        status: "INITIATED",
        conversationId: `txn_${org.id}_${plan}_${Date.now()}`,
      },
    });

    await trackProductEvent({
      eventName: "plan_upgrade_clicked",
      userId: user.id,
      organizationId: org.id,
      payloadSafe: { plan, channel: "billing_checkout", transactionId: transaction.id },
    });

    // ── STRIPE path ────────────────────────────────────────────────────────────
    if (paymentProvider === "STRIPE") {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey || stripeKey === "placeholder" || !stripe) {
        // Production fail-fast
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json({ error: "Payment provider not configured" }, { status: 500 });
        }
        // Dev/test fallback — route through fake
        await db.subscriptionPaymentTransaction.update({
          where: { id: transaction.id },
          data: { provider: "FAKE" },
        });
        return NextResponse.json({
          data: { mode: "test", message: "Stripe is not configured. Using fake provider." },
        });
      }

      const priceIdEnvVar = planConfig.stripePriceIdEnvVar;
      const priceId = priceIdEnvVar ? (process.env[priceIdEnvVar] ?? "") : "";
      if (!priceId) {
        return NextResponse.json({ error: `No Stripe price ID configured for plan: ${plan}` }, { status: 500 });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${successUrl}?conversationId=${transaction.conversationId}`,
        cancel_url: cancelUrl,
        customer_email: user.email ?? undefined,
        metadata: { organizationId: org.id, plan, conversationId: transaction.conversationId },
      });

      await db.subscriptionPaymentTransaction.update({
        where: { id: transaction.id },
        data: { status: "PENDING", providerSessionId: session.id },
      });

      return NextResponse.json({ data: { url: session.url } });
    }

    // ── Provider abstraction path (IYZICO / FAKE / etc.) ──────────────────────
    const provider = getPaymentProvider();
    if (!provider.createSubscriptionCheckout) {
      // Provider doesn't support subscription checkout yet — dev mode fallback
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Payment provider not configured for subscription checkout" }, { status: 500 });
      }
      return NextResponse.json({
        data: { mode: "test", message: `Provider ${provider.name} does not support subscription checkout yet.` },
      });
    }

    const result = await provider.createSubscriptionCheckout({
      organizationId: org.id,
      userId: user.id,
      planId: plan,
      billingCycle: "MONTHLY",
      locale: "tr",
      currency,
      amountCents,
      conversationId: transaction.conversationId,
      successUrl,
      cancelUrl,
      customerEmail: user.email ?? undefined,
    });

    await db.subscriptionPaymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: "PENDING",
        providerSessionId: result.providerSessionId,
        provider: result.provider,
      },
    });

    if (result.checkoutUrl) {
      return NextResponse.json({ data: { checkoutUrl: result.checkoutUrl, mode: result.mode } });
    }
    if (result.checkoutHtml) {
      return NextResponse.json({ data: { checkoutHtml: result.checkoutHtml, mode: result.mode } });
    }

    return NextResponse.json({ data: { mode: "test", message: "Checkout initiated." } });
  } catch (err) {
    if (err instanceof TenantError) {
      const msg = err.message;
      if (msg === "Oturum doğrulanamadı") {
        return NextResponse.json({ error: msg, code: "AUTH_REQUIRED" }, { status: 401 });
      }
      if (msg.startsWith("Bu kullanıcı için işletme bulunamadı")) {
        return NextResponse.json({ error: msg, code: "ACTIVE_ORGANIZATION_REQUIRED" }, { status: 404 });
      }
      return NextResponse.json({ error: msg, code: "FORBIDDEN" }, { status: 403 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error("[billing/checkout]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
