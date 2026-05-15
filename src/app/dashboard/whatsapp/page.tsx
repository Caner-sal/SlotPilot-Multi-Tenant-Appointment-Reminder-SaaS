"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";

interface WaSettings {
  enabled: boolean;
  provider: string;
  phoneNumberId: string | null;
  replyMode: "ALWAYS" | "KEYWORD_ONLY" | "DISABLED";
  cooldownHours: number;
  triggerKeywords: string[];
  messageTemplate: string;
  includeBookingLink: boolean;
}

interface WaLog {
  id: string;
  customerPhone: string;
  status: string;
  errorMessage: string | null;
  sentAt: string | null;
  createdAt: string;
  replyText: string | null;
}

interface LogsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const DEFAULT_SETTINGS: WaSettings = {
  enabled: false,
  provider: "FAKE",
  phoneNumberId: null,
  replyMode: "ALWAYS",
  cooldownHours: 24,
  triggerKeywords: [],
  messageTemplate:
    "Merhaba 👋\nRandevu almak için linkimizi kullanabilirsiniz:\n{{bookingUrl}}\n\nBu linkten hizmet seçebilir, uygun saatleri görebilir ve randevunuzu oluşturabilirsiniz.\nİnsan desteği için bu mesaja yazmaya devam edebilirsiniz.",
  includeBookingLink: true,
};

function StatusBadge({ status, tCommon }: { status: string; tCommon: ReturnType<typeof useTranslations> }) {
  if (status === "SENT")
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        {tCommon("sent")}
      </span>
    );
  if (status === "SKIPPED")
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-foreground/90 dark:bg-gray-800 dark:text-muted-foreground/70">
        {tCommon("skipped")}
      </span>
    );
  if (status === "FAILED")
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
        {tCommon("failed")}
      </span>
    );
  return <span className="text-xs text-muted-foreground">{status}</span>;
}

export default function WhatsAppAutoReplyPage() {
  const t = useTranslations("whatsapp");
  const tCommon = useTranslations("common");
  const [settings, setSettings] = useState<WaSettings>(DEFAULT_SETTINGS);
  const [logs, setLogs] = useState<WaLog[]>([]);
  const [logsMeta, setLogsMeta] = useState<LogsMeta>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [logsPage, setLogsPage] = useState(1);
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [keywordsInput, setKeywordsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/whatsapp/auto-reply/settings");
      if (res.ok) {
        const data = (await res.json()) as WaSettings;
        setSettings(data);
        setKeywordsInput((data.triggerKeywords ?? []).join(", "));
      }
    } catch {
      // silently fail
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  const fetchLogs = useCallback(async (page: number) => {
    try {
      const res = await fetch(`/api/whatsapp/auto-reply/logs?page=${page}&limit=20`);
      if (res.ok) {
        const data = (await res.json()) as { data: WaLog[]; meta: LogsMeta };
        setLogs(data.data);
        setLogsMeta(data.meta);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    void fetchSettings();
    void fetchLogs(1);
  }, [fetchSettings, fetchLogs]);

  useEffect(() => {
    void fetchLogs(logsPage);
  }, [logsPage, fetchLogs]);

  async function handleSave() {
    setSaving(true);
    setSaveMsg(null);
    try {
      const keywords = keywordsInput
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const res = await fetch("/api/whatsapp/auto-reply/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, triggerKeywords: keywords }),
      });

      if (res.ok) {
        const updated = (await res.json()) as WaSettings;
        setSettings(updated);
        setKeywordsInput((updated.triggerKeywords ?? []).join(", "));
        setSaveMsg(t("saveSuccess"));
      } else {
        setSaveMsg(t("saveFailed"));
      }
    } catch {
      setSaveMsg(t("connectionError"));
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 3000);
    }
  }

  async function handlePreview() {
    setLoadingPreview(true);
    setPreviewText(null);
    try {
      const res = await fetch("/api/whatsapp/auto-reply/preview", { method: "POST" });
      if (res.ok) {
        const data = (await res.json()) as { previewText: string };
        setPreviewText(data.previewText);
      }
    } catch {
      setPreviewText(t("previewError"));
    } finally {
      setLoadingPreview(false);
    }
  }

  if (loadingSettings) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground text-sm">{tCommon("loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t("subtitle")}
        </p>
      </div>

      {/* Settings Card */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-6">
        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{t("enabledLabel")}</p>
            <p className="text-sm text-muted-foreground">
              {t("enabledDesc")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSettings((s) => ({ ...s, enabled: !s.enabled }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none ${
              settings.enabled ? "bg-primary" : "bg-muted"
            }`}
            role="switch"
            aria-checked={settings.enabled}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-card shadow transition-transform ${
                settings.enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Reply Mode */}
        <div className="space-y-1">
          <label className="text-sm font-medium">{t("responseMode")}</label>
          <select
            value={settings.replyMode}
            onChange={(e) =>
              setSettings((s) => ({ ...s, replyMode: e.target.value as WaSettings["replyMode"] }))
            }
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="ALWAYS">{t("modeAlways")}</option>
            <option value="KEYWORD_ONLY">{t("modeKeyword")}</option>
            <option value="DISABLED">{t("modeOff")}</option>
          </select>
        </div>

        {/* Cooldown */}
        <div className="space-y-1">
          <label className="text-sm font-medium">{t("cooldown")}</label>
          <p className="text-xs text-muted-foreground">
            {t("cooldownDesc")}
          </p>
          <input
            type="number"
            min={1}
            max={168}
            value={settings.cooldownHours}
            onChange={(e) =>
              setSettings((s) => ({ ...s, cooldownHours: parseInt(e.target.value, 10) || 24 }))
            }
            className="flex h-9 w-32 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Keywords (only shown in KEYWORD_ONLY mode) */}
        {settings.replyMode === "KEYWORD_ONLY" && (
          <div className="space-y-1">
            <label className="text-sm font-medium">{t("keywords")}</label>
            <p className="text-xs text-muted-foreground">
              {t("keywordsHint")}
            </p>
            <input
              type="text"
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              placeholder={t("keywordsPlaceholder")}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        )}

        {/* Message Template */}
        <div className="space-y-1">
          <label className="text-sm font-medium">{t("template")}</label>
          <p className="text-xs text-muted-foreground">
            {t("templateHint")}
          </p>
          <textarea
            rows={6}
            value={settings.messageTemplate}
            onChange={(e) => setSettings((s) => ({ ...s, messageTemplate: e.target.value }))}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none font-mono"
          />
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => void handlePreview()}
            disabled={loadingPreview}
            className="inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
          >
            {loadingPreview ? tCommon("loading") : t("preview")}
          </button>
          {previewText && (
            <pre className="rounded-md bg-muted px-4 py-3 text-sm whitespace-pre-wrap font-mono border border-border">
              {previewText}
            </pre>
          )}
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? tCommon("saving") : tCommon("save")}
          </button>
          {saveMsg && (
            <span
              className={`text-sm ${
                saveMsg === t("saveSuccess") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {saveMsg}
            </span>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div>
        <h2 className="text-lg font-semibold mb-3">{t("history")}</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center border border-dashed border-border rounded-lg">
            {t("noHistory")}
          </p>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("phoneCol")}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("statusCol")}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("timeCol")}</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("errorCol")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{log.customerPhone}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={log.status} tCommon={tCommon} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {log.sentAt
                        ? new Date(log.sentAt).toLocaleString("tr-TR")
                        : new Date(log.createdAt).toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {log.errorMessage ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {logsMeta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-3">
            <p className="text-sm text-muted-foreground">
              {t("totalRecords", { total: logsMeta.total })}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={logsPage <= 1}
                onClick={() => setLogsPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-40 transition-colors"
              >
                {tCommon("previous")}
              </button>
              <span className="inline-flex items-center text-xs text-muted-foreground px-2">
                {logsPage} / {logsMeta.totalPages}
              </span>
              <button
                type="button"
                disabled={logsPage >= logsMeta.totalPages}
                onClick={() => setLogsPage((p) => Math.min(logsMeta.totalPages, p + 1))}
                className="inline-flex items-center rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-40 transition-colors"
              >
                {tCommon("next")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
