"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";

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
  width: "100%", background: "#111120",
  border: "1px solid rgba(119,104,212,0.18)", borderRadius: 10,
  padding: "12px 14px", fontSize: 14, color: "#f0eff8", outline: "none",
  fontFamily: "var(--font-body, Nunito, sans-serif)",
  transition: "border-color 0.18s",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: "#8a8aaa",
  fontFamily: "var(--font-heading, Outfit, sans-serif)",
  textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6, display: "block",
};

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message ?? "Kayıt başarısız. Lütfen tekrar deneyin.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      setError("Hesap oluşturuldu fakat giriş başarısız. Lütfen giriş yapın.");
      return;
    }

    router.push("/onboarding");
  }

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh" }}>

      {/* ── LEFT BRANDING PANEL ── */}
      <div
        style={{
          width: 440, flexShrink: 0, background: "#111120",
          borderRight: "1px solid rgba(119,104,212,0.1)",
          display: "flex", flexDirection: "column", padding: "40px 44px",
          position: "relative", overflow: "hidden",
        }}
        className="hidden md:flex"
      >
        <div style={{ position: "absolute", bottom: -100, left: -100, width: 500, height: 500, background: "radial-gradient(ellipse at center, rgba(119,104,212,0.14) 0%, transparent 65%)", pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 56, position: "relative", zIndex: 1 }}>
          <RandevoLogo />
          <span style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: 20, fontWeight: 700, letterSpacing: "-0.4px" }}>Randevo</span>
        </div>

        {/* Headline */}
        <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: 34, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>
            5 dakikada<br />
            <span style={{ background: "linear-gradient(128deg,#b3aaff 0%,#d49cf5 50%,#f9a8d4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              hazır hale gelin
            </span>
          </h2>
          <p style={{ fontSize: 15, color: "#8a8aaa", lineHeight: 1.7, marginBottom: 32 }}>
            Kredi kartı gerekmez. Ücretsiz planla başlayın, büyüdükçe yükseltin.
          </p>

          {/* Plan info */}
          <div style={{ background: "rgba(119,104,212,0.08)", border: "1px solid rgba(119,104,212,0.2)", borderRadius: 14, padding: "18px 20px", marginBottom: 24 }}>
            <p style={{ fontSize: 12, color: "#a59cf0", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-heading, Outfit, sans-serif)", marginBottom: 12 }}>Ücretsiz Plan</p>
            {["1 Çalışan", "Ayda 20 Randevu", "Herkese açık rezervasyon sayfası", "Sınırsız hizmet tanımı"].map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 20, height: 20, background: "rgba(119,104,212,0.12)", border: "1px solid rgba(119,104,212,0.25)", borderRadius: 5, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#a59cf0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                </div>
                <span style={{ fontSize: 13, color: "#8a8aaa" }}>{f}</span>
              </div>
            ))}
          </div>

          {/* Plans comparison */}
          <div style={{ display: "flex", gap: 10 }}>
            {[["Başlangıç", "₺40/ay", "#7768d4"], ["Pro", "₺249/ay", "#a59cf0"]].map(([planName, price, color]) => (
              <div key={planName} style={{ flex: 1, background: "#0b0b16", border: "1px solid rgba(119,104,212,0.1)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 12, color: "#8a8aaa", fontFamily: "var(--font-heading, Outfit, sans-serif)", fontWeight: 600 }}>{planName}</div>
                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--font-heading, Outfit, sans-serif)", color, marginTop: 4 }}>{price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 600px 400px at 60% 30%, rgba(119,104,212,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ width: "100%", maxWidth: 400, position: "relative", zIndex: 1 }}>
          {/* Mobile logo */}
          <div className="flex md:hidden items-center justify-center gap-2 mb-8">
            <RandevoLogo />
            <span style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: 20, fontWeight: 700 }}>Randevo</span>
          </div>

          <h3 style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>{t("registerTitle")}</h3>
          <p style={{ fontSize: 13, color: "#8a8aaa", marginBottom: 24 }}>{t("registerSubtitle")}</p>

          {/* Free plan notice */}
          <div style={{ background: "rgba(119,104,212,0.1)", border: "1px solid rgba(119,104,212,0.22)", borderRadius: 10, padding: "11px 14px", marginBottom: 22, fontSize: 13, color: "#a59cf0", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" />
            </svg>
            {t("registerFreeNote")}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {error && (
              <div style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.25)", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: "#f43f5e" }}>
                {error}
              </div>
            )}

            <div>
              <label style={labelStyle}>{t("fullName")}</label>
              <input style={inputStyle} type="text" placeholder="Ayşe Yılmaz" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
            </div>

            <div>
              <label style={labelStyle}>{t("emailLabel")}</label>
              <input style={inputStyle} type="email" placeholder="siz@ornek.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>

            <div>
              <label style={labelStyle}>{t("passwordLabel")}</label>
              <input style={inputStyle} type="password" placeholder="En az 8 karakter" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" minLength={8} />
              <p style={{ fontSize: 12, color: "#3a3a58", marginTop: 5 }}>{t("passwordHint")}</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: 13, borderRadius: 11, border: "none",
                fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: 15, fontWeight: 700,
                background: loading ? "rgba(119,104,212,0.5)" : "#7768d4", color: "#fff",
                boxShadow: "0 0 24px rgba(119,104,212,0.28)", cursor: loading ? "default" : "pointer",
                marginTop: 4, transition: "all 0.2s",
              }}
            >
              {loading ? t("creating") : t("createFreeAccount")}
            </button>
          </form>

          <p style={{ fontSize: 12, color: "#3a3a58", textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
            Kayıt olarak{" "}
            <a href="#" style={{ color: "#a59cf0" }}>Kullanım Koşulları</a>
            {" "}ve{" "}
            <a href="#" style={{ color: "#a59cf0" }}>KVKK Aydınlatma Metni</a>
            &apos;ni kabul etmiş olursunuz.
          </p>

          <p style={{ fontSize: 13, color: "#3a3a58", textAlign: "center", marginTop: 18 }}>
            {t("alreadyHaveAccount")}{" "}
            <Link href="/login" style={{ color: "#a59cf0", fontWeight: 600 }}>{t("signIn")}</Link>
          </p>
        </div>
      </div>

    </div>
  );
}
