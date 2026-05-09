import type { PaymentProvider, PaymentResult } from "./payment-provider.interface";

// Stub — configure IYZICO_API_KEY and IYZICO_SECRET_KEY in .env to activate
export class IyzicoProvider implements PaymentProvider {
  readonly name = "IYZICO";

  isConfigured(): boolean {
    return !!(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY);
  }

  async createPayment(_params: {
    amountCents: number;
    currency: string;
    description: string;
    customerEmail: string;
    metadata?: Record<string, string>;
  }): Promise<PaymentResult> {
    throw new Error("iyzico entegrasyonu henüz aktif değil. IYZICO_API_KEY ve IYZICO_SECRET_KEY ortam değişkenlerini ayarlayın.");
  }
}
