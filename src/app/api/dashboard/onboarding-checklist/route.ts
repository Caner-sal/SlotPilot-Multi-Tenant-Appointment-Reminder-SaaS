import { db } from "@/lib/db";
import { getOnboardingChecklistSnapshot } from "@/services/onboarding-checklist.service";
import { requireAuth, TenantError } from "@/lib/tenant";
import { NextResponse } from "next/server";

const OWNER_ROLES = new Set(["OWNER", "ADMIN"]);

export async function GET() {
  try {
    const { user, org } = await requireAuth();
    const membership = await db.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: org.id,
        },
      },
      select: { role: true },
    });

    if (!membership || !OWNER_ROLES.has(membership.role)) {
      return NextResponse.json(
        { error: "Bu kaynak yalnizca isletme yoneticileri icindir." },
        { status: 403 }
      );
    }

    const snapshot = await getOnboardingChecklistSnapshot(org.id);
    return NextResponse.json({ data: snapshot });
  } catch (err) {
    if (err instanceof TenantError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 });
  }
}
