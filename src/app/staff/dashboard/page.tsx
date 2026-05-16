"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type Metrics = {
  todayAppointments: number;
  weekAppointments: number;
  completedAppointments: number;
  noShowAppointments: number;
};

type MeResponse = {
  id: string;
  name: string;
  email?: string | null;
  isActive: boolean;
  metrics: Metrics;
  nextAppointment?: {
    id: string;
    startTime: string;
    customer: { fullName: string };
    service: { name: string };
  } | null;
};

export default function StaffDashboardPage() {
  const t = useTranslations("staffPortal");
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/staff/me")
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? "Failed to load staff profile");
        setData(body.data ?? null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">Loading dashboard...</div>;
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error ?? "Failed to load staff dashboard"}
      </div>
    );
  }

  const next = data.nextAppointment;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">{t("welcomeBack", { name: data.name })}</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">{t("todayAppointments")}</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{data.metrics.todayAppointments}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">This week</p>
          <p className="mt-1 text-3xl font-bold text-blue-700">{data.metrics.weekAppointments}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="mt-1 text-3xl font-bold text-green-700">{data.metrics.completedAppointments}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">No-show</p>
          <p className="mt-1 text-3xl font-bold text-foreground/90">{data.metrics.noShowAppointments}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 font-semibold text-foreground">Next appointment</h2>
        {next ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{next.customer.fullName}</p>
              <p className="text-sm text-muted-foreground">{next.service.name}</p>
            </div>
            <div className="text-right text-sm">
              <p>{new Date(next.startTime).toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" })}</p>
              <p className="text-muted-foreground">
                {new Date(next.startTime).toLocaleTimeString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Europe/Istanbul",
                })}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("noUpcoming")}</p>
        )}
      </div>

      <div className="mt-4">
        <Link href="/staff/appointments" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          Go to appointments
        </Link>
      </div>
    </div>
  );
}
