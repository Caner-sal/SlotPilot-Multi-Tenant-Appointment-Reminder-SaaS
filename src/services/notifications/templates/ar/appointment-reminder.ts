import type { AppointmentReminderData } from "../tr/appointment-reminder";

export function buildAppointmentReminderSMSAR(data: AppointmentReminderData): string {
  const lines = [
    `\u0645\u0631\u062d\u0628\u0627 ${data.customerName}\u060c`,
    `\u0645\u0648\u0639\u062f\u0643 \u0644\u062f\u0649 ${data.businessName} \u0628\u062a\u0627\u0631\u064a\u062e ${data.date} \u0627\u0644\u0633\u0627\u0639\u0629 ${data.time}.`,
    `\u0627\u0644\u062e\u062f\u0645\u0629: ${data.serviceName}.`
  ];
  if (data.address) lines.push(`\u0627\u0644\u0639\u0646\u0648\u0627\u0646: ${data.address}.`);
  return lines.join(" ");
}

export function buildAppointmentReminderEmailAR(data: AppointmentReminderData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `\u062a\u0630\u0643\u064a\u0631 \u0628\u0627\u0644\u0645\u0648\u0639\u062f - ${data.date} ${data.time}`;

  const text = [
    `\u0645\u0631\u062d\u0628\u0627 ${data.customerName}\u060c`,
    "",
    `\u0647\u0630\u0627 \u062a\u0630\u0643\u064a\u0631 \u0628\u0645\u0648\u0639\u062f\u0643 \u0644\u062f\u0649 ${data.businessName}.`,
    "",
    `\u0627\u0644\u062a\u0627\u0631\u064a\u062e: ${data.date}`,
    `\u0627\u0644\u0648\u0642\u062a: ${data.time}`,
    `\u0627\u0644\u062e\u062f\u0645\u0629: ${data.serviceName}`,
    data.address ? `\u0627\u0644\u0639\u0646\u0648\u0627\u0646: ${data.address}` : "",
    data.phone ? `\u0627\u0644\u0647\u0627\u062a\u0641: ${data.phone}` : ""
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const html = `
    <p dir="rtl">\u0645\u0631\u062d\u0628\u0627 <strong>${data.customerName}</strong>\u060c</p>
    <p dir="rtl">\u0647\u0630\u0627 \u062a\u0630\u0643\u064a\u0631 \u0628\u0645\u0648\u0639\u062f\u0643 \u0644\u062f\u0649 <strong>${data.businessName}</strong>.</p>
    <table dir="rtl">
      <tr><td><strong>\u0627\u0644\u062a\u0627\u0631\u064a\u062e:</strong></td><td>${data.date}</td></tr>
      <tr><td><strong>\u0627\u0644\u0648\u0642\u062a:</strong></td><td>${data.time}</td></tr>
      <tr><td><strong>\u0627\u0644\u062e\u062f\u0645\u0629:</strong></td><td>${data.serviceName}</td></tr>
      ${data.address ? `<tr><td><strong>\u0627\u0644\u0639\u0646\u0648\u0627\u0646:</strong></td><td>${data.address}</td></tr>` : ""}
      ${data.phone ? `<tr><td><strong>\u0627\u0644\u0647\u0627\u062a\u0641:</strong></td><td>${data.phone}</td></tr>` : ""}
    </table>
  `;

  return { subject, text, html };
}
