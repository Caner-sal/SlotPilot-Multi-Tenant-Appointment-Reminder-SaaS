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
    return <div className="rounded-lg border bg-white p-6 text-sm text-gray-600">Loading dashboard...</div>;
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
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{t("welcomeBack", { name: data.name })}</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">{t("todayAppointments")}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{data.metrics.todayAppointments}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">This week</p>
          <p className="mt-1 text-3xl font-bold text-blue-700">{data.metrics.weekAppointments}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="mt-1 text-3xl font-bold text-green-700">{data.metrics.completedAppointments}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">No-show</p>
          <p className="mt-1 text-3xl font-bold text-gray-700">{data.metrics.noShowAppointments}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 font-semibold text-gray-900">Next appointment</h2>
        {next ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{next.customer.fullName}</p>
              <p className="text-sm text-gray-500">{next.service.name}</p>
            </div>
            <div className="text-right text-sm">
              <p>{new Date(next.startTime).toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" })}</p>
              <p className="text-gray-500">
                {new Date(next.startTime).toLocaleTimeString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Europe/Istanbul",
                })}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">{t("noUpcoming")}</p>
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
