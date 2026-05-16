"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

function RandevoLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <rect x="2" y="6" width="28" height="23" rx="5" fill="rgba(119,104,212,0.14)" stroke="#7768d4" strokeWidth="1.4" />
      <path d="M2 12.5h28" stroke="#7768d4" strokeWidth="0.9" opacity="0.4" />
      <line x1="10" y1="3" x2="10" y2="9.5" stroke="#7768d4" strokeWidth="2" strokeLinecap="round" />
      <line x1="22" y1="3" x2="22" y2="9.5" stroke="#7768d4" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 20.5L14.5 25L22 17" stroke="#7768d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#111120",
  border: "1px solid rgba(119,104,212,0.18)",
  borderRadius: 10,
  padding: "12px 14px",
  fontSize: 14,
  color: "#f0eff8",
  outline: "none",
  fontFamily: "var(--font-body, Nunito, sans-serif)",
  transition: "border-color 0.18s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  color: "#a59cf0",
  marginBottom: 6,
  fontWeight: 500,
};

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = typeof params.token === "string" ? params.token : "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalıdır.");
      return;
    }
    if (password !== confirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Şifre sıfırlanamadı. Bağlantı geçersiz veya süresi dolmuş olabilir.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#09090e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "var(--font-body, Nunito, sans-serif)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#111120",
          borderRadius: 18,
          border: "1px solid rgba(119,104,212,0.12)",
          padding: "40px 36px",
          boxShadow: "0 8px 48px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <RandevoLogo />
          <span style={{ fontSize: 20, fontWeight: 700, color: "#f0eff8", letterSpacing: -0.5 }}>
            Randevo
          </span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f0eff8", marginBottom: 8 }}>
          Yeni Şifre Belirle
        </h1>
        <p style={{ fontSize: 14, color: "#8a8aaa", marginBottom: 28, lineHeight: 1.5 }}>
          Hesabınız için yeni bir şifre girin.
        </p>

        {success ? (
          <div
            style={{
              background: "rgba(45,228,164,0.08)",
              border: "1px solid rgba(45,228,164,0.25)",
              borderRadius: 10,
              padding: "16px 18px",
              color: "#2de4a4",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            Şifreniz başarıyla sıfırlandı. Giriş sayfasına yönlendiriliyorsunuz…
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {error && (
              <div
                style={{
                  background: "rgba(244,63,94,0.08)",
                  border: "1px solid rgba(244,63,94,0.25)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "#f43f5e",
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label style={labelStyle}>Yeni şifre</label>
              <input
                style={inputStyle}
                type="password"
                placeholder="En az 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div>
              <label style={labelStyle}>Şifre tekrar</label>
              <input
                style={inputStyle}
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px 0",
                background: loading ? "rgba(119,104,212,0.4)" : "#7768d4",
                color: "#fff",
                fontWeight: 600,
                fontSize: 15,
                borderRadius: 10,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.18s",
              }}
            >
              {loading ? "Kaydediliyor…" : "Şifremi Sıfırla"}
            </button>
          </form>
        )}

        <div style={{ marginTop: 28, textAlign: "center", fontSize: 13, color: "#8a8aaa" }}>
          <Link href="/login" style={{ color: "#a59cf0", textDecoration: "none" }}>
            ← Giriş sayfasına dön
          </Link>
        </div>
      </div>
    </div>
  );
}
