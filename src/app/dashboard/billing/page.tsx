"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { TURKEY_PLANS, formatPlanPriceTR, getPlanTR, type TurkeyPlanId } from "@/config/pricing.tr";

interface PlanLimits {
  maxStaff: number;
  maxAppointmentsPerMonth: number;
  emailReminders: boolean;
  advancedAnalytics: boolean;
}

interface SubscriptionData {
  plan: TurkeyPlanId;
  limits: PlanLimits;
  subscription: { status: string } | null;
}

const PLAN_BADGE_COLORS: Record<TurkeyPlanId, string> = {
  FREE: "bg-muted text-muted-foreground",
  STARTER: "bg-blue-100 text-blue-700",
  PRO: "bg-purple-100 text-purple-700",
  ENTERPRISE: "bg-slate-100 text-slate-700",
};

function isUpgradablePlan(planId: TurkeyPlanId): planId is "STARTER" | "PRO" {
  return planId === "STARTER" || planId === "PRO";
}

function BillingContent() {
  const t = useTranslations("billing");
  const tCommon = useTranslations("common");
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<"STARTER" | "PRO" | null>(null);
  const [demoMessage, setDemoMessage] = useState("");
  const searchParams = useSearchParams();

  const success = searchParams.get("success") === "true";
  const cancelled = searchParams.get("cancelled") === "true";

  useEffect(() => {
    fetch("/api/billing/subscription")
      .then((r) => r.json())
      .then((json) => setData(json.data ?? null))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpgrade(plan: "STARTER" | "PRO") {
    setUpgrading(plan);
    setDemoMessage("");
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json();
      if (json.data?.url) {
        window.location.href = json.data.url;
      } else if (json.data?.mode === "test") {
        setDemoMessage(json.data.message ?? "Demo modu: Stripe yapÄ±landÄ±rÄ±lmamÄ±ÅŸ.");
      }
    } finally {
      setUpgrading(null);
    }
  }

  const planCards = useMemo(() => {
    return (["FREE", "STARTER", "PRO"] as const).map((id) => {
      const plan = TURKEY_PLANS[id];
      return {
        id,
        label: plan.nameTR,
        price: id === "FREE" ? "â‚º0/ay" : formatPlanPriceTR(plan),
        highlight: id === "STARTER",
        features: plan.features,
      };
    });
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-muted-foreground/80">{t("loading")}</div>;
  }

  const currentPlan: TurkeyPlanId = data?.plan ?? "FREE";
  const currentPlanInfo = getPlanTR(currentPlan);
  const limits = data?.limits;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {t("updateSuccess")}
        </div>
      )}

      {cancelled && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
          {t("paymentCancelled")}
        </div>
      )}

      {demoMessage && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <strong>{t("demoMode")}</strong> {demoMessage}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">{t("currentPlan")}</p>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-foreground">{currentPlanInfo.nameTR}</h2>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PLAN_BADGE_COLORS[currentPlan]}`}>
                {currentPlan}
              </span>
            </div>
          </div>
        </div>
        {limits && (
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="mb-1 text-xs text-muted-foreground/80">{t("maxStaff")}</p>
              <p className="font-semibold text-foreground">{limits.maxStaff === Infinity ? t("unlimited") : limits.maxStaff}</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="mb-1 text-xs text-muted-foreground/80">{t("appointmentsPerMonth")}</p>
              <p className="font-semibold text-foreground">
                {limits.maxAppointmentsPerMonth === Infinity ? t("unlimited") : limits.maxAppointmentsPerMonth}
              </p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="mb-1 text-xs text-muted-foreground/80">{t("emailReminder")}</p>
              <p className="font-semibold text-foreground">{limits.emailReminders ? tCommon("yes") : tCommon("no")}</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="mb-1 text-xs text-muted-foreground/80">{t("advancedAnalytics")}</p>
              <p className="font-semibold text-foreground">{limits.advancedAnalytics ? tCommon("yes") : tCommon("no")}</p>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">{t("plans")}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {planCards.map((plan) => {
            const isCurrent = plan.id === currentPlan;
            const paidPlan = isUpgradablePlan(plan.id) ? plan.id : null;
            return (
              <div
                key={plan.id}
                className={`flex flex-col rounded-xl border bg-card p-6 shadow-sm ${
                  plan.highlight ? "border-blue-400" : "border-border"
                } ${isCurrent ? "ring-2 ring-blue-500" : ""}`}
              >
                {plan.highlight && (
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-600">{t("mostPopular")}</div>
                )}
                {isCurrent && (
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-green-600">{t("currentPlan")}</div>
                )}
                <h3 className="text-xl font-bold text-foreground">{plan.label}</h3>
                <p className="mt-1 text-2xl font-bold text-foreground">{plan.price}</p>
                <ul className="mt-4 flex-1 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="shrink-0 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  {isCurrent ? (
                    <div className="rounded-lg border border-border py-2 text-center text-sm text-muted-foreground">{t("activePlan")}</div>
                  ) : plan.id === "FREE" ? (
                    <div className="py-2 text-center text-sm text-muted-foreground/80">{t("downgradeContact")}</div>
                  ) : paidPlan ? (
                    <button
                      onClick={() => handleUpgrade(paidPlan)}
                      disabled={!!upgrading}
                      className={`w-full rounded-lg py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
                        plan.highlight
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "border border-border text-foreground/90 hover:border-border hover:bg-muted/40"
                      }`}
                    >
                      {upgrading === plan.id ? t("redirecting") : `${plan.label} ${t("switchTo")}`}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  const tCommon = useTranslations("common");
  return (
    <Suspense fallback={<div className="p-10 text-center text-muted-foreground/80">{tCommon("loading")}</div>}>
      <BillingContent />
    </Suspense>
  );
}

