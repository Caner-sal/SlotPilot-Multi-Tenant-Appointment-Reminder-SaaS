import type { MarketingData } from "../tr/marketing";

export function buildMarketingSMSEN(data: MarketingData): string {
  const unsubscribe = data.unsubscribeNote ?? "Reply STOP to unsubscribe.";
  return `${data.businessName}: ${data.message} ${unsubscribe}`;
}

export function buildMarketingEmailEN(data: MarketingData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `News from ${data.businessName}`;
  const unsubscribe = data.unsubscribeNote ?? "You can unsubscribe from these emails at any time.";

  const text = [`Hi ${data.customerName},`, "", data.message, "", unsubscribe].join("\n");
  const html = `
    <p>Hi <strong>${data.customerName}</strong>,</p>
    <p>${data.message}</p>
    <hr/>
    <p style="font-size:12px;color:#888">${unsubscribe}</p>
  `;

  return { subject, text, html };
}
