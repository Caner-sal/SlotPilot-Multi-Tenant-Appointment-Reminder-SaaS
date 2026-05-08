"use client";

import { useState, useEffect } from "react";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

interface AvailabilityRule {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export default function StaffAvailabilityPage() {
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/staff-portal/availability")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setRules(d.data);
      });
  }, []);

  function updateRule(day: string, field: keyof AvailabilityRule, value: string | boolean) {
    setRules((prev) => {
      const existing = prev.find((r) => r.dayOfWeek === day);
      if (existing) {
        return prev.map((r) => r.dayOfWeek === day ? { ...r, [field]: value } : r);
      }
      return [...prev, { dayOfWeek: day, startTime: "09:00", endTime: "17:00", isActive: true, [field]: value }];
    });
  }

  function isEnabled(day: string) {
    return rules.some((r) => r.dayOfWeek === day);
  }

  function toggleDay(day: string) {
    if (isEnabled(day)) {
      setRules((prev) => prev.filter((r) => r.dayOfWeek !== day));
    } else {
      setRules((prev) => [...prev, { dayOfWeek: day, startTime: "09:00", endTime: "17:00", isActive: true }]);
    }
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/staff-portal/availability", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rules),
    });
    setSaving(false);
    setMessage(res.ok ? "Availability saved!" : "Failed to save.");
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Availability</h1>
      <div className="bg-white rounded-lg border divide-y">
        {DAYS.map((day) => {
          const rule = rules.find((r) => r.dayOfWeek === day);
          const enabled = !!rule;
          return (
            <div key={day} className="px-4 py-3 flex items-center gap-4">
              <input type="checkbox" checked={enabled} onChange={() => toggleDay(day)} className="w-4 h-4" />
              <span className="w-24 text-sm font-medium text-gray-700">{day.charAt(0) + day.slice(1).toLowerCase()}</span>
              {enabled && (
                <div className="flex gap-2 items-center text-sm">
                  <input
                    type="time"
                    value={rule?.startTime ?? "09:00"}
                    onChange={(e) => updateRule(day, "startTime", e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                  <span className="text-gray-500">—</span>
                  <input
                    type="time"
                    value={rule?.endTime ?? "17:00"}
                    onChange={(e) => updateRule(day, "endTime", e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Availability"}
        </button>
        {message && <span className={`text-sm ${message.includes("Failed") ? "text-red-600" : "text-green-600"}`}>{message}</span>}
      </div>
    </div>
  );
}
