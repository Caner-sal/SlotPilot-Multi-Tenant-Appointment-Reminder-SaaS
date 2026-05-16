import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { apiFetch } from "../api/client";
import type { AnalyticsSummary, MobileSession } from "../types";
import { useI18n } from "../i18n";
import { supportedLocales } from "../i18n/config";

interface Props {
  session: MobileSession;
  onOpenAppointments: () => void;
  onOpenCalendar: () => void;
  onLogout: () => void;
}

export default function DashboardScreen({ session, onOpenAppointments, onOpenCalendar, onLogout }: Props) {
  const { t, locale, setLocale } = useI18n();
  const [stats, setStats] = useState<AnalyticsSummary["data"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<AnalyticsSummary>("/api/mobile/analytics", {}, session.accessToken)
      .then((res) => setStats(res.data))
      .catch(() => Alert.alert(t("common_error"), t("dashboard_analytics_load_error")))
      .finally(() => setLoading(false));
  }, [session.accessToken, t]);

  const isStaff = session.roles.appRole === "STAFF_MEMBER";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>{t("dashboard_welcome")}</Text>
        <Text style={styles.email}>{session.user.email}</Text>
        <Text style={styles.org}>{session.user.organizationName}</Text>
        <Text style={styles.mode}>{isStaff ? t("dashboard_staff_mode") : t("dashboard_owner_mode")}</Text>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logout}>{t("dashboard_sign_out")}</Text>
        </TouchableOpacity>

        <View style={styles.languageRow}>
          <Text style={styles.languageLabel}>{t("language_label")}:</Text>
          {supportedLocales.map((l) => (
            <TouchableOpacity
              key={l}
              style={[styles.languageChip, locale === l && styles.languageChipActive]}
              onPress={() => setLocale(l)}
            >
              <Text style={[styles.languageChipText, locale === l && styles.languageChipTextActive]}>
                {l.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#2563eb" />
      ) : (
        <View style={styles.statsGrid}>
          <StatCard label={t("dashboard_today")} value={stats?.todayAppointments ?? 0} color="#2563eb" />
          <StatCard label={t("dashboard_this_week")} value={stats?.weekAppointments ?? 0} color="#7c3aed" />
          <StatCard label={t("dashboard_this_month")} value={stats?.monthAppointments ?? 0} color="#059669" />
          <StatCard label={t("dashboard_pending")} value={stats?.pendingAppointments ?? 0} color="#d97706" />
        </View>
      )}

      <TouchableOpacity style={styles.navButton} onPress={onOpenAppointments}>
        <Text style={styles.navButtonText}>{`${t("dashboard_view_appointments")} ->`}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.navButton, styles.secondary]} onPress={onOpenCalendar}>
        <Text style={styles.secondaryText}>{t("dashboard_view_calendar")}</Text>
      </TouchableOpacity>
    </View>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 20 },
  header: { marginBottom: 24 },
  greeting: { fontSize: 22, fontWeight: "700", color: "#111827" },
  email: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  org: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  mode: { fontSize: 12, color: "#2563eb", marginTop: 2, fontWeight: "600" },
  logout: { fontSize: 13, color: "#ef4444", marginTop: 8 },
  languageRow: { marginTop: 10, flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  languageLabel: { fontSize: 12, color: "#6b7280" },
  languageChip: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#fff"
  },
  languageChipActive: { borderColor: "#2563eb", backgroundColor: "#eff6ff" },
  languageChipText: { fontSize: 11, color: "#6b7280", fontWeight: "600" },
  languageChipTextActive: { color: "#2563eb" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: "45%",
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  statValue: { fontSize: 28, fontWeight: "700" },
  statLabel: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  navButton: { backgroundColor: "#2563eb", borderRadius: 12, padding: 14, alignItems: "center", marginBottom: 10 },
  navButtonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  secondary: { backgroundColor: "#eef2ff" },
  secondaryText: { color: "#4338ca", fontWeight: "600", fontSize: 15 },
});

