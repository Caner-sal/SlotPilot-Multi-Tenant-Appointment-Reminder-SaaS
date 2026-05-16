"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

function FailureContent() {
  const t = useTranslations("billing");
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  const reason = searchParams.get("reason");

  return (
    <div className="max-w-lg mx-auto mt-16 text-center space-y-6">
      <div className="mx-auto w-16 h-16 rounded-full bg-destructive/15 border border-destructive/20 flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-destructive">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("paymentFailed")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {reason ?? t("paymentFailedDesc")}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 text-left space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">{t("whatToDoNow")}</p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">→</span>
            {t("failureHint1")}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">→</span>
            {t("failureHint2")}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">→</span>
            {t("failureHint3")}
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
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
    </div>
  );
}

export default function FailurePage() {
  const tCommon = useTranslations("common");
  return (
    <Suspense fallback={<div className="p-10 text-center text-muted-foreground/80">{tCommon("loading")}</div>}>
      <FailureContent />
    </Suspense>
  );
}
