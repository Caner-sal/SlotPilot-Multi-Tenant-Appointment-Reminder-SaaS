import type { MarketingData } from "../tr/marketing";

export function buildMarketingSMSIT(data: MarketingData): string {
  const unsubscribe = data.unsubscribeNote ?? "Rispondi STOP per annullare l'iscrizione.";
  return `${data.businessName}: ${data.message} ${unsubscribe}`;
}

export function buildMarketingEmailIT(data: MarketingData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `Novita da ${data.businessName}`;
  const unsubscribe = data.unsubscribeNote ?? "Puoi annullare l'iscrizione a queste email in qualsiasi momento.";

  const text = [`Ciao ${data.customerName},`, "", data.message, "", unsubscribe].join("\n");
  const html = `
    <p>Ciao <strong>${data.customerName}</strong>,</p>
    <p>${data.message}</p>
    <hr/>
    <p style="font-size:12px;color:#888">${unsubscribe}</p>
  `;

  return { subject, text, html };
}
