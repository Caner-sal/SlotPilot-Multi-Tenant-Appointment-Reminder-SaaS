import type { PaymentProvider, PaymentResult } from "./payment-provider.interface";

// Stub - configure PARAM_CLIENT_CODE, PARAM_CLIENT_USERNAME, PARAM_CLIENT_PASSWORD, PARAM_GUID in .env to activate
export class ParamProvider implements PaymentProvider {
  readonly name = "PARAM";

  isConfigured(): boolean {
    return !!(
      process.env.PARAM_CLIENT_CODE &&
      process.env.PARAM_CLIENT_USERNAME &&
      process.env.PARAM_CLIENT_PASSWORD &&
      process.env.PARAM_GUID
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
    throw new Error("Param POS entegrasyonu henüz aktif değil. PARAM_CLIENT_CODE, PARAM_CLIENT_USERNAME, PARAM_CLIENT_PASSWORD ve PARAM_GUID ortam değişkenlerini ayarlayın.");
  }
}
