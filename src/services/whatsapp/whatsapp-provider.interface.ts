export interface WhatsAppTemplateParams {
  [key: string]: string;
}

export interface WhatsAppResult {
  messageId: string;
  status: "sent" | "failed";
  error?: string;
}

export interface WhatsAppProvider {
  sendTemplate(
    to: string,
    templateName: string,
    languageCode: string,
    params: WhatsAppTemplateParams
  ): Promise<WhatsAppResult>;
}
