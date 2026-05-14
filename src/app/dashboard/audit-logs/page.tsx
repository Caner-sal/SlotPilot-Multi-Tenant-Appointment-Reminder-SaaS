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
        <h1 className="text-2xl font-bold text-foreground">İşlem Geçmişi</h1>
        <p className="text-sm text-muted-foreground mt-1">Hesabınızda gerçekleştirilen tüm işlemleri takip edin.</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-muted-foreground">Yükleniyor...</div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">Henüz işlem kaydı yok.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Tarih</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Kullanıcı</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">İşlem</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Tür</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">ID</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">
                      {log.actorUserId ? log.actorUserId.slice(0, 8) + "..." : "sistem"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-foreground">
                      {log.action.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                      {log.entityType}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-muted-foreground">
                      {log.entityId.slice(0, 8)}...
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground max-w-[260px]">
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
          <p className="text-sm text-muted-foreground">
            {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} / {meta.total} kayıt
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 border border-border bg-card text-foreground rounded-lg text-sm disabled:opacity-40 hover:bg-muted transition-colors"
            >
              Önceki
            </button>
            <span className="text-sm text-muted-foreground">
              {meta.page} / {meta.totalPages}
            </span>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 border border-border bg-card text-foreground rounded-lg text-sm disabled:opacity-40 hover:bg-muted transition-colors"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
