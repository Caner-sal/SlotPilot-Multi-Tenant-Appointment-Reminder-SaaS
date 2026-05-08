import { db } from "@/lib/db";
import { SubscriptionPlan } from "@prisma/client";

export interface PlanLimits {
  maxStaff: number;
  maxAppointmentsPerMonth: number;
  emailReminders: boolean;
  advancedAnalytics: boolean;
}

export function getPlanLimits(plan: SubscriptionPlan): PlanLimits {
  switch (plan) {
    case SubscriptionPlan.FREE:
      return {
        maxStaff: 1,
        maxAppointmentsPerMonth: 20,
        emailReminders: false,
        advancedAnalytics: false,
      };
    case SubscriptionPlan.STARTER:
      return {
        maxStaff: 3,
        maxAppointmentsPerMonth: 300,
        emailReminders: true,
        advancedAnalytics: false,
      };
    case SubscriptionPlan.PRO:
      return {
        maxStaff: Infinity,
        maxAppointmentsPerMonth: Infinity,
        emailReminders: true,
        advancedAnalytics: true,
      };
  }
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
