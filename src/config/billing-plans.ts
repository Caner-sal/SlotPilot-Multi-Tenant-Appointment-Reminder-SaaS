// Central billing plan config — re-exports pricing.tr + adds checkout helpers
export {
  TURKEY_PLANS,
  formatPlanPriceTR,
  getPlanTR,
  type TurkeyPlan,
  type TurkeyPlanId,
} from "./pricing.tr";

export const UPGRADABLE_PLANS = ["STARTER", "PRO"] as const;
export type UpgradablePlanId = (typeof UPGRADABLE_PLANS)[number];

export function isUpgradablePlan(planId: string): planId is UpgradablePlanId {
  return (UPGRADABLE_PLANS as readonly string[]).includes(planId);
}

export function getCheckoutUrl(planId: UpgradablePlanId): string {
  return `/dashboard/billing/checkout?plan=${planId}`;
}
