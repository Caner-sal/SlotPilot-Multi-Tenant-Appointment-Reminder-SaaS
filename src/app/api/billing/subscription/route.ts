import { getPlanLimits } from "@/lib/billing";
import { db } from "@/lib/db";
import { assertMembership, requireAuth, TenantError } from "@/lib/tenant";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { user, org } = await requireAuth();
    await assertMembership(user.id, org.id, [MemberRole.OWNER, MemberRole.ADMIN]);

    const subscription = await db.subscription.findUnique({
      where: { organizationId: org.id },
    });

    const plan = subscription?.plan ?? "FREE";
    const limits = getPlanLimits(plan as Parameters<typeof getPlanLimits>[0]);

    return NextResponse.json({
      data: {
        subscription,
        plan,
        limits,
      },
    });
  } catch (err) {
    if (err instanceof TenantError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
