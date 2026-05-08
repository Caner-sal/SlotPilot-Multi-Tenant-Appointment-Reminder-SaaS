import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const org = await db.organization.findUnique({
      where: { slug },
      select: { id: true, bookingEnabled: true, suspended: true },
    });

    if (!org || org.suspended || !org.bookingEnabled) {
      return NextResponse.json({ error: "Business not available" }, { status: 403 });
    }

    const locations = await db.location.findMany({
      where: { organizationId: org.id, isActive: true },
      select: { id: true, name: true, address: true, phone: true, timezone: true, isDefault: true },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });

    return NextResponse.json({ data: locations });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
