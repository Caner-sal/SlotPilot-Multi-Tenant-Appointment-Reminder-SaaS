import type { MarketingData } from "../tr/marketing";

export function buildMarketingSMSRU(data: MarketingData): string {
  const unsubscribe = data.unsubscribeNote ?? "\u041e\u0442\u0432\u0435\u0442\u044c\u0442\u0435 STOP, \u0447\u0442\u043e\u0431\u044b \u043e\u0442\u043f\u0438\u0441\u0430\u0442\u044c\u0441\u044f.";
  return `${data.businessName}: ${data.message} ${unsubscribe}`;
}

export function buildMarketingEmailRU(data: MarketingData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `\u041d\u043e\u0432\u043e\u0441\u0442\u0438 \u043e\u0442 ${data.businessName}`;
  const unsubscribe =
    data.unsubscribeNote ?? "\u0412\u044b \u043c\u043e\u0436\u0435\u0442\u0435 \u043e\u0442\u043f\u0438\u0441\u0430\u0442\u044c\u0441\u044f \u043e\u0442 \u044d\u0442\u0438\u0445 \u043f\u0438\u0441\u0435\u043c \u0432 \u043b\u044e\u0431\u043e\u0435 \u0432\u0440\u0435\u043c\u044f.";

  const text = [`\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435 ${data.customerName},`, "", data.message, "", unsubscribe].join(
    "\n"
  );
  const html = `
    <p>\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435 <strong>${data.customerName}</strong>,</p>
    <p>${data.message}</p>
    <hr/>
    <p style="font-size:12px;color:#888">${unsubscribe}</p>
  `;

  return { subject, text, html };
}
