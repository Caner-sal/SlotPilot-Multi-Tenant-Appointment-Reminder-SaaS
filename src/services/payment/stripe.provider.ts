import type { PaymentProvider, PaymentResult } from "./payment-provider.interface";

// Wrapper around existing Stripe integration - used when PAYMENT_PROVIDER=STRIPE
export class StripeProvider implements PaymentProvider {
  readonly name = "STRIPE";

  isConfigured(): boolean {
    return !!(process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("placeholder"));
  }

  async createPayment(params: {
    amountCents: number;
    currency: string;
    description: string;
    customerEmail: string;
    metadata?: Record<string, string>;
    idempotencyKey?: string;
  }): Promise<PaymentResult> {
    if (!this.isConfigured()) {
      throw new Error("Stripe yapılandırılmamış. STRIPE_SECRET_KEY ortam değişkenini ayarlayın.");
    }

    return {
      status: "REQUIRES_ACTION",
      providerReference: `stripe_pending_${Date.now()}`,
      instructions: `${params.description} için Stripe ödeme sayfasına yönlendiriliyorsunuz.`,
    };
  }
}
