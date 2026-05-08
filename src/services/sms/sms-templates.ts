export interface SmsTemplateData {
  customerName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  businessName: string;
  businessPhone?: string;
}

export function renderReminderSms(data: SmsTemplateData): string {
  return `Hi ${data.customerName}, reminder: your ${data.serviceName} appointment at ${data.businessName} is on ${data.appointmentDate} at ${data.appointmentTime}.${data.businessPhone ? ` Questions? Call ${data.businessPhone}.` : ""}`;
}

export function renderConfirmationSms(data: SmsTemplateData): string {
  return `Confirmed! Your ${data.serviceName} at ${data.businessName} is booked for ${data.appointmentDate} at ${data.appointmentTime}. See you then!`;
}
