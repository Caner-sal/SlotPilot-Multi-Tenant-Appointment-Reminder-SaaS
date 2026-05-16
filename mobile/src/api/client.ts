const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
let apiLocale = "tr";

export function setApiLocale(locale: string) {
  apiLocale = locale;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export type AppRole = "OWNER" | "STAFF_MEMBER";
export type PlatformRole = "USER" | "SUPERADMIN";
export type MembershipRole = "OWNER" | "ADMIN" | "STAFF";

export interface MobileUser {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
}

export interface MobileRoles {
  appRole: AppRole;
  platformRole: PlatformRole;
  membershipRole: MembershipRole;
  scope: string[];
}

export interface MobileAuthPayload {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: MobileUser;
  roles: MobileRoles;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept-Language": apiLocale,
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new ApiError(res.status, text);
  }

  return res.json() as Promise<T>;
}

export async function mobileLogin(params: {
  email: string;
  password: string;
  deviceId?: string;
}): Promise<MobileAuthPayload> {
  const response = await apiFetch<{ data: MobileAuthPayload }>("/api/mobile/auth/login", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return response.data;
}

export async function mobileRefresh(params: {
  refreshToken: string;
  deviceId?: string;
}): Promise<MobileAuthPayload> {
  const response = await apiFetch<{ data: MobileAuthPayload }>("/api/mobile/auth/refresh", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return response.data;
}

export async function mobileLogout(refreshToken: string): Promise<void> {
  await apiFetch<{ data: { revoked: boolean } }>("/api/mobile/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";

export interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  service: { name: string; durationMinutes: number };
  staff: { name: string };
  customer: { fullName: string; phone: string | null };
}

export interface AnalyticsSummary {
  data: {
    todayAppointments: number;
    weekAppointments: number;
    monthAppointments: number;
    pendingAppointments: number;
  };
}

