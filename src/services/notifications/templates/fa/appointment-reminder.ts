import type { AppointmentReminderData } from "../tr/appointment-reminder";

export function buildAppointmentReminderSMSFA(data: AppointmentReminderData): string {
  const lines = [
    `\u0633\u0644\u0627\u0645 ${data.customerName}\u060c`,
    `\u0646\u0648\u0628\u062a \u0634\u0645\u0627 \u062f\u0631 ${data.businessName} \u0628\u0631\u0627\u06cc ${data.date} \u0633\u0627\u0639\u062a ${data.time} \u0628\u0631\u0646\u0627\u0645\u0647\u200c\u0631\u06cc\u0632\u06cc \u0634\u062f\u0647 \u0627\u0633\u062a.`,
    `\u062e\u062f\u0645\u062a: ${data.serviceName}.`
  ];
  if (data.address) lines.push(`\u0622\u062f\u0631\u0633: ${data.address}.`);
  return lines.join(" ");
}

export function buildAppointmentReminderEmailFA(data: AppointmentReminderData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `\u06cc\u0627\u062f\u0622\u0648\u0631\u06cc \u0646\u0648\u0628\u062a - ${data.date} ${data.time}`;

  const text = [
    `\u0633\u0644\u0627\u0645 ${data.customerName}\u060c`,
    "",
    `\u0627\u06cc\u0646 \u06cc\u06a9 \u06cc\u0627\u062f\u0622\u0648\u0631\u06cc \u0628\u0631\u0627\u06cc \u0646\u0648\u0628\u062a \u0634\u0645\u0627 \u062f\u0631 ${data.businessName} \u0627\u0633\u062a.`,
    "",
    `\u062a\u0627\u0631\u06cc\u062e: ${data.date}`,
    `\u0633\u0627\u0639\u062a: ${data.time}`,
    `\u062e\u062f\u0645\u062a: ${data.serviceName}`,
    data.address ? `\u0622\u062f\u0631\u0633: ${data.address}` : "",
    data.phone ? `\u062a\u0644\u0641\u0646: ${data.phone}` : ""
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const html = `
    <p>\u0633\u0644\u0627\u0645 <strong>${data.customerName}</strong>\u060c</p>
    <p>\u0627\u06cc\u0646 \u06cc\u06a9 \u06cc\u0627\u062f\u0622\u0648\u0631\u06cc \u0628\u0631\u0627\u06cc \u0646\u0648\u0628\u062a \u0634\u0645\u0627 \u062f\u0631 <strong>${data.businessName}</strong> \u0627\u0633\u062a.</p>
    <table>
      <tr><td><strong>\u062a\u0627\u0631\u06cc\u062e:</strong></td><td>${data.date}</td></tr>
      <tr><td><strong>\u0633\u0627\u0639\u062a:</strong></td><td>${data.time}</td></tr>
      <tr><td><strong>\u062e\u062f\u0645\u062a:</strong></td><td>${data.serviceName}</td></tr>
      ${data.address ? `<tr><td><strong>\u0622\u062f\u0631\u0633:</strong></td><td>${data.address}</td></tr>` : ""}
      ${data.phone ? `<tr><td><strong>\u062a\u0644\u0641\u0646:</strong></td><td>${data.phone}</td></tr>` : ""}
    </table>
  `;

  return { subject, text, html };
}
