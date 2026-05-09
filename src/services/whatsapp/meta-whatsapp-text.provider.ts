import type { WhatsAppTextProvider, WhatsAppTextResult } from "./whatsapp-text-provider.interface";

export class MetaWhatsAppTextProvider implements WhatsAppTextProvider {
  private readonly accessToken: string;

  constructor() {
    const token = process.env.META_WHATSAPP_ACCESS_TOKEN;
    if (!token) {
      throw new Error(
        "META_WHATSAPP_ACCESS_TOKEN is required for MetaWhatsAppTextProvider"
      );
    }
    this.accessToken = token;
  }

  async sendTextMessage(
    to: string,
    body: string,
    fromNumberId: string
  ): Promise<WhatsAppTextResult> {
    try {
      const url = `https://graph.facebook.com/v19.0/${fromNumberId}/messages`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `Meta API error ${response.status}: ${errorText}` };
      }

      const data = (await response.json()) as { messages?: { id: string }[] };
      const messageId = data.messages?.[0]?.id ?? "unknown";
      return { success: true, messageId };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }
}
