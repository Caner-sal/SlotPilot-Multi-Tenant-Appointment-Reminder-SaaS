import { requireAuth, TenantError, assertMembership } from "@/lib/tenant";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

// Called from success page to verify payment status
// Does NOT activate subscription by itself — activation is webhook-driven
export async function GET(req: Request) {
  try {
    const { user, org } = await requireAuth();
    await assertMembership(user.id, org.id, [MemberRole.OWNER, MemberRole.ADMIN]);

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
    }

    // Find transaction belonging to this organization
    const transaction = await db.subscriptionPaymentTransaction.findFirst({
      where: { conversationId, organizationId: org.id },
      select: { status: true, planId: true, paidAt: true, failedAt: true, failureReason: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Get current subscription status
    const subscription = await db.subscription.findUnique({
      where: { organizationId: org.id },
      select: { plan: true, status: true },
    });

    // Handle fake provider — auto-activate in dev/test
    if (
      transaction.status === "PENDING" &&
      process.env.NODE_ENV !== "production" &&
      searchParams.get("fake") === "1"
    ) {
      const planId = transaction.planId as "FREE" | "STARTER" | "PRO";
      await db.subscriptionPaymentTransaction.update({
        where: { conversationId },
        data: { status: "PAID", paidAt: new Date() },
      });
      await db.subscription.upsert({
        where: { organizationId: org.id },
        create: {
          organizationId: org.id,
          plan: planId,
          status: "ACTIVE",
        },
        update: {
          plan: planId,
          status: "ACTIVE",
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
      return NextResponse.json({
        data: {
          transactionStatus: "PAID",
          subscriptionStatus: "ACTIVE",
          plan: planId,
          paidAt: new Date().toISOString(),
          fake: true,
        },
      });
    }

    return NextResponse.json({
      data: {
        transactionStatus: transaction.status,
        subscriptionStatus: subscription?.status ?? null,
        plan: subscription?.plan ?? transaction.planId,
        paidAt: transaction.paidAt?.toISOString() ?? null,
        failedAt: transaction.failedAt?.toISOString() ?? null,
        failureReason: transaction.failureReason ?? null,
      },
    });
  } catch (err) {
    if (err instanceof TenantError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
