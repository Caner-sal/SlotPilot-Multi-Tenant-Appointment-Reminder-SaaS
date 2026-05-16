import type { AppointmentReminderData } from "../tr/appointment-reminder";

export function buildAppointmentReminderSMSDE(data: AppointmentReminderData): string {
  const lines = [
    `Hallo ${data.customerName},`,
    `Ihr Termin bei ${data.businessName} ist am ${data.date} um ${data.time} geplant.`,
    `Leistung: ${data.serviceName}.`
  ];
  if (data.address) lines.push(`Adresse: ${data.address}.`);
  return lines.join(" ");
}

export function buildAppointmentReminderEmailDE(data: AppointmentReminderData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `Terminerinnerung - ${data.date} ${data.time}`;

  const text = [
    `Hallo ${data.customerName},`,
    "",
    `Dies ist eine Erinnerung an Ihren Termin bei ${data.businessName}.`,
    "",
    `Datum: ${data.date}`,
    `Uhrzeit: ${data.time}`,
    `Leistung: ${data.serviceName}`,
    data.address ? `Adresse: ${data.address}` : "",
    data.phone ? `Telefon: ${data.phone}` : ""
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const html = `
    <p>Hallo <strong>${data.customerName}</strong>,</p>
    <p>Dies ist eine Erinnerung an Ihren Termin bei <strong>${data.businessName}</strong>.</p>
    <table>
      <tr><td><strong>Datum:</strong></td><td>${data.date}</td></tr>
      <tr><td><strong>Uhrzeit:</strong></td><td>${data.time}</td></tr>
      <tr><td><strong>Leistung:</strong></td><td>${data.serviceName}</td></tr>
      ${data.address ? `<tr><td><strong>Adresse:</strong></td><td>${data.address}</td></tr>` : ""}
      ${data.phone ? `<tr><td><strong>Telefon:</strong></td><td>${data.phone}</td></tr>` : ""}
    </table>
  `;

  return { subject, text, html };
}
