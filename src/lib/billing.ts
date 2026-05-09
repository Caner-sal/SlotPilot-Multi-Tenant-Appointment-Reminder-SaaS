import { db } from "@/lib/db";
import { SubscriptionPlan } from "@prisma/client";
import { getPlanTR } from "@/config/pricing.tr";

export interface PlanLimits {
  maxStaff: number;
  maxAppointmentsPerMonth: number;
  emailReminders: boolean;
  advancedAnalytics: boolean;
}

export function getPlanLimits(plan: SubscriptionPlan): PlanLimits {
  const trPlan = getPlanTR(plan);
  return {
    maxStaff: trPlan.maxStaff,
    maxAppointmentsPerMonth: trPlan.maxApptsPerMonth,
    emailReminders: plan !== SubscriptionPlan.FREE,
    advancedAnalytics: plan === SubscriptionPlan.PRO,
  };
}

async function getOrganizationPlan(organizationId: string): Promise<SubscriptionPlan> {
  const sub = await db.subscription.findUnique({ where: { organizationId } });
  return sub?.plan ?? SubscriptionPlan.FREE;
}

export async function canCreateStaff(organizationId: string): Promise<{ allowed: boolean; reason?: string }> {
  const plan = await getOrganizationPlan(organizationId);
  const limits = getPlanLimits(plan);

  if (limits.maxStaff === Infinity) return { allowed: true };

  const count = await db.staff.count({
    where: { organizationId, isActive: true },
  });

  if (count >= limits.maxStaff) {
    return {
      allowed: false,
      reason: `Your ${plan} plan allows up to ${limits.maxStaff} staff member(s). Upgrade to add more.`,
    };
  }

  return { allowed: true };
}

export async function canCreateAppointment(organizationId: string): Promise<{ allowed: boolean; reason?: string }> {
  const plan = await getOrganizationPlan(organizationId);
  const limits = getPlanLimits(plan);

  if (limits.maxAppointmentsPerMonth === Infinity) return { allowed: true };

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const count = await db.appointment.count({
    where: {
      organizationId,
      createdAt: { gte: startOfMonth, lte: endOfMonth },
      status: { notIn: ["CANCELLED"] },
    },
  });

  if (count >= limits.maxAppointmentsPerMonth) {
    return {
      allowed: false,
      reason: `Your ${plan} plan allows up to ${limits.maxAppointmentsPerMonth} appointments per month. Upgrade to continue.`,
    };
  }

  return { allowed: true };
}

export async function canUseEmailReminders(organizationId: string): Promise<boolean> {
  const plan = await getOrganizationPlan(organizationId);
  return getPlanLimits(plan).emailReminders;
}
