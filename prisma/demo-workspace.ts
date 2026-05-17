type SubscriptionPlan = "FREE" | "STARTER" | "PRO";
type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "PAST_DUE" | "TRIALING" | "INCOMPLETE";

const SubscriptionPlan = {
  FREE: "FREE",
  STARTER: "STARTER",
  PRO: "PRO",
} as const;

const SubscriptionStatus = {
  ACTIVE: "ACTIVE",
  CANCELLED: "CANCELLED",
  PAST_DUE: "PAST_DUE",
  TRIALING: "TRIALING",
  INCOMPLETE: "INCOMPLETE",
} as const;

function resolveDemoPassword(envKey: string, fallback: string): string {
  const fromEnv = process.env[envKey]?.trim();
  if (fromEnv && fromEnv.length >= 8) {
    return fromEnv;
  }
  return fallback;
}

export const DEMO_WORKSPACE = {
  superadmin: {
    email: "admin@randevo.app",
    password: resolveDemoPassword(
      "DEMO_SUPERADMIN_PASSWORD",
      "demo-superadmin-local-only"
    ),
  },
  owner: {
    email: "demo@randevo.app",
    password: resolveDemoPassword("DEMO_OWNER_PASSWORD", "demo-owner-local-only"),
  },
  organization: {
    slug: "barber-demo",
    name: "Berber Demo",
  },
  ids: {
    location: "loc-barber-main",
    serviceHaircut: "service-haircut-demo",
    serviceBeard: "service-beard-demo",
    serviceCombo: "service-combo-demo",
    staffAli: "staff-ali-demo",
  },
  subscription: {
    plan: SubscriptionPlan.FREE,
    status: SubscriptionStatus.ACTIVE,
  },
} as const;

export type DemoWorkspaceSafetyInput = {
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  paymentCountDelta: number;
};

export function validateDemoWorkspaceSafety(input: DemoWorkspaceSafetyInput) {
  const issues: string[] = [];
  if (input.subscriptionPlan !== SubscriptionPlan.FREE) {
    issues.push("subscriptionPlan must remain FREE");
  }
  if (input.subscriptionStatus !== SubscriptionStatus.ACTIVE) {
    issues.push("subscriptionStatus must remain ACTIVE");
  }
  if (input.stripeCustomerId) {
    issues.push("stripeCustomerId must not be set for demo workspace");
  }
  if (input.stripeSubscriptionId) {
    issues.push("stripeSubscriptionId must not be set for demo workspace");
  }
  if (input.paymentCountDelta > 0) {
    issues.push("seed process created payment rows for demo workspace");
  }
  return {
    ok: issues.length === 0,
    issues,
  };
}
