import type { AppointmentConfirmationData } from "../tr/appointment-confirmation";

export function buildAppointmentConfirmationSMSNL(data: AppointmentConfirmationData): string {
  return (
    `Je afspraak is bevestigd! ${data.businessName} - ${data.serviceName}, ${data.date} om ${data.time}, met ${data.staffName}.` +
    (data.address ? ` Adres: ${data.address}` : "")
  );
}

export function buildAppointmentConfirmationEmailNL(data: AppointmentConfirmationData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `Afspraak bevestigd - ${data.businessName}`;

  const text = [
    `Hoi ${data.customerName},`,
    "",
    "Je afspraak is succesvol aangemaakt.",
    "",
    `Bedrijf: ${data.businessName}`,
    `Dienst: ${data.serviceName}`,
    `Medewerker: ${data.staffName}`,
    `Datum: ${data.date}`,
    `Tijd: ${data.time}`,
    data.address ? `Adres: ${data.address}` : "",
    data.phone ? `Telefoon: ${data.phone}` : ""
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const html = `
    <p>Hoi <strong>${data.customerName}</strong>,</p>
    <p>Je afspraak is succesvol aangemaakt.</p>
    <table>
      <tr><td><strong>Bedrijf:</strong></td><td>${data.businessName}</td></tr>
      <tr><td><strong>Dienst:</strong></td><td>${data.serviceName}</td></tr>
      <tr><td><strong>Medewerker:</strong></td><td>${data.staffName}</td></tr>
      <tr><td><strong>Datum:</strong></td><td>${data.date}</td></tr>
      <tr><td><strong>Tijd:</strong></td><td>${data.time}</td></tr>
      ${data.address ? `<tr><td><strong>Adres:</strong></td><td>${data.address}</td></tr>` : ""}
      ${data.phone ? `<tr><td><strong>Telefoon:</strong></td><td>${data.phone}</td></tr>` : ""}
    </table>
  `;

  return { subject, text, html };
}
