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
        <h1 className="text-2xl font-bold text-gray-900">Analitik</h1>
        <p className="text-sm text-gray-500 mt-1">
          Bu aya ait işletme performans özeti.
        </p>
      </div>

      {!analytics ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          Analitik verileri yüklenemedi.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <BigStat
              label="Bugün"
              value={analytics.todayAppointments}
              sub="Bugünkü randevular"
              color="text-blue-600"
            />
            <BigStat
              label="Bu Hafta"
              value={analytics.weekAppointments}
              sub="Bu haftaki randevular"
              color="text-indigo-600"
            />
            <BigStat
              label="Bu Ay"
              value={analytics.monthAppointments}
              sub="Toplam randevular"
              color="text-purple-600"
            />
            <BigStat
              label="Tamamlanan"
              value={analytics.completedCount}
              sub={`%${completionRate} tamamlanma oranı`}
              color="text-green-600"
            />
            <BigStat
              label="İptal Edilen"
              value={analytics.cancelledCount}
              sub={`%${cancellationRate} iptal oranı`}
              color="text-red-600"
            />
            <BigStat
              label="Gelmeyen"
              value={analytics.noShowCount}
              sub="Gelmeden iptal"
              color="text-orange-600"
            />
            <BigStat
              label="Tahmini Ciro"
              value={revenue}
              sub="Tamamlanan randevulardan"
              color="text-emerald-600"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Randevu Durum Dağılımı</h2>
              <div className="space-y-3">
                {[
                  { label: "Tamamlanan", value: analytics.completedCount, color: "bg-green-500" },
                  { label: "İptal Edilen", value: analytics.cancelledCount, color: "bg-red-500" },
                  { label: "Gelmeyen", value: analytics.noShowCount, color: "bg-orange-500" },
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
                          {value} (%{pct})
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
              <h2 className="font-semibold text-gray-900 mb-4">Öne Çıkanlar</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl">🏆</div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                      En Çok Tercih Edilen Hizmet
                    </p>
                    <p className="font-semibold text-gray-900 mt-0.5">
                      {analytics.topServiceName ?? "Henüz veri yok"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-indigo-50 rounded-lg">
                  <div className="text-2xl">⭐</div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                      En Yoğun Çalışan
                    </p>
                    <p className="font-semibold text-gray-900 mt-0.5">
                      {analytics.busiestStaffName ?? "Henüz veri yok"}
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
