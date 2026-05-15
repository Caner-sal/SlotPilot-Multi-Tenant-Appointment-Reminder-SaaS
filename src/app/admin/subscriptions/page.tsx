"use client";

import { useEffect, useState } from "react";

type SubscriptionItem = {
  id: string;
  organizationId: string;
  plan: "FREE" | "STARTER" | "PRO";
  status: "ACTIVE" | "TRIALING" | "PAST_DUE" | "INCOMPLETE" | "CANCELLED";
  currentPeriodEnd: string | null;
  createdAt: string;
  updatedAt: string;
  organization: {
    name: string;
    slug: string;
    email: string | null;
  };
};

type SubscriptionSummary = {
  totalSubscriptions: number;
  activeSubscriptions: number;
  paymentPendingAccounts: number;
  planDistribution: {
    FREE: number;
    STARTER: number;
    PRO: number;
  };
  statusDistribution: {
    ACTIVE: number;
    TRIALING: number;
    PAST_DUE: number;
    INCOMPLETE: number;
    CANCELLED: number;
  };
};

type SubscriptionsResponse = {
  items: SubscriptionItem[];
  pagination: { limit: number; nextCursor: string | null };
  summary: SubscriptionSummary;
};

const PLAN_OPTIONS = ["ALL", "FREE", "STARTER", "PRO"] as const;
const STATUS_OPTIONS = ["ALL", "ACTIVE", "TRIALING", "PAST_DUE", "INCOMPLETE", "CANCELLED"] as const;

export default function AdminSubscriptionsPage() {
  const [plan, setPlan] = useState<(typeof PLAN_OPTIONS)[number]>("ALL");
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>("ALL");
  const [data, setData] = useState<SubscriptionsResponse | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(nextCursor?: string | null) {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("limit", "20");
      if (plan !== "ALL") params.set("plan", plan);
      if (status !== "ALL") params.set("status", status);
      if (nextCursor) params.set("cursor", nextCursor);

      const res = await fetch(`/api/admin/subscriptions?${params.toString()}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Abonelik verisi yüklenemedi");
      }

      const body = (await res.json()) as { data: SubscriptionsResponse };
      setData(body.data);
      setCursor(nextCursor ?? null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Abonelik verisi yüklenemedi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = data?.summary;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Abonelikler</h1>
        <p className="text-sm text-muted-foreground">Plan dağılımı, ödeme bekleyen hesaplar ve abonelik listesi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <select
          className="border rounded px-3 py-2 text-sm"
          value={plan}
          onChange={(e) => setPlan(e.target.value as (typeof PLAN_OPTIONS)[number])}
        >
          {PLAN_OPTIONS.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <select
          className="border rounded px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as (typeof STATUS_OPTIONS)[number])}
        >
          {STATUS_OPTIONS.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <button className="px-3 py-2 rounded bg-gray-900 text-white text-sm" onClick={() => void load(null)}>
          Filtrele
        </button>

        <button
          className="px-3 py-2 rounded border text-sm"
          onClick={() => {
            setPlan("ALL");
            setStatus("ALL");
            setTimeout(() => {
              void load(null);
            }, 0);
          }}
        >
          Temizle
        </button>
      </div>

      {summary ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Toplam Abonelik" value={summary.totalSubscriptions} />
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
                <th className="text-left p-3">Plan</th>
                <th className="text-left p-3">Durum</th>
                <th className="text-left p-3">Dönem Sonu</th>
                <th className="text-left p-3">Güncelleme</th>
              </tr>
            </thead>
            <tbody>
              {(data?.items ?? []).map((row) => (
                <tr key={row.id} className="border-t align-top">
                  <td className="p-3">
                    <p className="font-medium text-foreground">{row.organization.name}</p>
                    <p className="text-xs text-muted-foreground">/{row.organization.slug}</p>
                    <p className="text-xs text-muted-foreground">{row.organization.email ?? "-"}</p>
                  </td>
                  <td className="p-3">{row.plan}</td>
                  <td className="p-3">{row.status}</td>
                  <td className="p-3">{row.currentPeriodEnd ? new Date(row.currentPeriodEnd).toLocaleDateString("tr-TR") : "-"}</td>
                  <td className="p-3 text-muted-foreground">{new Date(row.updatedAt).toLocaleString("tr-TR")}</td>
                </tr>
              ))}
              {(data?.items.length ?? 0) === 0 ? (
                <tr>
                  <td className="p-3 text-muted-foreground" colSpan={5}>Kayıt bulunamadı.</td>
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
