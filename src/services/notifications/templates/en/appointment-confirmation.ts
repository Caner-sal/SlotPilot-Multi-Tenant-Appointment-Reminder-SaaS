import type { AppointmentConfirmationData } from "../tr/appointment-confirmation";

export function buildAppointmentConfirmationSMSEN(data: AppointmentConfirmationData): string {
  return (
    `Your appointment is confirmed! ${data.businessName} - ${data.serviceName}, ` +
    `${data.date} at ${data.time}, with ${data.staffName}.` +
    (data.address ? ` Address: ${data.address}` : "")
  );
}

export function buildAppointmentConfirmationEmailEN(data: AppointmentConfirmationData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `Appointment Confirmed - ${data.businessName}`;

  const text = [
    `Hi ${data.customerName},`,
    "",
    "Your appointment has been created successfully.",
    "",
    `Business: ${data.businessName}`,
    `Service: ${data.serviceName}`,
    `Staff: ${data.staffName}`,
    `Date: ${data.date}`,
    `Time: ${data.time}`,
    data.address ? `Address: ${data.address}` : "",
    data.phone ? `Phone: ${data.phone}` : ""
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const html = `
    <p>Hi <strong>${data.customerName}</strong>,</p>
    <p>Your appointment has been created successfully.</p>
    <table>
      <tr><td><strong>Business:</strong></td><td>${data.businessName}</td></tr>
      <tr><td><strong>Service:</strong></td><td>${data.serviceName}</td></tr>
      <tr><td><strong>Staff:</strong></td><td>${data.staffName}</td></tr>
      <tr><td><strong>Date:</strong></td><td>${data.date}</td></tr>
      <tr><td><strong>Time:</strong></td><td>${data.time}</td></tr>
      ${data.address ? `<tr><td><strong>Address:</strong></td><td>${data.address}</td></tr>` : ""}
      ${data.phone ? `<tr><td><strong>Phone:</strong></td><td>${data.phone}</td></tr>` : ""}
    </table>
  `;

  return { subject, text, html };
}
