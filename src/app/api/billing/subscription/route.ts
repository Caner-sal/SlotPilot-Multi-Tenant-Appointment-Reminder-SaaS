import { db } from "@/lib/db";
import { requireAuth, TenantError } from "@/lib/tenant";
import { getPlanLimits } from "@/lib/billing";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { org } = await requireAuth();

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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
