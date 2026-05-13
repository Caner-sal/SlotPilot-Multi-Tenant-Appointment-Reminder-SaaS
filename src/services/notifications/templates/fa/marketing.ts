import type { MarketingData } from "../tr/marketing";

export function buildMarketingSMSFA(data: MarketingData): string {
  const unsubscribe = data.unsubscribeNote ?? "\u0628\u0631\u0627\u06cc \u0644\u063a\u0648 \u0627\u0634\u062a\u0631\u0627\u06a9 STOP \u0627\u0631\u0633\u0627\u0644 \u06a9\u0646\u06cc\u062f.";
  return `${data.businessName}: ${data.message} ${unsubscribe}`;
}

export function buildMarketingEmailFA(data: MarketingData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `\u062e\u0628\u0631\u0647\u0627\u06cc ${data.businessName}`;
  const unsubscribe =
    data.unsubscribeNote ?? "\u0645\u06cc\u200c\u062a\u0648\u0627\u0646\u06cc\u062f \u0647\u0631 \u0632\u0645\u0627\u0646 \u0627\u0632 \u062f\u0631\u06cc\u0627\u0641\u062a \u0627\u06cc\u0646 \u0627\u06cc\u0645\u06cc\u0644\u200c\u0647\u0627 \u0644\u063a\u0648 \u0627\u0634\u062a\u0631\u0627\u06a9 \u06a9\u0646\u06cc\u062f.";

  const text = [`\u0633\u0644\u0627\u0645 ${data.customerName}\u060c`, "", data.message, "", unsubscribe].join("\n");
  const html = `
    <p>\u0633\u0644\u0627\u0645 <strong>${data.customerName}</strong>\u060c</p>
    <p>${data.message}</p>
    <hr/>
    <p style="font-size:12px;color:#888">${unsubscribe}</p>
  `;

  return { subject, text, html };
}
