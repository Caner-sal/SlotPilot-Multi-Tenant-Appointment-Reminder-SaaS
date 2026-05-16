import type { MarketingData } from "../tr/marketing";

export function buildMarketingSMSFR(data: MarketingData): string {
  const unsubscribe = data.unsubscribeNote ?? "Repondez STOP pour vous desabonner.";
  return `${data.businessName}: ${data.message} ${unsubscribe}`;
}

export function buildMarketingEmailFR(data: MarketingData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `Actualites de ${data.businessName}`;
  const unsubscribe = data.unsubscribeNote ?? "Vous pouvez vous desabonner de ces e-mails a tout moment.";

  const text = [`Bonjour ${data.customerName},`, "", data.message, "", unsubscribe].join("\n");
  const html = `
    <p>Bonjour <strong>${data.customerName}</strong>,</p>
    <p>${data.message}</p>
    <hr/>
    <p style="font-size:12px;color:#888">${unsubscribe}</p>
  `;

  return { subject, text, html };
}
