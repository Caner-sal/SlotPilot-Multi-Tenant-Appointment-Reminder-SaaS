"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [inviteInfo, setInviteInfo] = useState<{ email: string; expiresAt: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", password: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Geçersiz davet bağlantısı.");
      setLoading(false);
      return;
    }

    fetch(`/api/auth/accept-invite?token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setInviteInfo(d.data);
        else setError(d.error ?? "Davet geçersiz.");
        setLoading(false);
      })
      .catch(() => {
        setError("Davet bilgisi yüklenemedi.");
        setLoading(false);
      });
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/auth/accept-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, name: form.name, password: form.password }),
    });

    const data = await res.json();
    if (res.ok) {
      router.push("/login?invited=1");
    } else {
      setError(data.error ?? "Hesap oluşturulamadı.");
      setSubmitting(false);
    }
  }

  if (loading) return <div className="text-muted-foreground">Davet bilgisi yükleniyor...</div>;
  if (error && !inviteInfo) return <div className="text-red-600">{error}</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="mb-4 text-sm text-muted-foreground">
        Çalışan olarak davet edildiniz. E-posta adresiniz: <strong>{inviteInfo?.email}</strong>
      </p>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground/90">Ad Soyad</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder="Ad Soyad"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground/90">Şifre</label>
        <input
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground/90">Şifre (Tekrar)</label>
        <input
          type="password"
          required
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Hesap oluşturuluyor..." : "Çalışan Hesabını Oluştur"}
      </button>
    </form>
  );
}

export default function AcceptInvitePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <div className="w-full max-w-md rounded-lg border bg-card p-8">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Çalışan Daveti</h1>
        <Suspense fallback={<div className="text-muted-foreground">Yükleniyor...</div>}>
          <AcceptInviteForm />
        </Suspense>
      </div>
    </div>
  );
}
