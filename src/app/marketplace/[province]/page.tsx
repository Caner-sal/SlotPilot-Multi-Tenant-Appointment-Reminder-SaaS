/* eslint-disable @next/next/no-img-element */
import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProvinceBySlug } from "@/data/turkey-provinces";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ province: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { province: provinceSlug } = await params;
  const province = getProvinceBySlug(provinceSlug);
  if (!province) return { title: "SlotPilot Marketplace" };
  return {
    title: `${province.name} İşletmeleri — SlotPilot Marketplace`,
    description: `${province.name}'daki işletmeleri keşfedin, online randevu alın. Kuaför, güzellik, spor ve daha fazlası.`,
  };
}

export default async function ProvinceMarketplacePage({ params }: Props) {
  const { province: provinceSlug } = await params;
  const province = getProvinceBySlug(provinceSlug);
  if (!province) notFound();

  const orgs = await db.organization.findMany({
    where: {
      marketplaceEnabled: true,
      bookingEnabled: true,
      suspended: false,
      province: provinceSlug,
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
