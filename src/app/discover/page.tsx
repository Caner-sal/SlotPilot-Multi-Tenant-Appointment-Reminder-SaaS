"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { BusinessCard, type BusinessCardData } from "@/components/discover/BusinessCard";
import ProvinceSelect from "@/components/forms/ProvinceSelect";
import DistrictSelect from "@/components/forms/DistrictSelect";

const CATEGORIES = [
  { slug: "", label: "Tüm Kategoriler" },
  { slug: "hair-salon", label: "Kuaför" },
  { slug: "barber", label: "Berber" },
  { slug: "nail-salon", label: "Tırnak Salonu" },
  { slug: "spa-wellness", label: "Spa & Masaj" },
  { slug: "medical-clinic", label: "Klinik" },
  { slug: "fitness-coach", label: "Fitness" },
  { slug: "consulting", label: "Danışmanlık" },
];

export default function DiscoverPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [countryCode, setCountryCode] = useState("TR");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [locality, setLocality] = useState("");

  const [results, setResults] = useState<BusinessCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const isTR = countryCode === "TR";

  const handleSearch = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (category) params.set("category", category);
      if (countryCode) params.set("countryCode", countryCode);
      if (isTR && province) params.set("province", province);
      if (isTR && district) params.set("district", district);
      if (!isTR && locality) params.set("locality", locality);

      try {
        const res = await fetch(`/api/discover/search?${params.toString()}`);
        if (!res.ok) throw new Error("Arama başarısız");
        const json = (await res.json()) as { data: BusinessCardData[] };
        setResults(json.data);
        setSearched(true);
      } catch {
        setError("Arama sırasında bir hata oluştu. Lütfen tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    },
    [q, category, countryCode, province, district, locality, isTR]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <Link href="/" className="text-primary text-sm hover:underline">
              ← Ana Sayfa
            </Link>
            <h1 className="text-2xl font-bold text-foreground mt-1">İşletme Keşfet</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Hizmet ve konuma göre işletme bul, randevu al
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="bg-card border border-border rounded-2xl p-5 mb-8 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Keyword */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Hizmet veya işletme ara
              </label>
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="örn. saç, masaj, diş..."
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Country */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Ülke
              </label>
              <select
                value={countryCode}
                onChange={(e) => {
                  setCountryCode(e.target.value);
                  setProvince("");
                  setDistrict("");
                  setLocality("");
                }}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="TR">Türkiye</option>
                <option value="DE">Almanya</option>
                <option value="NL">Hollanda</option>
                <option value="GB">Birleşik Krallık</option>
                <option value="FR">Fransa</option>
              </select>
            </div>

            {/* TR: Province + District | Non-TR: locality */}
            {isTR ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    İl
                  </label>
                  <ProvinceSelect
                    value={province}
                    onChange={(v) => { setProvince(v); setDistrict(""); }}
                    placeholder="İl seçin"
                    className="rounded-xl border-border"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    İlçe
                  </label>
                  <DistrictSelect
                    provinceSlug={province}
                    value={district}
                    onChange={setDistrict}
                    disabled={!province}
                    placeholder="İlçe seçin"
                    className="rounded-xl border-border"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Şehir / Bölge
                </label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="örn. Berlin, Amsterdam..."
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm"
            >
              {loading ? "Aranıyor…" : "İşletmeleri Ara"}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl px-4 py-3 mb-6 flex items-center justify-between gap-4">
            <span>{error}</span>
            <button
              onClick={() => void handleSearch()}
              className="shrink-0 text-xs font-medium underline underline-offset-2 hover:no-underline"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Results */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-5 h-48 animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              Aramanızla eşleşen işletme bulunamadı.
            </p>
            <p className="text-muted-foreground/60 text-sm mt-2">
              Farklı anahtar kelimeler veya filtreler deneyin.
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {results.length} işletme bulundu
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((biz) => (
                <BusinessCard key={biz.slug} business={biz} />
              ))}
            </div>
          </>
        )}

        {!searched && !loading && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">Aramak istediğiniz hizmeti girin ve işletmeleri keşfedin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
