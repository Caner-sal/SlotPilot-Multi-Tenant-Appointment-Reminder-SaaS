import { db } from "@/lib/db";

function formatPlan(plan: string): string {
  switch (plan) {
    case "FREE":
      return "Ücretsiz";
    case "STARTER":
      return "Starter";
    case "PRO":
      return "Pro";
    default:
      return plan;
  }
}

export default async function AdminOverviewPage() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    totalOrganizations,
    activeOrganizations,
    suspendedOrganizations,
    monthlyAppointments,
    activeSubscriptions,
    paymentPendingAccounts,
    planCounts,
    recentLogs,
  ] = await Promise.all([
    db.organization.count(),
    db.organization.count({ where: { suspended: false } }),
    db.organization.count({ where: { suspended: true } }),
    db.appointment.count({ where: { startTime: { gte: monthStart } } }),
    db.subscription.count({ where: { status: { in: ["ACTIVE", "TRIALING"] } } }),
    db.subscription.count({ where: { status: { in: ["PAST_DUE", "INCOMPLETE"] } } }),
    db.subscription.groupBy({ by: ["plan"], _count: { plan: true } }),
    db.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        organization: { select: { name: true, slug: true } },
        actor: { select: { name: true, email: true } },
      },
    }),
  ]);

  const planSummary = { FREE: 0, STARTER: 0, PRO: 0 };
  for (const row of planCounts) {
    planSummary[row.plan] = row._count.plan;
  }

  const stats = [
    { label: "Toplam işletme", value: totalOrganizations },
    { label: "Aktif işletme", value: activeOrganizations },
    { label: "Askıya alınan işletme", value: suspendedOrganizations },
    { label: "Bu ay toplam randevu", value: monthlyAppointments },
    { label: "Aktif abonelikler", value: activeSubscriptions },
    { label: "Ödeme bekleyen hesaplar", value: paymentPendingAccounts },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Genel Bakış</h1>
        <p className="text-sm text-gray-500">Sistem genelindeki işletme, abonelik ve kullanım metrikleri</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Free / Starter / Pro dağılımı</h2>
        <div className="flex gap-4 text-sm">
          {["FREE", "STARTER", "PRO"].map((plan) => (
            <div key={plan}>
              <span className="font-medium">{formatPlan(plan)}:</span> {planSummary[plan as keyof typeof planSummary]}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Son audit kayıtları</h2>
        {recentLogs.length === 0 ? (
          <p className="text-sm text-gray-500">Henüz audit kaydı yok.</p>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <div key={log.id} className="border rounded p-3 text-sm">
                <p className="font-mono text-xs text-gray-700">{log.action}</p>
                <p className="text-gray-600">
                  {log.organization?.name ? `${log.organization.name} (${log.organization.slug})` : "Platform"}
                  {" · "}
                  {log.actor?.name ?? log.actor?.email ?? "Sistem"}
                </p>
                <p className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString("tr-TR")}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
