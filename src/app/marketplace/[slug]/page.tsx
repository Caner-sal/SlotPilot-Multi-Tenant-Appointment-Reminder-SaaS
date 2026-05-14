/* eslint-disable @next/next/no-img-element */
import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProvinceBySlug } from "@/data/turkey-provinces";
import type { Metadata } from "next";

interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const province = getProvinceBySlug(slug);
  if (province) {
    return {
      title: `${province.name} İşletmeleri — Randevo Marketplace`,
      description: `${province.name}'daki işletmeleri keşfedin, online randevu alın. Kuaför, güzellik, spor ve daha fazlası.`,
    };
  }
  return { title: "Randevo Marketplace" };
}

export default async function MarketplaceSlugPage({ params }: Props) {
  const { slug } = await params;

  // Check if slug matches a Turkish province
  const province = getProvinceBySlug(slug);
  if (province) {
    const orgs = await db.organization.findMany({
      where: {
        marketplaceEnabled: true,
        bookingEnabled: true,
        suspended: false,
        province: slug,
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
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <Link href="/marketplace" className="text-blue-600 text-sm hover:underline">
              ← Tüm İllere Dön
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">
              {province.name} İşletmeleri
            </h1>
            <p className="text-gray-500 mt-1">
              {province.name}&apos;da yerel işletmeleri keşfedin ve randevu alın
            </p>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          {orgs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">{province.name}&apos;da henüz listelenmiş işletme yok.</p>
              <Link href="/marketplace" className="text-blue-600 hover:underline mt-4 inline-block text-sm">
                Tüm işletmelere göz at
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orgs.map((biz) => (
                <Link key={biz.id} href={`/marketplace/${biz.slug}`}>
                  <div className="bg-white rounded-xl border hover:shadow-md transition-shadow p-5 h-full">
                    {biz.coverImageUrl && (
                      <img src={biz.coverImageUrl} alt={biz.name} className="w-full h-32 object-cover rounded-lg mb-4" />
                    )}
                    <div className="flex items-center gap-3 mb-2">
                      {biz.logoUrl && (
                        <img src={biz.logoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                      )}
                      <h2 className="font-semibold text-gray-900">{biz.name}</h2>
                    </div>
                    {biz.description && (
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">{biz.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {biz.category && (
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{biz.category}</span>
                      )}
                      {biz.city && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{biz.city}</span>
                      )}
                      <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full">
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

  // Otherwise treat slug as a business slug
  const org = await db.organization.findFirst({
    where: { slug, marketplaceEnabled: true, bookingEnabled: true, suspended: false },
    select: {
      name: true,
      slug: true,
      description: true,
      category: true,
      city: true,
      coverImageUrl: true,
      logoUrl: true,
      phone: true,
      email: true,
      address: true,
      services: {
        where: { isActive: true },
        select: { id: true, name: true, durationMinutes: true, priceCents: true },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!org) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/marketplace" className="text-blue-600 text-sm hover:underline">
            ← Marketplace&apos;e Dön
          </Link>
        </div>
        {org.coverImageUrl && (
          <img src={org.coverImageUrl} alt={org.name} className="w-full h-48 object-cover" />
        )}
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          {org.logoUrl && (
            <img src={org.logoUrl} alt="" className="w-16 h-16 rounded-full object-cover border" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{org.name}</h1>
            <div className="flex gap-2 mt-1 text-sm">
              {org.category && <span className="text-blue-600">{org.category}</span>}
              {org.city && <span className="text-gray-500">{org.city}</span>}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {org.description && (
          <section>
            <h2 className="text-lg font-semibold mb-2">Hakkında</h2>
            <p className="text-gray-600">{org.description}</p>
          </section>
        )}

        {(org.phone || org.email || org.address) && (
          <section>
            <h2 className="text-lg font-semibold mb-2">İletişim</h2>
            <div className="space-y-1 text-sm text-gray-600">
              {org.phone && <p>📞 {org.phone}</p>}
              {org.email && <p>✉️ {org.email}</p>}
              {org.address && <p>📍 {org.address}</p>}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold mb-4">Hizmetler</h2>
          {org.services.length === 0 ? (
            <p className="text-gray-400">Henüz hizmet listelenmemiş.</p>
          ) : (
            <div className="grid gap-3">
              {(org.services as Service[]).map((svc) => (
                <div key={svc.id} className="bg-white border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{svc.name}</p>
                    <p className="text-sm text-gray-500">{svc.durationMinutes} dk</p>
                  </div>
                  {svc.priceCents > 0 && (
                    <span className="font-semibold text-gray-900">
                      {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(svc.priceCents / 100)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="text-center pt-4">
          <Link
            href={`/booking/${org.slug}`}
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Randevu Al
          </Link>
        </div>
      </main>
    </div>
  );
}
