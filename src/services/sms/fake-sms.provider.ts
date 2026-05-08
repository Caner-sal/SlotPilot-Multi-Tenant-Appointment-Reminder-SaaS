import type { SmsProvider, SmsResult } from "./sms-provider.interface";

export class FakeSmsProvider implements SmsProvider {
  async sendSms(to: string, body: string): Promise<SmsResult> {
    const messageId = `fake_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    console.log(`[FAKE SMS] To: ${to} | Body: ${body} | MessageId: ${messageId}`);
    return { messageId, status: "sent" };
  }
}

export const fakeSmsProvider = new FakeSmsProvider();
