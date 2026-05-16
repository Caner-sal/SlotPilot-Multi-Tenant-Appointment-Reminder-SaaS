import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { apiFetch } from "../api/client";
import type { Appointment } from "../api/client";
import { useI18n } from "../i18n";

interface Props {
  token: string;
  onBack: () => void;
  onSelectAppointment: (id: string) => void;
}

type ViewMode = "day" | "week";

function startOfDay(date: Date) {
  const clone = new Date(date);
  clone.setHours(0, 0, 0, 0);
  return clone;
}

function endOfDay(date: Date) {
  const clone = new Date(date);
  clone.setHours(23, 59, 59, 999);
  return clone;
}

function startOfWeek(date: Date) {
  const clone = startOfDay(date);
  const offset = (clone.getDay() + 6) % 7;
  clone.setDate(clone.getDate() - offset);
  return clone;
}

function endOfWeek(date: Date) {
  const clone = startOfWeek(date);
  clone.setDate(clone.getDate() + 6);
  clone.setHours(23, 59, 59, 999);
  return clone;
}

export default function CalendarScreen({ token, onBack, onSelectAppointment }: Props) {
  const { locale, t } = useI18n();
  const [mode, setMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const range = useMemo(() => {
    const start = mode === "day" ? startOfDay(currentDate) : startOfWeek(currentDate);
    const end = mode === "day" ? endOfDay(currentDate) : endOfWeek(currentDate);
    return { start, end };
  }, [currentDate, mode]);

  useEffect(() => {
    setLoading(true);
    apiFetch<{ data: Appointment[] }>(
      `/api/mobile/appointments?dateFrom=${range.start.toISOString()}&dateTo=${range.end.toISOString()}&limit=200`,
      {},
      token
    )
      .then((res) => setAppointments(res.data ?? []))
      .catch(() => Alert.alert(t("common_error"), t("appointments_load_error")))
      .finally(() => setLoading(false));
  }, [range.end, range.start, t, token]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>{t("common_back")}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t("calendar_title")}</Text>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.controlButton} onPress={() => setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000))}>
          <Text style={styles.controlText}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.rangeText}>
          {range.start.toLocaleDateString(locale)} - {range.end.toLocaleDateString(locale)}
        </Text>
        <TouchableOpacity style={styles.controlButton} onPress={() => setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000))}>
          <Text style={styles.controlText}>{">"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.modeRow}>
        <TouchableOpacity style={[styles.modeButton, mode === "day" && styles.modeButtonActive]} onPress={() => setMode("day")}>
          <Text style={[styles.modeText, mode === "day" && styles.modeTextActive]}>{t("calendar_day")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.modeButton, mode === "week" && styles.modeButtonActive]} onPress={() => setMode("week")}>
          <Text style={[styles.modeText, mode === "week" && styles.modeTextActive]}>{t("calendar_week")}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 26 }} size="large" color="#2563eb" />
      ) : appointments.length === 0 ? (
        <Text style={styles.empty}>{t("appointments_empty")}</Text>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => onSelectAppointment(item.id)}>
              <Text style={styles.customer}>{item.customer.fullName}</Text>
              <Text style={styles.service}>{item.service.name}</Text>
              <Text style={styles.time}>
                {new Date(item.startTime).toLocaleString(locale, { dateStyle: "short", timeStyle: "short" })}
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
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  back: { color: "#2563eb", fontSize: 15 },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  controlsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  controlButton: { backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  controlText: { color: "#2563eb", fontWeight: "700", fontSize: 16 },
  rangeText: { color: "#111827", fontWeight: "600", fontSize: 13 },
  modeRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  modeButton: { borderRadius: 999, borderWidth: 1, borderColor: "#d1d5db", paddingVertical: 6, paddingHorizontal: 14, backgroundColor: "#fff" },
  modeButtonActive: { borderColor: "#2563eb", backgroundColor: "#eff6ff" },
  modeText: { color: "#6b7280", fontSize: 12, fontWeight: "600" },
  modeTextActive: { color: "#2563eb" },
  empty: { color: "#9ca3af", textAlign: "center", marginTop: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  customer: { fontSize: 15, fontWeight: "700", color: "#111827" },
  service: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  time: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
});
