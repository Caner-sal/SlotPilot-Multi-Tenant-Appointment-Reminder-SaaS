import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// Public marketplace listing — no auth required
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const city = searchParams.get("city");
  const q = searchParams.get("q");

  const orgs = await db.organization.findMany({
    where: {
      marketplaceEnabled: true,
      bookingEnabled: true,
      suspended: false,
      ...(category ? { category } : {}),
      ...(city ? { city } : {}),
      ...(q ? { name: { contains: q } } : {}),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      category: true,
      city: true,
      coverImageUrl: true,
      logoUrl: true,
      phone: true,
      _count: { select: { services: { where: { isActive: true } } } },
    },
    orderBy: { name: "asc" },
    take: 50,
  });

  return NextResponse.json({ data: orgs });
}
