export interface AppointmentReminderData {
  customerName: string;
  businessName: string;
  date: string;
  time: string;
  serviceName: string;
  address?: string;
  phone?: string;
}

export function buildAppointmentReminderSMSTR(data: AppointmentReminderData): string {
  const lines = [
    `Merhaba ${data.customerName},`,
    `${data.businessName} randevunuz ${data.date} saat ${data.time} için planlandı.`,
    `Hizmet: ${data.serviceName}.`,
  ];
  if (data.address) lines.push(`Adres: ${data.address}.`);
  return lines.join(" ");
}

export function buildAppointmentReminderEmailTR(data: AppointmentReminderData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `Randevu Hatırlatması — ${data.date} saat ${data.time}`;

  const text = [
    `Merhaba ${data.customerName},`,
    "",
    `${data.businessName}'daki randevunuzu hatırlatmak istedik.`,
    "",
    `Tarih: ${data.date}`,
    `Saat: ${data.time}`,
    `Hizmet: ${data.serviceName}`,
    data.address ? `Adres: ${data.address}` : "",
    data.phone ? `Telefon: ${data.phone}` : "",
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const html = `
    <p>Merhaba <strong>${data.customerName}</strong>,</p>
    <p><strong>${data.businessName}</strong>'daki randevunuzu hatırlatmak istedik.</p>
    <table>
      <tr><td><strong>Tarih:</strong></td><td>${data.date}</td></tr>
      <tr><td><strong>Saat:</strong></td><td>${data.time}</td></tr>
      <tr><td><strong>Hizmet:</strong></td><td>${data.serviceName}</td></tr>
      ${data.address ? `<tr><td><strong>Adres:</strong></td><td>${data.address}</td></tr>` : ""}
      ${data.phone ? `<tr><td><strong>Telefon:</strong></td><td>${data.phone}</td></tr>` : ""}
    </table>
  `;

  return { subject, text, html };
}
