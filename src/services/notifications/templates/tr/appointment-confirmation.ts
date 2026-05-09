export interface AppointmentConfirmationData {
  customerName: string;
  businessName: string;
  date: string;
  time: string;
  serviceName: string;
  staffName: string;
  address?: string;
  phone?: string;
}

export function buildAppointmentConfirmationSMSTR(data: AppointmentConfirmationData): string {
  return (
    `Randevunuz onaylandı! ${data.businessName} — ${data.serviceName}, ` +
    `${data.date} saat ${data.time}, ${data.staffName} ile.` +
    (data.address ? ` Adres: ${data.address}` : "")
  );
}

export function buildAppointmentConfirmationEmailTR(data: AppointmentConfirmationData): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `Randevunuz Onaylandı — ${data.businessName}`;

  const text = [
    `Merhaba ${data.customerName},`,
    "",
    "Randevunuz başarıyla oluşturuldu.",
    "",
    `İşletme: ${data.businessName}`,
    `Hizmet: ${data.serviceName}`,
    `Çalışan: ${data.staffName}`,
    `Tarih: ${data.date}`,
    `Saat: ${data.time}`,
    data.address ? `Adres: ${data.address}` : "",
    data.phone ? `Telefon: ${data.phone}` : "",
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const html = `
    <p>Merhaba <strong>${data.customerName}</strong>,</p>
    <p>Randevunuz başarıyla oluşturuldu.</p>
    <table>
      <tr><td><strong>İşletme:</strong></td><td>${data.businessName}</td></tr>
      <tr><td><strong>Hizmet:</strong></td><td>${data.serviceName}</td></tr>
      <tr><td><strong>Çalışan:</strong></td><td>${data.staffName}</td></tr>
      <tr><td><strong>Tarih:</strong></td><td>${data.date}</td></tr>
      <tr><td><strong>Saat:</strong></td><td>${data.time}</td></tr>
      ${data.address ? `<tr><td><strong>Adres:</strong></td><td>${data.address}</td></tr>` : ""}
      ${data.phone ? `<tr><td><strong>Telefon:</strong></td><td>${data.phone}</td></tr>` : ""}
    </table>
    <p>Görüşmek üzere!</p>
  `;

  return { subject, text, html };
}
