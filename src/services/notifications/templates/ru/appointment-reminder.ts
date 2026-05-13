import type { AppointmentReminderData } from "../tr/appointment-reminder";

export function buildAppointmentReminderSMSRU(data: AppointmentReminderData): string {
  const lines = [
    `\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435 ${data.customerName},`,
    `\u0412\u0430\u0448\u0430 \u0437\u0430\u043f\u0438\u0441\u044c \u0432 ${data.businessName} \u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u0430 \u043d\u0430 ${data.date} \u0432 ${data.time}.`,
    `\u0423\u0441\u043b\u0443\u0433\u0430: ${data.serviceName}.`
  ];
  if (data.address) lines.push(`\u0410\u0434\u0440\u0435\u0441: ${data.address}.`);
  return lines.join(" ");
}

export function buildAppointmentReminderEmailRU(data: AppointmentReminderData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `\u041d\u0430\u043f\u043e\u043c\u0438\u043d\u0430\u043d\u0438\u0435 \u043e \u0437\u0430\u043f\u0438\u0441\u0438 - ${data.date} ${data.time}`;

  const text = [
    `\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435 ${data.customerName},`,
    "",
    `\u042d\u0442\u043e \u043d\u0430\u043f\u043e\u043c\u0438\u043d\u0430\u043d\u0438\u0435 \u043e \u0432\u0430\u0448\u0435\u0439 \u0437\u0430\u043f\u0438\u0441\u0438 \u0432 ${data.businessName}.`,
    "",
    `\u0414\u0430\u0442\u0430: ${data.date}`,
    `\u0412\u0440\u0435\u043c\u044f: ${data.time}`,
    `\u0423\u0441\u043b\u0443\u0433\u0430: ${data.serviceName}`,
    data.address ? `\u0410\u0434\u0440\u0435\u0441: ${data.address}` : "",
    data.phone ? `\u0422\u0435\u043b\u0435\u0444\u043e\u043d: ${data.phone}` : ""
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const html = `
    <p>\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435 <strong>${data.customerName}</strong>,</p>
    <p>\u042d\u0442\u043e \u043d\u0430\u043f\u043e\u043c\u0438\u043d\u0430\u043d\u0438\u0435 \u043e \u0432\u0430\u0448\u0435\u0439 \u0437\u0430\u043f\u0438\u0441\u0438 \u0432 <strong>${data.businessName}</strong>.</p>
    <table>
      <tr><td><strong>\u0414\u0430\u0442\u0430:</strong></td><td>${data.date}</td></tr>
      <tr><td><strong>\u0412\u0440\u0435\u043c\u044f:</strong></td><td>${data.time}</td></tr>
      <tr><td><strong>\u0423\u0441\u043b\u0443\u0433\u0430:</strong></td><td>${data.serviceName}</td></tr>
      ${data.address ? `<tr><td><strong>\u0410\u0434\u0440\u0435\u0441:</strong></td><td>${data.address}</td></tr>` : ""}
      ${data.phone ? `<tr><td><strong>\u0422\u0435\u043b\u0435\u0444\u043e\u043d:</strong></td><td>${data.phone}</td></tr>` : ""}
    </table>
  `;

  return { subject, text, html };
}
