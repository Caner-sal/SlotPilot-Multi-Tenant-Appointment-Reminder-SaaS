"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import CountrySelect from "@/components/forms/CountrySelect";

interface OrgForm {
  name: string;
  slug: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  formattedAddress: string;
  countryCode: string;
  province: string;
  city: string;
  locality: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  timezone: string;
  bookingEnabled: boolean;
}

const TIMEZONES = [
  "Europe/Istanbul",
  "UTC",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Tokyo",
];

export default function SettingsPage() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const tBooking = useTranslations("booking");

  const [form, setForm] = useState<OrgForm>({
    name: "",
    slug: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    formattedAddress: "",
    countryCode: "TR",
    province: "",
    city: "",
    locality: "",
    postalCode: "",
    latitude: "",
    longitude: "",
    timezone: "Europe/Istanbul",
    bookingEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/organizations/current")
      .then((r) => r.json())
      .then((json) => {
        const org = json.data;
        if (org) {
          setForm({
            name: org.name ?? "",
            slug: org.slug ?? "",
            description: org.description ?? "",
            phone: org.phone ?? "",
            email: org.email ?? "",
            address: org.address ?? "",
            formattedAddress: org.formattedAddress ?? org.address ?? "",
            countryCode: org.countryCode ?? "TR",
            province: org.province ?? "",
            city: org.city ?? "",
            locality: org.locality ?? org.city ?? "",
            postalCode: org.postalCode ?? "",
            latitude: org.latitude?.toString() ?? "",
            longitude: org.longitude?.toString() ?? "",
            timezone: org.timezone ?? "Europe/Istanbul",
            bookingEnabled: org.bookingEnabled ?? true,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const payload = {
        ...form,
        locality: form.locality || form.city,
        formattedAddress: form.formattedAddress || form.address,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
      };

      const res = await fetch("/api/organizations/current", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(typeof j.error === "string" ? j.error : "Ayarlar kaydedilemedi.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  const bookingUrl = form.slug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/booking/${form.slug}`
    : "";

  if (loading) {
    return <div className="p-10 text-center text-muted-foreground/80">{t("loading")}</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      {bookingUrl && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">{t("bookingUrl")}</p>
          <div className="flex items-center gap-3">
            <code className="text-sm text-blue-800 break-all flex-1">{bookingUrl}</code>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(bookingUrl)}
              className="shrink-0 text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 rounded hover:bg-blue-100 transition-colors"
            >
              {t("copy")}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border shadow-sm">
        <div className="px-6 py-4 border-b border-border/70">
          <h2 className="font-semibold text-foreground">{t("businessInfo")}</h2>
        </div>
        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          {saved && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
              {t("saveSuccess")}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-foreground/90 mb-1">{t("businessName")}</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t("namePlaceholder")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/90 mb-1">
                {t("urlSlug")}
                <span className="ml-1 text-muted-foreground/80 font-normal">{t("slugNote")}</span>
              </label>
              <input
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder={t("slugPlaceholder")}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/90 mb-1">{tCommon("description")}</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t("descPlaceholder")}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-foreground/90 mb-1">{tCommon("phone")}</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+90 555 000 0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/90 mb-1">{tCommon("email")}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t("emailPlaceholder")}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-foreground/90 mb-1">{tBooking("country")}</label>
              <CountrySelect
                value={form.countryCode}
                onChange={(value) => setForm({ ...form, countryCode: value })}
                className="rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/90 mb-1">{tBooking("province")}</label>
              <input
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={form.countryCode === "TR" ? "Province" : "State / Province"}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-foreground/90 mb-1">{tBooking("city")}</label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/90 mb-1">Locality</label>
              <input
                value={form.locality}
                onChange={(e) => setForm({ ...form, locality: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Locality"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-foreground/90 mb-1">{tBooking("postalCode")}</label>
              <input
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="34000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/90 mb-1">Formatted Address</label>
              <input
                value={form.formattedAddress}
                onChange={(e) => setForm({ ...form, formattedAddress: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Formatted address"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/90 mb-1">{tCommon("address")}</label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t("addressPlaceholder")}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-foreground/90 mb-1">Latitude</label>
              <input
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="41.0082"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/90 mb-1">Longitude</label>
              <input
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="28.9784"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/90 mb-1">{t("timezone")}</label>
            <select
              value={form.timezone}
              onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between py-3 border border-border rounded-lg px-4">
            <div>
              <p className="text-sm font-medium text-foreground">{t("onlineBooking")}</p>
              <p className="text-xs text-muted-foreground/80 mt-0.5">{t("onlineBookingDesc")}</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, bookingEnabled: !form.bookingEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                form.bookingEnabled ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-card transition-transform ${
                  form.bookingEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border/70 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
          >
            {saving ? tCommon("saving") : t("saveSettings")}
          </button>
        </div>
      </form>
    </div>
  );
}
