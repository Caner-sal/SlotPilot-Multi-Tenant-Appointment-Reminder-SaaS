import type { PaymentProvider } from "./payment-provider.interface";
import { ManualBankTransferProvider } from "./manual-bank-transfer.provider";
import { IyzicoProvider } from "./iyzico.provider";
import { PayTRProvider } from "./paytr.provider";
import { ParamProvider } from "./param.provider";
import { StripeProvider } from "./stripe.provider";
import { FakePaymentProvider } from "./fake-payment.provider";

let _instance: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (_instance) return _instance;

  const provider = (process.env.PAYMENT_PROVIDER ?? "MANUAL_BANK_TRANSFER").toUpperCase();

  switch (provider) {
    case "FAKE":
      _instance = new FakePaymentProvider();
      break;
    case "IYZICO":
      _instance = new IyzicoProvider();
      break;
    case "PAYTR":
      _instance = new PayTRProvider();
      break;
    case "PARAM":
      _instance = new ParamProvider();
      break;
    case "STRIPE":
      _instance = new StripeProvider();
      break;
    case "MANUAL_BANK_TRANSFER":
    default:
      _instance = new ManualBankTransferProvider();
      break;
  }

  return _instance;
}

// For testing purposes — reset singleton
export function resetPaymentProvider(): void {
  _instance = null;
}
