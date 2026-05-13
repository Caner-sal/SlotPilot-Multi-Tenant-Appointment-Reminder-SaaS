import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// Public marketplace listing — no auth required
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const city = searchParams.get("city");
  const locality = searchParams.get("locality");
  const province = searchParams.get("province");
  const countryCode = searchParams.get("countryCode");
  const q = searchParams.get("q");

  let organizationIdFilter: string[] | undefined;
  if (countryCode || locality) {
    const matches = await db.normalizedAddress.findMany({
      where: {
        ownerType: "ORGANIZATION",
        ...(countryCode ? { countryCode: countryCode.toUpperCase() } : {}),
        ...(locality
          ? {
              OR: [
                { locality: { contains: locality } },
                { adminLevel2: { contains: locality } },
                { formattedAddress: { contains: locality } },
              ],
            }
          : {}),
      },
      select: { ownerId: true },
      take: 200,
    });

    organizationIdFilter = [...new Set(matches.map((item) => item.ownerId as string))];
    if (organizationIdFilter.length === 0) {
      return NextResponse.json({ data: [] });
    }
  }

  const orgs = await db.organization.findMany({
    where: {
      marketplaceEnabled: true,
      bookingEnabled: true,
      suspended: false,
      ...(organizationIdFilter ? { id: { in: organizationIdFilter } } : {}),
      ...(category ? { category: { contains: category } } : {}),
      ...(province ? { province } : city ? { city: { contains: city } } : {}),
      ...(q ? { name: { contains: q } } : {}),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      category: true,
      city: true,
      province: true,
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
