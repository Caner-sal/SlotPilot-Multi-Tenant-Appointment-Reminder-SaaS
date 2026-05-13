import type { AppointmentConfirmationData } from "../tr/appointment-confirmation";

export function buildAppointmentConfirmationSMSES(data: AppointmentConfirmationData): string {
  return (
    `Tu cita esta confirmada! ${data.businessName} - ${data.serviceName}, ${data.date} a las ${data.time}, con ${data.staffName}.` +
    (data.address ? ` Direccion: ${data.address}` : "")
  );
}

export function buildAppointmentConfirmationEmailES(data: AppointmentConfirmationData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `Cita confirmada - ${data.businessName}`;

  const text = [
    `Hola ${data.customerName},`,
    "",
    "Tu cita se ha creado correctamente.",
    "",
    `Negocio: ${data.businessName}`,
    `Servicio: ${data.serviceName}`,
    `Personal: ${data.staffName}`,
    `Fecha: ${data.date}`,
    `Hora: ${data.time}`,
    data.address ? `Direccion: ${data.address}` : "",
    data.phone ? `Telefono: ${data.phone}` : ""
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const html = `
    <p>Hola <strong>${data.customerName}</strong>,</p>
    <p>Tu cita se ha creado correctamente.</p>
    <table>
      <tr><td><strong>Negocio:</strong></td><td>${data.businessName}</td></tr>
      <tr><td><strong>Servicio:</strong></td><td>${data.serviceName}</td></tr>
      <tr><td><strong>Personal:</strong></td><td>${data.staffName}</td></tr>
      <tr><td><strong>Fecha:</strong></td><td>${data.date}</td></tr>
      <tr><td><strong>Hora:</strong></td><td>${data.time}</td></tr>
      ${data.address ? `<tr><td><strong>Direccion:</strong></td><td>${data.address}</td></tr>` : ""}
      ${data.phone ? `<tr><td><strong>Telefono:</strong></td><td>${data.phone}</td></tr>` : ""}
    </table>
  `;

  return { subject, text, html };
}
