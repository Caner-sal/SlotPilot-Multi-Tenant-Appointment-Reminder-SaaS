"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-gray-100 text-gray-700",
};

type Appointment = {
  id: string;
  startTime: string;
  status: string;
  service: { name: string; durationMinutes: number };
  customer: { fullName: string; phone?: string | null; email?: string | null };
};

export default function StaffAppointmentsPage() {
  const t = useTranslations("staffPortal");
  const tCommon = useTranslations("common");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/staff/me/appointments")
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? "Failed to load appointments");
        setAppointments(body.data ?? []);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const statusLabels = useMemo(
    () => ({
      PENDING: tCommon("pending"),
      CONFIRMED: tCommon("confirmed"),
      COMPLETED: tCommon("completed"),
      CANCELLED: tCommon("cancelled"),
      NO_SHOW: tCommon("noShow"),
    }),
    [tCommon]
  );

  if (loading) {
    return <div className="rounded-lg border bg-white p-6 text-sm text-gray-600">Loading appointments...</div>;
  }

  if (error) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{t("myAppointments")}</h1>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">{t("customerCol")}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">{t("serviceCol")}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">{t("dateTimeCol")}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">{tCommon("status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {appointments.map((apt) => (
              <tr key={apt.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">
                    <Link className="hover:underline" href={`/staff/appointments/${apt.id}`}>
                      {apt.customer.fullName}
                    </Link>
                  </div>
                  <div className="text-xs text-gray-500">{apt.customer.phone ?? apt.customer.email ?? ""}</div>
                </td>
                <td className="px-4 py-3">
                  <div>{apt.service.name}</div>
                  <div className="text-xs text-gray-500">
                    {apt.service.durationMinutes} {tCommon("min")}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>{new Date(apt.startTime).toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" })}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(apt.startTime).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Europe/Istanbul",
                    })}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${STATUS_COLORS[apt.status] ?? "bg-gray-100 text-gray-700"}`}
                  >
                    {statusLabels[apt.status as keyof typeof statusLabels] ?? apt.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {appointments.length === 0 ? (
          <div className="py-8 text-center text-gray-500">{t("noAppointments")}</div>
        ) : null}
      </div>
    </div>
  );
}
