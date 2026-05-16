import type { MarketingData } from "../tr/marketing";

export function buildMarketingSMSAR(data: MarketingData): string {
  const unsubscribe = data.unsubscribeNote ?? "\u0627\u0631\u0633\u0644 STOP \u0644\u0627\u0644\u063a\u0627\u0621 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643.";
  return `${data.businessName}: ${data.message} ${unsubscribe}`;
}

export function buildMarketingEmailAR(data: MarketingData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `\u0627\u062e\u0628\u0627\u0631 \u0645\u0646 ${data.businessName}`;
  const unsubscribe = data.unsubscribeNote ?? "\u064a\u0645\u0643\u0646\u0643 \u0627\u0644\u063a\u0627\u0621 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643 \u0641\u064a \u0627\u064a \u0648\u0642\u062a.";

  const text = [`\u0645\u0631\u062d\u0628\u0627 ${data.customerName}\u060c`, "", data.message, "", unsubscribe].join("\n");
  const html = `
    <p dir="rtl">\u0645\u0631\u062d\u0628\u0627 <strong>${data.customerName}</strong>\u060c</p>
    <p dir="rtl">${data.message}</p>
    <hr/>
    <p dir="rtl" style="font-size:12px;color:#888">${unsubscribe}</p>
  `;

  return { subject, text, html };
}
