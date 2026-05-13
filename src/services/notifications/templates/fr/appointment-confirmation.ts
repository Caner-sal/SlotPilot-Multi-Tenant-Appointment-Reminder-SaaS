import type { AppointmentConfirmationData } from "../tr/appointment-confirmation";

export function buildAppointmentConfirmationSMSFR(data: AppointmentConfirmationData): string {
  return (
    `Votre rendez-vous est confirme ! ${data.businessName} - ${data.serviceName}, le ${data.date} a ${data.time}, avec ${data.staffName}.` +
    (data.address ? ` Adresse: ${data.address}` : "")
  );
}

export function buildAppointmentConfirmationEmailFR(data: AppointmentConfirmationData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `Rendez-vous confirme - ${data.businessName}`;

  const text = [
    `Bonjour ${data.customerName},`,
    "",
    "Votre rendez-vous a ete cree avec succes.",
    "",
    `Entreprise: ${data.businessName}`,
    `Service: ${data.serviceName}`,
    `Equipe: ${data.staffName}`,
    `Date: ${data.date}`,
    `Heure: ${data.time}`,
    data.address ? `Adresse: ${data.address}` : "",
    data.phone ? `Telephone: ${data.phone}` : ""
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const html = `
    <p>Bonjour <strong>${data.customerName}</strong>,</p>
    <p>Votre rendez-vous a ete cree avec succes.</p>
    <table>
      <tr><td><strong>Entreprise:</strong></td><td>${data.businessName}</td></tr>
      <tr><td><strong>Service:</strong></td><td>${data.serviceName}</td></tr>
      <tr><td><strong>Equipe:</strong></td><td>${data.staffName}</td></tr>
      <tr><td><strong>Date:</strong></td><td>${data.date}</td></tr>
      <tr><td><strong>Heure:</strong></td><td>${data.time}</td></tr>
      ${data.address ? `<tr><td><strong>Adresse:</strong></td><td>${data.address}</td></tr>` : ""}
      ${data.phone ? `<tr><td><strong>Telephone:</strong></td><td>${data.phone}</td></tr>` : ""}
    </table>
  `;

  return { subject, text, html };
}
