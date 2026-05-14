import { db } from "@/lib/db";
import { requireSuperAdmin, SuperAdminError } from "@/lib/superadmin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireSuperAdmin();

    const organizations = await db.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        bookingEnabled: true,
        status: true,
        suspended: true,
        suspendedAt: true,
        suspendedReason: true,
        createdAt: true,
        subscription: {
          select: { plan: true, status: true },
        },
        _count: {
          select: {
            appointments: true,
            staff: true,
            members: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: organizations });
  } catch (err) {
    if (err instanceof SuperAdminError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

