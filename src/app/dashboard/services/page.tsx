"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number;
  currency: string;
  isActive: boolean;
}

const emptyForm = {
  name: "",
  description: "",
  durationMinutes: 30,
  priceCents: 0,
  currency: "TRY",
  isActive: true,
};

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(cents / 100);
}

export default function ServicesPage() {
  const t = useTranslations("services");
  const tCommon = useTranslations("common");

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function fetchServices() {
    setLoading(true);
    try {
      const res = await fetch("/api/services");
      const json = await res.json();
      setServices(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchServices();
  }, []);

  function openAddDialog() {
    setEditingService(null);
    setForm(emptyForm);
    setError("");
    setDialogOpen(true);
  }

  function openEditDialog(service: Service) {
    setEditingService(service);
    setForm({
      name: service.name,
      description: service.description ?? "",
      durationMinutes: service.durationMinutes,
      priceCents: service.priceCents,
      currency: service.currency,
      isActive: service.isActive,
    });
    setError("");
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        durationMinutes: Number(form.durationMinutes),
        priceCents: Math.round(Number(form.priceCents) * 100),
      };
      const res = editingService
        ? await fetch(`/api/services/${editingService.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/services", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (!res.ok) {
        const j = await res.json();
        setError(typeof j.error === "string" ? j.error : tCommon("error"));
        return;
      }
      setDialogOpen(false);
      await fetchServices();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(service: Service) {
    await fetch(`/api/services/${service.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !service.isActive }),
    });
    await fetchServices();
  }

  async function deleteService(service: Service) {
    if (!confirm(`"${service.name}" hizmetini kaldırmak istediğinizden emin misiniz?`)) return;
    await fetch(`/api/services/${service.id}`, { method: "DELETE" });
    await fetchServices();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>
        <button
          onClick={openAddDialog}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {t("addService")}
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-muted-foreground/80">{tCommon("loading")}</div>
        ) : services.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground/80">
            {t("notFound")}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/70 bg-muted/40">
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">{t("nameCol")}</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">{t("durationCol")}</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">{t("priceCol")}</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground">{tCommon("status")}</th>
                <th className="px-5 py-3 text-right font-semibold text-muted-foreground">{tCommon("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-foreground">{service.name}</div>
                    {service.description && (
                      <div className="text-xs text-muted-foreground/80 mt-0.5 line-clamp-1">{service.description}</div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{service.durationMinutes} {tCommon("min")}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {formatPrice(service.priceCents, service.currency)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        service.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {service.isActive ? tCommon("active") : tCommon("passive")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditDialog(service)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        {tCommon("edit")}
                      </button>
                      <button
                        onClick={() => toggleActive(service)}
                        className="text-muted-foreground hover:text-foreground/90 text-xs font-medium px-2 py-1 rounded hover:bg-muted transition-colors"
                      >
                        {service.isActive ? t("deactivate") : t("activate")}
                      </button>
                      <button
                        onClick={() => deleteService(service)}
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
          <div className="bg-card rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-border/70 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">
                {editingService ? t("editService") : t("addService")}
              </h2>
              <button
                onClick={() => setDialogOpen(false)}
                className="text-muted-foreground/80 hover:text-muted-foreground"
              >
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
                <label className="block text-sm font-medium text-foreground/90 mb-1">Ad *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t("namePlaceholder")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/90 mb-1">{tCommon("description")}</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder={t("descPlaceholder")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/90 mb-1">{t("durationLabel")}</label>
                  <input
                    required
                    type="number"
                    min={5}
                    max={480}
                    value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/90 mb-1">{t("priceLabel")}</label>
                  <input
                    required
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.priceCents / 100}
                    onChange={(e) =>
                      setForm({ ...form, priceCents: Math.round(Number(e.target.value) * 100) })
                    }
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/90 mb-1">{t("currencyLabel")}</label>
                <select
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TRY">{t("tryLabel")}</option>
                  <option value="USD">{t("usdLabel")}</option>
                  <option value="EUR">{t("eurLabel")}</option>
                  <option value="GBP">{t("gbpLabel")}</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm text-foreground/90">
                  {t("activeVisible")}
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
                  {saving ? tCommon("saving") : editingService ? tCommon("update") : tCommon("create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
