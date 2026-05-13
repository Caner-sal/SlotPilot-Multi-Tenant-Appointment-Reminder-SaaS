import { z } from "zod";

export const whatsAppAutoReplySettingsSchema = z.object({
  enabled: z.boolean().optional(),
  provider: z.enum(["FAKE", "META_CLOUD_API", "TWILIO_WHATSAPP"]).optional(),
  phoneNumberId: z.string().optional().nullable(),
  replyMode: z.enum(["ALWAYS", "KEYWORD_ONLY", "DISABLED"]).optional(),
  cooldownHours: z.number().int().min(1).max(168).optional(),
  triggerKeywords: z.array(z.string()).optional(),
  messageTemplate: z.string().min(1).max(1000).optional(),
  includeBookingLink: z.boolean().optional(),
});
export type WhatsAppAutoReplySettingsInput = z.infer<typeof whatsAppAutoReplySettingsSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
});

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(1, "Şifre zorunludur"),
});

export const organizationSchema = z.object({
  name: z.string().min(2, "İşletme adı en az 2 karakter olmalıdır"),
  slug: z
    .string()
    .min(3, "Kısa ad en az 3 karakter olmalıdır")
    .max(50, "Kısa ad en fazla 50 karakter olabilir")
    .regex(/^[a-z0-9-]+$/, "Kısa ad sadece küçük harf, rakam ve tire içerebilir"),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  timezone: z.string().default("Europe/Istanbul"),
  bookingEnabled: z.boolean().default(true),
});

export const serviceSchema = z.object({
  name: z.string().min(2, "Hizmet adı en az 2 karakter olmalıdır"),
  description: z.string().optional(),
  durationMinutes: z
    .number()
    .int()
    .min(5, "Süre en az 5 dakika olmalıdır")
    .max(480, "Süre en fazla 8 saat olabilir"),
  priceCents: z.number().int().min(0, "Fiyat negatif olamaz"),
  currency: z.string().default("TRY"),
  isActive: z.boolean().default(true),
});

export const staffSchema = z.object({
  name: z.string().min(2, "Çalışan adı en az 2 karakter olmalıdır"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
  serviceIds: z.array(z.string()).optional(),
});

export const availabilitySchema = z.object({
  staffId: z.string().min(1, "Çalışan seçimi zorunludur"),
  dayOfWeek: z.enum([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ]),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Geçersiz saat formatı"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Geçersiz saat formatı"),
  isActive: z.boolean().default(true),
});

export const bookingSchema = z.object({
  serviceId: z.string().min(1, "Hizmet seçimi zorunludur"),
  staffId: z.string().min(1, "Çalışan seçimi zorunludur"),
  startTime: z.string().datetime("Geçersiz tarih-saat"),
  customerName: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  customerEmail: z.string().email("Geçerli bir e-posta adresi girin"),
  customerPhone: z.string().optional(),
  customerProvince: z.string().optional(),
  customerDistrict: z.string().optional(),
  customerCountryCode: z.string().length(2).optional(),
  customerAddressLine: z.string().optional(),
  customerPostalCode: z.string().optional(),
  notes: z.string().optional(),
  privacyNoticeAcknowledged: z.boolean().refine((v) => v === true, {
    message: "KVKK Aydınlatma Metni kabul edilmelidir.",
  }),
  appointmentNotificationConsent: z.boolean().default(true),
  marketingConsent: z.boolean().default(false),
});

export const appointmentStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OrganizationInput = z.infer<typeof organizationSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type StaffInput = z.infer<typeof staffSchema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
