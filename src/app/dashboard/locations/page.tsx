"use client";

import { useEffect, useState } from "react";

interface Location {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  timezone: string;
  isActive: boolean;
  isDefault: boolean;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    timezone: "Europe/Istanbul",
    isDefault: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/locations");
    const data = await res.json();
    if (data.data) setLocations(data.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createLocation(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch("/api/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (res.ok) {
      setShowForm(false);
      setForm({ name: "", address: "", phone: "", timezone: "Europe/Istanbul", isDefault: false });
      load();
    } else {
      setError(typeof data.error === "string" ? data.error : "Şube oluşturulamadı.");
    }
    setSaving(false);
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/locations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    load();
  }

  async function setDefault(id: string) {
    await fetch(`/api/locations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    load();
  }

  if (loading) return <div className="p-6 text-muted-foreground">Yükleniyor...</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Şubeler</h1>
        <button
          onClick={() => setShowForm(true)}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Şube Ekle
        </button>
      </div>

      {showForm && (
        <form onSubmit={createLocation} className="mb-6 space-y-3 rounded-lg border border-border bg-card p-4">
          <h2 className="font-semibold text-foreground">Yeni Şube</h2>
          <input
            required
            placeholder="Şube Adı"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded border border-border bg-input text-foreground px-3 py-2 text-sm"
          />
          <input
            placeholder="Adres"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full rounded border border-border bg-input text-foreground px-3 py-2 text-sm"
          />
          <input
            placeholder="Telefon"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded border border-border bg-input text-foreground px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              className="rounded border-border bg-background"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
            />
            Varsayılan şube olarak ayarla
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Kaydediliyor..." : "Oluştur"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80"
            >
              İptal
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ad</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Adres</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Durum</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {locations.map((loc) => (
              <tr key={loc.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{loc.name}</div>
                  {loc.isDefault && <span className="text-xs font-medium text-blue-400">Varsayılan</span>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{loc.address ?? "—"}</td>
                <td className="px-4 py-3">
                  {loc.isActive ? (
                    <span className="rounded bg-green-500/20 px-2 py-1 text-xs text-green-400">Aktif</span>
                  ) : (
                    <span className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">Pasif</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {!loc.isDefault && (
                      <button onClick={() => setDefault(loc.id)} className="text-xs text-blue-400 hover:underline">
                        Varsayılan Yap
                      </button>
                    )}
                    <button onClick={() => toggleActive(loc.id, loc.isActive)} className="text-xs text-muted-foreground hover:text-foreground hover:underline">
                      {loc.isActive ? "Pasife Al" : "Aktifleştir"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {locations.length === 0 && <div className="py-8 text-center text-muted-foreground">Henüz şube yok. İlk şubenizi ekleyin.</div>}
      </div>
    </div>
  );
}
