import { requireAuth } from "@/lib/tenant";
import { getAnalytics } from "@/services/analytics.service";
import { db } from "@/lib/db";
import Link from "next/link";

async function getDashboardData() {
  try {
    const { org } = await requireAuth();
    const [analytics, auditLogs] = await Promise.all([
      getAnalytics(org.id),
      db.auditLog.findMany({
        where: { organizationId: org.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);
    return { analytics, auditLogs, org };
  } catch {
    return null;
  }
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const analytics = data?.analytics ?? null;
  const auditLogs = data?.auditLogs ?? [];
  const org = data?.org ?? null;

  const revenue = analytics
    ? new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(
        analytics.estimatedRevenueCents / 100
      )
    : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kontrol Paneli</h1>
        <p className="text-gray-500 text-sm mt-1">Kontrol panelinize hoş geldiniz.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Bugünkü Randevular"
          value={analytics?.todayAppointments ?? "—"}
          color="text-blue-600"
        />
        <StatCard
          label="Bu Hafta"
          value={analytics?.weekAppointments ?? "—"}
          color="text-indigo-600"
        />
        <StatCard
          label="Bu Ay"
          value={analytics?.monthAppointments ?? "—"}
          color="text-purple-600"
        />
        <StatCard
          label="Tamamlanan"
          value={analytics?.completedCount ?? "—"}
          color="text-green-600"
        />
        <StatCard
          label="İptal Edilen"
          value={analytics?.cancelledCount ?? "—"}
          color="text-red-600"
        />
        <StatCard
          label="Gelmeyen"
          value={analytics?.noShowCount ?? "—"}
          color="text-orange-600"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
            Tahmini Ciro (Ay)
          </p>
          <p className="text-2xl font-bold text-emerald-600">{revenue}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
            En Çok Tercih Edilen Hizmet
          </p>
          <p className="text-lg font-semibold text-gray-800">
            {analytics?.topServiceName ?? "Henüz veri yok"}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
            En Yoğun Çalışan
          </p>
          <p className="text-lg font-semibold text-gray-800">
            {analytics?.busiestStaffName ?? "Henüz veri yok"}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Hızlı Erişim</h2>
          <div className="flex flex-col gap-2">
            <Link
              href="/dashboard/appointments"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm font-medium text-gray-700"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Randevuları Gör
            </Link>
            <Link
              href="/dashboard/services"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm font-medium text-gray-700"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Hizmetleri Yönet
            </Link>
            <Link
              href="/dashboard/staff"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm font-medium text-gray-700"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              Çalışanları Yönet
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm font-medium text-gray-700"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              İşletme Ayarları
            </Link>
            {org && (
              <Link
                href={`/booking/${org.slug}`}
                target="_blank"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-colors text-sm font-medium text-gray-700"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Rezervasyon Sayfasını Aç
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Son İşlemler</h2>
          {auditLogs.length === 0 ? (
            <p className="text-sm text-gray-400">Henüz işlem yok.</p>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-medium text-gray-700">
                      {log.action.replace(/_/g, " ")}
                    </span>
                    <span className="text-gray-400 ml-1">· {log.entityType}</span>
                    <p className="text-gray-400 text-xs">
                      {new Date(log.createdAt).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
