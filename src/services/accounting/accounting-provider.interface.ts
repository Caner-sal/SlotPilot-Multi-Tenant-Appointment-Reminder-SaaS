export interface LedgerEntry {
  id: string;
  type: string;
  amountCents: number;
  currency: string;
  appointmentId?: string | null;
  paymentId?: string | null;
  recordedAt: Date;
}

export interface AccountingProvider {
  name: string;
  isConfigured(): boolean;
  syncEntry(entry: LedgerEntry): Promise<{ externalId?: string; success: boolean }>;
  exportEntries(entries: LedgerEntry[]): Promise<{ success: boolean }>;
}
