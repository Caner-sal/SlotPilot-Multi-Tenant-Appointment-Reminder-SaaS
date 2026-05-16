import { requireAuth } from "@/lib/tenant";
import { getAnalytics } from "@/services/analytics.service";
import { db } from "@/lib/db";
import OnboardingChecklistCard from "@/components/dashboard/OnboardingChecklistCard";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

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

const statColors: Record<string, string> = {
  blue:   "#7ba7f5",
  indigo: "#a59cf0",
  purple: "#c4a0f8",
  green:  "#2de4a4",
  red:    "#f43f5e",
  orange: "#f59e0b",
};

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const c = statColors[color] ?? "#a59cf0";
  return (
    <div style={{
      background: "#111120", border: "1px solid rgba(119,104,212,0.1)",
      borderRadius: 12, padding: "16px 14px", position: "relative", overflow: "hidden",
    }}>
      <p style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: c, marginBottom: 4 }}>
        {value}
      </p>
      <p style={{ fontSize: 11, color: "#8a8aaa" }}>{label}</p>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${c},transparent)`, opacity: 0.55 }} />
    </div>
  );
}

const quickLinkMeta = [
  {
    href: "/dashboard/appointments", labelKey: "viewAppointments" as const,
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    ext: false,
  },
  {
    href: "/dashboard/services", labelKey: "manageServices" as const,
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    ext: false,
  },
  {
    href: "/dashboard/staff", labelKey: "manageStaff" as const,
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>,
    ext: false,
  },
  {
    href: "/dashboard/settings", labelKey: "businessSettings" as const,
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
    ext: false,
  },
];

const logDotColors: Record<string, string> = {
  APPOINTMENT_CREATED:   "#7768d4",
  APPOINTMENT_COMPLETED: "#2de4a4",
  APPOINTMENT_CANCELLED: "#f43f5e",
  STAFF_UPDATED:         "#f59e0b",
};

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const data = await getDashboardData();
  const analytics = data?.analytics ?? null;
  const auditLogs = data?.auditLogs ?? [];
  const org = data?.org ?? null;

  const quickLinks = quickLinkMeta.map((ql) => ({ ...ql, label: t(ql.labelKey) }));

  const revenue = analytics
    ? new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(
        analytics.estimatedRevenueCents / 100
      )
    : "—";

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div>
        <h2 style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
          {t("overview")}
        </h2>
        <p style={{ fontSize: 13, color: "#8a8aaa", marginTop: 3 }}>{t("welcome")}</p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label={t("todayAppointments")} value={analytics?.todayAppointments ?? "—"} color="blue" />
        <StatCard label={t("thisWeek")}         value={analytics?.weekAppointments  ?? "—"} color="indigo" />
        <StatCard label={t("thisMonth")}        value={analytics?.monthAppointments ?? "—"} color="purple" />
        <StatCard label={t("completed")}        value={analytics?.completedCount    ?? "—"} color="green" />
        <StatCard label={t("cancelled")}        value={analytics?.cancelledCount    ?? "—"} color="red" />
        <StatCard label={t("noShow")}           value={analytics?.noShowCount       ?? "—"} color="orange" />
      </div>

      {/* Metric cards */}
      <div className="grid md:grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/50 font-bold mb-2" style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)" }}>
            {t("estimatedRevenue")}
          </p>
          <p className="text-2xl font-bold text-green-400" style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)" }}>{revenue}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/50 font-bold mb-2" style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)" }}>
            {t("topService")}
          </p>
          <p className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)" }}>
            {analytics?.topServiceName ?? t("noData")}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/50 font-bold mb-2" style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)" }}>
            {t("topStaff")}
          </p>
          <p className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)" }}>
            {analytics?.busiestStaffName ?? t("noData")}
          </p>
        </div>
      </div>

      <OnboardingChecklistCard />

      {/* Bottom grid */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* Quick links */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)" }}>{t("quickAccess")}</h3>
          <div className="flex flex-col gap-2">
            {quickLinks.map((ql) => (
              <Link
                key={ql.href}
                href={ql.href}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 13px", borderRadius: 9,
                  border: "1px solid rgba(119,104,212,0.1)",
                  fontSize: 13.5, fontWeight: 500, color: "#8a8aaa",
                  transition: "all 0.15s", textDecoration: "none",
                }}
                className="hover:border-[rgba(119,104,212,0.28)] hover:bg-[rgba(119,104,212,0.06)] hover:text-[#f0eff8]"
              >
                <span style={{ color: "#a59cf0", flexShrink: 0 }}>{ql.icon}</span>
                {ql.label}
              </Link>
            ))}
            {org && (
              <Link
                href={`/booking/${org.slug}`}
                target="_blank"
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 13px", borderRadius: 9,
                  border: "1px solid rgba(45,228,164,0.18)",
                  fontSize: 13.5, fontWeight: 500, color: "#2de4a4",
                  transition: "all 0.15s", textDecoration: "none",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                {t("openBookingPage")}
              </Link>
            )}
          </div>
        </div>

        {/* Audit log */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)" }}>{t("recentTransactions")}</h3>
          {auditLogs.length === 0 ? (
            <p style={{ fontSize: 13, color: "#3a3a58" }}>{t("noTransactions")}</p>
          ) : (
            <div>
              {auditLogs.map((log) => {
                const dotColor = logDotColors[log.action] ?? "#7768d4";
                return (
                  <div key={log.id} style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "10px 0", borderBottom: "1px solid rgba(119,104,212,0.07)" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: dotColor, marginTop: 5, flexShrink: 0 }} />
                    <div>
                      <div>
                        <span style={{ fontSize: 12.5, fontWeight: 600 }}>{log.action.replace(/_/g, " ")}</span>
                        <span style={{ fontSize: 12.5, color: "#8a8aaa", marginLeft: 4 }}>· {log.entityType}</span>
                      </div>
                      <p style={{ fontSize: 11, color: "#3a3a58", marginTop: 2 }}>
                        {new Date(log.createdAt).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
