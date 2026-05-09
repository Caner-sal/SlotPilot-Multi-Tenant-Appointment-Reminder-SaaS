export interface WhatsAppTextResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface WhatsAppTextProvider {
  sendTextMessage(
    to: string,
    body: string,
    fromNumberId: string
  ): Promise<WhatsAppTextResult>;
}
