/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TURKEY_CATEGORIES } from "@/data/turkey-categories";
import { TURKEY_PROVINCES } from "@/data/turkey-provinces";

interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  city: string | null;
  province: string | null;
  coverImageUrl: string | null;
  logoUrl: string | null;
  _count: { services: number };
}

export default function MarketplacePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [province, setProvince] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (province) params.set("province", province);

    fetch(`/api/marketplace?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => setBusinesses(res.data ?? []))
      .catch(() => setBusinesses([]))
      .finally(() => setLoading(false));
  }, [q, category, province]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Randevo Marketplace</h1>
          <p className="text-gray-500 mt-1">Yerel işletmeleri keşfedin ve randevu alın</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-3 mb-8">
          <input
            type="text"
            placeholder="İşletme ara..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-48"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm w-48"
          >
            <option value="">Tüm Kategoriler</option>
            {TURKEY_CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.nameTR}>{cat.icon} {cat.nameTR}</option>
            ))}
          </select>
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm w-40"
          >
            <option value="">Tüm İller</option>
            {TURKEY_PROVINCES.map((p) => (
              <option key={p.slug} value={p.slug}>{p.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-gray-500">Yükleniyor...</p>
        ) : businesses.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">İşletme bulunamadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((biz) => (
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
