"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { formatPlanPriceTR, getPlanTR, type TurkeyPlanId } from "@/config/pricing.tr";
import { isUpgradablePlan } from "@/config/billing-plans";

function CheckoutContent() {
  const t = useTranslations("billing");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();

  const planParam = searchParams.get("plan")?.toUpperCase() ?? "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Loading state — session henüz hazır değil
  if (sessionStatus === "loading") {
    return (
      <div className="max-w-lg mx-auto mt-16 flex items-center justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  // Unauthenticated — login'e yönlendir
  if (sessionStatus === "unauthenticated") {
    const callbackUrl = encodeURIComponent(`/dashboard/billing/checkout?plan=${planParam}`);
    router.replace(`/login?callbackUrl=${callbackUrl}`);
    return null;
  }

  // Redirect staff users
  if (session?.user?.appRole === "STAFF_MEMBER") {
    router.replace("/dashboard");
    return null;
  }

  // Validate plan param
  if (!isUpgradablePlan(planParam)) {
    return (
      <div className="max-w-lg mx-auto mt-16 rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-destructive font-medium mb-2">{t("invalidPlan")}</p>
        <p className="text-sm text-muted-foreground mb-6">{t("invalidPlanDesc")}</p>
        <button
          onClick={() => router.push("/dashboard/billing")}
          className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted/40 transition-colors"
        >
          {t("backToBilling")}
        </button>
      </div>
    );
  }

  const selectedPlanId = planParam as TurkeyPlanId;
  const selectedPlan = getPlanTR(selectedPlanId);

  async function handleProceed() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlanId }),
      });
      const json = await res.json() as {
        data?: { url?: string; mode?: string; message?: string; checkoutUrl?: string };
        error?: string;
        code?: string;
      };

      if (!res.ok) {
        if (res.status === 401) {
          const callbackUrl = encodeURIComponent(`/dashboard/billing/checkout?plan=${selectedPlanId}`);
          router.replace(`/login?callbackUrl=${callbackUrl}`);
          return;
        }
        if (res.status === 403) {
          setError(t("checkoutForbidden"));
          return;
        }
        if (res.status === 404 && json.code === "ACTIVE_ORGANIZATION_REQUIRED") {
          setError(t("checkoutOrgRequired"));
          return;
        }
        setError(json.error ?? t("checkoutError"));
        return;
      }

      if (json.data?.url) {
        window.location.href = json.data.url;
        return;
      }
      if (json.data?.checkoutUrl) {
        window.location.href = json.data.checkoutUrl;
        return;
      }
      if (json.data?.mode === "test") {
        // Fake provider: simulate success
        router.push("/dashboard/billing/success?fake=1&plan=" + selectedPlanId);
        return;
      }
      setError(t("checkoutError"));
    } catch {
      setError(t("networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-8 space-y-6">
      <div>
        <button
          onClick={() => router.push("/dashboard/billing")}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          ← {t("backToBilling")}
        </button>
        <h1 className="mt-4 text-2xl font-bold text-foreground">{t("checkoutTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("checkoutSubtitle")}</p>
      </div>

      {/* Selected plan summary */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
              {t("selectedPlan")}
            </p>
            <h2 className="mt-1 text-xl font-bold text-foreground">{selectedPlan.nameTR}</h2>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{formatPlanPriceTR(selectedPlan)}</p>
            <p className="text-xs text-muted-foreground">{t("perMonth")}</p>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 mb-3">
            {t("includedFeatures")}
          </p>
          <ul className="space-y-2">
            {selectedPlan.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="shrink-0 text-green-500">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-border pt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("billingCycle")}</span>
            <span className="font-medium text-foreground">{t("monthly")}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("total")}</span>
            <span className="font-bold text-foreground">{formatPlanPriceTR(selectedPlan)}</span>
          </div>
        </div>
      </div>

      {/* Security note */}
      <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 flex items-start gap-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5 text-muted-foreground">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <p className="text-xs text-muted-foreground">{t("securePaymentNote")}</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => router.push("/dashboard/billing")}
          className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground/90 hover:bg-muted/40 transition-colors"
        >
          {tCommon("cancel")}
        </button>
        <button
          onClick={() => void handleProceed()}
          disabled={loading}
          className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {loading ? t("processingPayment") : t("proceedToPayment")}
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const tCommon = useTranslations("common");
  return (
    <Suspense fallback={<div className="p-10 text-center text-muted-foreground/80">{tCommon("loading")}</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
