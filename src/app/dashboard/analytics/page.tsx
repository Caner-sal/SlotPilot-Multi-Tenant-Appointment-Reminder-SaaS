import { requireAuth } from "@/lib/tenant";
import { getAnalytics } from "@/services/analytics.service";
import { getTranslations } from "next-intl/server";

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
    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
      <p className="text-xs text-muted-foreground/80 uppercase tracking-wider font-semibold mb-2">{label}</p>
      <p className={`text-4xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground/80 mt-2">{sub}</p>}
    </div>
  );
}

export default async function AnalyticsPage() {
  const t = await getTranslations("analytics");
  const tCommon = await getTranslations("common");
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
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("subtitle")}
        </p>
      </div>

      {!analytics ? (
        <div className="bg-card rounded-xl border border-border p-10 text-center text-muted-foreground/80">
          {t("loadError")}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <BigStat
              label={t("today")}
              value={analytics.todayAppointments}
              sub={t("todayDesc")}
              color="text-blue-600"
            />
            <BigStat
              label={t("thisWeek")}
              value={analytics.weekAppointments}
              sub={t("thisWeekDesc")}
              color="text-indigo-600"
            />
            <BigStat
              label={t("thisMonth")}
              value={analytics.monthAppointments}
              sub={t("thisMonthDesc")}
              color="text-purple-600"
            />
            <BigStat
              label={tCommon("completed")}
              value={analytics.completedCount}
              sub={t("completionRate", { rate: completionRate })}
              color="text-green-600"
            />
            <BigStat
              label={tCommon("cancelled")}
              value={analytics.cancelledCount}
              sub={t("cancelRate", { rate: cancellationRate })}
              color="text-red-600"
            />
            <BigStat
              label={tCommon("noShow")}
              value={analytics.noShowCount}
              sub={t("noShowDesc")}
              color="text-orange-600"
            />
            <BigStat
              label={t("estimatedRevenue")}
              value={revenue}
              sub={t("revenueDesc")}
              color="text-emerald-600"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl border border-border shadow-sm p-6">
              <h2 className="font-semibold text-foreground mb-4">{t("statusDistribution")}</h2>
              <div className="space-y-3">
                {[
                  { label: tCommon("completed"), value: analytics.completedCount, color: "bg-green-500" },
                  { label: tCommon("cancelled"), value: analytics.cancelledCount, color: "bg-red-500" },
                  { label: tCommon("noShow"), value: analytics.noShowCount, color: "bg-orange-500" },
                ].map(({ label, value, color }) => {
                  const pct =
                    analytics.monthAppointments > 0
                      ? Math.round((value / analytics.monthAppointments) * 100)
                      : 0;
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">{label}</span>
                        <span className="text-sm font-medium text-foreground">
                          {value} (%{pct})
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
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

            <div className="bg-card rounded-xl border border-border shadow-sm p-6">
              <h2 className="font-semibold text-foreground mb-4">{t("highlights")}</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl">🏆</div>
                  <div>
                    <p className="text-xs text-muted-foreground/80 font-medium uppercase tracking-wider">
                      {t("topService")}
                    </p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {analytics.topServiceName ?? tCommon("noData")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-indigo-50 rounded-lg">
                  <div className="text-2xl">⭐</div>
                  <div>
                    <p className="text-xs text-muted-foreground/80 font-medium uppercase tracking-wider">
                      {t("topStaff")}
                    </p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {analytics.busiestStaffName ?? tCommon("noData")}
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
