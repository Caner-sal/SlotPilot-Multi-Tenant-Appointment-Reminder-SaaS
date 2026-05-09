import { db } from "@/lib/db";

function formatPlan(plan: string): string {
  switch (plan) {
    case "FREE":
      return "ÜCRETSİZ";
    case "STARTER":
      return "BAŞLANGIÇ";
    case "PRO":
      return "PRO";
    case "ENTERPRISE":
      return "KURUMSAL";
    default:
      return plan;
  }
}

export default async function AdminOverviewPage() {
  const [orgCount, userCount, appointmentCount, auditCount] = await db.$transaction([
    db.organization.count(),
    db.user.count(),
    db.appointment.count(),
    db.auditLog.count(),
  ]);

  const planCounts = await db.subscription.groupBy({
    by: ["plan"],
    _count: { plan: true },
  });

  const suspendedCount = await db.organization.count({ where: { suspended: true } });

  const stats = [
    { label: "Toplam İşletme", value: orgCount },
    { label: "Toplam Kullanıcı", value: userCount },
    { label: "Toplam Randevu", value: appointmentCount },
    { label: "İşlem Kaydı", value: auditCount },
    { label: "Askıdaki İşletme", value: suspendedCount },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Platform Genel Bakış</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Plan Bazlı Abonelikler</h2>
        <div className="flex gap-4">
          {planCounts.map((p) => (
            <div key={p.plan} className="text-sm">
              <span className="font-medium">{formatPlan(p.plan)}:</span> {p._count.plan}
            </div>
          ))}
          {planCounts.length === 0 && <p className="text-sm text-gray-500">Henüz abonelik verisi yok.</p>}
        </div>
      </div>
    </div>
  );
}
