import type { WhatsAppProvider, WhatsAppResult, WhatsAppTemplateParams } from "./whatsapp-provider.interface";

// Prerequisites for production use:
// 1. Meta Business account with verified WhatsApp Business API access
// 2. Approved message templates (template approval can take 24-48 hours)
// 3. Phone number registered and verified in Meta Business Manager
// 4. Webhook endpoint for delivery status updates (GET /api/webhooks/whatsapp)

interface MetaMessageResponse {
  messages?: Array<{ id: string }>;
  error?: { message: string; code: number };
}

export class MetaWhatsAppProvider implements WhatsAppProvider {
  private accessToken: string;
  private phoneNumberId: string;

  constructor() {
    this.accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN ?? "";
    this.phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID ?? "";

    if (!this.accessToken || !this.phoneNumberId) {
      throw new Error("Meta WhatsApp credentials not configured (META_WHATSAPP_ACCESS_TOKEN, META_WHATSAPP_PHONE_NUMBER_ID required)");
    }
  }

  async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string,
    params: WhatsAppTemplateParams
  ): Promise<WhatsAppResult> {
    const url = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;

    const components = Object.keys(params).length > 0
      ? [{
          type: "body",
          parameters: Object.values(params).map((v) => ({ type: "text", text: v })),
        }]
      : [];

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "template",
          template: {
            name: templateName,
            language: { code: languageCode },
            components,
          },
        }),
      });

      const data = await res.json() as MetaMessageResponse;

      if (!res.ok || data.error) {
        return { messageId: "", status: "failed", error: data.error?.message ?? "Meta API error" };
      }

      return { messageId: data.messages?.[0]?.id ?? "", status: "sent" };
    } catch (err) {
      return { messageId: "", status: "failed", error: String(err) };
    }
  }
}
