"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const TIMEZONES = [
  "Europe/Istanbul",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Asia/Tokyo",
  "Asia/Dubai",
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

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

const steps = ["İşletme Bilgileri", "İletişim", "Konum & Saat"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [address, setAddress] = useState("");
  const [timezone, setTimezone] = useState("Europe/Istanbul");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slugEdited) setSlug(slugify(businessName));
  }, [businessName, slugEdited]);

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugEdited(true);
    setSlug(slugify(e.target.value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: businessName, slug, description, phone, email: orgEmail, address, timezone }),
    });

    const data = await res.json();
    if (!res.ok) {
      if (res.status === 409 || data.message?.toLowerCase().includes("slug")) {
        setError("Bu URL kısa adı kullanımda. Lütfen farklı bir kısa ad seçin.");
      } else {
        setError(data.message ?? "Bir hata oluştu. Lütfen tekrar deneyin.");
      }
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 800px 500px at 50% 30%, rgba(119,104,212,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 560, position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 40 }}>
          <RandevoLogo />
          <span style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: 20, fontWeight: 700, letterSpacing: "-0.4px" }}>Randevo</span>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%", display: "grid", placeItems: "center",
                  fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: 13, fontWeight: 700,
                  background: i < step ? "#7768d4" : i === step ? "#7768d4" : "#181828",
                  color: i <= step ? "#fff" : "#3a3a58",
                  border: i > step ? "1px solid rgba(119,104,212,0.15)" : "none",
                  boxShadow: i === step ? "0 0 0 4px rgba(119,104,212,0.14)" : "none",
                  transition: "all 0.25s",
                }}>
                  {i < step
                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    : i + 1
                  }
                </div>
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: 1, background: i < step ? "#7768d4" : "rgba(119,104,212,0.15)", margin: "0 6px", marginBottom: 16, opacity: 0.7 }} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 32 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ textAlign: "center", fontSize: 11, fontFamily: "var(--font-heading, Outfit, sans-serif)", fontWeight: 600, color: i === step ? "#a59cf0" : i < step ? "#8a8aaa" : "#3a3a58" }}>
              {s}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{ background: "#111120", border: "1px solid rgba(119,104,212,0.12)", borderRadius: 20, padding: "32px 36px" }}>
          <h2 style={{ fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>
            {step === 0 ? "İşletme Bilgileri" : step === 1 ? "İletişim Bilgileri" : "Konum ve Saat Dilimi"}
          </h2>
          <p style={{ fontSize: 13, color: "#8a8aaa", marginBottom: 26 }}>
            {step === 0 ? "Müşterilerinizin sizi bulabilmesi için temel bilgileri girin." : step === 1 ? "Müşterilerinizin size ulaşabileceği iletişim bilgileri." : "İşletmenizin konumu ve çalışma saat dilimi."}
          </p>

          {error && (
            <div style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.25)", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: "#f43f5e", marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={step < 2 ? (e) => { e.preventDefault(); setStep(step + 1); } : handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* STEP 0 */}
              {step === 0 && (
                <>
                  <div>
                    <label style={labelStyle}>İşletme Adı *</label>
                    <input style={inputStyle} type="text" placeholder="Bella Hair Studio" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
                  </div>
                  <div>
                    <label style={labelStyle}>URL Kısa Adı *</label>
                    <div style={{ display: "flex" }}>
                      <span style={{ display: "flex", alignItems: "center", background: "#181828", border: "1px solid rgba(119,104,212,0.18)", borderRight: "none", borderRadius: "10px 0 0 10px", padding: "0 12px", fontSize: 12, color: "#3a3a58", whiteSpace: "nowrap" }}>
                        randevo.com/
                      </span>
                      <input
                        style={{ ...inputStyle, borderRadius: "0 10px 10px 0" }}
                        type="text" placeholder="bella-hair-studio"
                        value={slug} onChange={handleSlugChange} required
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Açıklama</label>
                    <input style={inputStyle} type="text" placeholder="İşletmeniz için kısa bir açıklama" value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                </>
              )}

              {/* STEP 1 */}
              {step === 1 && (
                <>
                  <div>
                    <label style={labelStyle}>Telefon</label>
                    <input style={inputStyle} type="tel" placeholder="+90 555 000 00 00" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>İşletme E-postası</label>
                    <input style={inputStyle} type="email" placeholder="merhaba@isletmeniz.com" value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} />
                  </div>
                </>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <>
                  <div>
                    <label style={labelStyle}>Adres</label>
                    <input style={inputStyle} type="text" placeholder="Cadde/Sokak, İlçe, İl" value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Saat Dilimi *</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      style={{ ...inputStyle, cursor: "pointer" }}
                      required
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz} value={tz} style={{ background: "#111120" }}>{tz}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", justifyContent: step > 0 ? "space-between" : "flex-end", marginTop: 28 }}>
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 11, border: "1px solid rgba(119,104,212,0.2)", background: "transparent", color: "#8a8aaa", fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
                  Geri
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "11px 28px", borderRadius: 11, border: "none",
                  fontFamily: "var(--font-heading, Outfit, sans-serif)", fontSize: 14, fontWeight: 700,
                  background: loading ? "rgba(119,104,212,0.5)" : "#7768d4", color: "#fff",
                  boxShadow: "0 0 20px rgba(119,104,212,0.25)", cursor: loading ? "default" : "pointer",
                  transition: "all 0.2s",
                }}
              >
                {step < 2
                  ? <>Devam Et <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></>
                  : loading ? "Oluşturuluyor..." : <>İşletmeyi Oluştur <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></>
                }
              </button>
            </div>
          </form>
        </div>

        <p style={{ fontSize: 12, color: "#3a3a58", textAlign: "center", marginTop: 20 }}>
          Adım {step + 1} / {steps.length}
        </p>
      </div>
    </div>
  );
}
