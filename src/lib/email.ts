interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

interface EmailResult {
  success: boolean;
  mode: "fake" | "resend";
  messageId?: string;
  error?: string;
}

const isFakeMode = !process.env.RESEND_API_KEY;

export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  if (isFakeMode) {
    console.log(`[FAKE EMAIL] To: ${payload.to} | Subject: ${payload.subject}`);
    return { success: true, mode: "fake", messageId: `fake-${Date.now()}` };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "noreply@randevo.app",
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });

    if (error) {
      return { success: false, mode: "resend", error: error.message };
    }

    return { success: true, mode: "resend", messageId: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    return { success: false, mode: "resend", error: message };
  }
}

export function buildReminderEmail(data: {
  customerName: string;
  businessName: string;
  serviceName: string;
  staffName: string;
  startTime: Date;
  bookingUrl: string;
}): { subject: string; html: string } {
  const dateStr = data.startTime.toLocaleString("tr-TR", {
    timeZone: "Europe/Istanbul",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    subject: `Hatırlatma: ${data.businessName} randevunuz`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Randevu Hatırlatma</h2>
        <p>Merhaba ${data.customerName},</p>
        <p>Yaklaşan randevunuz için hatırlatma:</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>İşletme</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.businessName}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Hizmet</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.serviceName}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Çalışan</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.staffName}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Tarih & Saat</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${dateStr}</td></tr>
        </table>
        <p style="margin-top: 20px;">Görüşmek üzere.</p>
        <p style="color: #888; font-size: 12px;">Randevo Randevu Sistemi</p>
      </div>
    `,
  };
}
