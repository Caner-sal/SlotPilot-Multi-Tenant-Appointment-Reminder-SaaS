import type { AccountingProvider } from "./accounting-provider.interface";
import { FakeAccountingProvider, XeroAccountingProvider, QuickBooksAccountingProvider } from "./fake-accounting.provider";

let instance: AccountingProvider | null = null;

export function getAccountingProvider(): AccountingProvider {
  if (instance) return instance;

  const provider = process.env.ACCOUNTING_PROVIDER ?? "NONE";

  if (provider === "XERO") {
    instance = new XeroAccountingProvider();
  } else if (provider === "QUICKBOOKS") {
    instance = new QuickBooksAccountingProvider();
  } else {
    instance = new FakeAccountingProvider();
  }

  return instance;
}

export function resetAccountingProvider(): void {
  instance = null;
}
