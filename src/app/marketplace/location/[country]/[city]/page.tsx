/* eslint-disable @next/next/no-img-element */
import { db } from "@/lib/db";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ country: string; city: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country, city } = await params;
  return {
    title: `${city.toUpperCase()} (${country.toUpperCase()}) Businesses - Randevo Marketplace`,
    description: `Explore businesses in ${city} (${country}) and book online appointments.`,
  };
}

export default async function MarketplaceCountryCityPage({ params }: Props) {
  const { country, city } = await params;
  const countryCode = country.toUpperCase();
  const locality = decodeURIComponent(city);

  const matches = await db.normalizedAddress.findMany({
    where: {
      ownerType: "ORGANIZATION",
      countryCode,
      OR: [
        { locality: { contains: locality } },
        { adminLevel2: { contains: locality } },
        { formattedAddress: { contains: locality } },
      ],
    },
    select: { ownerId: true },
    take: 200,
  });

  const organizationIds = [...new Set(matches.map((item) => item.ownerId as string))];

  const orgs = await db.organization.findMany({
    where: {
      marketplaceEnabled: true,
      bookingEnabled: true,
      status: "ACTIVE",
      suspended: false,
      countryCode,
      OR: [
        ...(organizationIds.length > 0 ? [{ id: { in: organizationIds } }] : []),
        { city: { contains: locality } },
        { locality: { contains: locality } },
        { formattedAddress: { contains: locality } },
      ],
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
      _count: { select: { services: { where: { isActive: true } } } },
    },
    orderBy: { name: "asc" },
    take: 50,
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/marketplace" className="text-primary text-sm hover:underline">
            ← Marketplace
          </Link>
          <h1 className="text-3xl font-bold text-foreground mt-2">
            {locality} ({countryCode})
          </h1>
          <p className="text-muted-foreground mt-1">Marketplace sonuçları</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {orgs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">Henüz listelenmiş işletme yok.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orgs.map((biz) => (
              <Link key={biz.id} href={`/marketplace/${biz.slug}`}>
                <div className="bg-card rounded-xl border border-border hover:shadow-md transition-shadow p-5 h-full">
                  {biz.coverImageUrl && (
                    <img src={biz.coverImageUrl} alt={biz.name} className="w-full h-32 object-cover rounded-lg mb-4" />
                  )}
                  <div className="flex items-center gap-3 mb-2">
                    {biz.logoUrl && (
                      <img src={biz.logoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                    )}
                    <h2 className="font-semibold text-foreground">{biz.name}</h2>
                  </div>
                  {biz.description && (
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{biz.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {biz.category && (
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-full">{biz.category}</span>
                    )}
                    {biz.city && (
                      <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full">{biz.city}</span>
                    )}
                    <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-full">
                      {biz._count.services} hizmet
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

