"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface OrgDetail {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  timezone: string;
  bookingEnabled: boolean;
  suspended: boolean;
  createdAt: string;
  subscription: { plan: string; status: string; currentPeriodEnd: string | null } | null;
  _count: { appointments: number; staff: number; services: number; members: number };
}

export default function AdminOrgDetailPage() {
  const params = useParams<{ id: string }>();
  const [org, setOrg] = useState<OrgDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/organizations/${params.id}`)
      .then((r) => r.json())
      .then((d) => { setOrg(d.data); setLoading(false); })
      .catch(() => { setError("Failed to load organization"); setLoading(false); });
  }, [params.id]);

  async function toggleField(field: "suspended" | "bookingEnabled") {
    if (!org) return;
    setSaving(true);
    const res = await fetch(`/api/admin/organizations/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !org[field] }),
    });
    const data = await res.json();
    if (res.ok) setOrg((prev) => prev ? { ...prev, [field]: !prev[field] } : prev);
    else setError(data.error);
    setSaving(false);
  }

  if (loading) return <div className="text-gray-500">Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!org) return <div className="text-gray-500">Organization not found.</div>;

  return (
    <div className="max-w-3xl">
      <div className="mb-4">
        <Link href="/admin/organizations" className="text-blue-600 hover:underline text-sm">← Back to Organizations</Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{org.name}</h1>
      <p className="text-gray-500 text-sm mb-6">/{org.slug}</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: "Appointments", value: org._count.appointments },
          { label: "Staff", value: org._count.staff },
          { label: "Services", value: org._count.services },
          { label: "Members", value: org._count.members },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border p-4 mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Details</h2>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-gray-500">Email</dt><dd>{org.email ?? "—"}</dd>
          <dt className="text-gray-500">Phone</dt><dd>{org.phone ?? "—"}</dd>
          <dt className="text-gray-500">Timezone</dt><dd>{org.timezone}</dd>
          <dt className="text-gray-500">Plan</dt><dd>{org.subscription?.plan ?? "FREE"}</dd>
          <dt className="text-gray-500">Sub Status</dt><dd>{org.subscription?.status ?? "—"}</dd>
          <dt className="text-gray-500">Created</dt><dd>{new Date(org.createdAt).toLocaleDateString()}</dd>
        </dl>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Controls</h2>
        <div className="flex gap-3">
          <button
            onClick={() => toggleField("suspended")}
            disabled={saving}
            className={`px-4 py-2 rounded text-sm font-medium ${org.suspended ? "bg-green-600 text-white hover:bg-green-700" : "bg-red-600 text-white hover:bg-red-700"}`}
          >
            {org.suspended ? "Activate Organization" : "Suspend Organization"}
          </button>
          <button
            onClick={() => toggleField("bookingEnabled")}
            disabled={saving}
            className="px-4 py-2 rounded text-sm font-medium bg-gray-600 text-white hover:bg-gray-700"
          >
            {org.bookingEnabled ? "Disable Booking" : "Enable Booking"}
          </button>
        </div>
        {org.suspended && (
          <p className="mt-2 text-sm text-red-600">This organization is suspended. Public booking returns 403.</p>
        )}
      </div>
    </div>
  );
}
