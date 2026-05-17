"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useMarketContext } from "@/lib/geo/use-market-context";

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

const TR_FEATURES = [
  "5 dakikada kurulum, anında kullanıma hazır",
  "SMS, WhatsApp ve e-posta hatırlatmaları",
  "KVKK uyumlu, Türkiye'ye özel altyapı",
  "Kredi kartı gerektirmeyen ücretsiz plan",
];

const GLOBAL_FEATURES = [
  "Set up in 5 minutes, ready to use instantly",
  "SMS, WhatsApp and email reminders",
  "Privacy-ready, multi-country infrastructure",
  "Free plan, no credit card required",
];

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { isTurkey } = useMarketContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      setError(t("loginError"));
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    if (session?.user?.platformRole === "SUPERADMIN") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh" }}>

      {/* ── LEFT BRANDING PANEL ── */}
      <div style={{
        width: 440, flexShrink: 0, background: "#111120",
        borderRight: "1px solid rgba(119,104,212,0.1)",
        display: "flex", flexDirection: "column", padding: "40px 44px",
        position: "relative", overflow: "hidden",
      }} className="hidden md:flex">
        {/* glow */}
        <div style={{ position: "absolute", bottom: -100, left: -100, width: 500, height: 500, background: "radial-gradient(ellipse at center, rgba(119,104,212,0.14) 0%, transparent 65%)", pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 56, position: "relative", zIndex: 1 }}>
          <RandevoLogo />
          <span style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: 20, fontWeight: 700, letterSpacing: "-0.4px" }}>Randevo</span>
        </div>

        {/* Headline */}
        <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {isTurkey ? (
            <h2 style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: 34, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>
              Türkiye&apos;nin<br />
              <span style={{ background: "linear-gradient(128deg,#b3aaff 0%,#d49cf5 50%,#f9a8d4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                akıllı randevu
              </span><br />
              platformu
            </h2>
          ) : (
            <h2 style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: 34, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>
              Smart booking<br />
              <span style={{ background: "linear-gradient(128deg,#b3aaff 0%,#d49cf5 50%,#f9a8d4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                platform
              </span><br />
              for local businesses
            </h2>
          )}
          <p style={{ fontSize: 15, color: "#8a8aaa", lineHeight: 1.7, marginBottom: 32 }}>
            {isTurkey
              ? "Binlerce işletme randevularını Randevo ile yönetiyor."
              : "Thousands of businesses manage their appointments with Randevo."}
          </p>

          {/* Features */}
          {(isTurkey ? TR_FEATURES : GLOBAL_FEATURES).map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 22, height: 22, background: "rgba(119,104,212,0.12)", border: "1px solid rgba(119,104,212,0.25)", borderRadius: 6, display: "grid", placeItems: "center", flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a59cf0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              </div>
              <span style={{ fontSize: 14, color: "#8a8aaa", fontWeight: 500 }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div style={{ background: "#0b0b16", border: "1px solid rgba(119,104,212,0.1)", borderRadius: 14, padding: "18px 20px", position: "relative", zIndex: 1, marginTop: 32 }}>
          {isTurkey ? (
            <>
              <p style={{ fontSize: 14, color: "#8a8aaa", lineHeight: 1.6, fontStyle: "italic", marginBottom: 12 }}>
                &ldquo;Randevo ile randevu iptallerimiz %60 azaldı. Artık telefon yerine otomatik hatırlatma gönderiyor.&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#7768d4", display: "grid", placeItems: "center", fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: 12, fontWeight: 700, color: "#fff" }}>KA</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Kemal Arslan</div>
                  <div style={{ fontSize: 12, color: "#3a3a58" }}>Kuaför İşletmecisi, İzmir</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize: 14, color: "#8a8aaa", lineHeight: 1.6, fontStyle: "italic", marginBottom: 12 }}>
                &ldquo;Since using Randevo, our no-shows dropped 60%. Automated reminders replaced our manual calls entirely.&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#7768d4", display: "grid", placeItems: "center", fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: 12, fontWeight: 700, color: "#fff" }}>SR</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Sarah Robinson</div>
                  <div style={{ fontSize: 12, color: "#3a3a58" }}>Salon Owner, London</div>
                </div>
              </div>
            </>
          )}
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

          <h3 style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>{t("loginTitle")}</h3>
          <p style={{ fontSize: 13, color: "#8a8aaa", marginBottom: 28 }}>{t("loginSubtitle")}</p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {error && (
              <div style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.25)", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: "#f43f5e" }}>
                {error}
              </div>
            )}

            <div>
              <label style={labelStyle}>{t("emailLabel")}</label>
              <input style={inputStyle} type="email" placeholder="siz@ornek.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>{t("passwordLabel")}</label>
                <Link href="/forgot-password" style={{ fontSize: 12, color: "#a59cf0" }}>{t("forgotPassword")}</Link>
              </div>
              <input style={inputStyle} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
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
              {loading ? t("signingIn") : t("signIn")}
            </button>
          </form>

          <p style={{ fontSize: 13, color: "#3a3a58", textAlign: "center", marginTop: 18 }}>
            Demo: <span style={{ color: "#8a8aaa", fontWeight: 600 }}>demo@randevo.app</span> / <span style={{ color: "#8a8aaa", fontWeight: 600 }}>demo1234</span>
          </p>

          <p style={{ fontSize: 13, color: "#3a3a58", textAlign: "center", marginTop: 20 }}>
            {t("noAccount")}{" "}
            <Link href="/register" style={{ color: "#a59cf0", fontWeight: 600 }}>{t("createAccount")}</Link>
          </p>
        </div>
      </div>

    </div>
  );
}
