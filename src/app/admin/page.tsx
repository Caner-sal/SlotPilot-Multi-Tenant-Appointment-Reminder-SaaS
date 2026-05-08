import { db } from "@/lib/db";

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
    { label: "Total Organizations", value: orgCount },
    { label: "Total Users", value: userCount },
    { label: "Total Appointments", value: appointmentCount },
    { label: "Audit Log Entries", value: auditCount },
    { label: "Suspended Orgs", value: suspendedCount },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Platform Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Subscriptions by Plan</h2>
        <div className="flex gap-4">
          {planCounts.map((p) => (
            <div key={p.plan} className="text-sm">
              <span className="font-medium">{p.plan}:</span> {p._count.plan}
            </div>
          ))}
          {planCounts.length === 0 && <p className="text-sm text-gray-500">No subscription data yet.</p>}
        </div>
      </div>
    </div>
  );
}
