"use client";

import { useState, useEffect, useCallback } from "react";

interface Reminder {
  id: string;
  type: string;
  scheduledAt: string;
  status: string;
  sentAt: string | null;
  errorMessage: string | null;
  appointment: {
    id: string;
    startTime: string;
    customer: { fullName: string; email: string };
    service: { name: string };
  };
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  SENT: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  SKIPPED: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Beklemede",
  SENT: "Gönderildi",
  FAILED: "Başarısız",
  SKIPPED: "Atlandı",
};

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<string | null>(null);

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reminders?page=${page}&limit=20`);
      const json = await res.json();
      setReminders(json.data ?? []);
      setMeta(json.meta ?? null);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  async function processReminders() {
    setProcessing(true);
    setProcessResult(null);
    try {
      const res = await fetch("/api/reminders/process", { method: "POST" });
      const json = await res.json();
      if (res.ok && json.data) {
        const d = json.data;
        setProcessResult(
          `İşlendi: ${d.processed ?? 0} gönderildi, ${d.failed ?? 0} başarısız, ${d.skipped ?? 0} atlandı.`
        );
        await fetchReminders();
      } else {
        setProcessResult("Hatırlatmalar işlenemedi.");
      }
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hatırlatmalar</h1>
          <p className="text-sm text-gray-500 mt-1">Hatırlatma günlüklerini görüntüleyin ve manuel işlem başlatın.</p>
        </div>
        <button
          onClick={processReminders}
          disabled={processing}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 3l14 9-14 9V3z" />
          </svg>
          {processing ? "İşleniyor..." : "Hatırlatmaları İşle"}
        </button>
      </div>

      {processResult && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg px-4 py-3">
          {processResult}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Yükleniyor...</div>
        ) : reminders.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Hatırlatma bulunamadı.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Randevu</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Tür</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Planlandı</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Durum</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Gönderildi</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Hata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reminders.map((reminder) => (
                <tr key={reminder.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-gray-900">{reminder.appointment.customer.fullName}</div>
                    <div className="text-xs text-gray-400">
                      {reminder.appointment.service.name} ·{" "}
                      {new Date(reminder.appointment.startTime).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{reminder.type}</td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {new Date(reminder.scheduledAt).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_COLORS[reminder.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {STATUS_LABELS[reminder.status] ?? reminder.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {reminder.sentAt ? new Date(reminder.sentAt).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" }) : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-red-500 max-w-[200px]">
                    <span className="line-clamp-1 text-xs">{reminder.errorMessage ?? "—"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} / {meta.total} hatırlatma
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Önceki
            </button>
            <span className="text-sm text-gray-600">
              {meta.page} / {meta.totalPages}
            </span>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
