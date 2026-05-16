import type { AppointmentReminderData } from "../tr/appointment-reminder";

export function buildAppointmentReminderSMSFR(data: AppointmentReminderData): string {
  const lines = [
    `Bonjour ${data.customerName},`,
    `Votre rendez-vous chez ${data.businessName} est prevu le ${data.date} a ${data.time}.`,
    `Service: ${data.serviceName}.`
  ];
  if (data.address) lines.push(`Adresse: ${data.address}.`);
  return lines.join(" ");
}

export function buildAppointmentReminderEmailFR(data: AppointmentReminderData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `Rappel de rendez-vous - ${data.date} ${data.time}`;

  const text = [
    `Bonjour ${data.customerName},`,
    "",
    `Ceci est un rappel pour votre rendez-vous chez ${data.businessName}.`,
    "",
    `Date: ${data.date}`,
    `Heure: ${data.time}`,
    `Service: ${data.serviceName}`,
    data.address ? `Adresse: ${data.address}` : "",
    data.phone ? `Telephone: ${data.phone}` : ""
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const html = `
    <p>Bonjour <strong>${data.customerName}</strong>,</p>
    <p>Ceci est un rappel pour votre rendez-vous chez <strong>${data.businessName}</strong>.</p>
    <table>
      <tr><td><strong>Date:</strong></td><td>${data.date}</td></tr>
      <tr><td><strong>Heure:</strong></td><td>${data.time}</td></tr>
      <tr><td><strong>Service:</strong></td><td>${data.serviceName}</td></tr>
      ${data.address ? `<tr><td><strong>Adresse:</strong></td><td>${data.address}</td></tr>` : ""}
      ${data.phone ? `<tr><td><strong>Telephone:</strong></td><td>${data.phone}</td></tr>` : ""}
    </table>
  `;

  return { subject, text, html };
}
