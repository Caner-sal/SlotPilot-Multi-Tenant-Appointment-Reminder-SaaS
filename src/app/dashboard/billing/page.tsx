"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface PlanLimits {
  maxStaff: number;
  maxAppointmentsPerMonth: number;
  emailReminders: boolean;
  advancedAnalytics: boolean;
}

interface SubscriptionData {
  plan: string;
  limits: PlanLimits;
  subscription: { status: string } | null;
}

const PLAN_FEATURES: Record<string, { label: string; features: string[]; price: string; highlight: boolean }> = {
  FREE: {
    label: "Free",
    price: "$0/mo",
    highlight: false,
    features: ["1 Staff member", "20 appointments/month", "Public booking page", "Basic dashboard"],
  },
  STARTER: {
    label: "Starter",
    price: "$9/mo",
    highlight: true,
    features: [
      "3 Staff members",
      "300 appointments/month",
      "Email reminders",
      "Analytics dashboard",
      "All Free features",
    ],
  },
  PRO: {
    label: "Pro",
    price: "$19/mo",
    highlight: false,
    features: [
      "Unlimited staff",
      "Unlimited appointments",
      "Advanced analytics",
      "Priority support",
      "All Starter features",
    ],
  },
};

const PLAN_BADGE_COLORS: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-600",
  STARTER: "bg-blue-100 text-blue-700",
  PRO: "bg-purple-100 text-purple-700",
};

function BillingContent() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
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
        setDemoMessage(json.data.message ?? "Demo mode — Stripe not configured.");
      }
    } finally {
      setUpgrading(null);
    }
  }

  if (loading) {
    return <div className="p-10 text-center text-gray-400">Loading billing information...</div>;
  }

  const currentPlan = data?.plan ?? "FREE";
  const limits = data?.limits;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your subscription plan.</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
          Your subscription has been updated successfully. Thank you!
        </div>
      )}

      {cancelled && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-lg px-4 py-3">
          Checkout was cancelled. Your plan has not changed.
        </div>
      )}

      {demoMessage && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg px-4 py-3">
          <strong>Demo Mode:</strong> {demoMessage}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
              Current Plan
            </p>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">{PLAN_FEATURES[currentPlan]?.label}</h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${PLAN_BADGE_COLORS[currentPlan] ?? "bg-gray-100 text-gray-600"}`}
              >
                {currentPlan}
              </span>
            </div>
          </div>
        </div>
        {limits && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Max Staff</p>
              <p className="font-semibold text-gray-900">
                {limits.maxStaff === Infinity ? "Unlimited" : limits.maxStaff}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Appointments/mo</p>
              <p className="font-semibold text-gray-900">
                {limits.maxAppointmentsPerMonth === Infinity ? "Unlimited" : limits.maxAppointmentsPerMonth}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Email Reminders</p>
              <p className="font-semibold text-gray-900">{limits.emailReminders ? "Yes" : "No"}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Advanced Analytics</p>
              <p className="font-semibold text-gray-900">{limits.advancedAnalytics ? "Yes" : "No"}</p>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Plans</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(PLAN_FEATURES).map(([planKey, plan]) => {
            const isCurrent = planKey === currentPlan;
            return (
              <div
                key={planKey}
                className={`bg-white rounded-xl border shadow-sm p-6 flex flex-col ${
                  plan.highlight ? "border-blue-400" : "border-gray-200"
                } ${isCurrent ? "ring-2 ring-blue-500" : ""}`}
              >
                {plan.highlight && (
                  <div className="text-blue-600 text-xs font-semibold uppercase tracking-wider mb-2">
                    Most Popular
                  </div>
                )}
                {isCurrent && (
                  <div className="text-green-600 text-xs font-semibold uppercase tracking-wider mb-2">
                    Current Plan
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900">{plan.label}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{plan.price}</p>
                <ul className="mt-4 space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-500 flex-shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  {isCurrent ? (
                    <div className="text-center text-sm text-gray-500 py-2 border border-gray-200 rounded-lg">
                      Active Plan
                    </div>
                  ) : planKey === "FREE" ? (
                    <div className="text-center text-sm text-gray-400 py-2">
                      Contact support to downgrade
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(planKey as "STARTER" | "PRO")}
                      disabled={!!upgrading}
                      className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 ${
                        plan.highlight
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "border border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {upgrading === planKey ? "Redirecting..." : `Upgrade to ${plan.label}`}
                    </button>
                  )}
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
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-400">Loading...</div>}>
      <BillingContent />
    </Suspense>
  );
}
