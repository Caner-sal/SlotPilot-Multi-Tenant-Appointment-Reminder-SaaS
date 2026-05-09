import { requireAuth, TenantError } from "@/lib/tenant";
import { getAnalytics } from "@/services/analytics.service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { org } = await requireAuth();

    const analytics = await getAnalytics(org.id);

    return NextResponse.json({ data: analytics });
  } catch (err) {
    if (err instanceof TenantError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

