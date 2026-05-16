import type { AppointmentReminderData } from "../tr/appointment-reminder";

export function buildAppointmentReminderSMSEN(data: AppointmentReminderData): string {
  const lines = [
    `Hi ${data.customerName},`,
    `Your ${data.businessName} appointment is scheduled for ${data.date} at ${data.time}.`,
    `Service: ${data.serviceName}.`
  ];
  if (data.address) lines.push(`Address: ${data.address}.`);
  return lines.join(" ");
}

export function buildAppointmentReminderEmailEN(data: AppointmentReminderData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `Appointment Reminder - ${data.date} ${data.time}`;

  const text = [
    `Hi ${data.customerName},`,
    "",
    `This is a reminder for your appointment at ${data.businessName}.`,
    "",
    `Date: ${data.date}`,
    `Time: ${data.time}`,
    `Service: ${data.serviceName}`,
    data.address ? `Address: ${data.address}` : "",
    data.phone ? `Phone: ${data.phone}` : ""
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const html = `
    <p>Hi <strong>${data.customerName}</strong>,</p>
    <p>This is a reminder for your appointment at <strong>${data.businessName}</strong>.</p>
    <table>
      <tr><td><strong>Date:</strong></td><td>${data.date}</td></tr>
      <tr><td><strong>Time:</strong></td><td>${data.time}</td></tr>
      <tr><td><strong>Service:</strong></td><td>${data.serviceName}</td></tr>
      ${data.address ? `<tr><td><strong>Address:</strong></td><td>${data.address}</td></tr>` : ""}
      ${data.phone ? `<tr><td><strong>Phone:</strong></td><td>${data.phone}</td></tr>` : ""}
    </table>
  `;

  return { subject, text, html };
}
