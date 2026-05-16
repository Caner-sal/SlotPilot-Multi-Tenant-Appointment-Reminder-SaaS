import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser, TenantError } from "@/lib/tenant";
import {
  ACTIVE_ORG_COOKIE,
  resolveActiveOrganization,
} from "@/lib/tenant/active-organization";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const cookieStore = await cookies();
    const org = await resolveActiveOrganization(user.id, cookieStore);
    if (!org) {
      return NextResponse.json({ error: "İşletme bulunamadı" }, { status: 404 });
    }
    return NextResponse.json({ data: org });
  } catch (err) {
    if (err instanceof TenantError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

const setActiveOrgSchema = z.object({ organizationId: z.string().min(1) });

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { organizationId } = setActiveOrgSchema.parse(body);

    // Validate membership before trusting the org ID
    const membership = await db.organizationMember.findUnique({
      where: { userId_organizationId: { userId: user.id, organizationId } },
      include: { organization: true },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Erişim reddedildi: bu işletmenin üyesi değilsiniz" },
        { status: 403 },
      );
    }

    const response = NextResponse.json({ data: membership.organization });
    response.cookies.set(ACTIVE_ORG_COOKIE, organizationId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return response;
  } catch (err) {
    if (err instanceof TenantError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
