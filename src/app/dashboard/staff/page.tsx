"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface Service {
  id: string;
  name: string;
}

interface StaffMember {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  staffServices: { service: Service }[];
}

interface Subscription {
  plan: string;
  limits: { maxStaff: number };
}

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  isActive: true,
  serviceIds: [] as string[],
};

export default function StaffPage() {
  const t = useTranslations("staffPage");
  const tCommon = useTranslations("common");

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function fetchData() {
    setLoading(true);
    try {
      const [staffRes, servicesRes, subRes] = await Promise.all([
        fetch("/api/staff"),
        fetch("/api/services"),
        fetch("/api/billing/subscription"),
      ]);
      const [staffJson, servicesJson, subJson] = await Promise.all([
        staffRes.json(),
        servicesRes.json(),
        subRes.json(),
      ]);
      setStaff(staffJson.data ?? []);
      setServices(servicesJson.data ?? []);
      setSubscription(subJson.data ?? null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function openAddDialog() {
    setEditingStaff(null);
    setForm(emptyForm);
    setError("");
    setDialogOpen(true);
  }

  function openEditDialog(member: StaffMember) {
    setEditingStaff(member);
    setForm({
      name: member.name,
      email: member.email ?? "",
      phone: member.phone ?? "",
      isActive: member.isActive,
      serviceIds: member.staffServices.map((ss) => ss.service.id),
    });
    setError("");
    setDialogOpen(true);
  }

  function toggleService(id: string) {
    setForm((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(id)
        ? prev.serviceIds.filter((s) => s !== id)
        : [...prev.serviceIds, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = editingStaff
        ? await fetch(`/api/staff/${editingStaff.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          })
        : await fetch("/api/staff", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
      if (!res.ok) {
        const j = await res.json();
        setError(typeof j.error === "string" ? j.error : tCommon("error"));
        return;
      }
      setDialogOpen(false);
      await fetchData();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(member: StaffMember) {
    await fetch(`/api/staff/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !member.isActive }),
    });
    await fetchData();
  }

  async function deleteStaff(member: StaffMember) {
    if (!confirm(`"${member.name}" çalışanını kaldırmak istediğinizden emin misiniz?`)) return;
    await fetch(`/api/staff/${member.id}`, { method: "DELETE" });
    await fetchData();
  }

  const activeStaffCount = staff.filter((s) => s.isActive).length;
  const maxStaff = subscription?.limits?.maxStaff ?? 1;
  const atLimit = maxStaff !== Infinity && activeStaffCount >= maxStaff;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>
        <button
          onClick={openAddDialog}
          disabled={atLimit}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {t("addStaff")}
        </button>
      </div>

      {subscription && (
        <div
          className={`rounded-lg px-4 py-3 text-sm border ${
            atLimit
              ? "bg-amber-50 border-amber-200 text-amber-700"
              : "bg-blue-50 border-blue-200 text-blue-700"
          }`}
        >
          {subscription.plan} {t("planPrefix")} {activeStaffCount}/{maxStaff === Infinity ? "∞" : maxStaff} {t("planLimit")}
          {atLimit && ` ${t("upgradePlan")}`}
        </div>
      )}

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-muted-foreground/80">{tCommon("loading")}</div>
        ) : staff.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground/80">
            {t("notFound")}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/70 bg-muted/40">
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">{tCommon("name")}</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">{t("emailCol")}</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">{t("phoneCol")}</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">{t("servicesCol")}</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">{tCommon("status")}</th>
                <th className="px-5 py-3 text-right font-semibold text-muted-foreground">{tCommon("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-foreground">{member.name}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{member.email ?? "—"}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{member.phone ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {member.staffServices.length === 0 ? (
                        <span className="text-muted-foreground/80">{t("none")}</span>
                      ) : (
                        member.staffServices.map((ss) => (
                          <span
                            key={ss.service.id}
                            className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs"
                          >
                            {ss.service.name}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.isActive ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {member.isActive ? tCommon("active") : tCommon("passive")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditDialog(member)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        {tCommon("edit")}
                      </button>
                      <button
                        onClick={() => toggleActive(member)}
                        className="text-muted-foreground hover:text-foreground/90 text-xs font-medium px-2 py-1 rounded hover:bg-muted transition-colors"
                      >
                        {member.isActive ? tCommon("deactivate") : tCommon("activate")}
                      </button>
                      <button
                        onClick={() => deleteStaff(member)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        {tCommon("delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-border/70 flex items-center justify-between sticky top-0 bg-card">
              <h2 className="font-semibold text-foreground">
                {editingStaff ? t("editStaff") : t("addStaff")}
              </h2>
              <button onClick={() => setDialogOpen(false)} className="text-muted-foreground/80 hover:text-muted-foreground">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground/90 mb-1">{t("fullNameLabel")}</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ad Soyad"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/90 mb-1">{t("emailCol")}</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t("emailPlaceholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/90 mb-1">{t("phoneCol")}</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t("phonePlaceholder")}
                />
              </div>
              {services.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-foreground/90 mb-2">{t("assignedServices")}</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-border rounded-lg p-3">
                    {services.map((service) => (
                      <label key={service.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.serviceIds.includes(service.id)}
                          onChange={() => toggleService(service.id)}
                          className="rounded"
                        />
                        <span className="text-sm text-foreground/90">{service.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="staffActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="staffActive" className="text-sm text-foreground/90">
                  {tCommon("active")}
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="flex-1 border border-border text-foreground/90 py-2 rounded-lg text-sm font-medium hover:bg-muted/40 transition-colors"
                >
                  {tCommon("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                >
                  {saving ? tCommon("saving") : editingStaff ? tCommon("update") : tCommon("create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
