import type { WhatsAppTextProvider, WhatsAppTextResult } from "./whatsapp-text-provider.interface";

export class FakeWhatsAppTextProvider implements WhatsAppTextProvider {
  async sendTextMessage(
    to: string,
    body: string,
    fromNumberId: string
  ): Promise<WhatsAppTextResult> {
    const messageId = `fake_txt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    console.log(
      `[FAKE WA TEXT] To: ${to} | From: ${fromNumberId} | MessageId: ${messageId}\nBody: ${body}`
    );
    return { success: true, messageId };
  }
}
