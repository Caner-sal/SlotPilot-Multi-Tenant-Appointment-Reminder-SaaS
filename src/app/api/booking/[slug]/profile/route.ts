import { db } from "@/lib/db";
import { isOrganizationPubliclyAvailable, isOrganizationSuspended } from "@/lib/organization-lifecycle";
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
        status: true,
        suspended: true,
        aiChatbotEnabled: true,
      },
    });

    if (!org) {
      return NextResponse.json({ error: "İşletme bulunamadı" }, { status: 404 });
    }

    if (!isOrganizationPubliclyAvailable(org)) {
      const error = isOrganizationSuspended(org)
        ? "This business is currently unavailable"
        : "Online booking is not available for this business";
      return NextResponse.json({ error }, { status: 403 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { bookingEnabled, status, suspended, ...profile } = org;

    return NextResponse.json({ data: profile });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
