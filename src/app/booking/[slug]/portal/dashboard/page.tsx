"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface Appointment {
  id: string;
  status: string;
  startTime: string;
  service: {
    name: string;
    priceCents: number;
    currency: string;
  };
  staff: {
    name: string;
  };
}

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(cents / 100);
}

export default function CustomerPortalDashboard() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/booking/${slug}/portal/appointments`);
        if (res.status === 401) {
          router.push(`/booking/${slug}/portal?error=MissingToken`);
          return;
        }
        
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "Randevular yüklenemedi.");
        }
        
        setAppointments(json.data || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Randevular yüklenemedi.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, router]);

  async function cancelAppointment(id: string) {
    if (!confirm("Bu randevuyu iptal etmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/booking/${slug}/portal/appointments/${id}/cancel`, {
        method: "POST",
      });
      const json = await res.json();
      
      if (!res.ok) {
        alert(json.error || "İptal işlemi başarısız.");
        return;
      }

      alert("Randevunuz iptal edildi.");
      
      // Update local state
      setAppointments(prev => prev.map(app => 
        app.id === id ? { ...app, status: "CANCELLED" } : app
      ));
    } catch (_err) {
      alert("Bir hata oluştu.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 text-red-700 p-4 rounded-xl inline-block mb-4">
          {error}
        </div>
        <div>
          <button onClick={() => router.push(`/booking/${slug}/portal`)} className="text-blue-600 hover:underline">
            Giriş sayfasına dön
          </button>
        </div>
      </div>
    );
  }

  const upcoming = appointments.filter(a => new Date(a.startTime) >= new Date() && (a.status === "PENDING" || a.status === "CONFIRMED"));
  const pastOrCancelled = appointments.filter(a => !upcoming.includes(a));

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Müşteri Portalı</h1>
        <button
          onClick={() => router.push(`/booking/${slug}`)}
          className="text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          Yeni Randevu Al &rarr;
        </button>
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Yaklaşan Randevularınız</h2>
        {upcoming.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500">
            Yaklaşan bir randevunuz bulunmuyor.
          </div>
        ) : (
          <div className="grid gap-4">
            {upcoming.map(app => (
              <div key={app.id} className="bg-white border border-blue-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{app.service.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">Çalışan: <span className="font-medium text-gray-700">{app.staff.name}</span></p>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1 text-blue-700 font-medium bg-blue-50 px-2.5 py-1 rounded-md">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {new Date(app.startTime).toLocaleString("tr-TR", {
                          weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                        })}
                      </span>
                      <span className="text-gray-600 font-medium">
                        {formatPrice(app.service.priceCents, app.service.currency)}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <button
                      onClick={() => cancelAppointment(app.id)}
                      className="w-full sm:w-auto px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                    >
                      İptal Et
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Geçmiş Randevular</h2>
        {pastOrCancelled.length === 0 ? (
          <div className="text-gray-400 text-sm italic">Geçmiş randevunuz bulunmuyor.</div>
        ) : (
          <div className="space-y-3">
            {pastOrCancelled.map(app => (
              <div key={app.id} className="bg-gray-50 border border-gray-100 rounded-lg p-4 flex items-center justify-between opacity-80">
                <div>
                  <h4 className="font-medium text-gray-800">{app.service.name}</h4>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(app.startTime).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                    {" · "}
                    {app.staff.name}
                  </div>
                </div>
                <div>
                  {app.status === "CANCELLED" ? (
                    <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-md">İPTAL EDİLDİ</span>
                  ) : app.status === "COMPLETED" ? (
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-md">TAMAMLANDI</span>
                  ) : app.status === "NO_SHOW" ? (
                    <span className="px-2.5 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-md">GELMEDİ</span>
                  ) : (
                    <span className="px-2.5 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-md">{app.status}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
