"use client";

import { useState, useEffect } from "react";

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
  const [form, setForm] = useState({ name: "", address: "", phone: "", timezone: "UTC", isDefault: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/locations");
    const data = await res.json();
    if (data.data) setLocations(data.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

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
      setForm({ name: "", address: "", phone: "", timezone: "UTC", isDefault: false });
      load();
    } else {
      setError(typeof data.error === "string" ? data.error : "Failed to create location");
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

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
        >
          Add Location
        </button>
      </div>

      {showForm && (
        <form onSubmit={createLocation} className="bg-white border rounded-lg p-4 mb-6 space-y-3">
          <h2 className="font-semibold text-gray-900">New Location</h2>
          <input required placeholder="Location Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
          <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
            Set as default location
          </label>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Saving..." : "Create"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Address</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {locations.map((loc) => (
              <tr key={loc.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{loc.name}</div>
                  {loc.isDefault && <span className="text-xs text-blue-600 font-medium">Default</span>}
                </td>
                <td className="px-4 py-3 text-gray-600">{loc.address ?? "—"}</td>
                <td className="px-4 py-3">
                  {loc.isActive ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Active</span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {!loc.isDefault && (
                      <button onClick={() => setDefault(loc.id)} className="text-xs text-blue-600 hover:underline">Set Default</button>
                    )}
                    <button onClick={() => toggleActive(loc.id, loc.isActive)} className="text-xs text-gray-600 hover:underline">
                      {loc.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {locations.length === 0 && (
          <div className="text-center py-8 text-gray-500">No locations yet. Add your first location.</div>
        )}
      </div>
    </div>
  );
}
