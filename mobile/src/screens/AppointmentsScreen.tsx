import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { apiFetch, ApiError } from "../api/client";
import type { Appointment } from "../api/client";
import { useI18n } from "../i18n";

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
  NO_SHOW: "#ef4444"
};

const CACHE_KEY = "slotpilot_mobile_appointments_cache";

export default function AppointmentsScreen({ token, onSelectAppointment, onBack }: Props) {
  const { locale, t } = useI18n();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCachedBanner, setShowCachedBanner] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await apiFetch<{ data: Appointment[] }>("/api/mobile/appointments?limit=100", {}, token);
        if (!active) return;
        setAppointments(res.data ?? []);
        setShowCachedBanner(false);
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(res.data ?? []));
      } catch (err) {
        const cachedRaw = await AsyncStorage.getItem(CACHE_KEY);
        const cached = cachedRaw ? (JSON.parse(cachedRaw) as Appointment[]) : [];
        if (!active) return;
        if (cached.length > 0) {
          setAppointments(cached);
          setShowCachedBanner(true);
        } else {
          Alert.alert(t("common_error"), t("appointments_load_error"));
        }
        if (err instanceof ApiError && err.status === 403) {
          Alert.alert(t("common_error"), t("common_forbidden"));
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load().catch(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [t, token]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>{t("common_back")}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t("appointments_title")}</Text>
      </View>

      {showCachedBanner && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{t("appointments_cached_banner")}</Text>
          <Text style={styles.bannerSubText}>{t("appointments_offline_banner")}</Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#2563eb" />
      ) : appointments.length === 0 ? (
        <Text style={styles.empty}>{t("appointments_empty")}</Text>
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
                  <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>{t(`status_${item.status.toLowerCase()}`)}</Text>
                </View>
              </View>
              <Text style={styles.serviceName}>{`${item.service.name} - ${item.staff.name}`}</Text>
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
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  back: { color: "#2563eb", fontSize: 15 },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  banner: {
    backgroundColor: "#fef3c7",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  bannerText: { color: "#92400e", fontSize: 12, fontWeight: "600" },
  bannerSubText: { color: "#a16207", fontSize: 11, marginTop: 2 },
  empty: { color: "#9ca3af", textAlign: "center", marginTop: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  customerName: { fontWeight: "600", fontSize: 15, color: "#111827" },
  serviceName: { fontSize: 13, color: "#6b7280", marginBottom: 2 },
  time: { fontSize: 12, color: "#9ca3af" },
  statusBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { fontSize: 11, fontWeight: "600" }
});

