import type { MarketingData } from "../tr/marketing";

export function buildMarketingSMSDE(data: MarketingData): string {
  const unsubscribe = data.unsubscribeNote ?? "Antworten Sie mit STOP, um sich abzumelden.";
  return `${data.businessName}: ${data.message} ${unsubscribe}`;
}

export function buildMarketingEmailDE(data: MarketingData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `Neuigkeiten von ${data.businessName}`;
  const unsubscribe = data.unsubscribeNote ?? "Sie koennen diese E-Mails jederzeit abbestellen.";

  const text = [`Hallo ${data.customerName},`, "", data.message, "", unsubscribe].join("\n");
  const html = `
    <p>Hallo <strong>${data.customerName}</strong>,</p>
    <p>${data.message}</p>
    <hr/>
    <p style="font-size:12px;color:#888">${unsubscribe}</p>
  `;

  return { subject, text, html };
}
