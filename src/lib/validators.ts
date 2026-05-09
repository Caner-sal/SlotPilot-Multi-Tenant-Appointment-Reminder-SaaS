import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const organizationSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug must be at most 50 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  timezone: z.string().default("UTC"),
  bookingEnabled: z.boolean().default(true),
});

export const serviceSchema = z.object({
  name: z.string().min(2, "Service name must be at least 2 characters"),
  description: z.string().optional(),
  durationMinutes: z
    .number()
    .int()
    .min(5, "Duration must be at least 5 minutes")
    .max(480, "Duration must be at most 8 hours"),
  priceCents: z.number().int().min(0, "Price cannot be negative"),
  currency: z.string().default("TRY"),
  isActive: z.boolean().default(true),
});

export const staffSchema = z.object({
  name: z.string().min(2, "Staff name must be at least 2 characters"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
  serviceIds: z.array(z.string()).optional(),
});

export const availabilitySchema = z.object({
  staffId: z.string().min(1, "Staff is required"),
  dayOfWeek: z.enum([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ]),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  isActive: z.boolean().default(true),
});

export const bookingSchema = z.object({
  serviceId: z.string().min(1, "Service is required"),
  staffId: z.string().min(1, "Staff is required"),
  startTime: z.string().datetime("Invalid datetime"),
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().optional(),
  customerProvince: z.string().optional(),
  customerDistrict: z.string().optional(),
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
