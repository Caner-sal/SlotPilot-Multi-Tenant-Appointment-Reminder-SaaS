import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { validateDemoWorkspaceSafety } from "../../prisma/demo-workspace";

describe("demo workspace safety assertions", () => {
  it("passes when demo invariants are safe", () => {
    const result = validateDemoWorkspaceSafety({
      subscriptionPlan: SubscriptionPlan.FREE,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      paymentCountDelta: 0,
    });

    expect(result.ok).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it("fails when subscription/payment invariants are violated", () => {
    const result = validateDemoWorkspaceSafety({
      subscriptionPlan: SubscriptionPlan.PRO,
      subscriptionStatus: SubscriptionStatus.CANCELLED,
      stripeCustomerId: "cus_live_123",
      stripeSubscriptionId: "sub_live_123",
      paymentCountDelta: 1,
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        "subscriptionPlan must remain FREE",
        "subscriptionStatus must remain ACTIVE",
        "stripeCustomerId must not be set for demo workspace",
        "stripeSubscriptionId must not be set for demo workspace",
        "seed process created payment rows for demo workspace",
      ])
    );
  });
});
