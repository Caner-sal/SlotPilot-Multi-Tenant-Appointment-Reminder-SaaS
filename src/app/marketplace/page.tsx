/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { getMarketplaceCategoryOptions } from "@/data/marketplace-categories";
import { COUNTRY_OPTIONS } from "@/data/country-options";
import AddressAutocomplete from "@/components/address/AddressAutocomplete";
import { getLocationOptionsForCountry } from "@/lib/address/location-options";
import { buildMarketplaceQueryParams, isTurkeyCountry } from "@/lib/marketplace/filters";

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
  const locale = useLocale();
  const t = useTranslations("marketplace");
  const tCommon = useTranslations("common");

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [province, setProvince] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [locality, setLocality] = useState("");
  const [loading, setLoading] = useState(true);
  const trSelected = isTurkeyCountry(countryCode);
  const locationOptions = getLocationOptionsForCountry(countryCode);
  const categoryOptions = getMarketplaceCategoryOptions(locale);

  useEffect(() => {
    setProvince("");
    setLocality("");
  }, [countryCode]);

  useEffect(() => {
    setLoading(true);
    const params = buildMarketplaceQueryParams({
      q,
      category,
      province,
      countryCode,
      locality,
    });

    fetch(`/api/marketplace?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => setBusinesses(res.data ?? []))
      .catch(() => setBusinesses([]))
      .finally(() => setLoading(false));
  }, [q, category, province, countryCode, locality]);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-3 mb-8">
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm flex-1 min-w-48 bg-card text-foreground"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm w-48 bg-card text-foreground"
          >
            <option value="">{t("allCategories")}</option>
            {categoryOptions.map((cat) => (
              <option key={cat.slug} value={cat.slug}>{cat.icon} {cat.label}</option>
            ))}
          </select>
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm w-48 bg-card text-foreground"
          >
            <option value="">{t("allCountries")}</option>
            {COUNTRY_OPTIONS.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          {trSelected ? (
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm w-48 bg-card text-foreground"
            >
              <option value="">{t("allCities")}</option>
              {locationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="w-64">
              <AddressAutocomplete
                locale={locale}
                countryCode={countryCode || undefined}
                placeholder={t("citySearchPlaceholder")}
                value={locality}
                onChange={(nextValue) => setLocality(nextValue)}
                onSelect={(normalized) => {
                  const nextLocality = normalized.locality ?? normalized.adminLevel2 ?? normalized.formattedAddress;
                  setLocality(nextLocality);
                }}
              />
            </div>
          )}
        </div>

        {loading ? (
          <p className="text-muted-foreground">{tCommon("loading")}</p>
        ) : businesses.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">{t("notFound")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((biz) => (
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
                      {biz._count.services} {t("service")}
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
