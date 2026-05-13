import type { AppointmentReminderData } from "../tr/appointment-reminder";

export function buildAppointmentReminderSMSES(data: AppointmentReminderData): string {
  const lines = [
    `Hola ${data.customerName},`,
    `Tu cita en ${data.businessName} esta programada para ${data.date} a las ${data.time}.`,
    `Servicio: ${data.serviceName}.`
  ];
  if (data.address) lines.push(`Direccion: ${data.address}.`);
  return lines.join(" ");
}

export function buildAppointmentReminderEmailES(data: AppointmentReminderData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `Recordatorio de cita - ${data.date} ${data.time}`;

  const text = [
    `Hola ${data.customerName},`,
    "",
    `Este es un recordatorio de tu cita en ${data.businessName}.`,
    "",
    `Fecha: ${data.date}`,
    `Hora: ${data.time}`,
    `Servicio: ${data.serviceName}`,
    data.address ? `Direccion: ${data.address}` : "",
    data.phone ? `Telefono: ${data.phone}` : ""
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const html = `
    <p>Hola <strong>${data.customerName}</strong>,</p>
    <p>Este es un recordatorio de tu cita en <strong>${data.businessName}</strong>.</p>
    <table>
      <tr><td><strong>Fecha:</strong></td><td>${data.date}</td></tr>
      <tr><td><strong>Hora:</strong></td><td>${data.time}</td></tr>
      <tr><td><strong>Servicio:</strong></td><td>${data.serviceName}</td></tr>
      ${data.address ? `<tr><td><strong>Direccion:</strong></td><td>${data.address}</td></tr>` : ""}
      ${data.phone ? `<tr><td><strong>Telefono:</strong></td><td>${data.phone}</td></tr>` : ""}
    </table>
  `;

  return { subject, text, html };
}
