import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { apiFetch } from "../api/client";
import type { Appointment } from "../api/client";

interface Props {
  token: string;
  onSelectAppointment: (id: string) => void;
  onBack: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#d97706",
  CONFIRMED: "#2563eb",
  COMPLETED: "#059669",
  CANCELLED: "#6b7280",
  NO_SHOW: "#ef4444",
};

export default function AppointmentsScreen({ token, onSelectAppointment, onBack }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ data: Appointment[] }>("/api/appointments", {}, token)
      .then((res) => setAppointments(res.data ?? []))
      .catch(() => Alert.alert("Error", "Could not load appointments."))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Appointments</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#2563eb" />
      ) : appointments.length === 0 ? (
        <Text style={styles.empty}>No appointments found.</Text>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => onSelectAppointment(item.id)}>
              <View style={styles.cardRow}>
                <Text style={styles.customerName}>{item.customer.fullName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + "22" }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.serviceName}>{item.service.name} • {item.staff.name}</Text>
              <Text style={styles.time}>
                {new Date(item.startTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  back: { color: "#2563eb", fontSize: 15 },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  empty: { color: "#9ca3af", textAlign: "center", marginTop: 40 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  customerName: { fontWeight: "600", fontSize: 15, color: "#111827" },
  serviceName: { fontSize: 13, color: "#6b7280", marginBottom: 2 },
  time: { fontSize: 12, color: "#9ca3af" },
  statusBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { fontSize: 11, fontWeight: "600" },
});
