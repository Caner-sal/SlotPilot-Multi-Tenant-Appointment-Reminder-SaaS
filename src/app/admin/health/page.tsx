"use client";

import { useEffect, useState } from "react";

type HealthData = {
  status: "ok" | "degraded";
  requestId: string;
  checks: {
    database: "ok" | "failed";
    pendingReminders: number;
    failedReminders: number;
    paymentsPendingReview: number;
    failedWebhookEvents: number;
    failedInternalJobs: number;
    failedPaymentAttempts: number;
  };
  windows: {
    last24h: {
      failedWebhookEvents: number;
      failedInternalJobs: number;
      failedPaymentAttempts: number;
      failedReminders: number;
    };
    last7d: {
      failedWebhookEvents: number;
      failedInternalJobs: number;
      failedPaymentAttempts: number;
      failedReminders: number;
    };
  };
};

type FailureItem = {
  id: string;
  provider: string;
  eventType: string;
  eventId: string;
  errorMessage: string | null;
  createdAt: string;
};

type FailureData = {
  items: FailureItem[];
  pagination: { limit: number; nextCursor: string | null };
};

export default function AdminHealthPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [webhookFailures, setWebhookFailures] = useState<FailureData | null>(null);
  const [jobFailures, setJobFailures] = useState<FailureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const [healthRes, webhookRes, jobRes] = await Promise.all([
          fetch("/api/admin/health", { cache: "no-store" }),
          fetch("/api/admin/failures?source=webhook&limit=5", { cache: "no-store" }),
          fetch("/api/admin/failures?source=job&limit=5", { cache: "no-store" }),
        ]);

        if (!healthRes.ok) {
          const body = (await healthRes.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? "Health endpoint failed");
        }
        if (!webhookRes.ok) throw new Error("Webhook failure list could not be loaded");
        if (!jobRes.ok) throw new Error("Job failure list could not be loaded");

        const healthJson = (await healthRes.json()) as { data: HealthData };
        const webhookJson = (await webhookRes.json()) as { data: FailureData };
        const jobJson = (await jobRes.json()) as { data: FailureData };

        if (!mounted) return;
        setHealth(healthJson.data);
        setWebhookFailures(webhookJson.data);
        setJobFailures(jobJson.data);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Sağlık verisi yüklenemedi.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Sağlık verisi yükleniyor...</div>;
  }

  if (error || !health) {
    return <div className="text-sm text-red-600">{error ?? "Sağlık verisi alınamadı."}</div>;
  }

  const cards = [
    { label: "Veritabanı", value: health.checks.database === "ok" ? "OK" : "FAILED", danger: health.checks.database !== "ok" },
    { label: "Bekleyen Hatırlatma", value: String(health.checks.pendingReminders) },
    { label: "Hatalı Hatırlatma", value: String(health.checks.failedReminders), danger: health.checks.failedReminders > 0 },
    { label: "Ödeme İnceleme Kuyruğu", value: String(health.checks.paymentsPendingReview) },
    { label: "Hatalı Webhook", value: String(health.checks.failedWebhookEvents), danger: health.checks.failedWebhookEvents > 0 },
    { label: "Hatalı Internal Job", value: String(health.checks.failedInternalJobs), danger: health.checks.failedInternalJobs > 0 },
    { label: "Hatalı Payment Attempt", value: String(health.checks.failedPaymentAttempts), danger: health.checks.failedPaymentAttempts > 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Sistem Sağlık Durumu</h1>
      <p className="text-sm text-muted-foreground mb-6">Durum: <span className={health.status === "ok" ? "text-green-600" : "text-amber-600"}>{health.status.toUpperCase()}</span></p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-card rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className={`text-xl font-semibold mt-1 ${card.danger ? "text-red-600" : "text-foreground"}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <WindowCard title="Son 24 Saat" data={health.windows.last24h} />
        <WindowCard title="Son 7 Gün" data={health.windows.last7d} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FailureCard title="Son Hatalı Webhook Olayları" items={webhookFailures?.items ?? []} />
        <FailureCard title="Son Hatalı Internal Job Olayları" items={jobFailures?.items ?? []} />
      </div>
    </div>
  );
}

function WindowCard({
  title,
  data,
}: {
  title: string;
  data: {
    failedWebhookEvents: number;
    failedInternalJobs: number;
    failedPaymentAttempts: number;
    failedReminders: number;
  };
}) {
  const rows = [
    { label: "Webhook", value: data.failedWebhookEvents },
    { label: "Internal Job", value: data.failedInternalJobs },
    { label: "Payment Attempt", value: data.failedPaymentAttempts },
    { label: "Reminders", value: data.failedReminders },
  ];

  return (
    <div className="bg-card rounded-lg border p-4">
      <h2 className="font-semibold text-foreground mb-3">{title} Hata Trendleri</h2>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{row.label}</span>
            <span className={row.value > 0 ? "text-red-600 font-medium" : "text-foreground"}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FailureCard({ title, items }: { title: string; items: FailureItem[] }) {
  return (
    <div className="bg-card rounded-lg border p-4">
      <h2 className="font-semibold text-foreground mb-3">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Kayıt yok.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="border rounded p-3">
              <p className="text-sm font-medium">{item.provider} • {item.eventType}</p>
              <p className="text-xs text-muted-foreground">{item.eventId}</p>
              <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString("tr-TR")}</p>
              {item.errorMessage ? <p className="text-xs text-red-600 mt-1">{item.errorMessage}</p> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
