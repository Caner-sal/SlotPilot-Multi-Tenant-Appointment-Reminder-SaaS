import nodemailer from "nodemailer";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

interface EmailResult {
  success: boolean;
  mode: "fake" | "resend" | "nodemailer";
  messageId?: string;
  error?: string;
}

const isFakeMode = !process.env.RESEND_API_KEY && (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD);

export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  if (isFakeMode) {
    console.log(`[FAKE EMAIL] To: ${payload.to} | Subject: ${payload.subject}`);
    return { success: true, mode: "fake", messageId: `fake-${Date.now()}` };
  }

  try {
    // If SMTP credentials are provided, use nodemailer (Gmail etc.)
    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      });

      return { success: true, mode: "nodemailer", messageId: info.messageId };
    }

    // Otherwise fallback to Resend
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
    return { success: false, mode: "nodemailer", error: message };
  }
}

export async function sendVerificationEmail(email: string, token: string, baseUrl: string) {
  return sendEmail({
    to: email,
    subject: "Doğrulama Kodunuz",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #111120; font-size: 24px; margin: 0;">Randevo</h1>
        </div>
        <h2 style="color: #333333; font-size: 20px; text-align: center; margin-bottom: 20px;">Hoş Geldiniz!</h2>
        <p style="color: #555555; font-size: 15px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
          Kayıt işleminizi tamamlamak için aşağıdaki 6 haneli doğrulama kodunu kullanabilirsiniz.
        </p>
        <div style="text-align: center; background-color: #f7f7f9; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #7768d4;">${token}</span>
        </div>
        <p style="color: #888888; font-size: 13px; text-align: center; margin-top: 30px; border-top: 1px solid #eaeaea; padding-top: 20px;">
          Bu kodu siz talep etmediyseniz, lütfen bu e-postayı görmezden gelin.<br/><br/>
          Randevo Randevu Sistemi
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  return sendEmail({
    to: email,
    subject: "Şifre Sıfırlama Kodunuz",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #111120; font-size: 24px; margin: 0;">Randevo</h1>
        </div>
        <h2 style="color: #333333; font-size: 20px; text-align: center; margin-bottom: 20px;">Şifre Sıfırlama İsteği</h2>
        <p style="color: #555555; font-size: 15px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
          Şifrenizi sıfırlamak için aşağıdaki 6 haneli doğrulama kodunu kullanabilirsiniz.
        </p>
        <div style="text-align: center; background-color: #f7f7f9; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #7768d4;">${token}</span>
        </div>
        <p style="color: #888888; font-size: 13px; text-align: center; margin-top: 30px; border-top: 1px solid #eaeaea; padding-top: 20px;">
          Bu kodu siz talep etmediyseniz, lütfen bu e-postayı görmezden gelin ve hesabınızın güvenliği için şifrenizi değiştirin.<br/><br/>
          Randevo Randevu Sistemi
        </p>
      </div>
    `,
  });
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
