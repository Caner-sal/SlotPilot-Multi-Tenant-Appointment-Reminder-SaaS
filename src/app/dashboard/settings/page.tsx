"use client";

import { useState, useEffect } from "react";

interface OrgForm {
  name: string;
  slug: string;
  description: string;
  phone: string;
  email: string;
  address: string;
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
  const [form, setForm] = useState<OrgForm>({
    name: "",
    slug: "",
    description: "",
    phone: "",
    email: "",
    address: "",
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
      const res = await fetch("/api/organizations/current", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
    return <div className="p-10 text-center text-muted-foreground">Ayarlar yükleniyor...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ayarlar</h1>
        <p className="text-sm text-muted-foreground mt-1">İşletme profilinizi ve tercihlerinizi yapılandırın.</p>
      </div>

      {bookingUrl && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">
            Genel Rezervasyon URL&apos;niz
          </p>
          <div className="flex items-center gap-3">
            <code className="text-sm text-blue-300 break-all flex-1">{bookingUrl}</code>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(bookingUrl)}
              className="shrink-0 text-blue-400 hover:text-blue-300 text-xs font-medium px-2 py-1 rounded hover:bg-blue-500/10 transition-colors"
            >
              Kopyala
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border shadow-sm">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">İşletme Bilgileri</h2>
        </div>
        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          {saved && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
              Ayarlar başarıyla kaydedildi.
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">İşletme Adı *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-border bg-muted/50 text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="İşletmem"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                URL Slug *
                <span className="ml-1 text-muted-foreground font-normal">(rezervasyon URL&apos;sinde kullanılır)</span>
              </label>
              <input
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                className="w-full border border-border bg-muted/50 text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="isletmem"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Açıklama</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full border border-border bg-muted/50 text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Müşterilerinize işletmeniz hakkında bilgi verin..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Telefon</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-border bg-muted/50 text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+90 555 000 0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">E-posta</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-border bg-muted/50 text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="merhaba@isletmem.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Adres</label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border border-border bg-muted/50 text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Atatürk Mah. No:1, İstanbul"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Saat Dilimi</label>
            <select
              value={form.timezone}
              onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              className="w-full border border-border bg-muted/50 text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <p className="text-sm font-medium text-foreground">Online Rezervasyon</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Müşterilerin genel rezervasyon sayfanızdan randevu almasına izin verin.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, bookingEnabled: !form.bookingEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                form.bookingEnabled ? "bg-blue-600" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  form.bookingEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
          >
            {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
