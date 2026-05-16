import type {
  PaymentProvider,
  CreatePaymentParams,
  PaymentResult,
  SubscriptionCheckoutInput,
  SubscriptionCheckoutResult,
} from "./payment-provider.interface";

// Only used in development/test — never in production
export class FakePaymentProvider implements PaymentProvider {
  readonly name = "FAKE";

  isConfigured(): boolean {
    return process.env.NODE_ENV !== "production";
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    return {
      status: "PAID",
      providerReference: `fake_pay_${Date.now()}`,
      rawSafe: { fake: true, description: params.description },
    };
  }

  async createSubscriptionCheckout(
    input: SubscriptionCheckoutInput
  ): Promise<SubscriptionCheckoutResult> {
    const providerSessionId = `fake_session_${input.conversationId}`;
    // Redirect to success page so the checkout flow completes end-to-end
    const checkoutUrl =
      input.successUrl.includes("?")
        ? `${input.successUrl}&fake=1&plan=${input.planId}&conversationId=${input.conversationId}`
        : `${input.successUrl}?fake=1&plan=${input.planId}&conversationId=${input.conversationId}`;

    return {
      provider: "FAKE",
      checkoutUrl,
      providerSessionId,
      conversationId: input.conversationId,
      mode: "test",
    };
  }
}
