import type { AccountingProvider, LedgerEntry } from "./accounting-provider.interface";

export class FakeAccountingProvider implements AccountingProvider {
  name = "FAKE";

  isConfigured(): boolean {
    return true;
  }

  async syncEntry(entry: LedgerEntry): Promise<{ externalId?: string; success: boolean }> {
    console.log(`[FAKE Accounting] syncEntry: ${entry.type} ${entry.amountCents} ${entry.currency} (id: ${entry.id})`);
    return { externalId: `fake_acc_${Date.now()}`, success: true };
  }

  async exportEntries(entries: LedgerEntry[]): Promise<{ success: boolean }> {
    console.log(`[FAKE Accounting] exportEntries: ${entries.length} entries`);
    return { success: true };
  }
}

// Xero placeholder — replace with real Xero OAuth + API implementation when ready
export class XeroAccountingProvider implements AccountingProvider {
  name = "XERO";

  isConfigured(): boolean {
    return !!(process.env.XERO_CLIENT_ID && process.env.XERO_CLIENT_SECRET);
  }

  async syncEntry(entry: LedgerEntry): Promise<{ externalId?: string; success: boolean }> {
    if (!this.isConfigured()) return { success: false };
    // TODO: Implement Xero API sync
    console.log(`[Xero] syncEntry placeholder — implement Xero API integration`);
    return { success: false };
  }

  async exportEntries(entries: LedgerEntry[]): Promise<{ success: boolean }> {
    if (!this.isConfigured()) return { success: false };
    // TODO: Implement Xero bulk export
    console.log(`[Xero] exportEntries placeholder — ${entries.length} entries`);
    return { success: false };
  }
}

// QuickBooks placeholder — replace with real QBO OAuth + API implementation when ready
export class QuickBooksAccountingProvider implements AccountingProvider {
  name = "QUICKBOOKS";

  isConfigured(): boolean {
    return !!(process.env.QUICKBOOKS_CLIENT_ID && process.env.QUICKBOOKS_CLIENT_SECRET);
  }

  async syncEntry(entry: LedgerEntry): Promise<{ externalId?: string; success: boolean }> {
    if (!this.isConfigured()) return { success: false };
    // TODO: Implement QuickBooks API sync
    console.log(`[QuickBooks] syncEntry placeholder — implement QBO API integration`);
    return { success: false };
  }

  async exportEntries(entries: LedgerEntry[]): Promise<{ success: boolean }> {
    if (!this.isConfigured()) return { success: false };
    // TODO: Implement QuickBooks bulk export
    console.log(`[QuickBooks] exportEntries placeholder — ${entries.length} entries`);
    return { success: false };
  }
}
