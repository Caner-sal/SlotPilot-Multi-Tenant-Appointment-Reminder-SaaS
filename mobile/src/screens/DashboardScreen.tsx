import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { apiFetch } from "../api/client";
import type { AnalyticsSummary } from "../api/client";

interface Props {
  token: string;
  email: string;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export default function DashboardScreen({ token, email, onNavigate, onLogout }: Props) {
  const [stats, setStats] = useState<AnalyticsSummary["data"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<AnalyticsSummary>("/api/analytics", {}, token)
      .then((res) => setStats(res.data))
      .catch(() => Alert.alert("Error", "Could not load analytics."))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back</Text>
        <Text style={styles.email}>{email}</Text>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logout}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#2563eb" />
      ) : (
        <View style={styles.statsGrid}>
          <StatCard label="Today" value={stats?.todayAppointments ?? 0} color="#2563eb" />
          <StatCard label="This Week" value={stats?.weekAppointments ?? 0} color="#7c3aed" />
          <StatCard label="This Month" value={stats?.monthAppointments ?? 0} color="#059669" />
          <StatCard label="Pending" value={stats?.pendingAppointments ?? 0} color="#d97706" />
        </View>
      )}

      <TouchableOpacity style={styles.navButton} onPress={() => onNavigate("appointments")}>
        <Text style={styles.navButtonText}>View Appointments →</Text>
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
  logout: { fontSize: 13, color: "#ef4444", marginTop: 8 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  statCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16, flex: 1, minWidth: "45%", borderLeftWidth: 4, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  statValue: { fontSize: 28, fontWeight: "700" },
  statLabel: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  navButton: { backgroundColor: "#2563eb", borderRadius: 12, padding: 14, alignItems: "center" },
  navButtonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
