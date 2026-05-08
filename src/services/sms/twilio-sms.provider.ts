import type { SmsProvider, SmsResult } from "./sms-provider.interface";

// Cost note: Twilio charges per message (~$0.0079/SMS in US, varies by country).
// Rate limit: by default Twilio allows 1 message/second per sending number.
// Always check country-specific regulations before enabling in production.

export class TwilioSmsProvider implements SmsProvider {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID ?? "";
    this.authToken = process.env.TWILIO_AUTH_TOKEN ?? "";
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER ?? "";

    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      throw new Error("Twilio credentials not configured (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER required)");
    }
  }

  async sendSms(to: string, body: string): Promise<SmsResult> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
    const credentials = Buffer.from(`${this.accountSid}:${this.authToken}`).toString("base64");

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: to, From: this.fromNumber, Body: body }).toString(),
      });

      const data = await res.json() as { sid?: string; status?: string; message?: string };

      if (!res.ok) {
        return { messageId: "", status: "failed", error: data.message ?? "Twilio API error" };
      }

      return { messageId: data.sid ?? "", status: "sent" };
    } catch (err) {
      return { messageId: "", status: "failed", error: String(err) };
    }
  }
}
