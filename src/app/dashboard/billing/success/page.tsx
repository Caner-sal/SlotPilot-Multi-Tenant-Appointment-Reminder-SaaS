"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

type ConfirmStatus = "loading" | "active" | "pending" | "failed" | "error";

interface ConfirmData {
  transactionStatus: string;
  subscriptionStatus: string | null;
  plan: string;
  paidAt: string | null;
  failureReason?: string | null;
}

function SuccessContent() {
  const t = useTranslations("billing");
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversationId");
  const isFake = searchParams.get("fake") === "1";
  const plan = searchParams.get("plan");

  const [status, setStatus] = useState<ConfirmStatus>("loading");
  const [data, setData] = useState<ConfirmData | null>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!conversationId) {
      setStatus("pending");
      return;
    }

    const params = new URLSearchParams({ conversationId });
    if (isFake) params.set("fake", "1");

    async function poll() {
      try {
        const res = await fetch(`/api/billing/confirm?${params.toString()}`);
        if (!res.ok) { setStatus("error"); return; }
        const json = await res.json() as { data?: ConfirmData; error?: string };
        if (!json.data) { setStatus("error"); return; }

        setData(json.data);

        if (json.data.transactionStatus === "PAID" && json.data.subscriptionStatus === "ACTIVE") {
          setStatus("active");
        } else if (json.data.transactionStatus === "FAILED") {
          setStatus("failed");
        } else {
          // Still pending — try again (max 8 attempts ~16s)
          setAttempts((a) => {
            if (a < 8) {
              setTimeout(() => void poll(), 2000);
              return a + 1;
            }
            setStatus("pending");
            return a;
          });
        }
      } catch {
        setStatus("error");
      }
    }

    void poll();
  }, [conversationId, isFake]);

  return (
    <div className="max-w-lg mx-auto mt-16 text-center space-y-6">
      {status === "loading" && (
        <>
          <div className="mx-auto w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <h1 className="text-xl font-bold text-foreground">{t("verifyingPayment")}</h1>
          <p className="text-sm text-muted-foreground">{t("verifyingPaymentDesc")}</p>
        </>
      )}

      {status === "active" && (
        <>
          <div className="mx-auto w-16 h-16 rounded-full bg-green-500/15 border border-green-500/20 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-400">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t("paymentSuccess")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("planActivated", { plan: data?.plan ?? "" })}
          </p>
          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              {t("goToDashboard")}
            </button>
            <button
              onClick={() => router.push("/dashboard/billing/history")}
              className="w-full rounded-lg border border-border py-2.5 text-sm font-medium text-foreground/90 hover:bg-muted/40 transition-colors"
            >
              {t("viewHistory")}
            </button>
          </div>
        </>
      )}

      {status === "pending" && (
        <>
          <div className="mx-auto w-16 h-16 rounded-full bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-400">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-foreground">{t("paymentPending")}</h1>
          <p className="text-sm text-muted-foreground">{t("paymentPendingDesc")}</p>
          <button
            onClick={() => router.push("/dashboard/billing")}
            className="w-full rounded-lg border border-border py-2.5 text-sm font-medium text-foreground/90 hover:bg-muted/40 transition-colors"
          >
            {t("backToBilling")}
          </button>
        </>
      )}

      {(status === "failed" || status === "error") && (
        <>
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/15 border border-destructive/20 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-destructive">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-foreground">{t("paymentFailed")}</h1>
          {data?.failureReason && (
            <p className="text-sm text-muted-foreground">{data.failureReason}</p>
          )}
          <div className="flex flex-col gap-3 pt-4">
            {plan && (
              <button
                onClick={() => router.push(`/dashboard/billing/checkout?plan=${plan}`)}
                className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                {t("tryAgain")}
              </button>
            )}
            <button
              onClick={() => router.push("/dashboard/billing")}
              className="w-full rounded-lg border border-border py-2.5 text-sm font-medium text-foreground/90 hover:bg-muted/40 transition-colors"
            >
              {t("backToBilling")}
            </button>
          </div>
        </>
      )}

      {attempts > 5 && status === "loading" && (
        <p className="text-xs text-muted-foreground">{t("verificationDelayed")}</p>
      )}
    </div>
  );
}

export default function SuccessPage() {
  const tCommon = useTranslations("common");
  return (
    <Suspense fallback={<div className="p-10 text-center text-muted-foreground/80">{tCommon("loading")}</div>}>
      <SuccessContent />
    </Suspense>
  );
}
