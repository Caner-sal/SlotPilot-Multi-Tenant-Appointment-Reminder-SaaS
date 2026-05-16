import { requireAuth, TenantError, assertMembership } from "@/lib/tenant";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { user, org } = await requireAuth();
    await assertMembership(user.id, org.id, [MemberRole.OWNER, MemberRole.ADMIN]);

    const transactions = await db.subscriptionPaymentTransaction.findMany({
      where: { organizationId: org.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        planId: true,
        amountCents: true,
        currency: true,
        status: true,
        provider: true,
        billingCycle: true,
        paidAt: true,
        failedAt: true,
        failureReason: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ data: transactions });
  } catch (err) {
    if (err instanceof TenantError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
