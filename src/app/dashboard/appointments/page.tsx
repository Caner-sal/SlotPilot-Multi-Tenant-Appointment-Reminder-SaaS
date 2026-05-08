"use client";

import { useState, useEffect, useCallback } from "react";

interface Appointment {
  id: string;
  startTime: string;
  status: string;
  notes: string | null;
  service: { name: string; durationMinutes: number };
  staff: { name: string };
  customer: { fullName: string; email: string };
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Staff {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-orange-100 text-orange-700",
};

const STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [serviceList, setServiceList] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const [filters, setFilters] = useState({
    date: "",
    status: "",
    staffId: "",
    serviceId: "",
    page: 1,
  });

  const [org, setOrg] = useState<{ slug: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/staff").then((r) => r.json()),
      fetch("/api/services").then((r) => r.json()),
      fetch("/api/organizations/current").then((r) => r.json()),
    ]).then(([staffJson, servicesJson, orgJson]) => {
      setStaffList(staffJson.data ?? []);
      setServiceList(servicesJson.data ?? []);
      setOrg(orgJson.data ?? null);
    });
  }, []);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.date) params.set("date", filters.date);
      if (filters.status) params.set("status", filters.status);
      if (filters.staffId) params.set("staffId", filters.staffId);
      if (filters.serviceId) params.set("serviceId", filters.serviceId);
      params.set("page", String(filters.page));
      params.set("limit", "20");

      const res = await fetch(`/api/appointments?${params.toString()}`);
      const json = await res.json();
      setAppointments(json.data ?? []);
      setMeta(json.meta ?? null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/appointments/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await fetchAppointments();
  }

  function copyBookingLink() {
    if (!org) return;
    const url = `${window.location.origin}/booking/${org.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function setFilter(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all bookings.</p>
        </div>
        <button
          onClick={copyBookingLink}
          className="inline-flex items-center gap-2 border border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {copied ? "Copied!" : "Copy Booking Link"}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilter("date", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilter("status", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase().replace("_", "-")}
              </option>
            ))}
          </select>
          <select
            value={filters.staffId}
            onChange={(e) => setFilter("staffId", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Staff</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            value={filters.serviceId}
            onChange={(e) => setFilter("serviceId", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Services</option>
            {serviceList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {(filters.date || filters.status || filters.staffId || filters.serviceId) && (
            <button
              onClick={() => setFilters({ date: "", status: "", staffId: "", serviceId: "", page: 1 })}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading...</div>
        ) : appointments.length === 0 ? (
          <div className="p-10 text-center text-gray-400">No appointments found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Customer</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Service</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Staff</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Date & Time</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Status</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Notes</th>
                <th className="px-5 py-3 text-right font-semibold text-gray-600">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {appointments.map((appt) => (
                <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-gray-900">{appt.customer.fullName}</div>
                    <div className="text-xs text-gray-400">{appt.customer.email}</div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-700">
                    <div>{appt.service.name}</div>
                    <div className="text-xs text-gray-400">{appt.service.durationMinutes} min</div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-700">{appt.staff.name}</td>
                  <td className="px-5 py-3.5 text-gray-700">
                    {new Date(appt.startTime).toLocaleDateString()}{" "}
                    <span className="text-gray-500">
                      {new Date(appt.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_COLORS[appt.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {appt.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 max-w-[160px]">
                    <span className="line-clamp-1 text-xs">{appt.notes ?? "—"}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <select
                      value={appt.status}
                      onChange={(e) => updateStatus(appt.id, e.target.value)}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(meta.page - 1) * meta.limit + 1}–
            {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={meta.page <= 1}
              onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              {meta.page} / {meta.totalPages}
            </span>
            <button
              disabled={meta.page >= meta.totalPages}
              onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
