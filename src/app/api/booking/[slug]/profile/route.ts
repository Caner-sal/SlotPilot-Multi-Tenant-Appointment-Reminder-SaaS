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
      select: {
        name: true,
        slug: true,
        description: true,
        phone: true,
        email: true,
        address: true,
        timezone: true,
        bookingEnabled: true,
      },
    });

    if (!org) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    if (!org.bookingEnabled) {
      return NextResponse.json({ error: "Online booking is not available for this business" }, { status: 403 });
    }

    const { bookingEnabled: _enabled, ...profile } = org;

    return NextResponse.json({ data: profile });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
