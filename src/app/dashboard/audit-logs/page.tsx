"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("auditLogs");
  const tCommon = useTranslations("common");

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
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-muted-foreground/80">{tCommon("loading")}</div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground/80">{t("notFound")}</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/70 bg-muted/40">
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">{t("dateCol")}</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">{t("userCol")}</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">{t("actionCol")}</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">{t("typeCol")}</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">{t("idCol")}</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">{t("metadataCol")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                      {log.actorUserId ? log.actorUserId.slice(0, 8) + "..." : t("system")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-foreground">
                      {log.action.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
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
              className="px-3 py-1.5 border border-border rounded-lg text-sm disabled:opacity-40 hover:bg-muted/40 transition-colors"
            >
              {tCommon("previous")}
            </button>
            <span className="text-sm text-muted-foreground">
              {meta.page} / {meta.totalPages}
            </span>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 border border-border rounded-lg text-sm disabled:opacity-40 hover:bg-muted/40 transition-colors"
            >
              {tCommon("next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
