"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("locations");
  const tCommon = useTranslations("common");

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
      setError(typeof data.error === "string" ? data.error : t("createError"));
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

  if (loading) return <div className="p-6 text-gray-500">{tCommon("loading")}</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <button
          onClick={() => setShowForm(true)}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {t("addLocation")}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createLocation} className="mb-6 space-y-3 rounded-lg border bg-white p-4">
          <h2 className="font-semibold text-gray-900">{t("newLocation")}</h2>
          <input
            required
            placeholder={t("nameLabel")}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded border px-3 py-2 text-sm"
          />
          <input
            placeholder={tCommon("address")}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full rounded border px-3 py-2 text-sm"
          />
          <input
            placeholder={tCommon("phone")}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded border px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
            />
            {t("setDefault")}
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? tCommon("saving") : tCommon("create")}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              {tCommon("cancel")}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">{tCommon("name")}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">{tCommon("address")}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">{tCommon("status")}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">{tCommon("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {locations.map((loc) => (
              <tr key={loc.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{loc.name}</div>
                  {loc.isDefault && <span className="text-xs font-medium text-blue-600">{tCommon("default")}</span>}
                </td>
                <td className="px-4 py-3 text-gray-600">{loc.address ?? "—"}</td>
                <td className="px-4 py-3">
                  {loc.isActive ? (
                    <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">{tCommon("active")}</span>
                  ) : (
                    <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">{tCommon("passive")}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {!loc.isDefault && (
                      <button onClick={() => setDefault(loc.id)} className="text-xs text-blue-600 hover:underline">
                        {t("makeDefault")}
                      </button>
                    )}
                    <button onClick={() => toggleActive(loc.id, loc.isActive)} className="text-xs text-gray-600 hover:underline">
                      {loc.isActive ? t("deactivate") : t("activate")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {locations.length === 0 && <div className="py-8 text-center text-gray-500">{t("notFound")}</div>}
      </div>
    </div>
  );
}
