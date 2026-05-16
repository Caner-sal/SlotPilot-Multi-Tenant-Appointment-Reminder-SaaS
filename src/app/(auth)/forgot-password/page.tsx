"use client";

import React, { useState } from "react";
import Link from "next/link";

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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.status === 429) {
        setError("Çok fazla istek gönderildi. Lütfen bir süre bekleyin.");
        return;
      }

      // Always show generic success (even if email not found)
      setSubmitted(true);
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
          Şifremi Unuttum
        </h1>
        <p style={{ fontSize: 14, color: "#8a8aaa", marginBottom: 28, lineHeight: 1.5 }}>
          E-posta adresinizi girin. Kayıtlıysa şifre sıfırlama bağlantısı göndereceğiz.
        </p>

        {submitted ? (
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
            Eğer bu e-posta kayıtlıysa şifre sıfırlama bağlantısı gönderildi.
            E-postanızı kontrol edin.
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
              <label style={labelStyle}>E-posta adresi</label>
              <input
                style={inputStyle}
                type="email"
                placeholder="siz@ornek.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
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
              {loading ? "Gönderiliyor…" : "Sıfırlama Bağlantısı Gönder"}
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
