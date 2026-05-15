"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

type DayKey = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

const DAY_KEYS: DayKey[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

interface Staff {
  id: string;
  name: string;
}

interface DayState {
  isActive: boolean;
  startTime: string;
  endTime: string;
}

type Schedule = Record<DayKey, DayState>;

const defaultSchedule: Schedule = {
  MONDAY: { isActive: true, startTime: "09:00", endTime: "18:00" },
  TUESDAY: { isActive: true, startTime: "09:00", endTime: "18:00" },
  WEDNESDAY: { isActive: true, startTime: "09:00", endTime: "18:00" },
  THURSDAY: { isActive: true, startTime: "09:00", endTime: "18:00" },
  FRIDAY: { isActive: true, startTime: "09:00", endTime: "18:00" },
  SATURDAY: { isActive: false, startTime: "09:00", endTime: "14:00" },
  SUNDAY: { isActive: false, startTime: "09:00", endTime: "14:00" },
};

export default function AvailabilityPage() {
  const t = useTranslations("availability");
  const tCommon = useTranslations("common");

  const DAY_LABELS: Record<DayKey, string> = {
    MONDAY: tCommon("monday"),
    TUESDAY: tCommon("tuesday"),
    WEDNESDAY: tCommon("wednesday"),
    THURSDAY: tCommon("thursday"),
    FRIDAY: tCommon("friday"),
    SATURDAY: tCommon("saturday"),
    SUNDAY: tCommon("sunday"),
  };

  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [schedule, setSchedule] = useState<Schedule>(defaultSchedule);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/staff")
      .then((r) => r.json())
      .then((json) => {
        const staffList: Staff[] = json.data ?? [];
        setStaff(staffList);
        if (staffList.length > 0) setSelectedStaffId(staffList[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedStaffId) return;
    fetch(`/api/availability?staffId=${selectedStaffId}`)
      .then((r) => r.json())
      .then((json) => {
        const rules: { dayOfWeek: DayKey; startTime: string; endTime: string; isActive: boolean }[] =
          json.data ?? [];
        const next: Schedule = { ...defaultSchedule };
        for (const rule of rules) {
          next[rule.dayOfWeek] = {
            isActive: rule.isActive,
            startTime: rule.startTime,
            endTime: rule.endTime,
          };
        }
        setSchedule(next);
      });
  }, [selectedStaffId]);

  function updateDay(day: DayKey, field: keyof DayState, value: boolean | string) {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  }

  async function handleSave() {
    if (!selectedStaffId) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const promises = DAY_KEYS.map((key) =>
        fetch("/api/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            staffId: selectedStaffId,
            dayOfWeek: key,
            startTime: schedule[key].startTime,
            endTime: schedule[key].endTime,
            isActive: schedule[key].isActive,
          }),
        })
      );
      const results = await Promise.all(promises);
      const failed = results.find((r) => !r.ok);
      if (failed) {
        const j = await failed.json();
        setError(typeof j.error === "string" ? j.error : t("partialError"));
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-muted-foreground/80">{tCommon("loading")}</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      {staff.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-10 text-center text-muted-foreground/80">
          {t("noStaff")}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-foreground/90">{t("staffLabel")}</label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border/70 bg-muted/40">
              <p className="text-sm font-semibold text-foreground/90">{t("weeklySchedule")}</p>
            </div>
            <div className="divide-y divide-gray-100">
              {DAY_KEYS.map((key) => (
                <div key={key} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-28 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`day-${key}`}
                      checked={schedule[key].isActive}
                      onChange={(e) => updateDay(key, "isActive", e.target.checked)}
                      className="rounded"
                    />
                    <label
                      htmlFor={`day-${key}`}
                      className={`text-sm font-medium cursor-pointer ${
                        schedule[key].isActive ? "text-foreground" : "text-muted-foreground/80"
                      }`}
                    >
                      {DAY_LABELS[key]}
                    </label>
                  </div>
                  {schedule[key].isActive ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="time"
                        value={schedule[key].startTime}
                        onChange={(e) => updateDay(key, "startTime", e.target.value)}
                        className="border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-muted-foreground/80 text-sm">—</span>
                      <input
                        type="time"
                        value={schedule[key].endTime}
                        onChange={(e) => updateDay(key, "endTime", e.target.value)}
                        className="border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground/80">{tCommon("closed")}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {saved && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
              {t("saveSuccess")}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
            >
              {saving ? tCommon("saving") : t("saveSchedule")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
