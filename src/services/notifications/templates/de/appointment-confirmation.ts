import type { AppointmentConfirmationData } from "../tr/appointment-confirmation";

export function buildAppointmentConfirmationSMSDE(data: AppointmentConfirmationData): string {
  return (
    `Ihr Termin ist bestaetigt! ${data.businessName} - ${data.serviceName}, ` +
    `${data.date} um ${data.time}, mit ${data.staffName}.` +
    (data.address ? ` Adresse: ${data.address}` : "")
  );
}

export function buildAppointmentConfirmationEmailDE(data: AppointmentConfirmationData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `Termin bestaetigt - ${data.businessName}`;

  const text = [
    `Hallo ${data.customerName},`,
    "",
    "Ihr Termin wurde erfolgreich erstellt.",
    "",
    `Unternehmen: ${data.businessName}`,
    `Leistung: ${data.serviceName}`,
    `Mitarbeiter: ${data.staffName}`,
    `Datum: ${data.date}`,
    `Uhrzeit: ${data.time}`,
    data.address ? `Adresse: ${data.address}` : "",
    data.phone ? `Telefon: ${data.phone}` : ""
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const html = `
    <p>Hallo <strong>${data.customerName}</strong>,</p>
    <p>Ihr Termin wurde erfolgreich erstellt.</p>
    <table>
      <tr><td><strong>Unternehmen:</strong></td><td>${data.businessName}</td></tr>
      <tr><td><strong>Leistung:</strong></td><td>${data.serviceName}</td></tr>
      <tr><td><strong>Mitarbeiter:</strong></td><td>${data.staffName}</td></tr>
      <tr><td><strong>Datum:</strong></td><td>${data.date}</td></tr>
      <tr><td><strong>Uhrzeit:</strong></td><td>${data.time}</td></tr>
      ${data.address ? `<tr><td><strong>Adresse:</strong></td><td>${data.address}</td></tr>` : ""}
      ${data.phone ? `<tr><td><strong>Telefon:</strong></td><td>${data.phone}</td></tr>` : ""}
    </table>
  `;

  return { subject, text, html };
}
