export interface SmsResult {
  messageId: string;
  status: "sent" | "failed";
  error?: string;
}

export interface SmsProvider {
  sendSms(to: string, body: string): Promise<SmsResult>;
}
