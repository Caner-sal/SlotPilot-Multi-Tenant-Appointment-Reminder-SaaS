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

function formatPlan(plan: string | undefined): string {
  switch (plan) {
    case "FREE":
      return "ÜCRETSİZ";
    case "STARTER":
      return "BAŞLANGIÇ";
    case "PRO":
      return "PRO";
    case "ENTERPRISE":
      return "KURUMSAL";
    default:
      return plan ?? "ÜCRETSİZ";
  }
}

function formatSubStatus(status: string | undefined): string {
  switch (status) {
    case "ACTIVE":
      return "AKTİF";
    case "TRIALING":
      return "DENEME";
    case "PAST_DUE":
      return "GECİKMİŞ";
    case "CANCELED":
    case "CANCELLED":
      return "İPTAL";
    case "INCOMPLETE":
      return "EKSİK";
    case "INCOMPLETE_EXPIRED":
      return "SÜRESİ DOLMUŞ";
    case "UNPAID":
      return "ÖDENMEMİŞ";
    default:
      return status ?? "—";
  }
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
      .then((d) => {
        setOrg(d.data);
        setLoading(false);
      })
      .catch(() => {
        setError("İşletme yüklenemedi.");
        setLoading(false);
      });
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
    if (res.ok) {
      setOrg((prev) => (prev ? { ...prev, [field]: !prev[field] } : prev));
    } else {
      setError(data.error);
    }
    setSaving(false);
  }

  if (loading) return <div className="text-gray-500">Yükleniyor...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!org) return <div className="text-gray-500">İşletme bulunamadı.</div>;

  return (
    <div className="max-w-3xl">
      <div className="mb-4">
        <Link href="/admin/organizations" className="text-blue-600 hover:underline text-sm">
          ← İşletmelere Dön
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{org.name}</h1>
      <p className="text-gray-500 text-sm mb-6">/{org.slug}</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: "Randevular", value: org._count.appointments },
          { label: "Çalışanlar", value: org._count.staff },
          { label: "Hizmetler", value: org._count.services },
          { label: "Üyeler", value: org._count.members },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border p-4 mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Detaylar</h2>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-gray-500">E-posta</dt>
          <dd>{org.email ?? "—"}</dd>
          <dt className="text-gray-500">Telefon</dt>
          <dd>{org.phone ?? "—"}</dd>
          <dt className="text-gray-500">Saat Dilimi</dt>
          <dd>{org.timezone}</dd>
          <dt className="text-gray-500">Plan</dt>
          <dd>{formatPlan(org.subscription?.plan)}</dd>
          <dt className="text-gray-500">Abonelik Durumu</dt>
          <dd>{formatSubStatus(org.subscription?.status)}</dd>
          <dt className="text-gray-500">Oluşturulma</dt>
          <dd>{new Date(org.createdAt).toLocaleDateString("tr-TR")}</dd>
        </dl>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Kontroller</h2>
        <div className="flex gap-3">
          <button
            onClick={() => toggleField("suspended")}
            disabled={saving}
            className={`px-4 py-2 rounded text-sm font-medium ${
              org.suspended ? "bg-green-600 text-white hover:bg-green-700" : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {org.suspended ? "İşletmeyi Aktifleştir" : "İşletmeyi Askıya Al"}
          </button>
          <button
            onClick={() => toggleField("bookingEnabled")}
            disabled={saving}
            className="px-4 py-2 rounded text-sm font-medium bg-gray-600 text-white hover:bg-gray-700"
          >
            {org.bookingEnabled ? "Rezervasyonu Kapat" : "Rezervasyonu Aç"}
          </button>
        </div>
        {org.suspended && (
          <p className="mt-2 text-sm text-red-600">
            Bu işletme askıya alındı. Genel rezervasyon istekleri 403 döner.
          </p>
        )}
      </div>
    </div>
  );
}
