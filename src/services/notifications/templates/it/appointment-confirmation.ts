import type { AppointmentConfirmationData } from "../tr/appointment-confirmation";

export function buildAppointmentConfirmationSMSIT(data: AppointmentConfirmationData): string {
  return (
    `Il tuo appuntamento e confermato! ${data.businessName} - ${data.serviceName}, ${data.date} alle ${data.time}, con ${data.staffName}.` +
    (data.address ? ` Indirizzo: ${data.address}` : "")
  );
}

export function buildAppointmentConfirmationEmailIT(data: AppointmentConfirmationData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `Appuntamento confermato - ${data.businessName}`;

  const text = [
    `Ciao ${data.customerName},`,
    "",
    "Il tuo appuntamento e stato creato con successo.",
    "",
    `Attivita: ${data.businessName}`,
    `Servizio: ${data.serviceName}`,
    `Personale: ${data.staffName}`,
    `Data: ${data.date}`,
    `Ora: ${data.time}`,
    data.address ? `Indirizzo: ${data.address}` : "",
    data.phone ? `Telefono: ${data.phone}` : ""
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const html = `
    <p>Ciao <strong>${data.customerName}</strong>,</p>
    <p>Il tuo appuntamento e stato creato con successo.</p>
    <table>
      <tr><td><strong>Attivita:</strong></td><td>${data.businessName}</td></tr>
      <tr><td><strong>Servizio:</strong></td><td>${data.serviceName}</td></tr>
      <tr><td><strong>Personale:</strong></td><td>${data.staffName}</td></tr>
      <tr><td><strong>Data:</strong></td><td>${data.date}</td></tr>
      <tr><td><strong>Ora:</strong></td><td>${data.time}</td></tr>
      ${data.address ? `<tr><td><strong>Indirizzo:</strong></td><td>${data.address}</td></tr>` : ""}
      ${data.phone ? `<tr><td><strong>Telefono:</strong></td><td>${data.phone}</td></tr>` : ""}
    </table>
  `;

  return { subject, text, html };
}
