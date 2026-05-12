import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { apiFetch } from "../api/client";
import type { Appointment, AppointmentStatus } from "../api/client";
import { useI18n } from "../i18n";

interface Props {
  appointmentId: string;
  token: string;
  onBack: () => void;
}

const ALLOWED_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "NO_SHOW", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: []
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#d97706",
  CONFIRMED: "#2563eb",
  COMPLETED: "#059669",
  CANCELLED: "#6b7280",
  NO_SHOW: "#ef4444"
};

export default function AppointmentDetailScreen({ appointmentId, token, onBack }: Props) {
  const { locale, t } = useI18n();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    apiFetch<{ data: Appointment }>(`/api/appointments/${appointmentId}`, {}, token)
      .then((res) => setAppointment(res.data))
      .catch(() => Alert.alert(t("common_error"), t("appointment_load_error")))
      .finally(() => setLoading(false));
  }, [appointmentId, t, token]);

  async function updateStatus(newStatus: AppointmentStatus) {
    if (!appointment) return;

    setUpdating(true);
    try {
      await apiFetch(
        `/api/appointments/${appointmentId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: newStatus })
        },
        token
      );

      setAppointment({ ...appointment, status: newStatus });
      Alert.alert(t("appointment_update_status"), t("appointment_update_success", { status: t(`status_${newStatus.toLowerCase()}`) }));
    } catch {
      Alert.alert(t("common_error"), t("appointment_update_error"));
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={styles.centered}>
        <Text>{t("appointment_not_found")}</Text>
      </View>
    );
  }

  const transitions = ALLOWED_TRANSITIONS[appointment.status] ?? [];

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack}>
        <Text style={styles.back}>{t("common_back")}</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.customerName}>{appointment.customer.fullName}</Text>
        {appointment.customer.phone && <Text style={styles.phone}>{appointment.customer.phone}</Text>}

        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[appointment.status] + "22" }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[appointment.status] }]}>
            {t(`status_${appointment.status.toLowerCase()}`)}
          </Text>
        </View>

        <View style={styles.divider} />

        <Row label={t("appointment_service")} value={appointment.service.name} />
        <Row
          label={t("appointment_duration")}
          value={t("appointment_duration_min", { minutes: appointment.service.durationMinutes })}
        />
        <Row label={t("appointment_staff")} value={appointment.staff.name} />
        <Row
          label={t("appointment_start")}
          value={new Date(appointment.startTime).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })}
        />
        <Row
          label={t("appointment_end")}
          value={new Date(appointment.endTime).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })}
        />
      </View>

      {transitions.length > 0 && (
        <View style={styles.actions}>
          <Text style={styles.actionsLabel}>{t("appointment_update_status")}</Text>
          {transitions.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.actionButton, { backgroundColor: STATUS_COLORS[s] }]}
              onPress={() => updateStatus(s)}
              disabled={updating}
            >
              <Text style={styles.actionButtonText}>{t(`status_${s.toLowerCase()}`)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 20 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  back: { color: "#2563eb", fontSize: 15, marginBottom: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3
  },
  customerName: { fontSize: 20, fontWeight: "700", color: "#111827", marginBottom: 4 },
  phone: { fontSize: 13, color: "#6b7280", marginBottom: 12 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: "flex-start", marginBottom: 12 },
  statusText: { fontSize: 12, fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#f3f4f6", marginVertical: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  rowLabel: { fontSize: 13, color: "#6b7280" },
  rowValue: { fontSize: 13, fontWeight: "500", color: "#111827", maxWidth: "60%", textAlign: "right" },
  actions: { marginTop: 20 },
  actionsLabel: { fontSize: 13, color: "#6b7280", marginBottom: 10 },
  actionButton: { borderRadius: 10, padding: 12, alignItems: "center", marginBottom: 8 },
  actionButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 }
});
