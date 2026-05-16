"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

interface AppointmentItem {
  id: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string | null;
  organization: { name: string; slug: string };
  service: { name: string; durationMinutes: number; priceCents: number };
  staff: { name: string };
}

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "Bekliyor",
  CONFIRMED: "Onaylandı",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal",
  NO_SHOW: "Gelmedi",
};

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400",
  CONFIRMED: "bg-primary/10 text-primary",
  COMPLETED: "bg-green-500/10 text-green-400",
  CANCELLED: "bg-destructive/10 text-destructive",
  NO_SHOW: "bg-muted text-muted-foreground",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", {
    timeZone: "Europe/Istanbul",
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CustomerAppointmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/customer/appointments")
      .then((r) => r.json())
      .then((json: { data?: AppointmentItem[]; error?: string }) => {
        if (json.error) setError(json.error);
        else setAppointments(json.data ?? []);
      })
      .catch(() => setError("Randevular yüklenemedi."))
      .finally(() => setLoading(false));
  }, [status]);

  const now = new Date();
  const upcoming = appointments.filter(
    (a) => new Date(a.startTime) >= now && a.status !== "CANCELLED"
  );
  const past = appointments.filter(
    (a) => new Date(a.startTime) < now || a.status === "CANCELLED" || a.status === "COMPLETED"
  );

  const displayed = tab === "upcoming" ? upcoming : past;

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Yükleniyor…</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link href="/discover" className="text-primary text-sm hover:underline">
            ← Keşfete Dön
          </Link>
          <h1 className="text-2xl font-bold text-foreground mt-1">Randevularım</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{session.user?.email}</p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-6 w-fit">
          {(["upcoming", "past"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "upcoming"
                ? `Yaklaşan (${upcoming.length})`
                : `Geçmiş (${past.length})`}
            </button>
          ))}
        </div>

        {displayed.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              {tab === "upcoming" ? "Yaklaşan randevunuz yok." : "Geçmiş randevunuz yok."}
            </p>
            {tab === "upcoming" && (
              <Link
                href="/discover"
                className="inline-block mt-4 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                İşletme Keşfet
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map((appt) => (
              <div
                key={appt.id}
                className="bg-card border border-border rounded-xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-foreground">{appt.organization.name}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">{appt.service.name}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_COLORS[appt.status]}`}
                  >
                    {STATUS_LABELS[appt.status]}
                  </span>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>📅 {formatDateTime(appt.startTime)}</p>
                  <p>👤 {appt.staff.name}</p>
                  <p>⏱ {appt.service.durationMinutes} dakika</p>
                  {appt.service.priceCents > 0 && (
                    <p>
                      💰{" "}
                      {new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      }).format(appt.service.priceCents / 100)}
                    </p>
                  )}
                </div>

                {appt.notes && (
                  <p className="text-xs text-muted-foreground/70 border-t border-border pt-2">
                    Not: {appt.notes}
                  </p>
                )}

                <div className="pt-1">
                  <Link
                    href={`/booking/${appt.organization.slug}`}
                    className="text-xs text-primary hover:underline"
                  >
                    Bu işletmeden tekrar randevu al →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
