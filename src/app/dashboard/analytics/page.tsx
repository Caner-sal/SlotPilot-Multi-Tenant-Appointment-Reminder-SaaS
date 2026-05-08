import { requireAuth } from "@/lib/tenant";
import { getAnalytics } from "@/services/analytics.service";

async function fetchAnalytics() {
  try {
    const { org } = await requireAuth();
    return await getAnalytics(org.id);
  } catch {
    return null;
  }
}

function BigStat({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">{label}</p>
      <p className={`text-4xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-2">{sub}</p>}
    </div>
  );
}

export default async function AnalyticsPage() {
  const analytics = await fetchAnalytics();

  const revenue = analytics
    ? new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(
        analytics.estimatedRevenueCents / 100
      )
    : "—";

  const completionRate =
    analytics && analytics.monthAppointments > 0
      ? Math.round((analytics.completedCount / analytics.monthAppointments) * 100)
      : 0;

  const cancellationRate =
    analytics && analytics.monthAppointments > 0
      ? Math.round((analytics.cancelledCount / analytics.monthAppointments) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">
          Business performance overview for the current month.
        </p>
      </div>

      {!analytics ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          Could not load analytics data.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <BigStat
              label="Today"
              value={analytics.todayAppointments}
              sub="Appointments today"
              color="text-blue-600"
            />
            <BigStat
              label="This Week"
              value={analytics.weekAppointments}
              sub="Appointments this week"
              color="text-indigo-600"
            />
            <BigStat
              label="This Month"
              value={analytics.monthAppointments}
              sub="Total appointments"
              color="text-purple-600"
            />
            <BigStat
              label="Completed"
              value={analytics.completedCount}
              sub={`${completionRate}% completion rate`}
              color="text-green-600"
            />
            <BigStat
              label="Cancelled"
              value={analytics.cancelledCount}
              sub={`${cancellationRate}% cancellation rate`}
              color="text-red-600"
            />
            <BigStat
              label="No-Shows"
              value={analytics.noShowCount}
              sub="Missed appointments"
              color="text-orange-600"
            />
            <BigStat
              label="Est. Revenue"
              value={revenue}
              sub="From completed appointments"
              color="text-emerald-600"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Appointment Status Breakdown</h2>
              <div className="space-y-3">
                {[
                  { label: "Completed", value: analytics.completedCount, color: "bg-green-500" },
                  { label: "Cancelled", value: analytics.cancelledCount, color: "bg-red-500" },
                  { label: "No-Show", value: analytics.noShowCount, color: "bg-orange-500" },
                ].map(({ label, value, color }) => {
                  const pct =
                    analytics.monthAppointments > 0
                      ? Math.round((value / analytics.monthAppointments) * 100)
                      : 0;
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">{label}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {value} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${color} rounded-full transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Top Performers</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl">🏆</div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                      Most Booked Service
                    </p>
                    <p className="font-semibold text-gray-900 mt-0.5">
                      {analytics.topServiceName ?? "No data yet"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-indigo-50 rounded-lg">
                  <div className="text-2xl">⭐</div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                      Busiest Staff Member
                    </p>
                    <p className="font-semibold text-gray-900 mt-0.5">
                      {analytics.busiestStaffName ?? "No data yet"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
