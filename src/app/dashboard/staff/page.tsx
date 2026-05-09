"use client";

import { useState, useEffect } from "react";

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
        setError(typeof j.error === "string" ? j.error : "Bir hata oluştu.");
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
          <h1 className="text-2xl font-bold text-gray-900">Çalışanlar</h1>
          <p className="text-sm text-gray-500 mt-1">Ekip üyelerinizi yönetin.</p>
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
          Çalışan Ekle
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
          {subscription.plan} planı: {activeStaffCount}/{maxStaff === Infinity ? "∞" : maxStaff} çalışan kullanılıyor.
          {atLimit && " Daha fazla çalışan eklemek için planınızı yükseltin."}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Yükleniyor...</div>
        ) : staff.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            Henüz çalışan yok. Başlamak için ilk ekip üyenizi ekleyin.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Ad</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">E-posta</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Telefon</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Hizmetler</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Durum</th>
                <th className="px-5 py-3 text-right font-semibold text-gray-600">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{member.name}</td>
                  <td className="px-5 py-3.5 text-gray-600">{member.email ?? "—"}</td>
                  <td className="px-5 py-3.5 text-gray-600">{member.phone ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {member.staffServices.length === 0 ? (
                        <span className="text-gray-400">Yok</span>
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
                        member.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {member.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditDialog(member)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => toggleActive(member)}
                        className="text-gray-500 hover:text-gray-700 text-xs font-medium px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                      >
                        {member.isActive ? "Pasifleştir" : "Aktifleştir"}
                      </button>
                      <button
                        onClick={() => deleteStaff(member)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Sil
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="font-semibold text-gray-900">
                {editingStaff ? "Çalışanı Düzenle" : "Çalışan Ekle"}
              </h2>
              <button onClick={() => setDialogOpen(false)} className="text-gray-400 hover:text-gray-600">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ad Soyad"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="calisan@ornek.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+90 555 000 0000"
                />
              </div>
              {services.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Atanan Hizmetler</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {services.map((service) => (
                      <label key={service.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.serviceIds.includes(service.id)}
                          onChange={() => toggleService(service.id)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">{service.name}</span>
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
                <label htmlFor="staffActive" className="text-sm text-gray-700">
                  Aktif
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                >
                  {saving ? "Kaydediliyor..." : editingStaff ? "Güncelle" : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
