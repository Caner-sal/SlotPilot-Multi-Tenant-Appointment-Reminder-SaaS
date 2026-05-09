import type { WhatsAppTextProvider, WhatsAppTextResult } from "./whatsapp-text-provider.interface";

export class TwilioWhatsAppTextProvider implements WhatsAppTextProvider {
  private readonly accountSid: string;
  private readonly authToken: string;

  constructor() {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) {
      throw new Error(
        "TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required for TwilioWhatsAppTextProvider"
      );
    }
    this.accountSid = sid;
    this.authToken = token;
  }

  async sendTextMessage(
    to: string,
    body: string,
    fromNumberId: string
  ): Promise<WhatsAppTextResult> {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      const credentials = Buffer.from(`${this.accountSid}:${this.authToken}`).toString("base64");

      const params = new URLSearchParams({
        To: `whatsapp:${to}`,
        From: `whatsapp:${fromNumberId}`,
        Body: body,
      });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `Twilio API error ${response.status}: ${errorText}` };
      }

      const data = (await response.json()) as { sid?: string };
      return { success: true, messageId: data.sid ?? "unknown" };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }
}
