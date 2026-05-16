"use client";

import { useEffect, useState } from "react";

type ChecklistItem = {
  key: string;
  label: string;
  completed: boolean;
};

type ChecklistData = {
  completedCount: number;
  totalCount: number;
  progressPercent: number;
  items: ChecklistItem[];
};

export default function OnboardingChecklistCard() {
  const [data, setData] = useState<ChecklistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await fetch("/api/dashboard/onboarding-checklist", {
          cache: "no-store",
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? "Checklist verisi alinamadi");
        }
        const body = (await res.json()) as { data: ChecklistData };
        if (!mounted) return;
        setData(body.data);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Checklist verisi alinamadi");
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
    return (
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="text-sm text-muted-foreground">Onboarding checklist yükleniyor...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-card border border-destructive/25 rounded-2xl p-5">
        <p className="text-sm text-destructive">{error ?? "Checklist verisi alınamadı."}</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex justify-between items-baseline mb-3">
        <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)" }}>
          Onboarding Checklist
        </h3>
        <span className="text-xs text-accent-foreground">
          {data.completedCount}/{data.totalCount}
        </span>
      </div>

      <div className="h-2 rounded-full bg-primary/15 overflow-hidden mb-4">
        <div
          className="h-full"
          style={{
            width: `${data.progressPercent}%`,
            background: "linear-gradient(90deg, #7768d4 0%, #2de4a4 100%)",
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        {data.items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between border border-border rounded-lg px-3 py-2"
          >
            <span className="text-sm text-foreground/80">{item.label}</span>
            <span className={`text-xs font-semibold ${item.completed ? "text-green-400" : "text-muted-foreground"}`}>
              {item.completed ? "Tamamlandı" : "Bekliyor"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
