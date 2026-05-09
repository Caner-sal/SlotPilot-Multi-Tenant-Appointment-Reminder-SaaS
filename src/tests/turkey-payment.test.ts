import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getPaymentProvider, resetPaymentProvider } from "@/services/payment/payment.factory";
import { ManualBankTransferProvider } from "@/services/payment/manual-bank-transfer.provider";
import { IyzicoProvider } from "@/services/payment/iyzico.provider";
import { PayTRProvider } from "@/services/payment/paytr.provider";

beforeEach(() => {
  resetPaymentProvider();
});

afterEach(() => {
  resetPaymentProvider();
  vi.unstubAllEnvs();
});

describe("getPaymentProvider", () => {
  it("defaults to ManualBankTransfer when PAYMENT_PROVIDER is not set", () => {
    vi.stubEnv("PAYMENT_PROVIDER", "");
    const provider = getPaymentProvider();
    expect(provider).toBeInstanceOf(ManualBankTransferProvider);
  });

  it("returns ManualBankTransfer for MANUAL_BANK_TRANSFER", () => {
    vi.stubEnv("PAYMENT_PROVIDER", "MANUAL_BANK_TRANSFER");
    const provider = getPaymentProvider();
    expect(provider).toBeInstanceOf(ManualBankTransferProvider);
  });

  it("returns IyzicoProvider for IYZICO", () => {
    vi.stubEnv("PAYMENT_PROVIDER", "IYZICO");
    const provider = getPaymentProvider();
    expect(provider).toBeInstanceOf(IyzicoProvider);
  });

  it("returns PayTRProvider for PAYTR", () => {
    vi.stubEnv("PAYMENT_PROVIDER", "PAYTR");
    const provider = getPaymentProvider();
    expect(provider).toBeInstanceOf(PayTRProvider);
  });
});

describe("ManualBankTransferProvider", () => {
  it("isConfigured returns true (always available)", () => {
    const p = new ManualBankTransferProvider();
    expect(p.isConfigured()).toBe(true);
  });

  it("createPayment returns pending status", async () => {
    const p = new ManualBankTransferProvider();
    const result = await p.createPayment({
      amountCents: 4000,
      currency: "TRY",
      description: "Test randevu ödemesi",
      customerEmail: "test@example.com",
    });
    expect(result.status).toBe("pending");
    expect(result.providerReference).toBeTruthy();
  });

  it("includes amount in instructions", async () => {
    const p = new ManualBankTransferProvider();
    const result = await p.createPayment({
      amountCents: 5000,
      currency: "TRY",
      description: "Ödeme",
      customerEmail: "musteri@ornek.com",
    });
    expect(result.instructions).toContain("50.00");
    expect(result.instructions).toContain("TRY");
  });
});

describe("IyzicoProvider stub", () => {
  it("isConfigured returns false when keys missing", () => {
    vi.stubEnv("IYZICO_API_KEY", "");
    vi.stubEnv("IYZICO_SECRET_KEY", "");
    const p = new IyzicoProvider();
    expect(p.isConfigured()).toBe(false);
  });

  it("createPayment throws with helpful message", async () => {
    const p = new IyzicoProvider();
    await expect(
      p.createPayment({ amountCents: 100, currency: "TRY", description: "test", customerEmail: "a@b.com" })
    ).rejects.toThrow("iyzico");
  });
});
