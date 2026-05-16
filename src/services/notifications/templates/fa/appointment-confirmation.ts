import type { AppointmentConfirmationData } from "../tr/appointment-confirmation";

export function buildAppointmentConfirmationSMSFA(data: AppointmentConfirmationData): string {
  return (
    `\u0646\u0648\u0628\u062a \u0634\u0645\u0627 \u062a\u0627\u06cc\u06cc\u062f \u0634\u062f! ${data.businessName} - ${data.serviceName}\u060c ` +
    `${data.date} \u0633\u0627\u0639\u062a ${data.time}\u060c \u0628\u0627 ${data.staffName}.` +
    (data.address ? ` \u0622\u062f\u0631\u0633: ${data.address}` : "")
  );
}

export function buildAppointmentConfirmationEmailFA(data: AppointmentConfirmationData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `\u062a\u0627\u06cc\u06cc\u062f \u0646\u0648\u0628\u062a - ${data.businessName}`;

  const text = [
    `\u0633\u0644\u0627\u0645 ${data.customerName}\u060c`,
    "",
    "\u0646\u0648\u0628\u062a \u0634\u0645\u0627 \u0628\u0627 \u0645\u0648\u0641\u0642\u06cc\u062a \u062b\u0628\u062a \u0634\u062f.",
    "",
    `\u06a9\u0633\u0628\u200c\u0648\u06a9\u0627\u0631: ${data.businessName}`,
    `\u062e\u062f\u0645\u062a: ${data.serviceName}`,
    `\u06a9\u0627\u0631\u0645\u0646\u062f: ${data.staffName}`,
    `\u062a\u0627\u0631\u06cc\u062e: ${data.date}`,
    `\u0633\u0627\u0639\u062a: ${data.time}`,
    data.address ? `\u0622\u062f\u0631\u0633: ${data.address}` : "",
    data.phone ? `\u062a\u0644\u0641\u0646: ${data.phone}` : ""
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const html = `
    <p>\u0633\u0644\u0627\u0645 <strong>${data.customerName}</strong>\u060c</p>
    <p>\u0646\u0648\u0628\u062a \u0634\u0645\u0627 \u0628\u0627 \u0645\u0648\u0641\u0642\u06cc\u062a \u062b\u0628\u062a \u0634\u062f.</p>
    <table>
      <tr><td><strong>\u06a9\u0633\u0628\u200c\u0648\u06a9\u0627\u0631:</strong></td><td>${data.businessName}</td></tr>
      <tr><td><strong>\u062e\u062f\u0645\u062a:</strong></td><td>${data.serviceName}</td></tr>
      <tr><td><strong>\u06a9\u0627\u0631\u0645\u0646\u062f:</strong></td><td>${data.staffName}</td></tr>
      <tr><td><strong>\u062a\u0627\u0631\u06cc\u062e:</strong></td><td>${data.date}</td></tr>
      <tr><td><strong>\u0633\u0627\u0639\u062a:</strong></td><td>${data.time}</td></tr>
      ${data.address ? `<tr><td><strong>\u0622\u062f\u0631\u0633:</strong></td><td>${data.address}</td></tr>` : ""}
      ${data.phone ? `<tr><td><strong>\u062a\u0644\u0641\u0646:</strong></td><td>${data.phone}</td></tr>` : ""}
    </table>
  `;

  return { subject, text, html };
}
