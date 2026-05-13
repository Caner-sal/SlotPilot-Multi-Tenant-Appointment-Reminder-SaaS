import type { MarketingData } from "../tr/marketing";

export function buildMarketingSMSNL(data: MarketingData): string {
  const unsubscribe = data.unsubscribeNote ?? "Stuur STOP om uit te schrijven.";
  return `${data.businessName}: ${data.message} ${unsubscribe}`;
}

export function buildMarketingEmailNL(data: MarketingData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `Nieuws van ${data.businessName}`;
  const unsubscribe = data.unsubscribeNote ?? "Je kunt je op elk moment afmelden voor deze e-mails.";

  const text = [`Hoi ${data.customerName},`, "", data.message, "", unsubscribe].join("\n");
  const html = `
    <p>Hoi <strong>${data.customerName}</strong>,</p>
    <p>${data.message}</p>
    <hr/>
    <p style="font-size:12px;color:#888">${unsubscribe}</p>
  `;

  return { subject, text, html };
}
