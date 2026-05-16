import type { AppointmentConfirmationData } from "../tr/appointment-confirmation";

export function buildAppointmentConfirmationSMSAR(data: AppointmentConfirmationData): string {
  return (
    `\u062a\u0645 \u062a\u0627\u0643\u064a\u062f \u0645\u0648\u0639\u062f\u0643! ${data.businessName} - ${data.serviceName}, ` +
    `${data.date} ${data.time}, \u0645\u0639 ${data.staffName}.` +
    (data.address ? ` \u0627\u0644\u0639\u0646\u0648\u0627\u0646: ${data.address}` : "")
  );
}

export function buildAppointmentConfirmationEmailAR(data: AppointmentConfirmationData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `\u062a\u0627\u0643\u064a\u062f \u0627\u0644\u0645\u0648\u0639\u062f - ${data.businessName}`;

  const text = [
    `\u0645\u0631\u062d\u0628\u0627 ${data.customerName}\u060c`,
    "",
    "\u062a\u0645 \u0627\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0648\u0639\u062f \u0628\u0646\u062c\u0627\u062d.",
    "",
    `\u0627\u0644\u0645\u0646\u0634\u0627\u0629: ${data.businessName}`,
    `\u0627\u0644\u062e\u062f\u0645\u0629: ${data.serviceName}`,
    `\u0627\u0644\u0645\u0648\u0638\u0641: ${data.staffName}`,
    `\u0627\u0644\u062a\u0627\u0631\u064a\u062e: ${data.date}`,
    `\u0627\u0644\u0648\u0642\u062a: ${data.time}`,
    data.address ? `\u0627\u0644\u0639\u0646\u0648\u0627\u0646: ${data.address}` : "",
    data.phone ? `\u0627\u0644\u0647\u0627\u062a\u0641: ${data.phone}` : ""
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const html = `
    <p dir="rtl">\u0645\u0631\u062d\u0628\u0627 <strong>${data.customerName}</strong>\u060c</p>
    <p dir="rtl">\u062a\u0645 \u0627\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0648\u0639\u062f \u0628\u0646\u062c\u0627\u062d.</p>
    <table dir="rtl">
      <tr><td><strong>\u0627\u0644\u0645\u0646\u0634\u0627\u0629:</strong></td><td>${data.businessName}</td></tr>
      <tr><td><strong>\u0627\u0644\u062e\u062f\u0645\u0629:</strong></td><td>${data.serviceName}</td></tr>
      <tr><td><strong>\u0627\u0644\u0645\u0648\u0638\u0641:</strong></td><td>${data.staffName}</td></tr>
      <tr><td><strong>\u0627\u0644\u062a\u0627\u0631\u064a\u062e:</strong></td><td>${data.date}</td></tr>
      <tr><td><strong>\u0627\u0644\u0648\u0642\u062a:</strong></td><td>${data.time}</td></tr>
      ${data.address ? `<tr><td><strong>\u0627\u0644\u0639\u0646\u0648\u0627\u0646:</strong></td><td>${data.address}</td></tr>` : ""}
      ${data.phone ? `<tr><td><strong>\u0627\u0644\u0647\u0627\u062a\u0641:</strong></td><td>${data.phone}</td></tr>` : ""}
    </table>
  `;

  return { subject, text, html };
}
