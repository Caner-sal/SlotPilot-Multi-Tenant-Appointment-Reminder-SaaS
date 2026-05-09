"use client";

import { useState, useEffect, useCallback } from "react";

interface AuditLog {
  id: string;
  createdAt: string;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: { [key: string]: unknown } | null;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/audit-logs?page=${page}&limit=20`);
      const json = await res.json();
      setLogs(json.data ?? []);
      setMeta(json.meta ?? null);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  function metaPreview(metadata: { [key: string]: unknown } | null) {
    if (!metadata || typeof metadata !== "object") return "—";
    const keys = Object.keys(metadata).slice(0, 3);
    return keys.map((k) => `${k}: ${String(metadata[k]).slice(0, 30)}`).join(", ");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">İşlem Geçmişi</h1>
        <p className="text-sm text-gray-500 mt-1">Hesabınızda gerçekleştirilen tüm işlemleri takip edin.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Yükleniyor...</div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Henüz işlem kaydı yok.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Tarih</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Kullanıcı</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">İşlem</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Tür</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">ID</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">
                    <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                      {log.actorUserId ? log.actorUserId.slice(0, 8) + "..." : "sistem"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-gray-800">
                      {log.action.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {log.entityType}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-gray-500">
                      {log.entityId.slice(0, 8)}...
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 max-w-[260px]">
                    <span className="text-xs line-clamp-1">{metaPreview(log.metadata)}</span>
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
            {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} / {meta.total} kayıt
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
