import type { WhatsAppProvider, WhatsAppResult, WhatsAppTemplateParams } from "./whatsapp-provider.interface";

export class FakeWhatsAppProvider implements WhatsAppProvider {
  async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string,
    params: WhatsAppTemplateParams
  ): Promise<WhatsAppResult> {
    const messageId = `fake_wa_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    console.log(`[FAKE WhatsApp] To: ${to} | Template: ${templateName} (${languageCode}) | Params:`, params, `| MessageId: ${messageId}`);
    return { messageId, status: "sent" };
  }
}
