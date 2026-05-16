import type { PaymentLifecycleStatus } from "./payment-provider.interface";

const canonicalStatuses = new Set<PaymentLifecycleStatus>([
  "PENDING",
  "REQUIRES_ACTION",
  "PAID",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
  "MANUAL_REVIEW",
]);

export type CanonicalPaymentStatus =
  | "PENDING"
  | "REQUIRES_ACTION"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED"
  | "MANUAL_REVIEW";

export function normalizePaymentStatus(status: PaymentLifecycleStatus | string): CanonicalPaymentStatus {
  if (canonicalStatuses.has(status as PaymentLifecycleStatus)) {
    return status as CanonicalPaymentStatus;
  }

  const normalized = status.trim().toLowerCase();

  switch (normalized) {
    case "pending":
      return "PENDING";
    case "requires_action":
    case "requires-action":
    case "requiresaction":
      return "REQUIRES_ACTION";
    case "paid":
    case "success":
      return "PAID";
    case "failed":
      return "FAILED";
    case "cancelled":
    case "canceled":
      return "CANCELLED";
    case "refunded":
      return "REFUNDED";
    case "manual_review":
    case "manual-review":
    case "manualreview":
      return "MANUAL_REVIEW";
    default:
      return "PENDING";
  }
}
