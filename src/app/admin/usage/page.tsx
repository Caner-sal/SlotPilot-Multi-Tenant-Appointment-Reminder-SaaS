"use client";

import { useEffect, useState } from "react";

type UsageItem = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  bookingEnabled: boolean;
  suspended: boolean;
  isPubliclyAvailable: boolean;
  monthlyAppointments: number;
  subscription: {
    plan: "FREE" | "STARTER" | "PRO";
    status: "ACTIVE" | "TRIALING" | "PAST_DUE" | "INCOMPLETE" | "CANCELLED";
    currentPeriodEnd: string | null;
  } | null;
  _count: {
    appointments: number;
    staff: number;
    services: number;
    members: number;
  };
};

type UsageResponse = {
  items: UsageItem[];
  pagination: { limit: number; nextCursor: string | null };
  summary: {
    totalOrganizations: number;
    activeOrganizations: number;
    suspendedOrganizations: number;
    monthlyAppointments: number;
    activeSubscriptions: number;
    paymentPendingAccounts: number;
    planDistribution: {
      FREE: number;
      STARTER: number;
      PRO: number;
    };
  };
};

export default function AdminUsagePage() {
  const [data, setData] = useState<UsageResponse | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(nextCursor?: string | null) {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("limit", "20");
      if (nextCursor) params.set("cursor", nextCursor);

      const res = await fetch(`/api/admin/usage?${params.toString()}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Kullanım verisi yüklenemedi");
      }

      const body = (await res.json()) as { data: UsageResponse };
      setData(body.data);
      setCursor(nextCursor ?? null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kullanım verisi yüklenemedi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const summary = data?.summary;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Kullanım</h1>
        <p className="text-sm text-muted-foreground">Organizasyon bazlı randevu, ekip ve abonelik görünümü</p>
      </div>

      {summary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Toplam İşletme" value={summary.totalOrganizations} />
          <StatCard label="Aktif İşletme" value={summary.activeOrganizations} />
          <StatCard label="Askıya Alınan" value={summary.suspendedOrganizations} danger={summary.suspendedOrganizations > 0} />
          <StatCard label="Bu Ay Randevu" value={summary.monthlyAppointments} />
          <StatCard label="Aktif Abonelik" value={summary.activeSubscriptions} />
          <StatCard label="Ödeme Bekleyen" value={summary.paymentPendingAccounts} danger={summary.paymentPendingAccounts > 0} />
          <StatCard label="Starter" value={summary.planDistribution.STARTER} />
          <StatCard label="Pro" value={summary.planDistribution.PRO} />
        </div>
      ) : null}

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      {loading ? (
        <div className="text-sm text-muted-foreground">Yükleniyor...</div>
      ) : (
        <div className="bg-card rounded border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="text-left p-3">İşletme</th>
                <th className="text-left p-3">Bu Ay</th>
                <th className="text-left p-3">Toplam Randevu</th>
                <th className="text-left p-3">Çalışan</th>
                <th className="text-left p-3">Hizmet</th>
                <th className="text-left p-3">Plan</th>
                <th className="text-left p-3">Public Durum</th>
              </tr>
            </thead>
            <tbody>
              {(data?.items ?? []).map((row) => (
                <tr key={row.id} className="border-t align-top">
                  <td className="p-3">
                    <p className="font-medium text-foreground">{row.name}</p>
                    <p className="text-xs text-muted-foreground">/{row.slug}</p>
                  </td>
                  <td className="p-3">{row.monthlyAppointments}</td>
                  <td className="p-3">{row._count.appointments}</td>
                  <td className="p-3">{row._count.staff}</td>
                  <td className="p-3">{row._count.services}</td>
                  <td className="p-3">{row.subscription ? `${row.subscription.plan} (${row.subscription.status})` : "-"}</td>
                  <td className="p-3">
                    {row.isPubliclyAvailable ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Açık</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Kapalı</span>
                    )}
                  </td>
                </tr>
              ))}
              {(data?.items.length ?? 0) === 0 ? (
                <tr>
                  <td className="p-3 text-muted-foreground" colSpan={7}>Kayıt bulunamadı.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          className="px-3 py-2 text-sm rounded border disabled:opacity-50"
          onClick={() => void load(cursor)}
          disabled={!cursor}
        >
          Yeniden Yükle
        </button>
        <button
          className="px-3 py-2 text-sm rounded border disabled:opacity-50"
          onClick={() => void load(data?.pagination.nextCursor ?? null)}
          disabled={!data?.pagination.nextCursor}
        >
          Sonraki Sayfa
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return (
    <div className="bg-card rounded border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${danger ? "text-red-600" : "text-foreground"}`}>{value}</p>
    </div>
  );
}
