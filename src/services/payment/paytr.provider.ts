import type { PaymentProvider, PaymentResult } from "./payment-provider.interface";

// Stub - configure PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY, PAYTR_MERCHANT_SALT in .env to activate
export class PayTRProvider implements PaymentProvider {
  readonly name = "PAYTR";

  isConfigured(): boolean {
    return !!(
      process.env.PAYTR_MERCHANT_ID &&
      process.env.PAYTR_MERCHANT_KEY &&
      process.env.PAYTR_MERCHANT_SALT
    );
  }

  async createPayment(_params: {
    amountCents: number;
    currency: string;
    description: string;
    customerEmail: string;
    metadata?: Record<string, string>;
    idempotencyKey?: string;
  }): Promise<PaymentResult> {
    throw new Error("PayTR entegrasyonu henüz aktif değil. PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY ve PAYTR_MERCHANT_SALT ortam değişkenlerini ayarlayın.");
  }
}
