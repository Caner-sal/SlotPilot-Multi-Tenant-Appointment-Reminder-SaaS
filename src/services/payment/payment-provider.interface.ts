export type PaymentLifecycleStatus =
  | "PENDING"
  | "REQUIRES_ACTION"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED"
  | "MANUAL_REVIEW"
  | "pending"
  | "success"
  | "failed";

export interface PaymentResult {
  status: PaymentLifecycleStatus;
  providerReference?: string;
  providerEventId?: string;
  checkoutUrl?: string;
  instructions?: string;
  rawSafe?: Record<string, unknown>;
}

export interface CreatePaymentParams {
  amountCents: number;
  currency: string;
  description: string;
  customerEmail: string;
  metadata?: Record<string, string>;
  idempotencyKey?: string;
}

// ─── Subscription Checkout ────────────────────────────────────────────────────

export interface SubscriptionCheckoutInput {
  organizationId: string;
  userId: string;
  planId: string;
  billingCycle: "MONTHLY" | "YEARLY";
  locale: string;
  currency: string;
  amountCents: number;
  conversationId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}

export interface SubscriptionCheckoutResult {
  provider: string;
  checkoutUrl?: string;
  checkoutHtml?: string;
  providerSessionId: string;
  conversationId: string;
  mode?: "test" | "live";
}

export interface PaymentProvider {
  name: string;
  isConfigured(): boolean;
  createPayment(params: CreatePaymentParams): Promise<PaymentResult>;
  createSubscriptionCheckout?(input: SubscriptionCheckoutInput): Promise<SubscriptionCheckoutResult>;
}
