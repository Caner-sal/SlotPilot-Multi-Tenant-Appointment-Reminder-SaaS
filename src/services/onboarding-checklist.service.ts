import { db } from "@/lib/db";

export type OnboardingChecklistKey =
  | "organization_created"
  | "service_created"
  | "first_booking_created"
  | "plan_upgrade_clicked";

export type OnboardingChecklistItem = {
  key: OnboardingChecklistKey;
  label: string;
  completed: boolean;
};

export type OnboardingChecklistSnapshot = {
  organizationId: string;
  completedCount: number;
  totalCount: number;
  progressPercent: number;
  items: OnboardingChecklistItem[];
};

const EVENT_KEYS: OnboardingChecklistKey[] = [
  "organization_created",
  "service_created",
  "first_booking_created",
  "plan_upgrade_clicked",
];

const STEP_LABELS: Record<OnboardingChecklistKey, string> = {
  organization_created: "Isletme olusturuldu",
  service_created: "En az bir hizmet eklendi",
  first_booking_created: "Ilk rezervasyon olusturuldu",
  plan_upgrade_clicked: "Plan yukseltime akisi acildi",
};

export async function getOnboardingChecklistSnapshot(
  organizationId: string
): Promise<OnboardingChecklistSnapshot> {
  const [orgExists, serviceCount, appointmentCount, eventRows] = await Promise.all([
    db.organization.count({ where: { id: organizationId } }),
    db.service.count({ where: { organizationId } }),
    db.appointment.count({ where: { organizationId } }),
    db.productEvent.findMany({
      where: {
        organizationId,
        eventName: { in: EVENT_KEYS },
      },
      select: { eventName: true },
    }),
  ]);

  const eventSet = new Set<OnboardingChecklistKey>(
    eventRows
      .map((row) => row.eventName)
      .filter((name): name is OnboardingChecklistKey =>
        EVENT_KEYS.includes(name as OnboardingChecklistKey)
      )
  );

  const items: OnboardingChecklistItem[] = [
    {
      key: "organization_created",
      label: STEP_LABELS.organization_created,
      completed: orgExists > 0 || eventSet.has("organization_created"),
    },
    {
      key: "service_created",
      label: STEP_LABELS.service_created,
      completed: serviceCount > 0 || eventSet.has("service_created"),
    },
    {
      key: "first_booking_created",
      label: STEP_LABELS.first_booking_created,
      completed: appointmentCount > 0 || eventSet.has("first_booking_created"),
    },
    {
      key: "plan_upgrade_clicked",
      label: STEP_LABELS.plan_upgrade_clicked,
      completed: eventSet.has("plan_upgrade_clicked"),
    },
  ];

  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;

  return {
    organizationId,
    items,
    completedCount,
    totalCount,
    progressPercent: Math.round((completedCount / totalCount) * 100),
  };
}
