import type { AppointmentReminderData } from "../tr/appointment-reminder";

export function buildAppointmentReminderSMSNL(data: AppointmentReminderData): string {
  const lines = [
    `Hoi ${data.customerName},`,
    `Je afspraak bij ${data.businessName} staat gepland op ${data.date} om ${data.time}.`,
    `Dienst: ${data.serviceName}.`
  ];
  if (data.address) lines.push(`Adres: ${data.address}.`);
  return lines.join(" ");
}

export function buildAppointmentReminderEmailNL(data: AppointmentReminderData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `Afspraakherinnering - ${data.date} ${data.time}`;

  const text = [
    `Hoi ${data.customerName},`,
    "",
    `Dit is een herinnering voor je afspraak bij ${data.businessName}.`,
    "",
    `Datum: ${data.date}`,
    `Tijd: ${data.time}`,
    `Dienst: ${data.serviceName}`,
    data.address ? `Adres: ${data.address}` : "",
    data.phone ? `Telefoon: ${data.phone}` : ""
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const html = `
    <p>Hoi <strong>${data.customerName}</strong>,</p>
    <p>Dit is een herinnering voor je afspraak bij <strong>${data.businessName}</strong>.</p>
    <table>
      <tr><td><strong>Datum:</strong></td><td>${data.date}</td></tr>
      <tr><td><strong>Tijd:</strong></td><td>${data.time}</td></tr>
      <tr><td><strong>Dienst:</strong></td><td>${data.serviceName}</td></tr>
      ${data.address ? `<tr><td><strong>Adres:</strong></td><td>${data.address}</td></tr>` : ""}
      ${data.phone ? `<tr><td><strong>Telefoon:</strong></td><td>${data.phone}</td></tr>` : ""}
    </table>
  `;

  return { subject, text, html };
}
