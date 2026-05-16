import type { AppointmentReminderData } from "../tr/appointment-reminder";

export function buildAppointmentReminderSMSIT(data: AppointmentReminderData): string {
  const lines = [
    `Ciao ${data.customerName},`,
    `Il tuo appuntamento presso ${data.businessName} e fissato per il ${data.date} alle ${data.time}.`,
    `Servizio: ${data.serviceName}.`
  ];
  if (data.address) lines.push(`Indirizzo: ${data.address}.`);
  return lines.join(" ");
}

export function buildAppointmentReminderEmailIT(data: AppointmentReminderData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `Promemoria appuntamento - ${data.date} ${data.time}`;

  const text = [
    `Ciao ${data.customerName},`,
    "",
    `Questo e un promemoria del tuo appuntamento presso ${data.businessName}.`,
    "",
    `Data: ${data.date}`,
    `Ora: ${data.time}`,
    `Servizio: ${data.serviceName}`,
    data.address ? `Indirizzo: ${data.address}` : "",
    data.phone ? `Telefono: ${data.phone}` : ""
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const html = `
    <p>Ciao <strong>${data.customerName}</strong>,</p>
    <p>Questo e un promemoria del tuo appuntamento presso <strong>${data.businessName}</strong>.</p>
    <table>
      <tr><td><strong>Data:</strong></td><td>${data.date}</td></tr>
      <tr><td><strong>Ora:</strong></td><td>${data.time}</td></tr>
      <tr><td><strong>Servizio:</strong></td><td>${data.serviceName}</td></tr>
      ${data.address ? `<tr><td><strong>Indirizzo:</strong></td><td>${data.address}</td></tr>` : ""}
      ${data.phone ? `<tr><td><strong>Telefono:</strong></td><td>${data.phone}</td></tr>` : ""}
    </table>
  `;

  return { subject, text, html };
}
