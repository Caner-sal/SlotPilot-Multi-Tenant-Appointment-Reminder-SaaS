import type { MarketingData } from "../tr/marketing";

export function buildMarketingSMSES(data: MarketingData): string {
  const unsubscribe = data.unsubscribeNote ?? "Responde STOP para darte de baja.";
  return `${data.businessName}: ${data.message} ${unsubscribe}`;
}

export function buildMarketingEmailES(data: MarketingData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `Novedades de ${data.businessName}`;
  const unsubscribe = data.unsubscribeNote ?? "Puedes darte de baja de estos correos en cualquier momento.";

  const text = [`Hola ${data.customerName},`, "", data.message, "", unsubscribe].join("\n");
  const html = `
    <p>Hola <strong>${data.customerName}</strong>,</p>
    <p>${data.message}</p>
    <hr/>
    <p style="font-size:12px;color:#888">${unsubscribe}</p>
  `;

  return { subject, text, html };
}
