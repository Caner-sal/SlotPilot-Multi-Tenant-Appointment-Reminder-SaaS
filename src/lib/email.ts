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
      from: process.env.EMAIL_FROM ?? "noreply@slotpilot.app",
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });

    if (error) {
      return { success: false, mode: "resend", error: error.message };
    }

    return { success: true, mode: "resend", messageId: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
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
  const dateStr = data.startTime.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    subject: `Reminder: Your appointment at ${data.businessName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Appointment Reminder</h2>
        <p>Hello ${data.customerName},</p>
        <p>This is a reminder for your upcoming appointment:</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Business</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.businessName}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Service</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.serviceName}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Staff</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.staffName}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Date & Time</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${dateStr}</td></tr>
        </table>
        <p style="margin-top: 20px;">See you soon!</p>
        <p style="color: #888; font-size: 12px;">SlotPilot Appointment System</p>
      </div>
    `,
  };
}
