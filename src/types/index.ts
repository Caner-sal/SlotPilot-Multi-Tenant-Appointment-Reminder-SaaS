import type {
  Appointment,
  AppointmentStatus,
  Customer,
  Organization,
  Service,
  Staff,
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
  Reminder,
  ReminderStatus,
  AuditLog,
  AvailabilityRule,
  DayOfWeek,
} from "@prisma/client";

export type {
  Appointment,
  AppointmentStatus,
  Customer,
  Organization,
  Service,
  Staff,
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
  Reminder,
  ReminderStatus,
  AuditLog,
  AvailabilityRule,
  DayOfWeek,
};

export interface AppointmentWithRelations extends Appointment {
  service: Service;
  staff: Staff;
  customer: Customer;
}

export interface StaffWithServices extends Staff {
  staffServices: Array<{ service: Service }>;
}

export interface OrganizationWithSubscription extends Organization {
  subscription: Subscription | null;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
