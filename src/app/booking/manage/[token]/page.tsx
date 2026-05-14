"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface AppointmentData {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  service: { name: string; durationMinutes: number; priceCents: number; currency: string };
  staff: { name: string };
  customer: { fullName: string; email: string; phone: string | null };
  organization: { name: string; phone: string | null; address: string | null; slug: string };
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Beklemede", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  CONFIRMED: { label: "Onaylandı", color: "#7768d4", bg: "rgba(119,104,212,0.1)" },
  CANCELLED: { label: "İptal Edildi", color: "#f43f5e", bg: "rgba(244,63,94,0.1)" },
  COMPLETED: { label: "Tamamlandı", color: "#2de4a4", bg: "rgba(45,228,164,0.1)" },
  NO_SHOW: { label: "Gelmedi", color: "#8a8aaa", bg: "rgba(138,138,170,0.1)" },
};

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(cents / 100);
}

export default function BookingManagePage() {
  const params = useParams();
  const token = params.token as string;

  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchAppointment = useCallback(async () => {
    try {
      const res = await fetch(`/api/booking/manage/${token}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Randevu bilgileri yüklenemedi.");
        return;
      }
      setAppointment(json.data);
    } catch {
      setError("Sunucu ile bağlantı kurulamadı.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);

  async function handleCancel() {
    setCancelling(true);
    setCancelError(null);
    try {
      const res = await fetch(`/api/booking/manage/${token}/cancel`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setCancelError(json.error ?? "İptal işlemi başarısız.");
        return;
      }
      setCancelSuccess(true);
      setCancelConfirm(false);
      // Refresh appointment data
      await fetchAppointment();
    } catch {
      setCancelError("Sunucu ile bağlantı kurulamadı.");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#09090e", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 36, height: 36, border: "3px solid #7768d4",
            borderTopColor: "transparent", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
          }} />
          <p style={{ color: "#8a8aaa", fontSize: 14 }}>Yükleniyor...</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh", background: "#09090e", display: "flex",
        alignItems: "center", justifyContent: "center", padding: 24,
      }}>
        <div style={{
          background: "#111120", border: "1px solid rgba(244,63,94,0.2)",
          borderRadius: 16, padding: "40px 32px", textAlign: "center", maxWidth: 420,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
          <h1 style={{
            fontFamily: "var(--font-heading, Outfit, sans-serif)",
            fontSize: 20, fontWeight: 700, color: "#f0eff8", marginBottom: 8,
          }}>
            Bağlantı Geçersiz
          </h1>
          <p style={{ color: "#8a8aaa", fontSize: 14, lineHeight: 1.6 }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!appointment) return null;

  const status = STATUS_MAP[appointment.status] ?? STATUS_MAP.PENDING;
  const canCancel = ["PENDING", "CONFIRMED"].includes(appointment.status) &&
    new Date(appointment.startTime) > new Date();

  const dateStr = new Date(appointment.startTime).toLocaleString("tr-TR", {
    timeZone: "Europe/Istanbul",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div style={{
      minHeight: "100vh", background: "#09090e", color: "#f0eff8",
      fontFamily: "var(--font-body, Nunito, sans-serif)",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, rgba(119,104,212,0.15), rgba(119,104,212,0.05))",
        borderBottom: "1px solid rgba(119,104,212,0.1)",
        padding: "24px 0", textAlign: "center",
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{
            fontFamily: "var(--font-heading, Outfit, sans-serif)",
            fontSize: 20, fontWeight: 700, color: "#f0eff8",
          }}>
            Randevo
          </span>
        </Link>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "40px 20px" }}>

        {/* Success message */}
        {cancelSuccess && (
          <div style={{
            background: "rgba(45,228,164,0.08)", border: "1px solid rgba(45,228,164,0.25)",
            borderRadius: 12, padding: "14px 18px", marginBottom: 24,
            fontSize: 14, color: "#2de4a4", textAlign: "center",
          }}>
            ✓ Randevunuz başarıyla iptal edildi.
          </div>
        )}

        {/* Status Badge */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: status.bg, color: status.color,
            padding: "8px 20px", borderRadius: 100,
            fontSize: 14, fontWeight: 600,
            fontFamily: "var(--font-heading, Outfit, sans-serif)",
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: status.color, flexShrink: 0,
            }} />
            {status.label}
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "var(--font-heading, Outfit, sans-serif)",
          fontSize: 26, fontWeight: 700, textAlign: "center",
          marginBottom: 6, letterSpacing: "-0.02em",
        }}>
          Randevu Detayları
        </h1>
        <p style={{ color: "#8a8aaa", fontSize: 14, textAlign: "center", marginBottom: 32 }}>
          {appointment.organization.name}
        </p>

        {/* Details Card */}
        <div style={{
          background: "#111120", border: "1px solid rgba(119,104,212,0.1)",
          borderRadius: 16, overflow: "hidden", marginBottom: 24,
        }}>
          {[
            { label: "Hizmet", value: appointment.service.name },
            { label: "Çalışan", value: appointment.staff.name },
            { label: "Tarih & Saat", value: dateStr },
            { label: "Süre", value: `${appointment.service.durationMinutes} dakika` },
            { label: "Ücret", value: formatPrice(appointment.service.priceCents, appointment.service.currency), highlight: true },
            { label: "Müşteri", value: appointment.customer.fullName },
            { label: "E-posta", value: appointment.customer.email },
            ...(appointment.customer.phone ? [{ label: "Telefon", value: appointment.customer.phone }] : []),
            ...(appointment.notes ? [{ label: "Notlar", value: appointment.notes }] : []),
          ].map((row, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 20px",
              borderBottom: "1px solid rgba(119,104,212,0.06)",
              background: i % 2 === 0 ? "transparent" : "rgba(119,104,212,0.03)",
            }}>
              <span style={{ color: "#8a8aaa", fontSize: 13 }}>{row.label}</span>
              <span style={{
                fontSize: 14, fontWeight: 600,
                color: "highlight" in row && row.highlight ? "#a59cf0" : "#f0eff8",
                textAlign: "right", maxWidth: "60%",
              }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Business info */}
        {(appointment.organization.phone || appointment.organization.address) && (
          <div style={{
            background: "#111120", border: "1px solid rgba(119,104,212,0.1)",
            borderRadius: 12, padding: "16px 20px", marginBottom: 24,
          }}>
            <p style={{
              fontSize: 11, color: "#3a3a58", textTransform: "uppercase",
              letterSpacing: "0.1em", fontWeight: 700, marginBottom: 8,
              fontFamily: "var(--font-heading, Outfit, sans-serif)",
            }}>
              İşletme Bilgileri
            </p>
            {appointment.organization.address && (
              <p style={{ fontSize: 13, color: "#8a8aaa", marginBottom: 4 }}>
                📍 {appointment.organization.address}
              </p>
            )}
            {appointment.organization.phone && (
              <p style={{ fontSize: 13, color: "#8a8aaa" }}>
                📞 {appointment.organization.phone}
              </p>
            )}
          </div>
        )}

        {/* Cancel section */}
        {canCancel && !cancelSuccess && (
          <div style={{
            background: "#111120", border: "1px solid rgba(244,63,94,0.12)",
            borderRadius: 16, padding: "24px 20px",
          }}>
            {!cancelConfirm ? (
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "#8a8aaa", marginBottom: 16 }}>
                  Randevunuzu iptal etmek isterseniz aşağıdaki butonu kullanabilirsiniz.
                </p>
                <button
                  onClick={() => setCancelConfirm(true)}
                  style={{
                    background: "transparent", border: "1px solid rgba(244,63,94,0.3)",
                    color: "#f43f5e", padding: "10px 28px", borderRadius: 10,
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                    fontFamily: "var(--font-heading, Outfit, sans-serif)",
                    transition: "all 0.15s",
                  }}
                >
                  Randevumu İptal Et
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <p style={{
                  fontSize: 14, color: "#f43f5e", fontWeight: 600, marginBottom: 6,
                  fontFamily: "var(--font-heading, Outfit, sans-serif)",
                }}>
                  Emin misiniz?
                </p>
                <p style={{ fontSize: 13, color: "#8a8aaa", marginBottom: 18 }}>
                  Bu işlem geri alınamaz. Randevunuz iptal edilecektir.
                </p>

                {cancelError && (
                  <div style={{
                    background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.25)",
                    borderRadius: 10, padding: "10px 14px", marginBottom: 14,
                    fontSize: 13, color: "#f43f5e",
                  }}>
                    {cancelError}
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  <button
                    onClick={() => setCancelConfirm(false)}
                    disabled={cancelling}
                    style={{
                      background: "rgba(119,104,212,0.1)", border: "1px solid rgba(119,104,212,0.2)",
                      color: "#a59cf0", padding: "10px 24px", borderRadius: 10,
                      fontSize: 13, fontWeight: 600, cursor: "pointer",
                      fontFamily: "var(--font-heading, Outfit, sans-serif)",
                    }}
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    style={{
                      background: "#f43f5e", border: "none",
                      color: "#fff", padding: "10px 24px", borderRadius: 10,
                      fontSize: 13, fontWeight: 600, cursor: "pointer",
                      fontFamily: "var(--font-heading, Outfit, sans-serif)",
                      opacity: cancelling ? 0.6 : 1,
                    }}
                  >
                    {cancelling ? "İptal Ediliyor..." : "Evet, İptal Et"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer link */}
        {appointment.organization.slug && (
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link
              href={`/booking/${appointment.organization.slug}`}
              style={{
                color: "#a59cf0", fontSize: 13, textDecoration: "none",
                fontWeight: 500,
              }}
            >
              ← Yeni randevu almak için tıklayın
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
