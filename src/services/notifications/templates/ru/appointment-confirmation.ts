import type { AppointmentConfirmationData } from "../tr/appointment-confirmation";

export function buildAppointmentConfirmationSMSRU(data: AppointmentConfirmationData): string {
  return (
    `\u0412\u0430\u0448\u0430 \u0437\u0430\u043f\u0438\u0441\u044c \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0430! ${data.businessName} - ${data.serviceName}, ` +
    `${data.date} \u0432 ${data.time}, \u043a ${data.staffName}.` +
    (data.address ? ` \u0410\u0434\u0440\u0435\u0441: ${data.address}` : "")
  );
}

export function buildAppointmentConfirmationEmailRU(data: AppointmentConfirmationData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `\u0417\u0430\u043f\u0438\u0441\u044c \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0430 - ${data.businessName}`;

  const text = [
    `\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435 ${data.customerName},`,
    "",
    "\u0412\u0430\u0448\u0430 \u0437\u0430\u043f\u0438\u0441\u044c \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0437\u0434\u0430\u043d\u0430.",
    "",
    `\u0411\u0438\u0437\u043d\u0435\u0441: ${data.businessName}`,
    `\u0423\u0441\u043b\u0443\u0433\u0430: ${data.serviceName}`,
    `\u0421\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a: ${data.staffName}`,
    `\u0414\u0430\u0442\u0430: ${data.date}`,
    `\u0412\u0440\u0435\u043c\u044f: ${data.time}`,
    data.address ? `\u0410\u0434\u0440\u0435\u0441: ${data.address}` : "",
    data.phone ? `\u0422\u0435\u043b\u0435\u0444\u043e\u043d: ${data.phone}` : ""
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const html = `
    <p>\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435 <strong>${data.customerName}</strong>,</p>
    <p>\u0412\u0430\u0448\u0430 \u0437\u0430\u043f\u0438\u0441\u044c \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0437\u0434\u0430\u043d\u0430.</p>
    <table>
      <tr><td><strong>\u0411\u0438\u0437\u043d\u0435\u0441:</strong></td><td>${data.businessName}</td></tr>
      <tr><td><strong>\u0423\u0441\u043b\u0443\u0433\u0430:</strong></td><td>${data.serviceName}</td></tr>
      <tr><td><strong>\u0421\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a:</strong></td><td>${data.staffName}</td></tr>
      <tr><td><strong>\u0414\u0430\u0442\u0430:</strong></td><td>${data.date}</td></tr>
      <tr><td><strong>\u0412\u0440\u0435\u043c\u044f:</strong></td><td>${data.time}</td></tr>
      ${data.address ? `<tr><td><strong>\u0410\u0434\u0440\u0435\u0441:</strong></td><td>${data.address}</td></tr>` : ""}
      ${data.phone ? `<tr><td><strong>\u0422\u0435\u043b\u0435\u0444\u043e\u043d:</strong></td><td>${data.phone}</td></tr>` : ""}
    </table>
  `;

  return { subject, text, html };
}
