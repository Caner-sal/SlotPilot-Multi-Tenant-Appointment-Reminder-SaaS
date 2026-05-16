"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface Transaction {
  id: string;
  planId: string;
  amountCents: number;
  currency: string;
  status: string;
  provider: string;
  billingCycle: string;
  paidAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-green-500/15 text-green-400",
  INITIATED: "bg-blue-500/15 text-blue-400",
  PENDING: "bg-yellow-500/15 text-yellow-400",
  FAILED: "bg-destructive/15 text-destructive",
  CANCELLED: "bg-muted text-muted-foreground",
};

function formatAmount(amountCents: number, currency: string): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}

export default function BillingHistoryPage() {
  const t = useTranslations("billing");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/billing/history")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setTransactions(json.data as Transaction[]);
        else setError(json.error ?? "Error loading history");
      })
      .catch(() => setError(tCommon("loadError")))
      .finally(() => setLoading(false));
  }, [tCommon]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("historyTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("historySubtitle")}</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/billing")}
          className="rounded-lg border border-border px-4 py-2 text-sm text-foreground/90 hover:bg-muted/40 transition-colors"
        >
          {t("backToBilling")}
        </button>
      </div>

      {loading && (
        <div className="text-center py-10 text-muted-foreground/80">{tCommon("loading")}</div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && !error && transactions.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground/80">
          {t("noHistory")}
        </div>
      )}

      {!loading && transactions.length > 0 && (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("historyPlan")}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("historyAmount")}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("historyStatus")}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("historyProvider")}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("historyDate")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{tx.planId}</td>
                  <td className="px-4 py-3 text-foreground">
                    {formatAmount(tx.amountCents, tx.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[tx.status] ?? "bg-muted text-muted-foreground"}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{tx.provider}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(tx.paidAt ?? tx.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
