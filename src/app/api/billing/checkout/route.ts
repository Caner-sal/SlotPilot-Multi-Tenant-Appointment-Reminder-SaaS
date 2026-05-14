import { requireAuth, TenantError, assertMembership } from "@/lib/tenant";
import { stripe } from "@/lib/stripe";
import { trackProductEvent } from "@/services/product-event.service";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const checkoutSchema = z.object({
  plan: z.enum(["STARTER", "PRO"]),
});

const PLAN_PRICE_IDS: Record<string, string> = {
  STARTER: process.env.STRIPE_STARTER_PRICE_ID ?? "",
  PRO: process.env.STRIPE_PRO_PRICE_ID ?? "",
};

export async function POST(req: Request) {
  try {
    const { user, org } = await requireAuth();
    await assertMembership(user.id, org.id, [MemberRole.OWNER, MemberRole.ADMIN]);

    const body = await req.json();
    const { plan } = checkoutSchema.parse(body);

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey || stripeKey === "placeholder" || !stripe) {
      return NextResponse.json({
        data: {
          mode: "test",
          message: "Stripe is not configured. Set STRIPE_SECRET_KEY to enable billing.",
        },
      });
    }

    const priceId = PLAN_PRICE_IDS[plan];
    if (!priceId) {
      return NextResponse.json({ error: `No price ID configured for plan: ${plan}` }, { status: 500 });
    }

    await trackProductEvent({
      eventName: "plan_upgrade_clicked",
      userId: user.id,
      organizationId: org.id,
      payloadSafe: { plan, channel: "billing_checkout" },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?cancelled=true`,
      customer_email: user.email ?? undefined,
      metadata: {
        organizationId: org.id,
        plan,
      },
    });

    return NextResponse.json({ data: { url: session.url } });
  } catch (err) {
    if (err instanceof TenantError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
