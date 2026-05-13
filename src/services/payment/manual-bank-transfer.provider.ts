import type { PaymentProvider, PaymentResult } from "./payment-provider.interface";

export class ManualBankTransferProvider implements PaymentProvider {
  readonly name = "MANUAL_BANK_TRANSFER";

  isConfigured(): boolean {
    return true;
  }

  async createPayment(params: {
    amountCents: number;
    currency: string;
    description: string;
    customerEmail: string;
    metadata?: Record<string, string>;
  }): Promise<PaymentResult> {
    const iban = process.env.BANK_TRANSFER_IBAN ?? "";
    const holder = process.env.BANK_TRANSFER_ACCOUNT_HOLDER ?? "";
    const bank = process.env.BANK_TRANSFER_BANK_NAME ?? "";
    const prefix = process.env.BANK_TRANSFER_DESCRIPTION_PREFIX ?? "RANDEVO";

    const reference = `${prefix}-${Date.now()}`;
    const amount = (params.amountCents / 100).toFixed(2);

    const instructions = [
      `Tutar: ${amount} ${params.currency}`,
      iban ? `IBAN: ${iban}` : "",
      holder ? `Alıcı: ${holder}` : "",
      bank ? `Banka: ${bank}` : "",
      `Açıklama: ${reference}`,
      `E-posta: ${params.customerEmail}`,
    ]
      .filter(Boolean)
      .join("\n");

    return {
      status: "pending",
      providerReference: reference,
      instructions,
    };
  }
}

