export interface MarketingData {
  customerName: string;
  businessName: string;
  message: string;
  unsubscribeNote?: string;
}

export function buildMarketingSMSTR(data: MarketingData): string {
  const unsubscribe = data.unsubscribeNote ?? "Abonelikten çıkmak için IPTAL yazın.";
  return `${data.businessName}: ${data.message} ${unsubscribe}`;
}

export function buildMarketingEmailTR(data: MarketingData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `${data.businessName}'dan Duyuru`;
  const unsubscribe = data.unsubscribeNote ?? "Bu e-postayı almak istemiyorsanız abonelikten çıkabilirsiniz.";

  const text = [
    `Merhaba ${data.customerName},`,
    "",
    data.message,
    "",
    unsubscribe,
  ].join("\n");

  const html = `
    <p>Merhaba <strong>${data.customerName}</strong>,</p>
    <p>${data.message}</p>
    <hr/>
    <p style="font-size:12px;color:#888">${unsubscribe}</p>
  `;

  return { subject, text, html };
}

export function requiresMarketingConsent(): true {
  return true;
}
