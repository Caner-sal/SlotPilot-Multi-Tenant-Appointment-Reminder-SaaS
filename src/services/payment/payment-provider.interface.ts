export interface PaymentResult {
  status: "success" | "pending" | "failed";
  providerReference?: string;
  instructions?: string;
}

export interface PaymentProvider {
  name: string;
  isConfigured(): boolean;
  createPayment(params: {
    amountCents: number;
    currency: string;
    description: string;
    customerEmail: string;
    metadata?: Record<string, string>;
  }): Promise<PaymentResult>;
}
